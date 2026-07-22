# Phishing Detection Assistant

GenAI-powered phishing email detection assistant built for the Cybersecurity Phishing Email Detection Assistant hackathon problem statement.

## Problem
Cybersecurity teams struggle to detect phishing emails quickly due to evolving tactics and high email volumes. Manual inspection is slow and error-prone.

## Solution
An AI assistant that analyzes email content (or a pasted link) and returns a structured risk assessment: classification, risk score, threat type, severity, explanation, immediate recommendations, and general precautions to avoid similar scams in future.

## Architecture
## Features
- Paste raw email text OR a bare URL — the backend fetches and analyzes link content directly
- Simulated "Incoming Inbox" demonstrating the intended production flow (real emails routed through this pipeline automatically)
- Structured output: risk score, classification, confidence, threat type, severity, reasoning, immediate recommendations, and general precautions
- Runs fully locally via Ollama — no data leaves the machine, relevant for handling sensitive email content

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS v4
- **Backend:** FastAPI, Python
- **AI:** DeepSeek R1 via Ollama (local inference)

## Setup
```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install fastapi uvicorn ollama pydantic httpx
ollama pull deepseek-r1
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Accuracy
Evaluated on a 6-sample balanced test set (mix of phishing and legitimate emails) — see `backend/test_batch.py`. Result: **6/6 (100%) on balanced test set — see backend/test_batch.py**.

## Known Limitations & Production Roadmap
- **Live Gmail/Outlook integration:** current version simulates incoming email routing; production would use OAuth + Gmail API push notifications to route real inbox mail automatically.
- **URL fetching (SSRF consideration):** the backend fetches user-submitted URLs server-side to analyze linked content. Production deployment should sandbox/allowlist outbound requests to prevent SSRF against internal services.
- **Speed optimization:** current version routes every email through the LLM. Production would add a fast local classifier (SLM/TF-IDF) as a first-pass filter, reserving the LLM for ambiguous cases only.
