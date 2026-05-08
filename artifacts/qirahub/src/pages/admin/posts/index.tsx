import { AdminLayout } from "@/components/layout/AdminLayout";
import { canDelete } from "@/lib/admin-auth";
import { Link } from "wouter";
import { useListPosts, useDeletePost, getListPostsQueryKey, getGetRecentPostsQueryKey, getGetFeaturedPostsQueryKey, getGetPostsPerCategoryQueryKey } from "@workspace/api-client-react";
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminPosts() {
  const [search, setSearch] = useState("");
  const { data: posts, isLoading } = useListPosts();
  const deletePost = useDeletePost();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Post deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetFeaturedPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPostsPerCategoryQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to delete post", variant: "destructive" });
        }
      });
    }
  };

  const filteredPosts = posts?.filter(p => p.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-foreground">Posts Management</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href="/admin/posts/new">
              <Button className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">Loading posts...</td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">No posts found.</td>
                  </tr>
                ) : (
                  filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground line-clamp-1">{post.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {post.categoryName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`
                          ${post.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                          ${post.status === 'draft' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : ''}
                          ${post.status === 'archived' ? 'bg-muted text-muted-foreground border-border' : ''}
                        `}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/posts/${post.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            {canDelete() && (
                              <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                onClick={() => handleDelete(post.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
