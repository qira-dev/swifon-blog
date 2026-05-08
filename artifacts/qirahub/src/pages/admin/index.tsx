import { AdminLayout } from "@/components/layout/AdminLayout";
import { Link } from "wouter";
import { useGetStatsSummary, useHealthCheck } from "@workspace/api-client-react";
import { FileText, Folder, Tag, Globe, PlusCircle, Server, MessageSquare, Share2, ShoppingBag, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactMessages, useProducts, useAdminUsers } from "@/lib/api-hooks";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStatsSummary();
  const { data: healthData } = useHealthCheck();
  const { data: messages } = useContactMessages();
  const { data: productsData } = useProducts();
  const { data: usersData } = useAdminUsers();
  const unreadCount = messages?.filter((m) => m.status === "unread").length ?? 0;
  const totalProducts = productsData?.length ?? 0;
  const totalUsers = usersData?.total ?? usersData?.users?.length ?? 0;

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Server: {healthData ? <span className="text-green-500">Online</span> : <span className="text-red-500">Offline</span>}
                </span>
              </div>
              {unreadCount > 0 && (
                <Link href="/admin/messages" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80">
                  <MessageSquare className="w-4 h-4" />
                  {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </Link>
              )}
            </div>
          </div>
          <Link href="/admin/posts/new">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              New Post
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Total Posts</h3>
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats?.totalPosts || 0}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Published</h3>
                <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats?.publishedPosts || 0}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Drafts</h3>
                <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats?.draftPosts || 0}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Categories</h3>
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats?.totalCategories || 0}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Tags</h3>
                <div className="w-10 h-10 bg-pink-500/10 text-pink-500 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats?.totalTags || 0}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Products</h3>
                <div className="w-10 h-10 bg-teal-500/10 text-teal-500 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalProducts}</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-muted-foreground">Users</h3>
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalUsers}</div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-muted/40">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/posts/new" className="block text-center p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <PlusCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Write Post</span>
            </Link>
            <Link href="/admin/categories" className="block text-center p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <Folder className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Manage Categories</span>
            </Link>
            <Link href="/admin/social-links" className="block text-center p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <Share2 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Social Links</span>
            </Link>
            <Link href="/admin/messages" className="block text-center p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Messages</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
