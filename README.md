# Phishing Detection Assistant

GenAI-powered phishing email detection assistant built for the Cybersecurity Phishing Email Detection Assistant hackathon problem statement.

## Team

Built by **Team CSM-E** for the Cybersecurity Phishing Email Detection Assistant hackathon:

- Baddam Sathvik
- D Srishanth
- Mamidi Dilip Kumar
- Podilla Preetham Kumar
- Thati Vamshi

## Problem
Cybersecurity teams struggle to detect phishing emails quickly due to evolving tactics and high email volumes. Manual inspection is slow and error-prone.

## Solution
An AI assistant that analyzes email content (or a pasted link) and returns a structured risk assessment: classification, risk score, threat type, severity, explanation, immediate recommendations, and general precautions to avoid similar scams in future.

## Architecture
## Features
- Paste raw email text OR a bare URL — the backend fetches and analyzes link content directly
- Simulated "Incoming Inbox" demonstrating the intended production flow (real emails routed through this pipeline automatically)
- Structured output: risk score, classification, confidence, threat type, severity, reasoning, immediate recommendations, and general precautions
- Real Gmail inbox integration via OAuth — analyze actual inbox messages, not just pasted text
- Live AI chat follow-up — ask the assistant why an email was flagged and what to do next
- One-click cybersecurity helpline routing (India Cyber Crime 1930, cybercrime.gov.in, CERT-In email report with full analysis as proof)

## Tech Stack & Tools

| Tool | Purpose |
|---|---|
| **React + Vite** | Frontend UI framework and build tooling |
| **Tailwind CSS v4** | Styling and responsive design |
| **FastAPI (Python)** | Backend API serving `/analyze` and `/chat` endpoints |
| **Groq API (Llama 3.3 70B)** | LLM inference for phishing classification and risk analysis |
| **Google OAuth 2.0 + Gmail API** | Real inbox integration — lets users analyze their actual Gmail messages, not just pasted text |
| **GitHub** | Version control and source hosting |
| **Vercel** | Hosting for both frontend and backend (deployed as separate projects, backend runs as a Python serverless function) |

## Setup

### Live deployment
- **Frontend:** https://phishing-detector-pi-nine.vercel.app
- **Backend:** deployed on Vercel as a Python serverless function (FastAPI, zero-config detection)

### Local development
```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY=your-groq-key-here
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Gmail integration requires a Google Cloud OAuth Client ID with the Gmail API enabled, added to `frontend/.env.local` as `VITE_GOOGLE_CLIENT_ID`.

## Accuracy
Evaluated on a 6-sample balanced test set (mix of phishing and legitimate emails) — see `backend/test_batch.py`. Result: **6/6 (100%) on balanced test set — see backend/test_batch.py**.

## Known Limitations & Production Roadmap
- **URL fetching (SSRF consideration):** the backend fetches user-submitted URLs server-side to analyze linked content. Production deployment should sandbox/allowlist outbound requests to prevent SSRF against internal services.
- **Speed optimization:** current version routes every email through the LLM. Production would add a fast local classifier (SLM/TF-IDF) as a first-pass filter, reserving the LLM for ambiguous cases only.
