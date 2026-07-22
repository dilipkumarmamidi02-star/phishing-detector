from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama, json, re, httpx

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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

def strip_think(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

def is_url(text: str) -> bool:
    return text.strip().startswith("http://") or text.strip().startswith("https://")

def fetch_url_content(url: str) -> str:
    try:
        r = httpx.get(url.strip(), timeout=8, follow_redirects=True)
        # crude text extraction, good enough for demo
        text = re.sub(r"<[^>]+>", " ", r.text)
        text = re.sub(r"\s+", " ", text).strip()
        return f"[Content fetched from URL: {url}]\n{text[:3000]}"
    except Exception as e:
        return f"[Could not fetch URL: {url}. Error: {str(e)}. Treat the URL itself as suspicious if it looks like phishing.]"

@app.post("/analyze")
def analyze(req: EmailRequest):
    content = req.email_text.strip()

    # If it's just a bare link, fetch what it points to
    if is_url(content) and len(content.split()) == 1:
        content = fetch_url_content(content)

    system_prompt = f"""You are a Senior Cybersecurity Analyst specializing in phishing detection.
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
  "recommendations": []
}}"""

    try:
        response = ollama.chat(
            model="deepseek-r1",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Email or link content:\n{content}"}
            ],
            format="json",
            options={"temperature": 0.1}
        )
        parsed = json.loads(strip_think(response["message"]["content"]))
        return parsed
    except Exception as e:
        return {
            "risk_score": 50, "classification": "Unknown", "confidence": 0,
            "threat_type": "Analysis Error", "severity": "Medium",
            "summary": f"Could not complete analysis: {str(e)}",
            "reasons": [], "suspicious_phrases": [], "recommendations": ["Retry analysis"]
        }
