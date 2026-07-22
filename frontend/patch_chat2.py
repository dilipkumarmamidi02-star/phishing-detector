with open('src/App.jsx') as f:
    content = f.read()

# 1. Add chat state if not already present
if 'chatMessages' not in content:
    old_state = '  const [selectedId, setSelectedId] = useState(null);'
    new_state = '''  const [selectedId, setSelectedId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);'''
    if old_state in content:
        content = content.replace(old_state, new_state)
        print("State added")
    else:
        print("WARNING: could not find state anchor")

# 2. Add askChat function if not already present
if 'const askChat' not in content:
    old_fn = '''  const analyzePasted = () => {
    setSelectedId(null);
    runAnalysis(emailText);
  };'''
    new_fn = old_fn + '''

  const askChat = async () => {
    if (!chatInput.trim() || !result) return;
    const question = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("http://localhost:8000/chat", {
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
  };'''
    if old_fn in content:
        content = content.replace(old_fn, new_fn)
        print("Function added")
    else:
        print("WARNING: could not find function anchor")

# 3. Add chat card footer, matched against the ACTUAL ending
old_end = '''              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}'''

new_end = '''              </div>
            )}

            <div className="mt-5 bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-sm font-semibold text-gray-300 mb-3">
                Ask the AI about this result
              </p>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {chatMessages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                    <span
                      className={
                        m.role === "user"
                          ? "inline-block bg-blue-600 text-white text-sm rounded-lg px-3 py-1.5 max-w-[80%]"
                          : "inline-block bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-1.5 max-w-[80%]"
                      }
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
                {chatLoading && <p className="text-xs text-gray-500">Thinking...</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askChat()}
                  placeholder="e.g. Why is this risky? What should I do?"
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={askChat}
                  disabled={chatLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}'''

if old_end in content:
    content = content.replace(old_end, new_end)
    print("Footer added")
else:
    print("WARNING: could not find footer anchor")

with open('src/App.jsx', 'w') as f:
    f.write(content)
