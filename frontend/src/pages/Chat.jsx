import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "../components/DashboardLayout.jsx";
import api from "../services/api";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  function loadConversations() {
    api.get("/chat/conversations").then((res) => setConversations(res.data));
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    api.get(`/chat/conversations/${activeId}`).then((res) => setMessages(res.data.messages));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setError("");
    setInput("");
    setSending(true);

    // Optimistically show the user's message
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: "user", content: question }]);

    try {
      const res = await api.post("/chat", { conversation_id: activeId, question });
      setMessages((prev) => [
        ...prev,
        { id: `resp-${Date.now()}`, role: "assistant", content: res.data.answer, sources: res.data.sources },
      ]);
      if (!activeId) {
        setActiveId(res.data.conversation_id);
        loadConversations();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function startNewChat() {
    setActiveId(null);
    setMessages([]);
    setError("");
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Conversation sidebar */}
        <div className="w-64 shrink-0 border-r border-slate-100 bg-white p-4">
          <button
            onClick={startNewChat}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + New Chat
          </button>
          <div className="mt-4 space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm ${
                  activeId === c.id ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-md pt-20 text-center text-slate-400">
                <p className="text-4xl">💬</p>
                <p className="mt-4">Ask something about your documents to get started.</p>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-6">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {sending && (
                  <div className="text-sm text-slate-400">Thinking…</div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="mx-8 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-6">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something about your documents…"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-2xl ${isUser ? "order-1" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser ? "bg-brand-500 text-white" : "bg-white text-slate-800 shadow-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <MarkdownAnswer content={message.content} />
          )}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.sources.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                📄 {s.document} · Page {s.page}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Renders the assistant's Markdown answer (bold, bullet/numbered lists,
// paragraphs, inline code, links) using the same font size/colors as the
// rest of the chat bubble, instead of dumping raw "**text**" / "* item"
// syntax on screen.
function MarkdownAnswer({ content }) {
  return (
    <div className="space-y-2 leading-relaxed">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          h1: ({ children }) => <h3 className="mt-2 text-base font-semibold text-slate-900">{children}</h3>,
          h2: ({ children }) => <h3 className="mt-2 text-base font-semibold text-slate-900">{children}</h3>,
          h3: ({ children }) => <h4 className="mt-2 text-sm font-semibold text-slate-900">{children}</h4>,
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-700">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">{children}</pre>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-brand-600 underline hover:text-brand-700">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-slate-200 pl-3 italic text-slate-600">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}