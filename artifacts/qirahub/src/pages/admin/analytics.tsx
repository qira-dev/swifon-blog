import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  FileText, Users, ShoppingBag, Megaphone, Ticket, MessageSquare,
  Folder, Tag, TrendingUp, Star, Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "/api";

interface AnalyticsData {
  posts: { total: number; published: number; draft: number; featured: number; sidebar: number; normal: number };
  postsPerMonth: { month: string; count: number }[];
  postsPerCategory: { name: string; color: string | null; count: number }[];
  users: { total: number; byRole: { role: string; count: number; active: number }[] };
  products: { total: number; avgRating: number; highRated: number; midRated: number; lowRated: number };
  ads: { total: number; active: number; inactive: number; byNetwork: { network: string; position: string; count: number; active: number; inactive: number }[] };
  coupons: { total: number; active: number; expired: number; inactive: number };
  messages: { total: number; unread: number; read: number; replied: number };
  categories: number;
  tags: number;
}

function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics-overview"],
    queryFn: () => fetch(`${API_BASE}/stats/analytics-overview`).then(r => r.json()),
    staleTime: 30_000,
  });
}

const CHART_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#14b8a6", "#f97316", "#06b6d4", "#ec4899", "#84cc16",
];

const STATUS_COLORS: Record<string, string> = {
  published: "#22c55e",
  draft: "#f59e0b",
  featured: "#6366f1",
  unread: "#ef4444",
  read: "#22c55e",
  replied: "#6366f1",
  active: "#22c55e",
  expired: "#ef4444",
  inactive: "#94a3b8",
  admin: "#6366f1",
  moderator: "#f59e0b",
  user: "#22c55e",
};

function KpiCard({
  label, value, icon: Icon, color, sub,
}: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 shadow-sm ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
  fontSize: "13px",
  padding: "8px 12px",
};

