import { useState } from "react";

const REPORT_EMAIL = "incident@cert-in.org.in";

const SAMPLE_INBOX = [
  {
    id: 1,
    from: "security@paypa1-support.com",
    subject: "Urgent: Verify your account now",
    preview: "Your account will be suspended in 24 hours unless you verify...",
    body: "Dear Customer, we detected unusual activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately. Click here to verify: http://paypa1-secure-verify.com/login. Failure to act will result in permanent account closure.",
    flagged: true,
  },
  {
    id: 2,
    from: "hr@yourcompany.com",
    subject: "Team lunch on Friday",
    preview: "Hi all, just a reminder that we're doing team lunch this Friday...",
    body: "Hi all, just a reminder that we're doing team lunch this Friday at 1pm in the main conference room. Please let me know if you have any dietary restrictions. See you there!",
    flagged: false,
  },
  {
    id: 3,
    from: "no-reply@amaz0n-orders.net",
    subject: "Your order could not be delivered",
    preview: "We attempted to deliver your package but were unable to...",
    body: "We attempted to deliver your package but were unable to complete delivery. To reschedule, please confirm your payment details and shipping address here: http://amaz0n-orders.net/reschedule. This link expires in 2 hours.",
    flagged: true,
  },
  {
    id: 4,
    from: "billing@netflix.com",
    subject: "Your monthly invoice",
    preview: "Your Netflix subscription has been renewed. Here is your invoice...",
    body: "Your Netflix subscription has been renewed for this month at the standard rate. You can view or download your invoice anytime from your account settings. No action is required from you.",
    flagged: false,
  },
  {
    id: 5,
    from: "it-support@company-helpdesk.info",
    subject: "Password expiring - action required",
    preview: "Your company password will expire today. Reset now to avoid...",
    body: "Your company password will expire today. To avoid being locked out of your account, please reset your password immediately using the link below: http://company-helpdesk.info/reset. Contact IT support if you did not request this.",
    flagged: true,
  },
];

// Severity tiers drive every color in the UI — a gradient system instead of flat chips
const TIER_STYLES = {
  critical: {
    text: "text-red-400",
    badge: "bg-red-500/10 text-red-300 border-red-500/30",
    glow: "shadow-[0_0_50px_-12px_rgba(239,68,68,0.55)]",
    bar: "from-orange-500 to-red-500",
    dot: "bg-red-500",
    gaugeFrom: "#F97316",
    gaugeTo: "#EF4444",
  },
  warning: {
    text: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    glow: "shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)]",
    bar: "from-amber-400 to-orange-500",
    dot: "bg-amber-400",
    gaugeFrom: "#F59E0B",
    gaugeTo: "#F97316",
  },
  safe: {
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    glow: "shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]",
    bar: "from-emerald-400 to-cyan-500",
    dot: "bg-emerald-400",
    gaugeFrom: "#10B981",
    gaugeTo: "#06B6D4",
  },
};

function getTier(score = 0, severityStr = "") {
  const s = (severityStr || "").toLowerCase();
  if (score >= 70 || s === "critical" || s === "high") return "critical";
  if (score >= 40 || s === "medium") return "warning";
  return "safe";
}

function RiskGauge({ score = 0, tier }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference - (pct / 100) * circumference;
  const theme = TIER_STYLES[tier];
  const gradientId = `gauge-grad-${tier}`;

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.gaugeFrom} />
            <stop offset="100%" stopColor={theme.gaugeTo} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1E293B" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">/ 100</span>
      </div>
    </div>
  );
}

function RadarScanner() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full border border-cyan-500/25" />
      <div className="absolute inset-3 rounded-full border border-cyan-500/20" />
      <div className="absolute inset-6 rounded-full border border-cyan-500/15" />
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.4) 45deg, transparent 100deg)",
          animationDuration: "1.4s",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]" />
      </div>
    </div>
  );
}

