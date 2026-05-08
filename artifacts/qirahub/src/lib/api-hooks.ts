import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...(optHeaders as Record<string, string>) },
    ...restOptions,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string | null;
  shortDescription: string | null;
  rating: number;
  rank: number;
  pros: string[];
  cons: string[];
  features: Record<string, string>;
  pricing: string | null;
  affiliateUrl: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comparison {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  description: string | null;
  productIds: number[];
  comparisonFields: string[];
  verdict: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: number | null;
  sortOrder: number;
  isVisible: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function useAdminUsers() {
  return useQuery<{ users: { id: number; username: string; email: string; role: string | null }[]; total: number }>({
    queryKey: ["admin-users-list"],
    queryFn: () => {
      const token = sessionStorage.getItem("qirahub_user_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_BASE}/admin/users`, { headers }).then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      });
    },
    enabled: !!sessionStorage.getItem("qirahub_user_token"),
  });
}

export function useProducts(params?: { categoryId?: number; search?: string; lang?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.lang) searchParams.set("lang", params.lang);
  const qs = searchParams.toString();

  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: () => apiFetch(`/products${qs ? `?${qs}` : ""}`),
  });
}

export function useProductsByCategorySlug(slug: string | undefined, lang?: string) {
  const qs = lang ? `?lang=${lang}` : "";
  return useQuery<{ category: Category; products: Product[] }>({
    queryKey: ["products-by-category-slug", slug, lang],
    queryFn: () => apiFetch(`/products/by-category-slug/${slug}${qs}`),
    enabled: !!slug,
  });
}

export function useProductBySlug(slug: string | undefined, lang?: string) {
  const qs = lang ? `?lang=${lang}` : "";
  return useQuery<{ product: Product; category: Category; relatedProducts: Product[] }>({
    queryKey: ["product", slug, lang],
    queryFn: () => apiFetch(`/products/slug/${slug}${qs}`),
    enabled: !!slug,
  });
}

export function useProductById(id: number | undefined) {
  return useQuery<Product>({
    queryKey: ["product-id", id],
    queryFn: () => apiFetch(`/products/${id}`),
    enabled: !!id,
  });
}

export function useComparisons(params?: { categoryId?: number; lang?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));
  if (params?.lang) searchParams.set("lang", params.lang);
  const qs = searchParams.toString();

  return useQuery<Comparison[]>({
    queryKey: ["comparisons", params],
    queryFn: () => apiFetch(`/comparisons${qs ? `?${qs}` : ""}`),
  });
}

export function useComparisonBySlug(slug: string | undefined, lang?: string) {
  const qs = lang ? `?lang=${lang}` : "";
  return useQuery<{ comparison: Comparison; category: Category; products: Product[] }>({
    queryKey: ["comparison", slug, lang],
    queryFn: () => apiFetch(`/comparisons/slug/${slug}${qs}`),
    enabled: !!slug,
  });
}

export function useComparisonsByCategoryId(categoryId: number | undefined, lang?: string) {
  const qs = lang ? `?lang=${lang}` : "";
  return useQuery<Comparison[]>({
    queryKey: ["comparisons-by-category", categoryId, lang],
    queryFn: () => apiFetch(`/comparisons/category/${categoryId}${qs}`),
    enabled: !!categoryId,
  });
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  if (sessionStorage.getItem("qirahub_admin_authed") !== "1") return {};
  const token = sessionStorage.getItem("qirahub_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: number }) =>
      apiFetch<Product>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Comparison>) =>
      apiFetch<Comparison>("/comparisons", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}

export function useUpdateComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Comparison> & { id: number }) =>
      apiFetch<Comparison>(`/comparisons/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}

export function useDeleteComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/comparisons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}

export interface SiteSetting {
  key: string;
  value: string;
}

export function useSiteSetting(key: string) {
  return useQuery<SiteSetting>({
    queryKey: ["site-setting", key],
    queryFn: () => apiFetch(`/settings/${key}`),
  });
}

export function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiFetch(`/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
        headers: getAuthHeaders(),
      }),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["site-setting", vars.key] }),
  });
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["social-links"],
    queryFn: () => apiFetch("/social-links"),
  });
}

export function useCreateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SocialLink>) =>
      apiFetch<SocialLink>("/social-links", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-links"] }),
  });
}

export function useUpdateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<SocialLink> & { id: number }) =>
      apiFetch<SocialLink>(`/social-links/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-links"] }),
  });
}

export function useDeleteSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/social-links/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-links"] }),
  });
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export function useContactMessages() {
  return useQuery<ContactMessage[]>({
    queryKey: ["contact-messages"],
    queryFn: () =>
      apiFetch("/contact-messages", {
        headers: getAuthHeaders(),
      }),
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject?: string; message: string }) =>
      apiFetch<{ success: boolean; id: number }>("/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useReplyToMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      apiFetch(`/contact-messages/${id}/reply`, {
        method: "PUT",
        body: JSON.stringify({ reply }),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
}

export function useUpdateMessageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiFetch(`/contact-messages/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/contact-messages/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
}

