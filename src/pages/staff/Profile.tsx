import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "http://192.168.1.3:8000";

type ProfileResponse = Record<string, any>;

const normalizePermissions = (payload: any): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((v) => String(v));
  }

  if (Array.isArray(payload?.permissions)) {
    return payload.permissions.map((v: unknown) => String(v));
  }

  if (Array.isArray(payload?.data?.permissions)) {
    return payload.data.permissions.map((v: unknown) => String(v));
  }

  return [];
};

const StaffProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const token = localStorage.getItem("access");

  const displayRole = useMemo(
    () => String(profile?.role ?? user?.role ?? "STAFF").replaceAll("_", " "),
    [profile?.role, user?.role],
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const [meRes, permsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/accounts/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/accounts/me/permissions/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!meRes.ok) {
          throw new Error("Failed to load profile details.");
        }

        const meData = await meRes.json();
        const permsData = permsRes.ok ? await permsRes.json() : [];

        const resolvedName =
          meData?.name ||
          meData?.full_name ||
          meData?.username ||
          user?.name ||
          "";
        const resolvedEmail = meData?.email || user?.email || "";
        const resolvedPhone = meData?.phone || meData?.phone_number || "";

        setProfile(meData);
        setForm({
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
        });
        setPermissions(normalizePermissions(permsData));
      } catch (e: any) {
        setError(e?.message || "Unable to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, user?.email, user?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Missing access token.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch(`${BASE_URL}/api/accounts/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to update profile.");
      }

      const updated = await res.json();
      const mergedUser = {
        ...user,
        ...updated,
        name: updated?.name || updated?.full_name || form.name,
        username: updated?.username || user?.username,
        email: updated?.email || form.email,
      };

      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      setUser(mergedUser);
      localStorage.setItem("user", JSON.stringify(mergedUser));
      setSuccess("Profile updated successfully.");
    } catch (e: any) {
      setError(e?.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details and permissions.</p>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Data from `GET /api/accounts/me/` and update via `PATCH /api/accounts/me/`.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={displayRole} readOnly />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Loaded from `GET /api/accounts/me/permissions/`.</CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions returned for this account.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfile;