import DashboardLayout from "../components/DashboardLayout.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Your account details.</p>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {user?.name}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Member since</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Profile editing and password changes are planned for a future version.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
