import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/documents/"), api.get("/chat/conversations")])
      .then(([docsRes, convosRes]) => {
        setDocuments(docsRes.data.documents);
        setConversations(convosRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedCount = documents.filter((d) => d.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-slate-500">Here's what's happening with your documents.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Uploaded Documents" value={documents.length} icon="📄" />
          <StatCard label="Processed Documents" value={completedCount} icon="✅" />
          <StatCard label="Conversations" value={conversations.length} icon="💬" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Documents</h2>
              <Link to="/documents" className="text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : documents.length === 0 ? (
              <EmptyState text="No documents yet." cta="Upload your first PDF" to="/documents" />
            ) : (
              <ul className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-slate-700">📄 {doc.filename}</span>
                    <StatusBadge status={doc.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
              <Link to="/chat" className="text-sm font-medium text-brand-600 hover:underline">
                Open chat
              </Link>
            </div>
            {loading ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : conversations.length === 0 ? (
              <EmptyState text="No conversations yet." cta="Start a chat" to="/chat" />
            ) : (
              <ul className="space-y-3">
                {conversations.slice(0, 5).map((c) => (
                  <li key={c.id} className="truncate text-sm text-slate-700">
                    💬 {c.title}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: "bg-green-50 text-green-700",
    processing: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>{status}</span>
  );
}

function EmptyState({ text, cta, to }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-slate-400">{text}</p>
      <Link to={to} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
