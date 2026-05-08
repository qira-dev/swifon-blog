import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { getAdminRole, canDelete, isFullAdmin, isSuperAdmin } from "@/lib/admin-auth";
import {
  Search, Shield, UserCheck, UserX, Trash2, Key,
  ChevronLeft, ChevronRight, Users, ShieldCheck, Activity, Clock,
  MoreVertical, X, RefreshCw, Eye, EyeOff, Copy, CheckCircle,
  AlertTriangle, Lock, Pencil, Ban, ShieldAlert, UserPlus,
} from "lucide-react";

const API_BASE = "/api";

/* ─── Super-admin: this email can never be deleted, demoted, or suspended ─── */
const SUPER_ADMIN_EMAIL = "qirahub@gmail.com";

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("qirahub_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function generateKey(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

const ROLES = [
  { value: "user", label: "User", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  { value: "moderator", label: "Moderator", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
  { value: "admin", label: "Admin", color: "bg-purple-500/10 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
];

function getRoleInfo(role: string) {
  return ROLES.find(r => r.value === role) || ROLES[0];
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  admins: number;
  moderators: number;
  recentLogins: number;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PermissionsReferenceCard({ currentRole }: { currentRole: string }) {
  const rows = [
    {
      action: "View all content",
      icon: <Eye className="w-3.5 h-3.5" />,
      superAdmin: true, admin: true, moderator: true,
    },
    {
      action: "Create & edit posts, products, categories",
      icon: <Pencil className="w-3.5 h-3.5" />,
      superAdmin: true, admin: true, moderator: true,
    },
    {
      action: "Manage translations, coupons, messages",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      superAdmin: true, admin: true, moderator: true,
    },
    {
      action: "Manage ads, appearance, site settings",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      superAdmin: true, admin: true, moderator: false,
    },
    {
      action: "Delete any content",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      superAdmin: true, admin: false, moderator: false,
    },
    {
      action: "Change user roles",
      icon: <Shield className="w-3.5 h-3.5" />,
      superAdmin: true, admin: false, moderator: false,
    },
    {
      action: "Delete users",
      icon: <UserX className="w-3.5 h-3.5" />,
      superAdmin: true, admin: false, moderator: false,
    },
    {
      action: "Suspend / activate users",
      icon: <Ban className="w-3.5 h-3.5" />,
      superAdmin: true, admin: true, moderator: false,
    },
    {
      action: "Reset user passwords",
      icon: <Key className="w-3.5 h-3.5" />,
      superAdmin: true, admin: false, moderator: false,
    },
    {
      action: "Change admin key",
      icon: <Lock className="w-3.5 h-3.5" />,
      superAdmin: true, admin: false, moderator: false,
    },
  ];

  const Tick = () => <span className="text-green-500 font-bold text-sm">✓</span>;
  const Cross = () => <span className="text-red-400 font-bold text-sm">✗</span>;

  const roleLabel =
    currentRole === "key_admin" ? "Super Admin" :
    currentRole === "admin" ? "Admin" : "Moderator";

  const roleLabelColor =
    currentRole === "key_admin" ? "text-primary" :
    currentRole === "admin" ? "text-purple-400" : "text-blue-400";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Role Permissions</h2>
          <p className="text-xs text-muted-foreground">
            What each role can do — you are logged in as{" "}
            <span className={`font-bold ${roleLabelColor}`}>{roleLabel}</span>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-full">Action</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-primary whitespace-nowrap">Super Admin</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-purple-400 whitespace-nowrap">Admin</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-blue-400 whitespace-nowrap">Moderator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.action} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-2.5 text-foreground/80 flex items-center gap-2">
                  <span className="text-muted-foreground shrink-0">{row.icon}</span>
                  {row.action}
                </td>
                <td className="px-4 py-2.5 text-center"><Tick /></td>
                <td className="px-4 py-2.5 text-center">{row.admin ? <Tick /> : <Cross />}</td>
                <td className="px-4 py-2.5 text-center">{row.moderator ? <Tick /> : <Cross />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentRole === "moderator" && (
        <div className="px-4 py-3 bg-blue-500/5 border-t border-blue-500/20 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-400">
            You are logged in as a <strong>Moderator</strong>. Delete actions and role management are restricted to the Super Admin only.
          </p>
        </div>
      )}
      {currentRole === "admin" && (
        <div className="px-4 py-3 bg-purple-500/5 border-t border-purple-500/20 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400 shrink-0" />
          <p className="text-xs text-purple-400">
            You are logged in as an <strong>Admin</strong>. You can create and edit content, but delete actions and role changes are restricted to the Super Admin.
          </p>
        </div>
      )}
    </div>
  );
}

function AdminKeySection() {
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyInfo, setKeyInfo] = useState<{ hasCustomKey: boolean; keyPreview: string | null } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const { toast } = useToast();

  const getToken = () => sessionStorage.getItem("qirahub_user_token");

  const fetchKeyInfo = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingInfo(false); return; }
    const res = await fetch("/api/auth/admin-key", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setKeyInfo(await res.json());
    setLoadingInfo(false);
  }, []);

  useEffect(() => { fetchKeyInfo(); }, [fetchKeyInfo]);

  function handleGenerate() {
    const key = generateKey(32);
    setNewKey(key);
    setConfirmKey(key);
    setShowNew(true);
    setShowConfirm(true);
  }

  function handleCopy() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    toast({ title: "Key copied to clipboard" });
  }

  async function handleSave() {
    if (!newKey) { toast({ title: "Please enter a new key", variant: "destructive" }); return; }
    if (newKey.length < 8) { toast({ title: "Key must be at least 8 characters", variant: "destructive" }); return; }
    if (newKey !== confirmKey) { toast({ title: "Keys do not match", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/admin-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ newKey }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update admin key");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setNewKey("");
      setConfirmKey("");
      await fetchKeyInfo();
      toast({ title: "Admin key updated. Use the new key to log in next time." });
    } catch (err: any) {
      toast({ title: err.message || "Failed to update admin key", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Admin Key</h2>
          <p className="text-xs text-muted-foreground">The master key used for admin login. Keep it secret and stored safely.</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status */}
        <div>
          {loadingInfo ? (
            <div className="h-12 bg-muted animate-pulse rounded-lg" />
          ) : keyInfo ? (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              {keyInfo.hasCustomKey ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {keyInfo.hasCustomKey ? "Custom admin key is active" : "Using default admin key"}
                </p>
                {keyInfo.keyPreview && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{keyInfo.keyPreview}</p>
                )}
                {!keyInfo.hasCustomKey && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                    Set a custom key before going to production for security.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load key status.</p>
          )}
        </div>

        {/* Generate button */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleGenerate} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Secure Key
          </Button>
          {newKey && (
            <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
          )}
        </div>

        {/* New key */}
        <div className="space-y-2">
          <Label htmlFor="new-admin-key">New Admin Key</Label>
          <div className="relative">
            <Input
              id="new-admin-key"
              type={showNew ? "text" : "password"}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter new admin key (min. 8 characters)"
              className="pr-10 font-mono"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newKey && <p className="text-xs text-muted-foreground">{newKey.length} characters</p>}
        </div>

        {/* Confirm key */}
        <div className="space-y-2">
          <Label htmlFor="confirm-admin-key">Confirm New Key</Label>
          <div className="relative">
            <Input
              id="confirm-admin-key"
              type={showConfirm ? "text" : "password"}
              value={confirmKey}
              onChange={(e) => setConfirmKey(e.target.value)}
              placeholder="Confirm new admin key"
              className="pr-10 font-mono"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmKey && newKey && confirmKey !== newKey && (
            <p className="text-xs text-red-500">Keys do not match</p>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving || !newKey || !confirmKey} className="gap-2">
          {saving ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Key className="w-4 h-4" /> Update Admin Key</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, admins: 0, moderators: 0, recentLogins: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", displayName: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const currentRole = getAdminRole();
  const userCanDelete = canDelete();
  const userIsFullAdmin = isFullAdmin();
  const userIsSuperAdmin = isSuperAdmin();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      if (data.stats) setStats(data.stats);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function updateUser(userId: number, updates: Record<string, unknown>, successMsg: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: successMsg });
      fetchUsers();
      return true;
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" });
      return false;
    }
  }

  async function changeRole(user: AdminUser, newRole: string) {
    const label = getRoleInfo(newRole).label;
    await updateUser(user.id, { role: newRole }, `Role changed to ${label}`);
  }

  async function toggleActive(user: AdminUser) {
    await updateUser(user.id, { isActive: !user.isActive }, user.isActive ? "User deactivated" : "User activated");
  }

  async function handleResetPassword(userId: number) {
    if (!newPasswordInput || newPasswordInput.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    const ok = await updateUser(userId, { newPassword: newPasswordInput }, "Password reset successfully");
    if (ok) { setResetPasswordId(null); setNewPasswordInput(""); }
  }

  async function deleteUser(user: AdminUser) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "User deleted" });
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  }

  async function handleCreateUser() {
    if (!createForm.username || !createForm.email || !createForm.password) {
      toast({ title: "Username, email, and password are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      toast({ title: `User "${createForm.username}" created successfully` });
      setShowCreateUser(false);
      setCreateForm({ username: "", email: "", password: "", displayName: "", role: "user" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message || "Failed to create user", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  const filteredUsers = roleFilter === "all"
    ? users
    : users.filter(u => (u.role || "user") === roleFilter);

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles, access levels, and account settings. Role assignments and admin key management are all controlled from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={<Users className="w-5 h-5 text-foreground" />} label="Total Users" value={stats.total} color="bg-muted" />
          <StatCard icon={<UserCheck className="w-5 h-5 text-green-400" />} label="Active" value={stats.active} color="bg-green-500/10" />
          <StatCard icon={<Shield className="w-5 h-5 text-purple-400" />} label="Admins" value={stats.admins} color="bg-purple-500/10" />
          <StatCard icon={<ShieldCheck className="w-5 h-5 text-blue-400" />} label="Moderators" value={stats.moderators} color="bg-blue-500/10" />
          <StatCard icon={<Activity className="w-5 h-5 text-primary" />} label="Active (7 days)" value={stats.recentLogins} color="bg-primary/10" />
        </div>

        {/* Permissions Reference */}
        <PermissionsReferenceCard currentRole={currentRole} />

        {/* Search + Role filter + Create User */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or username…"
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap flex-1">
            {[{ value: "all", label: "All" }, ...ROLES].map(r => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  roleFilter === r.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {userIsFullAdmin && (
            <Button onClick={() => setShowCreateUser(true)} className="gap-2 shrink-0">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          )}
        </div>

        {/* Create User Dialog */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateUser(false)}>
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Create New User
                </h2>
                <button onClick={() => setShowCreateUser(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Username *</Label>
                  <Input
                    value={createForm.username}
                    onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Email *</Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Display Name</Label>
                  <Input
                    value={createForm.displayName}
                    onChange={e => setCreateForm(f => ({ ...f, displayName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Password *</Label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Role</Label>
                  <div className="flex gap-2">
                    {ROLES.filter(r => userIsSuperAdmin || r.value !== "admin").map(r => (
                      <button
                        key={r.value}
                        onClick={() => setCreateForm(f => ({ ...f, role: r.value }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          createForm.role === r.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateUser(false)}>Cancel</Button>
                <Button className="flex-1 gap-2" onClick={handleCreateUser} disabled={creating}>
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {creating ? "Creating…" : "Create User"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading users…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((u) => {
                const roleInfo = getRoleInfo(u.role || "user");
                const isExpanded = expandedUser === u.id;

                return (
                  <div key={u.id}>
                    {/* Main row */}
                    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors ${!u.isActive ? "opacity-60" : ""}`}>
                      {/* Avatar + basic info */}
                      <div className="relative shrink-0">
                        <AvatarDisplay avatarUrl={u.avatarUrl} size={38} />
                        {u.isActive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-card" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">
                            {u.displayName || u.username}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleInfo.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dot}`} />
                            {roleInfo.label}
                          </span>
                          {!u.isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 font-semibold">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>@{u.username}</span>
                          <span
                            className={`hidden sm:inline${u.email === SUPER_ADMIN_EMAIL ? " blur-sm select-none pointer-events-none" : ""}`}
                            title={u.email === SUPER_ADMIN_EMAIL ? undefined : u.email}
                          >{u.email}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(u.lastLoginAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Super-admin protected badge */}
                        {u.email === SUPER_ADMIN_EMAIL && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-semibold shrink-0"
                            title="This is the protected super-admin account and cannot be modified or deleted"
                          >
                            <Shield className="w-2.5 h-2.5" />
                            Super Admin
                          </span>
                        )}

                        {/* Role dropdown — Super Admin only, locked for everyone else */}
                        {u.email === SUPER_ADMIN_EMAIL ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleInfo.color}`}
                            title="Role is permanently locked for the super-admin"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            {roleInfo.label}
                          </span>
                        ) : userIsSuperAdmin ? (
                          <select
                            value={u.role || "user"}
                            onChange={e => changeRole(u, e.target.value)}
                            className="h-7 text-xs rounded-md border border-border bg-background text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                            title="Change role"
                          >
                            {ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleInfo.color}`}
                            title="Only the Super Admin can change user roles"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            {roleInfo.label}
                          </span>
                        )}

                        {/* Suspend/activate — admin only, not for super-admin */}
                        {userIsFullAdmin && u.email !== SUPER_ADMIN_EMAIL && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => toggleActive(u)}
                            title={u.isActive ? "Suspend user" : "Activate user"}
                          >
                            {u.isActive
                              ? <UserX className="h-3.5 w-3.5 text-orange-400" />
                              : <UserCheck className="h-3.5 w-3.5 text-green-400" />}
                          </Button>
                        )}

                        {/* Reset password — Super Admin only, never for super-admin account itself */}
                        {userIsSuperAdmin && u.email !== SUPER_ADMIN_EMAIL && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setResetPasswordId(resetPasswordId === u.id ? null : u.id); setNewPasswordInput(""); }}
                            title="Reset Password"
                          >
                            <Key className="h-3.5 w-3.5 text-blue-400" />
                          </Button>
                        )}

                        {/* Delete — admin only, never for super-admin */}
                        {userCanDelete && u.email !== SUPER_ADMIN_EMAIL && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setDeleteConfirm(u)}
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        )}

                        {/* Expand */}
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                          onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Reset password row */}
                    {resetPasswordId === u.id && (
                      <div className="px-4 py-2 bg-blue-500/5 border-t border-blue-500/20 flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-400 shrink-0" />
                        <Input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="New password (min 6 characters)"
                          className="h-8 text-xs flex-1"
                          onKeyDown={e => e.key === "Enter" && handleResetPassword(u.id)}
                        />
                        <Button size="sm" className="h-8 text-xs" onClick={() => handleResetPassword(u.id)}>
                          Reset
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setResetPasswordId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="px-4 py-3 bg-muted/20 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-0.5">Email</p>
                          <p className={`text-foreground${u.email === SUPER_ADMIN_EMAIL ? " blur-sm select-none pointer-events-none" : ""}`}>{u.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Username</p>
                          <p className="text-foreground">@{u.username}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Last Login</p>
                          <p className="text-foreground">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Joined</p>
                          <p className="text-foreground">{new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Status</p>
                          <p className={u.isActive ? "text-green-400" : "text-red-400"}>{u.isActive ? "Active" : "Suspended"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">User ID</p>
                          <p className="text-foreground font-mono">#{u.id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Admin Key Management — Super Admin only */}
        {userIsSuperAdmin && <AdminKeySection />}

        {/* Delete confirm overlay */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Delete User</h3>
                  <p className="text-xs text-muted-foreground">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">@{deleteConfirm.username}</span>?
                All their data will be removed.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" className="flex-1" onClick={() => deleteUser(deleteConfirm)}>
                  Delete User
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