export default function AdminAnalytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of all site activity and content metrics</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const postStatusData = [
    { name: "Published", value: data.posts.published, fill: STATUS_COLORS.published },
    { name: "Draft", value: data.posts.draft, fill: STATUS_COLORS.draft },
    { name: "Featured", value: data.posts.featured, fill: STATUS_COLORS.featured },
  ].filter(d => d.value > 0);

  const postPositionData = [
    { name: "Normal", value: data.posts.normal },
    { name: "Featured", value: data.posts.featured },
    { name: "Sidebar", value: data.posts.sidebar },
  ].filter(d => d.value > 0);

  const categoryChartData = data.postsPerCategory
    .filter(c => c.count > 0)
    .map(c => ({ name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name, Posts: c.count, fill: c.color || CHART_COLORS[0] }));

  const monthlyData = data.postsPerMonth.map(m => ({ month: m.month, Posts: m.count }));

  const userRoleData = data.users.byRole.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: r.count,
    fill: STATUS_COLORS[r.role] || CHART_COLORS[0],
  }));

  const productRatingData = [
    { name: "High (4–5★)", value: data.products.highRated, fill: "#22c55e" },
    { name: "Mid (2.5–4★)", value: data.products.midRated, fill: "#f59e0b" },
    { name: "Low (<2.5★)", value: data.products.lowRated, fill: "#ef4444" },
  ].filter(d => d.value > 0);

  const adNetworkData = Object.values(
    data.ads.byNetwork.reduce<Record<string, { name: string; Active: number; Inactive: number }>>((acc, row) => {
      const key = row.network;
      if (!acc[key]) acc[key] = { name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "), Active: 0, Inactive: 0 };
      acc[key].Active += row.active;
      acc[key].Inactive += row.inactive;
      return acc;
    }, {})
  ).filter(d => d.Active + d.Inactive > 0);

  const adsStatusData = [
    { name: "Active", value: data.ads.active, fill: STATUS_COLORS.active },
    { name: "Inactive", value: data.ads.inactive, fill: STATUS_COLORS.inactive },
  ].filter(d => d.value > 0);

  const couponsData = [
    { name: "Active", value: data.coupons.active, fill: STATUS_COLORS.active },
    { name: "Expired", value: data.coupons.expired, fill: STATUS_COLORS.expired },
    { name: "Inactive", value: data.coupons.inactive, fill: STATUS_COLORS.inactive },
  ].filter(d => d.value > 0);

  const messagesData = [
    { name: "Unread", value: data.messages.unread, fill: STATUS_COLORS.unread },
    { name: "Read", value: data.messages.read, fill: STATUS_COLORS.read },
    { name: "Replied", value: data.messages.replied, fill: STATUS_COLORS.replied },
  ].filter(d => d.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Overview of all site activity and content metrics</p>
          </div>
        </div>

        <div>
          <SectionTitle title="Site Overview" subtitle="Key numbers at a glance" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Total Posts" value={data.posts.total} icon={FileText} color="bg-blue-500/10 text-blue-500"
              sub={`${data.posts.published} published`} />
            <KpiCard label="Categories" value={data.categories} icon={Folder} color="bg-purple-500/10 text-purple-500"
              sub={`${data.tags} tags`} />
            <KpiCard label="Products" value={data.products.total} icon={ShoppingBag} color="bg-teal-500/10 text-teal-500"
              sub={`Avg ${data.products.avgRating ?? 0}★`} />
            <KpiCard label="Users" value={data.users.total} icon={Users} color="bg-indigo-500/10 text-indigo-500" />
            <KpiCard label="Ad Units" value={data.ads.total} icon={Megaphone} color="bg-orange-500/10 text-orange-500"
              sub={`${data.ads.active} active`} />
            <KpiCard label="Coupons" value={data.coupons.total} icon={Ticket} color="bg-pink-500/10 text-pink-500"
              sub={`${data.coupons.active} active`} />
            <KpiCard label="Messages" value={data.messages.total} icon={MessageSquare} color="bg-rose-500/10 text-rose-500"
              sub={`${data.messages.unread} unread`} />
            <KpiCard label="Avg Product Rating" value={`${data.products.avgRating ?? 0} / 5`} icon={Star} color="bg-yellow-500/10 text-yellow-500" />
          </div>
        </div>

        <div>
          <SectionTitle title="Content Trends" subtitle="Post activity over the last 12 months" />
          {monthlyData.length > 0 ? (
            <ChartCard title="Posts Published per Month">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="postGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Area type="monotone" dataKey="Posts" stroke="#6366f1" strokeWidth={2} fill="url(#postGradient)" dot={{ fill: "#6366f1", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No post activity data for the last 12 months yet.
            </div>
          )}
        </div>

        <div>
          <SectionTitle title="Posts Breakdown" subtitle="Status and category distribution" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Posts by Status">
              {postStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={postStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {postStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No posts yet</div>
              )}
            </ChartCard>

            <ChartCard title="Posts by Position">
              {postPositionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={postPositionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {postPositionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No posts yet</div>
              )}
            </ChartCard>

            <ChartCard title="Top Categories by Post Count" className="lg:col-span-2">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="Posts" radius={[0, 4, 4, 0]}>
                      {categoryChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No categories with posts yet</div>
              )}
            </ChartCard>
          </div>
        </div>

        <div>
          <SectionTitle title="Users & Community" subtitle="User registrations and role breakdown" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Users by Role">
              {userRoleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={userRoleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {userRoleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No users registered yet</div>
              )}
            </ChartCard>

            <ChartCard title="User Summary">
              <div className="space-y-3 mt-2">
                {data.users.byRole.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users yet</p>
                ) : (
                  data.users.byRole.map((r) => (
                    <div key={r.role} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[r.role] || "#94a3b8" }} />
                        <span className="text-sm font-medium capitalize">{r.role}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{r.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">({r.active} active)</span>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg mt-2">
                  <span className="text-sm font-semibold">Total Users</span>
                  <span className="text-sm font-bold text-primary">{data.users.total}</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        <div>
          <SectionTitle title="Products" subtitle="Product inventory and rating distribution" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Rating Distribution">
              {productRatingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={productRatingData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {productRatingData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No products yet</div>
              )}
            </ChartCard>

            <ChartCard title="Product Summary">
              <div className="space-y-3 mt-2">
                {[
                  { label: "Total Products", value: data.products.total, color: "bg-teal-500" },
                  { label: "High Rated (4–5★)", value: data.products.highRated, color: "bg-green-500" },
                  { label: "Mid Rated (2.5–4★)", value: data.products.midRated, color: "bg-yellow-500" },
                  { label: "Low Rated (<2.5★)", value: data.products.lowRated, color: "bg-red-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-sm font-semibold">Average Rating</span>
                  <span className="text-sm font-bold text-primary">{data.products.avgRating ?? 0} / 5 ★</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        <div>
          <SectionTitle title="Advertising" subtitle="Ad units by network and status" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {adNetworkData.length > 0 ? (
              <ChartCard title="Active vs Inactive by Network" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={adNetworkData} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                    <Bar dataKey="Active" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Inactive" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            ) : null}

            <ChartCard title="Ads Status Overview">
              {adsStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={adsStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {adsStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No ads yet</div>
              )}
            </ChartCard>

            <ChartCard title="Coupons Overview">
              {couponsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={couponsData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {couponsData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No coupons yet</div>
              )}
            </ChartCard>
          </div>
        </div>

        <div>
          <SectionTitle title="Messages" subtitle="Contact form inbox breakdown" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Messages by Status">
              {messagesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={messagesData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {messagesData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No messages yet</div>
              )}
            </ChartCard>

            <ChartCard title="Message Summary">
              <div className="space-y-3 mt-2">
                {[
                  { label: "Total Messages", value: data.messages.total, color: "bg-primary" },
                  { label: "Unread", value: data.messages.unread, color: "bg-red-500" },
                  { label: "Read", value: data.messages.read, color: "bg-green-500" },
                  { label: "Replied", value: data.messages.replied, color: "bg-indigo-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
