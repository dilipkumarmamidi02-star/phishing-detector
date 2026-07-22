path = "src/App.jsx"
with open(path) as f:
    content = f.read()

# --- 3a. State ---
old_state = '  const [chatLoading, setChatLoading] = useState(false);'
new_state = '''  const [chatLoading, setChatLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailMessages, setGmailMessages] = useState([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState(null);'''

if old_state in content:
    content = content.replace(old_state, new_state)
    print("State: added")
else:
    print("WARNING: state anchor not found")

# --- 3b. Functions (Gmail helpers + connect flow) ---
old_fn = '''  const selectInboxEmail = (email) => {
    setSelectedId(email.id);
    setEmailText(email.body);
    runAnalysis(email.body);
  };
'''
new_fn = old_fn + '''
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
'''

if old_fn in content:
    content = content.replace(old_fn, new_fn)
    print("Functions: added")
else:
    print("WARNING: function anchor not found")

# --- 3c. Sidebar UI ---
old_ui = '''              <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Incoming Inbox
              </p>'''
new_ui = '''              <div className="mb-4">
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
              </p>'''

if old_ui in content:
    content = content.replace(old_ui, new_ui)
    print("Sidebar UI: added")
else:
    print("WARNING: sidebar UI anchor not found")

with open(path, "w") as f:
    f.write(content)
