from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json, re, httpx, os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

PATTERNS = [
    "Urgent account suspension threats with tight deadlines",
    "Requests to click a link and re-enter login credentials",
    "Unexpected prize/lottery winnings requiring personal/bank details",
    "Spoofed IT/support requests for password resets via external links",
    "Invoice/payment requests with urgency and unfamiliar payment portals",
    "Mismatched sender domain vs claimed organization",
    "Generic greeting combined with urgent call-to-action",
]

class EmailRequest(BaseModel):
    email_text: str

def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

def is_url(text: str) -> bool:
    return text.strip().startswith("http://") or text.strip().startswith("https://")

def fetch_url_content(url: str) -> str:
    try:
        r = httpx.get(url.strip(), timeout=8, follow_redirects=True)
        text = re.sub(r"<[^>]+>", " ", r.text)
        text = re.sub(r"\s+", " ", text).strip()
        return f"[Content fetched from URL: {url}]\n{text[:3000]}"
    except Exception as e:
        return f"[Could not fetch URL: {url}. Error: {str(e)}. Treat the URL itself as suspicious if it looks like phishing.]"

SYSTEM_PROMPT = f"""You are a Senior Cybersecurity Analyst specializing in phishing detection.
Known phishing indicator patterns (reference only):
{chr(10).join(f"- {p}" for p in PATTERNS)}

Return ONLY valid JSON, no markdown, no text outside the JSON, matching exactly this schema:
{{
  "risk_score": 0-100,
  "classification": "Safe or Phishing",
  "confidence": 0-100,
  "threat_type": "",
  "severity": "",
  "summary": "",
  "reasons": [],
  "suspicious_phrases": [],
  "recommendations": [],
  "precautions": []
}}

Rules:
- "recommendations" = 3-5 immediate actions the user should take about THIS specific email.
- "precautions" = 3-5 general habits the user should build to avoid falling for this TYPE of scam in future.
- Keep every string concise (under 20 words).
- Do not add any text before or after the JSON object."""

@app.post("/analyze")
def analyze(req: EmailRequest):
    content = req.email_text.strip()

    if is_url(content) and len(content.split()) == 1:
        content = fetch_url_content(content)

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Email or link content:\n{content}"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content
        parsed = extract_json(raw)
        parsed.setdefault("precautions", [])
        parsed["engine"] = "groq-llama-3.3-70b"
        return parsed
    except Exception as e:
        print(f"Analysis failed: {repr(e)}")
        return {
            "risk_score": 50, "classification": "Unknown", "confidence": 0,
            "threat_type": "Analysis Error", "severity": "Medium",
            "summary": f"Could not complete analysis: {str(e)}",
            "reasons": [], "suspicious_phrases": [],
            "recommendations": ["Retry analysis"], "precautions": [], "engine": "none"
        }

class ChatRequest(BaseModel):
    question: str
    context: dict

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        context_summary = json.dumps(req.context, indent=2)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": f"You are a helpful cybersecurity assistant. The user just ran a phishing analysis on an email and got this result:\n{context_summary}\n\nAnswer their follow-up question clearly and concisely (2-4 sentences), based on this result. If they ask something unrelated to this analysis, politely redirect them to ask about the email result."},
                {"role": "user", "content": req.question}
            ],
            temperature=0.3,
        )
        return {"answer": completion.choices[0].message.content}
    except Exception as e:
        return {"answer": f"Sorry, I could not process that: {str(e)}"}
