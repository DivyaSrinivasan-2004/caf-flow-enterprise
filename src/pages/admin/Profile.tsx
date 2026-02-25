import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserRound, Mail, BadgeCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = "http://192.168.1.3:8000";

type AccessConfig = {
  roleLabel: string;
  capabilities: string[];
  accessScope: string[];
};

type ProfileData = {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
  date_joined?: string;
};

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const [form, setForm] = useState({ name: "", phone: "" });
  const [permissions, setPermissions] = useState<AccessConfig>({
    roleLabel: "ADMIN",
    capabilities: [],
    accessScope: [],
  });

  const getAuthHeaders = (withJson = false) => {
    const token = localStorage.getItem("access");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    if (withJson) headers["Content-Type"] = "application/json";
    return headers;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const [meRes, permissionRes] = await Promise.all([
          fetch(`${API_BASE}/api/accounts/me/`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/api/accounts/me/permissions/`, { headers: getAuthHeaders() }),
        ]);

        if (!meRes.ok) throw new Error(`Profile request failed (${meRes.status})`);
        const meData = await meRes.json();

        const normalizedMe: ProfileData = {
          id: String(meData.id ?? ""),
          username: String(meData.username ?? ""),
          name: String(meData.name ?? meData.full_name ?? meData.username ?? ""),
          email: String(meData.email ?? ""),
          phone: String(meData.phone ?? ""),
          role: String(meData.role ?? meData.user_type ?? user?.role ?? "ADMIN"),
          is_active: Boolean(meData.is_active ?? true),
          last_login: meData.last_login ? String(meData.last_login) : undefined,
          date_joined: meData.date_joined ? String(meData.date_joined) : undefined,
        };
        setProfile(normalizedMe);
        setForm({
          name: normalizedMe.name ?? "",
          phone: normalizedMe.phone ?? "",
        });

        if (permissionRes.ok) {
          const permissionData = await permissionRes.json();
          setPermissions({
            roleLabel: String(permissionData.role ?? normalizedMe.role ?? "ADMIN"),
            capabilities: Array.isArray(permissionData.capabilities) ? permissionData.capabilities.map(String) : [],
            accessScope: Array.isArray(permissionData.modules) ? permissionData.modules.map(String) : [],
          });
        } else {
          setPermissions({
            roleLabel: String(normalizedMe.role ?? "ADMIN"),
            capabilities: [],
            accessScope: [],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user?.role]);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/accounts/me/`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });
      if (!res.ok) throw new Error(`Profile update failed (${res.status})`);
      const updated = await res.json();
      setProfile((prev) => ({
        ...prev,
        name: String(updated.name ?? updated.full_name ?? form.name),
        phone: String(updated.phone ?? form.phone),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = useMemo(
    () => profile.name || profile.username || user?.name || user?.username || user?.email || "-",
    [profile.name, profile.username, user]
  );

  const displayEmail = useMemo(
    () => profile.email || user?.email || "-",
    [profile.email, user]
  );

  const displayRole = useMemo(
    () => permissions.roleLabel || profile.role || user?.role || "ADMIN",
    [permissions.roleLabel, profile.role, user?.role]
  );

  const access = useMemo(
    () => ({
      roleLabel: displayRole,
      capabilities: permissions.capabilities.length
        ? permissions.capabilities
        : ["Capabilities are not provided by /api/accounts/me/permissions/."],
      accessScope: permissions.accessScope,
    }),
    [displayRole, permissions]
  );

  if (loading) {
    return <div className="p-6 text-sm">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 p-1">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">User details, role capabilities, and access scope.</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <UserRound className="h-4 w-4" />
              Name
            </p>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-4 w-4" />
              Email
            </p>
            <p className="text-sm font-semibold text-slate-900">{displayEmail}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Role
            </p>
            <p className="text-sm font-semibold text-slate-900">{access.roleLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-3">
            <p className="mb-1 text-xs text-slate-500">Phone</p>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Capabilities</h2>
          <div className="mt-3 space-y-2">
            {access.capabilities.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Accessible Modules</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {access.accessScope.length ? (
              access.accessScope.map((moduleName) => (
                <span
                  key={moduleName}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {moduleName}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No modules returned by `/api/accounts/me/permissions/`.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Account Metadata</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Username</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.username || displayName}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.is_active ? "Active" : "Inactive"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Date Joined</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.date_joined || "-"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Last Login</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.last_login || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;