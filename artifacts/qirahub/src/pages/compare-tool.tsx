import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useProducts, useComparisons, type Product } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scale,
  ChevronRight,
  Star,
  Check,
  X,
  Search,
  Trophy,
  Medal,
  ExternalLink,
  Zap,
  ArrowRight,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { getCategoryTheme } from "@/lib/category-colors";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-sm font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductSelectCard({
  product,
  selected,
  disabled,
  onToggle,
  index,
}: {
  product: Product;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  index: number;
}) {
  const theme = getCategoryTheme("", index);
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 relative group ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : disabled
          ? "border-border bg-muted/20 opacity-50 cursor-not-allowed"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
          >
            {product.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
            {product.rank === 1 && <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
          </div>
          <StarRating rating={product.rating} />
          {product.pricing && (
            <p className="text-xs text-primary font-semibold mt-1">{product.pricing}</p>
          )}
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            selected ? "bg-primary border-primary" : "border-muted-foreground/40 group-hover:border-primary/60"
          }`}
        >
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
    </button>
  );
}

function ComparisonTable({ products }: { products: Product[] }) {
  const allFeatureKeys = useMemo(() => {
    return Array.from(new Set(products.flatMap(p => Object.keys(p.features || {}))));
  }, [products]);

  const winner = products.reduce((best, p) => (p.rating > best.rating ? p : best), products[0]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}>
        {/* Header row */}
        <div />
        {products.map((p, i) => {
          const isWinner = p.id === winner.id && products.length > 1;
          const theme = getCategoryTheme("", i);
          return (
            <div key={p.id} className="text-center relative">
              {isWinner && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-bold gap-1">
                    <Trophy className="w-3 h-3" /> Best
                  </Badge>
                </div>
              )}
              <div
                className={`bg-card border rounded-xl p-4 mt-4 ${isWinner ? "border-primary/40 shadow-sm" : "border-border"}`}
                style={isWinner ? { boxShadow: theme.glow } : {}}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-border" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 text-lg font-black"
                    style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
                  >
                    {p.name.charAt(0)}
                  </div>
                )}
                <p className="font-bold text-sm text-foreground mb-1">{p.name}</p>
                <StarRating rating={p.rating} size="sm" />
                {p.pricing && <p className="text-xs text-primary font-semibold mt-1">{p.pricing}</p>}
                <div className="flex gap-1.5 mt-3 justify-center">
                  <Link href={`/product/${p.slug}`}>
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 gap-1">
                      Review <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  {p.websiteUrl && (
                    <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="text-xs h-7 px-2.5 gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Rating */}
        <div className="flex items-center px-3 py-3 text-sm font-semibold text-foreground bg-muted/30 rounded-lg">
          Rating
        </div>
        {products.map((p, i) => {
          const isTop = p.id === winner.id && products.length > 1;
          return (
            <div key={p.id} className={`flex items-center justify-center py-3 ${isTop ? "bg-primary/5 rounded-lg" : ""}`}>
              <StarRating rating={p.rating} size="md" />
            </div>
          );
        })}

        {/* Pricing */}
        <div className="flex items-center px-3 py-3 text-sm font-semibold text-foreground">
          Pricing
        </div>
        {products.map((p, i) => {
          const isTop = p.id === winner.id && products.length > 1;
          return (
            <div key={p.id} className={`flex items-center justify-center py-3 ${isTop ? "bg-primary/5 rounded-lg" : ""}`}>
              <span className="text-sm font-bold text-primary">{p.pricing || "—"}</span>
            </div>
          );
        })}

        {/* Features */}
        {allFeatureKeys.map((key, rowIndex) => (
          <>
            <div
              key={`label-${key}`}
              className={`flex items-center px-3 py-3 text-sm font-medium text-muted-foreground ${rowIndex % 2 === 0 ? "bg-muted/20 rounded-lg" : ""}`}
            >
              {key}
            </div>
            {products.map((p, i) => {
              const isTop = p.id === winner.id && products.length > 1;
              const val = (p.features || {})[key] || "—";
              const isYes = val.toLowerCase() === "yes" || val.toLowerCase() === "true";
              const isNo = val.toLowerCase() === "no" || val.toLowerCase() === "false";
              return (
                <div
                  key={`${key}-${p.id}`}
                  className={`flex items-center justify-center py-3 ${
                    rowIndex % 2 === 0 ? "bg-muted/20 rounded-lg" : ""
                  } ${isTop ? "bg-primary/5" : ""}`}
                >
                  {isYes ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  ) : isNo ? (
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  ) : (
                    <span className="text-sm text-foreground">{val}</span>
                  )}
                </div>
              );
            })}
          </>
        ))}

        {/* Pros */}
        <div className="flex items-start px-3 py-3 text-sm font-semibold text-foreground bg-green-500/5 rounded-lg">
          <span className="text-green-500 mr-1.5">✓</span> Pros
        </div>
        {products.map((p, i) => {
          const isTop = p.id === winner.id && products.length > 1;
          return (
            <div key={p.id} className={`py-3 px-2 ${isTop ? "bg-primary/5 rounded-lg" : ""}`}>
              {(p.pros || []).length > 0 ? (
                <ul className="space-y-1.5">
                  {p.pros.slice(0, 5).map((pro, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-green-500">
                      <Check className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="text-foreground leading-snug">{pro}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          );
        })}

        {/* Cons */}
        <div className="flex items-start px-3 py-3 text-sm font-semibold text-foreground bg-red-500/5 rounded-lg">
          <span className="text-red-400 mr-1.5">✗</span> Cons
        </div>
        {products.map((p, i) => {
          const isTop = p.id === winner.id && products.length > 1;
          return (
            <div key={p.id} className={`py-3 px-2 ${isTop ? "bg-primary/5 rounded-lg" : ""}`}>
              {(p.cons || []).length > 0 ? (
                <ul className="space-y-1.5">
                  {p.cons.slice(0, 5).map((con, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-red-400">
                      <X className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="text-foreground leading-snug">{con}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MAX_PRODUCTS = 4;

export default function CompareTool() {
  const { langCode } = useTranslation();
  const { data: categories, isLoading: catsLoading } = useListCategories({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const { data: allProducts, isLoading: productsLoading } = useProducts({ lang: langCode });

  const categoryProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!selectedCategoryId) return allProducts;
    return allProducts.filter(p => p.categoryId === selectedCategoryId);
  }, [allProducts, selectedCategoryId]);

  const filteredProducts = categoryProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProducts = (allProducts || []).filter(p => selectedProductIds.includes(p.id));

  function toggleProduct(id: number) {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleCategoryChange(id: number) {
    setSelectedCategoryId(id);
    setSelectedProductIds([]);
    setSearch("");
  }

  const categoriesWithProducts = useMemo(() => {
    const categoryIdsWithProducts = new Set((allProducts || []).map(p => p.categoryId));
    return (categories || []).filter((c: any) => categoryIdsWithProducts.has(c.id));
  }, [categories, allProducts]);

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/comparisons" className="hover:text-foreground transition-colors">Comparisons</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Compare Tool</span>
        </div>

        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Interactive Compare Tool
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Compare Any Products
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Select a category, pick up to {MAX_PRODUCTS} products, and instantly see a side-by-side comparison of features, pricing, pros & cons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-xl p-4">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">1</span>
                Select a Category
              </h2>
              {catsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {categoriesWithProducts.map((cat: any) => {
                    const theme = getCategoryTheme(cat.name, cat.id);
                    const isActive = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{
                            background: theme.bg,
                            color: theme.accentHex,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {cat.name.charAt(0)}
                        </div>
                        <span className="truncate">{cat.name}</span>
                        {isActive && <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCategoryId && (
              <div className="bg-card border border-card-border rounded-xl p-4">
                <h2 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">2</span>
                  Pick Products
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {selectedProductIds.length}/{MAX_PRODUCTS}
                  </span>
                </h2>

                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                {productsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No products found.</p>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredProducts.map((p, i) => (
                      <ProductSelectCard
                        key={p.id}
                        product={p}
                        selected={selectedProductIds.includes(p.id)}
                        disabled={selectedProductIds.length >= MAX_PRODUCTS}
                        onToggle={() => toggleProduct(p.id)}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {selectedProductIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {selectedProductIds.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}

            {!selectedCategoryId && (
              <div className="bg-muted/30 border border-border rounded-xl p-5 text-center">
                <Scale className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a category above to start comparing products</p>
              </div>
            )}
          </div>

          <div>
            {selectedProducts.length < 2 ? (
              <div className="bg-card border border-card-border rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <Scale className="w-14 h-14 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {selectedCategoryId
                    ? `Select ${2 - selectedProductIds.length} more product${2 - selectedProductIds.length === 1 ? "" : "s"}`
                    : "Choose a category first"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {selectedCategoryId
                    ? "Pick at least 2 products from the left panel to start comparing."
                    : "Select a category from the left panel to see available products."}
                </p>
                {selectedCategoryId && (
                  <div className="flex gap-2 mt-6">
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                          selectedProductIds.length >= i
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/20"
                        }`}
                      >
                        {selectedProductIds.length >= i ? (
                          <Check className="w-5 h-5 text-primary" />
                        ) : (
                          <Plus className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">
                      Comparison Results
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {selectedProducts.length} products
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Highest rated is highlighted</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <ComparisonTable products={selectedProducts} />
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-muted-foreground">
                    Browse <Link href="/comparisons" className="text-primary hover:underline font-medium">expert comparisons</Link> for more in-depth analysis.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProductIds([])}
                    className="gap-1.5"
                  >
                    <Minus className="w-3.5 h-3.5" /> Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
