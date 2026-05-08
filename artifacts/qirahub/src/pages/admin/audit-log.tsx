import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert, Search, RefreshCw, ChevronLeft, ChevronRight,
  Clock, User, Activity, Trash2, AlertTriangle, X,
} from "lucide-react";
import { isSuperAdmin } from "@/lib/admin-auth";

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("qirahub_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE = "/api";

interface AuditLog {
  id: number;
  actorRole: string;
  actorEmail: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  deletions: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATED:  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPDATED:  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DELETED:  "bg-red-500/10 text-red-600 border-red-500/20",
  TOGGLED:  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  LOGIN:    "bg-purple-500/10 text-purple-600 border-purple-500/20",
  REPLIED:  "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  RESET:    "bg-orange-500/10 text-orange-600 border-orange-500/20",
  CHANGED:  "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  SENT:     "bg-teal-500/10 text-teal-600 border-teal-500/20",
};

const ROLE_COLORS: Record<string, string> = {
  key_admin:  "bg-primary/10 text-primary border-primary/20",
  admin:      "bg-blue-500/10 text-blue-600 border-blue-500/20",
  moderator:  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  anonymous:  "bg-muted text-muted-foreground border-border",
};

function actionColor(action: string): string {
  const suffix = Object.keys(ACTION_COLORS).find(k => action.includes(k));
  return suffix ? ACTION_COLORS[suffix] : "bg-muted text-muted-foreground border-border";
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

function parseDetails(raw: string | null): string {
  if (!raw) return "";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return raw;
  }
}

export default function AuditLogPage() {
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [search,   setSearch]   = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const limit = 50;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs/stats`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page:  String(p),
        limit: String(limit),
      });
      if (search)                    params.set("search",   search);
      if (roleFilter   !== "all")    params.set("role",     roleFilter);
      if (actionFilter !== "all")    params.set("action",   actionFilter);
      if (resourceFilter !== "all")  params.set("resource", resourceFilter);

      const res = await fetch(`${API_BASE}/admin/audit-logs?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setError("You do not have permission to view audit logs.");
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, actionFilter, resourceFilter]);

  useEffect(() => {
    fetchStats();
    fetchLogs(1);
  }, [fetchStats, fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  async function handleClearAll() {
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      setLogs([]);
      setTotal(0);
      setStats(null);
      setConfirmClear(false);
      fetchStats();
    } catch {
      setError("Failed to clear audit logs.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Audit Log
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Every admin action is recorded here. Super Admin access only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin() && confirmClear ? (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-sm text-destructive font-medium">Delete all logs?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="h-7 text-xs gap-1"
                >
                  {clearing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Yes, Delete All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmClear(false)}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : isSuperAdmin() ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClear(true)}
                disabled={loading || total === 0}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Logs
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchStats(); fetchLogs(1); }}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Events",   value: stats.total,     icon: Activity,      color: "text-primary" },
              { label: "Today",          value: stats.today,     icon: Clock,         color: "text-emerald-500" },
              { label: "This Week",      value: stats.thisWeek,  icon: User,          color: "text-blue-500" },
              { label: "Deletions",      value: stats.deletions, icon: Trash2,        color: "text-red-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{value ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchLogs(1)}
                placeholder="Email, action, details…"
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role</label>
            <Select value={roleFilter} onValueChange={v => setRoleFilter(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="key_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Resource</label>
            <Select value={resourceFilter} onValueChange={v => setResourceFilter(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="category">Categories</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="comparison">Comparisons</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="coupon">Coupons</SelectItem>
                <SelectItem value="ad">Ads</SelectItem>
                <SelectItem value="setting">Settings</SelectItem>
                <SelectItem value="contact_message">Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" onClick={() => fetchLogs(1)} className="h-9 gap-1.5">
            <Search className="w-4 h-4" />
            Filter
          </Button>

          {(search || roleFilter !== "all" || actionFilter !== "all" || resourceFilter !== "all") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 text-muted-foreground"
              onClick={() => {
                setSearch(""); setRoleFilter("all");
                setActionFilter("all"); setResourceFilter("all");
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Log table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <ShieldAlert className="w-8 h-8 opacity-30" />
              <p>No audit log entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resource</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Details</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs text-foreground font-medium">{timeAgo(log.createdAt)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 ${ROLE_COLORS[log.actorRole] ?? ROLE_COLORS.anonymous}`}
                          >
                            {log.actorRole === "key_admin" ? "Super Admin" : log.actorRole}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[160px]">
                          {log.actorEmail || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono ${actionColor(log.action)}`}
                        >
                          {formatAction(log.action)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.resourceType ? (
                          <div>
                            <span className="text-xs text-foreground capitalize">{log.resourceType.replace(/_/g, " ")}</span>
                            {log.resourceId && (
                              <span className="text-xs text-muted-foreground ml-1">#{log.resourceId}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell max-w-[220px]">
                        <span className="text-xs text-muted-foreground truncate block">
                          {parseDetails(log.details) || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">{log.ip || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages || loading}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