export interface Ad {
  id: number;
  name: string;
  type: string;
  page: string;
  position: string;
  network: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  redirectUrl: string | null;
  adCode: string | null;
  slotId: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdNetworkCredential {
  network: string;
  credentials: string;
  isEnabled: boolean;
  updatedAt: string;
}

export function useAds(page?: string, position?: string) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (position) params.set("position", position);
  const qs = params.toString();
  return useQuery<Ad[]>({
    queryKey: ["ads", page, position],
    queryFn: () => apiFetch(`/ads${qs ? `?${qs}` : ""}`),
    staleTime: 60_000,
  });
}

export function useAllAds() {
  return useQuery<Ad[]>({
    queryKey: ["ads-all"],
    queryFn: () =>
      apiFetch("/ads/all", {
        headers: getAuthHeaders(),
      }),
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Ad>) =>
      apiFetch<Ad>("/ads", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads-all"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Ad> & { id: number }) =>
      apiFetch<Ad>(`/ads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads-all"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useToggleAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<Ad>(`/ads/${id}/toggle`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads-all"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/ads/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads-all"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

/* ═══════════════════════════ AD NETWORK CREDENTIALS ═══════════════════ */

export function useAdNetworkCredentials() {
  return useQuery<AdNetworkCredential[]>({
    queryKey: ["ad-network-credentials"],
    queryFn: () => apiFetch("/ad-network-credentials", { headers: getAuthHeaders() }),
  });
}

export function usePublicAdNetworkCredentials() {
  return useQuery<Record<string, Record<string, string>>>({
    queryKey: ["ad-network-credentials-public"],
    queryFn: () => apiFetch("/ad-network-credentials/public"),
    staleTime: 60_000,
  });
}

export function useUpdateAdNetworkCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ network, credentials, isEnabled }: {
      network: string;
      credentials?: Record<string, string>;
      isEnabled?: boolean;
    }) =>
      apiFetch(`/ad-network-credentials/${network}`, {
        method: "PUT",
        body: JSON.stringify({ credentials, isEnabled }),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-network-credentials"] });
      qc.invalidateQueries({ queryKey: ["ad-network-credentials-public"] });
    },
  });
}

/* ═══════════════════════════════ COUPONS ═══════════════════════════════ */

export interface Coupon {
  id: number;
  title: string;
  code: string;
  category: string;
  type: string;
  discount: string | null;
  description: string | null;
  terms: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  affiliateUrl: string | null;
  expiresAt: string | null;
  isActive: boolean;
  isVerified: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponAd {
  id: number;
  name: string;
  couponId: number | null;
  type: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  redirectUrl: string | null;
  adCode: string | null;
  width: number | null;
  height: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function useCoupons(category?: string) {
  return useQuery({
    queryKey: ["coupons", category || "all"],
    queryFn: () => apiFetch<Coupon[]>(`/coupons${category && category !== "all" ? `?category=${encodeURIComponent(category)}` : ""}`),
  });
}

export function useCouponAdsForCoupon(couponId: number | null) {
  return useQuery({
    queryKey: ["coupon-ads", couponId],
    queryFn: () => apiFetch<CouponAd[]>(`/coupons/${couponId}/ads`),
    enabled: couponId !== null,
  });
}

export function useAllCoupons() {
  return useQuery({
    queryKey: ["coupons-all"],
    queryFn: () => apiFetch<Coupon[]>("/coupons/all", { headers: getAuthHeaders() }),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Coupon>) =>
      apiFetch<Coupon>("/coupons", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons-all"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Coupon> & { id: number }) =>
      apiFetch<Coupon>(`/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons-all"] });
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useToggleCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<Coupon>(`/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons-all"] });
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/coupons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons-all"] }),
  });
}

/* ─── Coupon Ads ─── */

export function useAllCouponAds() {
  return useQuery({
    queryKey: ["coupon-ads-all"],
    queryFn: () => apiFetch<CouponAd[]>("/coupon-ads/all", { headers: getAuthHeaders() }),
  });
}

export function useCreateCouponAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CouponAd>) =>
      apiFetch<CouponAd>("/coupon-ads", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupon-ads-all"] }),
  });
}

export function useUpdateCouponAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CouponAd> & { id: number }) =>
      apiFetch<CouponAd>(`/coupon-ads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupon-ads-all"] }),
  });
}

export function useToggleCouponAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<CouponAd>(`/coupon-ads/${id}/toggle`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupon-ads-all"] }),
  });
}

export function useDeleteCouponAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/coupon-ads/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupon-ads-all"] }),
  });
}
