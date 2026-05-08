import { AdminLayout } from "@/components/layout/AdminLayout";
import { canDelete } from "@/lib/admin-auth";
import type { Category } from "@workspace/api-client-react";
import { useGetCategoryTree, useCreateCategory, useUpdateCategory, useDeleteCategory, getGetCategoryTreeQueryKey } from "@workspace/api-client-react";
import { Folder, Search, Plus, Trash2, Edit, ChevronRight, ChevronDown, Image } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminCategories() {
  const [search, setSearch] = useState("");
  const { data: categoriesTree, isLoading } = useGetCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", imageUrl: "", parentId: null as number | null });

  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  const handleToggleNode = (id: number) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || "", imageUrl: (cat as any).imageUrl || "", parentId: cat.parentId ?? null });
    setIsModalOpen(true);
  };

  const handleAdd = (defaultParentId: number | null = null) => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "", imageUrl: "", parentId: defaultParentId });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      parentId: formData.parentId ?? undefined,
    };

    if (editingId) {
      updateCategory.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Category updated" });
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetCategoryTreeQueryKey() });
        }
      });
    } else {
      createCategory.mutate({ data: { ...payload, sortOrder: 0, isVisible: true } }, {
        onSuccess: () => {
          toast({ title: "Category created" });
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetCategoryTreeQueryKey() });
        }
      });
    }
  };

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDeleteRequest = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId === null) return;
    deleteCategory.mutate({ id: deleteTargetId }, {
      onSuccess: () => {
        toast({ title: "Category deleted" });
        queryClient.invalidateQueries({ queryKey: getGetCategoryTreeQueryKey() });
        setDeleteTargetId(null);
      }
    });
  };

  function flattenTree(nodes: Category[], depth = 0): Array<{ id: number; name: string; depth: number }> {
    const result: Array<{ id: number; name: string; depth: number }> = [];
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, depth });
      if (node.children && node.children.length > 0) {
        result.push(...flattenTree(node.children, depth + 1));
      }
    }
    return result;
  }

  const renderTree = (nodes: Category[], level = 0) => {
    return nodes.map(cat => {
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) return null;
      const isExpanded = expandedNodes[cat.id];
      const hasChildren = cat.children && cat.children.length > 0;

      return (
        <div key={cat.id}>
          <div className="flex items-center gap-4 py-3 px-4 border-b border-border/60 hover:bg-muted/40 transition-colors" style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => hasChildren && handleToggleNode(cat.id)}>
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <div className="w-4" />
              )}
              <Folder className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="font-medium text-foreground text-sm">{cat.name}</div>
              <div className="text-xs text-muted-foreground">/{cat.slug}</div>
            </div>

            <div className="text-xs text-muted-foreground min-w-[60px] text-right">
              {cat.postCount || 0} posts
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(cat)} data-testid={`btn-edit-cat-${cat.id}`}>
                <Edit className="w-4 h-4" />
              </Button>
              {canDelete() && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteRequest(cat.id)} data-testid={`btn-delete-cat-${cat.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="bg-muted/20">
              {renderTree(cat.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-foreground">Categories Management</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-muted/40 p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Category Hierarchy</h3>
            <Button size="sm" onClick={() => handleAdd(null)} data-testid="btn-add-category">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading categories...</div>
            ) : categoriesTree?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No categories found.</div>
            ) : (
              renderTree(categoriesTree || [])
            )}
          </div>
        </div>
      </div>

      <Dialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Posts in this category will be uncategorized. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} data-testid="btn-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={e => {
                  const newName = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    name: newName,
                    ...(!editingId && !prev.slug ? { slug: newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') } : {}),
                  }));
                }}
                data-testid="input-cat-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={e => setFormData(prev => ({...prev, slug: e.target.value}))}
                data-testid="input-cat-slug"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Brief description shown on the slider…"
                rows={3}
                data-testid="input-cat-desc"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Image className="w-4 h-4 text-muted-foreground" /> Slider Background Image URL</Label>
              <Input
                value={formData.imageUrl}
                onChange={e => setFormData(prev => ({...prev, imageUrl: e.target.value}))}
                placeholder="https://example.com/image.jpg"
                data-testid="input-cat-image-url"
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border h-28">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Paste any image URL to use as the slider background for this category.</p>
            </div>
            <div className="space-y-2">
              <Label>Parent Category (optional)</Label>
              <select
                className="w-full border border-border bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.parentId ?? ""}
                onChange={e => setFormData(prev => ({...prev, parentId: e.target.value ? parseInt(e.target.value, 10) : null}))}
                data-testid="select-cat-parent"
              >
                <option value="">— None (top level) —</option>
                {flattenTree(categoriesTree || []).filter(c => c.id !== editingId).map(c => (
                  <option key={c.id} value={c.id}>{c.depth > 0 ? `${"  ".repeat(c.depth)}↳ ` : ""}{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="btn-save-category">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
