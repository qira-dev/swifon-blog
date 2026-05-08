import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { canDelete } from "@/lib/admin-auth";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, Search, X } from "lucide-react";

interface FormData {
  name: string;
  slug: string;
  categoryId: number;
  description: string;
  shortDescription: string;
  rating: number;
  rank: number;
  pricing: string;
  websiteUrl: string;
  imageUrl: string;
  pros: string;
  cons: string;
}

const emptyForm: FormData = {
  name: "", slug: "", categoryId: 0, description: "", shortDescription: "",
  rating: 0, rank: 1, pricing: "", websiteUrl: "", imageUrl: "", pros: "", cons: "",
};

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const { toast } = useToast();

  const { data: products, isLoading } = useProducts({ categoryId: selectedCategoryId, search });
  const { data: categories } = useListCategories({});
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  function handleEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      rating: product.rating,
      rank: product.rank,
      pricing: product.pricing || "",
      websiteUrl: product.websiteUrl || "",
      imageUrl: product.imageUrl || "",
      pros: (product.pros || []).join("\n"),
      cons: (product.cons || []).join("\n"),
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function handleAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    if (!form.categoryId) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categoryId: form.categoryId,
      description: form.description,
      shortDescription: form.shortDescription,
      rating: Number(form.rating),
      rank: Number(form.rank),
      pricing: form.pricing,
      websiteUrl: form.websiteUrl,
      imageUrl: form.imageUrl,
      pros: form.pros.split("\n").filter(s => s.trim()),
      cons: form.cons.split("\n").filter(s => s.trim()),
    };

    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Product updated" });
      } else {
        await createProduct.mutateAsync(payload);
        toast({ title: "Product created" });
      }
      setShowForm(false);
    } catch {
      toast({ title: "Error saving product", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">Manage product reviews and Top 5 listings</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            value={selectedCategoryId || ""}
            onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Categories</option>
            {categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">{editingId ? "Edit Product" : "Add Product"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" />
              </div>
              <div>
                <Label>Category <span className="text-destructive">*</span></Label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                >
                  <option value={0}>Select category (required)...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Pricing</Label>
                <Input value={form.pricing} onChange={e => setForm({ ...form, pricing: e.target.value })} placeholder="e.g. $9.99/mo" />
              </div>
              <div>
                <Label>Rating (0-5)</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Rank</Label>
                <Input type="number" min="1" value={form.rank} onChange={e => setForm({ ...form, rank: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <Label>Short Description</Label>
                <Input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Full Description</Label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] bg-background text-foreground" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div>
                <Label>Pros (one per line)</Label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] bg-background text-foreground" value={form.pros} onChange={e => setForm({ ...form, pros: e.target.value })} />
              </div>
              <div>
                <Label>Cons (one per line)</Label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] bg-background text-foreground" value={form.cons} onChange={e => setForm({ ...form, cons: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave}>{editingId ? "Update" : "Create"} Product</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Rank</th>
                <th className="text-left p-4 font-semibold text-foreground">Product</th>
                <th className="text-left p-4 font-semibold text-foreground">Category</th>
                <th className="text-left p-4 font-semibold text-foreground">Rating</th>
                <th className="text-left p-4 font-semibold text-foreground">Pricing</th>
                <th className="text-right p-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : products?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td></tr>
              ) : (
                products?.map(product => {
                  const cat = categories?.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="p-4">
                        <Badge variant="secondary">#{product.rank}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.slug}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{cat?.name || `#${product.categoryId}`}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-foreground">{product.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-primary font-medium">{product.pricing}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete() && (
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(product.id)}>
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