function CyberHelpFooter({ result, emailText }) {
  const score = result?.risk_score ?? result?.score ?? 0;
  const severity = result?.severity ?? "";
  const tier = result ? getTier(score, severity) : null;
  const isHighRisk = tier === "critical";
  const theme = isHighRisk ? TIER_STYLES.critical : null;

  const labelize = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatAnalysisReport = (data) => {
    if (!data) return "(no analysis data)";
    const lines = [];
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (Array.isArray(value)) {
        if (value.length === 0) return;
        lines.push(`${labelize(key)}:`);
        value.forEach((item) => lines.push(`  - ${item}`));
      } else {
        lines.push(`${labelize(key)}: ${value}`);
      }
    });
    return lines.join("\n");
  };

  const buildReportEmail = () => {
    const subject = encodeURIComponent("Phishing Report - Suspicious Email Detected");
    const bodyLines = [
      "I'm reporting a suspicious email flagged as high-risk by my phishing detection tool.",
      "",
      "--- Original message content ---",
      emailText || "(not provided)",
      "",
      "--- Full analysis details (for proof) ---",
      formatAnalysisReport(result),
    ];
    return { subject, body: encodeURIComponent(bodyLines.join("\n")) };
  };

  const handleEmailReport = () => {
    const { subject, body } = buildReportEmail();
    window.location.href = `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="fixed bottom-4 left-4 z-50 max-w-[280px]">
      <div
        className={`relative rounded-2xl border p-4 backdrop-blur-xl bg-slate-900/90 overflow-hidden ${
          isHighRisk ? "border-red-500/40 " + theme.glow : "border-slate-700/60"
        }`}
      >
        <div
          className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${
            isHighRisk ? theme.bar : "from-cyan-400 to-blue-500"
          }`}
        />
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Cybersecurity Helpline
        </p>

        <a
          href="tel:1930"
          className="flex items-center gap-2 text-sm text-slate-200 hover:text-cyan-300 transition mb-2 group"
        >
          <span className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition">
            ☎
          </span>
          Call 1930 (India Cyber Crime)
        </a>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-slate-200 hover:text-cyan-300 transition mb-1 group"
        >
          <span className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition">
            ⚑
          </span>
          Report on cybercrime.gov.in
        </a>

        {isHighRisk && (
          <button
            onClick={handleEmailReport}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition shadow-lg shadow-red-500/20"
          >
            🚨 Email Report (with proof)
          </button>
        )}
      </div>
    </footer>
  );
}

