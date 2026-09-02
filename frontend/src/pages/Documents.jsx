import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import api from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function loadDocuments() {
    setLoading(true);
    api
      .get("/documents/")
      .then((res) => setDocuments(res.data.documents))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    await api.delete(`/documents/${id}`);
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
            <p className="mt-1 text-slate-500">Upload PDFs to make them searchable in chat.</p>
          </div>
          <label className="cursor-pointer rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            {uploading ? "Uploading…" : "+ Upload PDF"}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelected}
              disabled={uploading}
            />
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-400">Loading documents…</p>
          ) : documents.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">
              No documents yet. Upload your first PDF to get started.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium">Chunks</th>
                  <th className="px-6 py-3 font-medium">Uploaded</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-800">📄 {doc.filename}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                      {doc.status === "failed" && doc.error_message && (
                        <p className="mt-1 max-w-xs text-xs text-red-500">{doc.error_message}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatSize(doc.file_size)}</td>
                    <td className="px-6 py-4 text-slate-500">{doc.chunk_count}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-sm font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
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
