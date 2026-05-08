import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { canDelete } from "@/lib/admin-auth";
import { useComparisons, useProducts, useCreateComparison, useUpdateComparison, useDeleteComparison, type Comparison } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, BarChart3 } from "lucide-react";

export default function AdminComparisons() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", categoryId: 0, description: "", verdict: "" });
  const { toast } = useToast();

  const { data: comparisons, isLoading } = useComparisons();
  const { data: categories } = useListCategories({});
  const { data: allProducts } = useProducts();
  const createComparison = useCreateComparison();
  const updateComparison = useUpdateComparison();
  const deleteComparison = useDeleteComparison();

  function handleEdit(comparison: Comparison) {
    setForm({
      title: comparison.title,
      slug: comparison.slug,
      categoryId: comparison.categoryId,
      description: comparison.description || "",
      verdict: comparison.verdict || "",
    });
    setEditingId(comparison.id);
    setShowForm(true);
  }

  function handleAdd() {
    setForm({ title: "", slug: "", categoryId: 0, description: "", verdict: "" });
    setEditingId(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ title: "Comparison title is required", variant: "destructive" });
      return;
    }
    if (!form.categoryId) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }

    const categoryProducts = allProducts?.filter(p => p.categoryId === form.categoryId) || [];
    const productIds = categoryProducts.map(p => p.id);
    const comparisonFields = Array.from(new Set(categoryProducts.flatMap(p => Object.keys(p.features || {}))));

    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categoryId: form.categoryId,
      description: form.description,
      verdict: form.verdict,
      productIds,
      comparisonFields,
    };

    try {
      if (editingId) {
        await updateComparison.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Comparison updated" });
      } else {
        await createComparison.mutateAsync(payload);
        toast({ title: "Comparison created" });
      }
      setShowForm(false);
    } catch {
      toast({ title: "Error saving comparison", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this comparison?")) return;
    try {
      await deleteComparison.mutateAsync(id);
      toast({ title: "Comparison deleted" });
    } catch {
      toast({ title: "Error deleting comparison", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comparisons</h1>
            <p className="text-sm text-muted-foreground">Manage product comparison tables</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Comparison
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">{editingId ? "Edit Comparison" : "Add Comparison"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>
              <div>
                <Label>Category <span className="text-destructive">*</span></Label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                >
                  <option value={0}>Select category...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] bg-background text-foreground" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Verdict</Label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] bg-background text-foreground" value={form.verdict} onChange={e => setForm({ ...form, verdict: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave}>{editingId ? "Update" : "Create"} Comparison</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Title</th>
                <th className="text-left p-4 font-semibold text-foreground">Category</th>
                <th className="text-left p-4 font-semibold text-foreground">Products</th>
                <th className="text-right p-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : comparisons?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No comparisons found</td></tr>
              ) : (
                comparisons?.map(comp => {
                  const cat = categories?.find(c => c.id === comp.categoryId);
                  return (
                    <tr key={comp.id} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{comp.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{comp.slug}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{cat?.name || `#${comp.categoryId}`}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{(comp.productIds || []).length} products</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(comp)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete() && (
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(comp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