export default function App() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailMessages, setGmailMessages] = useState([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState(null);

  const runAnalysis = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("https://mamididilip.pythonanywhere.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to connect to backend. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const selectInboxEmail = (email) => {
    setSelectedId(email.id);
    setEmailText(email.body);
    runAnalysis(email.body);
  };

  const GMAIL_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const decodeBase64Url = (data) => {
    try {
      const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
    } catch {
      return "";
    }
  };

  const extractBody = (payload) => {
    if (!payload) return "";
    if (payload.body?.data) return decodeBase64Url(payload.body.data);
    if (payload.parts) {
      const plainPart = payload.parts.find((p) => p.mimeType === "text/plain");
      if (plainPart?.body?.data) return decodeBase64Url(plainPart.body.data);
      for (const part of payload.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
    return "";
  };

  const fetchGmailMessages = async (token) => {
    setGmailLoading(true);
    setGmailError(null);
    try {
      const listRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const listData = await listRes.json();
      if (!listData.messages) {
        setGmailMessages([]);
        return;
      }

      const detailed = await Promise.all(
        listData.messages.map(async (m) => {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const msg = await res.json();
          const headers = msg.payload?.headers || [];
          const from = headers.find((h) => h.name === "From")?.value || "Unknown sender";
          const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
          const body = extractBody(msg.payload) || msg.snippet || "";
          return {
            id: msg.id,
            from,
            subject,
            preview: msg.snippet || "",
            body,
            flagged: false,
          };
        })
      );
      setGmailMessages(detailed);
    } catch (err) {
      setGmailError("Could not load Gmail messages.");
    } finally {
      setGmailLoading(false);
    }
  };

  const connectGmail = () => {
    if (!GMAIL_CLIENT_ID) {
      setGmailError("Missing VITE_GOOGLE_CLIENT_ID in .env.local");
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      setGmailError("Google Identity Services not loaded yet — refresh and try again.");
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GMAIL_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      callback: (response) => {
        if (response.error) {
          setGmailError("Gmail authorization failed.");
          return;
        }
        setGmailConnected(true);
        fetchGmailMessages(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  };

  const selectGmailEmail = (email) => {
    setSelectedId(email.id);
    setEmailText(email.body);
    runAnalysis(email.body);
  };

  const analyzePasted = () => {
    setSelectedId(null);
    runAnalysis(emailText);
  };

  const askChat = async () => {
    if (!chatInput.trim() || !result) return;
    const question = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://mamididilip.pythonanywhere.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: result }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Could not reach the assistant." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const tier = result ? getTier(result.risk_score, result.severity) : "safe";
  const theme = TIER_STYLES[tier];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-data { font-family: 'JetBrains Mono', monospace; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.045)_1px,transparent_0)] bg-[size:26px_26px]">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 flex items-center justify-center text-lg shadow-lg shadow-blue-500/30 shrink-0">
              🛡
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                Phishing Detection Assistant
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Every incoming email routes here for AI-powered threat analysis —{" "}
                <span className="text-slate-300 font-medium">DeepSeek R1</span>
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Inbox sidebar */}
            <div className="lg:col-span-1 bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-4 h-fit">
              <div className="mb-4">
                {!gmailConnected ? (
                  <button
                    onClick={connectGmail}
                    className="w-full text-sm bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-3 py-2 rounded-xl border border-slate-700 transition"
                  >
                    Connect Gmail
                  </button>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      Gmail Inbox {gmailLoading && "(loading...)"}
                    </p>
                    {gmailError && (
                      <p className="text-red-400 text-xs mb-2">{gmailError}</p>
                    )}
                    <div className="space-y-2 mb-3">
                      {gmailMessages.map((email) => (
                        <button
                          key={email.id}
                          onClick={() => selectGmailEmail(email)}
                          className={`relative w-full text-left p-3 pl-4 rounded-xl border transition overflow-hidden ${
                            selectedId === email.id
                              ? "bg-blue-600/10 border-blue-500/60"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <p className="text-[11px] text-slate-500 truncate">{email.from}</p>
                          <p className="text-sm font-medium text-slate-100 truncate">{email.subject}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{email.preview}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Incoming Inbox
              </p>
              <div className="space-y-2">
                {SAMPLE_INBOX.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => selectInboxEmail(email)}
                    className={`relative w-full text-left p-3 pl-4 rounded-xl border transition overflow-hidden ${
                      selectedId === email.id
                        ? "bg-blue-600/10 border-blue-500/60"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-1 ${
                        email.flagged ? "bg-red-500/70" : "bg-emerald-500/70"
                      }`}
                    />
                    <p className="text-[11px] text-slate-500 truncate">{email.from}</p>
                    <p className="text-sm font-medium text-slate-100 truncate">{email.subject}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{email.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main panel */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-5 mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Or paste email content / link directly
                </label>
                <textarea
                  className="w-full h-32 bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition"
                  placeholder="Paste email text or a link here..."
                  value={emailText}
                  onChange={(e) => {
                    setEmailText(e.target.value);
                    setSelectedId(null);
                  }}
                />
                <button
                  onClick={analyzePasted}
                  disabled={loading}
                  className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
                {error && (
                  <p className="text-red-400 mt-3 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              {loading && (
                <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                  <RadarScanner />
                  <p className="font-data text-xs tracking-[0.3em] text-cyan-400/80 uppercase">
                    Scanning message
                  </p>
                </div>
              )}

              {result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div
                    className={`bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-5 flex flex-col items-center text-center ${theme.glow}`}
                  >
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Risk Score</p>
                    <RiskGauge score={result.risk_score} tier={tier} />
                    <span
                      className={`mt-4 inline-block text-xs font-semibold px-3 py-1 rounded-full border ${theme.badge}`}
                    >
                      {result.severity || tier.toUpperCase()}
                    </span>
                    <p className="text-sm text-slate-400 mt-3">
                      Classification:{" "}
                      <span className="font-semibold text-slate-100">{result.classification}</span>
                    </p>
                    <p className="text-sm text-slate-400">
                      Confidence: <span className="text-slate-100">{result.confidence}%</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                      <span className="text-violet-400">◆</span> Threat Type
                    </p>
                    <p className="font-display text-xl font-semibold text-slate-100 mb-3">
                      {result.threat_type}
                    </p>
                    <p className="text-sm text-slate-400 mb-2">{result.summary}</p>
                    {result.suspicious_phrases?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-1.5">Suspicious phrases</p>
                        <ul className="text-sm text-slate-300 space-y-1.5">
                          {result.suspicious_phrases.map((p, i) => (
                            <li
                              key={i}
                              className="bg-slate-950/60 rounded-lg px-2.5 py-1.5 border border-amber-500/20 text-amber-200/90"
                            >
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Recommendations
                    </p>
                    <ul className="text-sm text-slate-200 space-y-2">
                      {result.recommendations?.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                    {result.reasons?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 mb-1.5">Reasons</p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {result.reasons.map((r, i) => (
                            <li key={i}>– {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 p-5">
                <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  Ask the AI about this result
                </p>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                      <span
                        className={
                          m.role === "user"
                            ? "inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm rounded-xl px-3 py-1.5 max-w-[80%]"
                            : "inline-block bg-slate-800 text-slate-200 text-sm rounded-xl px-3 py-1.5 max-w-[80%]"
                        }
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                  {chatLoading && (
                    <p className="text-xs text-slate-500 font-data">thinking…</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askChat()}
                    placeholder="e.g. Why is this risky? What should I do?"
                    className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition"
                  />
                  <button
                    onClick={askChat}
                    disabled={chatLoading}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CyberHelpFooter result={result} emailText={emailText} />
      </div>
    </>
  );
}
