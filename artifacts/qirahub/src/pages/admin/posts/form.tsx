import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import type { PostStatus, PostPosition } from "@workspace/api-client-react";
import { useCreatePost, useUpdatePost, useGetPost, useListTags, useCreateTag, useListCategories, getGetPostQueryKey, getListPostsQueryKey, getGetRecentPostsQueryKey, getGetFeaturedPostsQueryKey, getGetPostsPerCategoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Link2, Minus, Undo2, Redo2, Type,
  ImageIcon, Tag, Folder, Video, Pin, Search, X,
} from "lucide-react";

export default function AdminPostForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const isEditing = !!id && id !== "new";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useGetPost(Number(id), {}, { query: { enabled: isEditing, queryKey: getGetPostQueryKey(Number(id)) } });
  const { data: tagsData } = useListTags();
  const { data: categoriesData } = useListCategories();
  const createTag = useCreateTag();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [position, setPosition] = useState<PostPosition>("normal");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setMetaTitle(post.metaTitle || "");
      setMetaDescription(post.metaDescription || "");
      setStatus(post.status);
      setFeaturedImage(post.featuredImageUrl || "");
      setVideoUrl(post.videoUrl || "");
      setPosition(post.position);
      setCategoryId(post.categoryId ?? null);
      setSelectedTags(post.tags?.map(t => t.id) || []);
      if (editorRef.current) editorRef.current.innerHTML = post.content;
    }
  }, [post, isEditing]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitle(v);
    if (!isEditing) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim());
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const val = tagInput.trim();
    if (!val) return;
    const existing = tagsData?.find(t => t.name.toLowerCase() === val.toLowerCase());
    if (existing) {
      if (!selectedTags.includes(existing.id)) setSelectedTags([...selectedTags, existing.id]);
      setTagInput("");
    } else {
      createTag.mutate({ data: { name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, "-") } }, {
        onSuccess: (newTag) => { setSelectedTags([...selectedTags, newTag.id]); setTagInput(""); },
      });
    }
  };

  const handleSave = (publish: boolean) => {
    const currentContent = editorRef.current?.innerHTML || "";
    const postData = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim(),
      content: currentContent,
      metaTitle,
      metaDescription,
      status: publish ? "published" as const : "draft" as const,
      featuredImageUrl: featuredImage,
      videoUrl,
      position,
      tagIds: selectedTags,
      ...(categoryId !== null ? { categoryId } : {}),
    };
    if (!postData.title || !postData.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const invalidateStats = () => {
      queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentPostsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetFeaturedPostsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetPostsPerCategoryQueryKey() });
    };

    if (isEditing) {
      updatePost.mutate({ id: Number(id), data: postData }, {
        onSuccess: () => { toast({ title: "Post updated successfully" }); invalidateStats(); setLocation("/admin/posts"); },
      });
    } else {
      createPost.mutate({ data: postData }, {
        onSuccess: () => { toast({ title: "Post created successfully" }); invalidateStats(); setLocation("/admin/posts"); },
      });
    }
  };

  const fmt = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) fmt("createLink", url);
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const POSITIONS: { value: PostPosition; label: string; desc: string }[] = [
    { value: "normal",   label: "Normal",   desc: "Default listing order" },
    { value: "featured", label: "Featured", desc: "Homepage highlight" },
    { value: "pinned",   label: "Pinned",   desc: "Always on top" },
    { value: "series",   label: "Series",   desc: "Part of a series" },
  ];

  const ToolbarBtn = ({ onClick, title: t, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={t}
      className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
      {children}
    </button>
  );

  const SideCard = ({ icon, title: t, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{t}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{children}</label>
  );

  const themedInput = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors";

  return (
    <AdminLayout>
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-5 bg-card border border-border rounded-xl px-5 py-3 sticky top-20 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground text-sm">
            {isEditing ? "Edit Post" : "New Post"}
          </span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
            status === "published"
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : "bg-orange-500/10 text-orange-400 border-orange-500/30"
          }`}>
            {status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/posts")}>
            Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} data-testid="btn-save-draft">
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} data-testid="btn-publish">
            Publish
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: Main content ── */}
        <div className="space-y-4">

          {/* Title + Slug card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Post title…"
                value={title}
                onChange={handleTitleChange}
                data-testid="input-post-title"
                className="w-full text-xl font-bold bg-transparent text-foreground placeholder:text-muted-foreground/50 border-none outline-none focus:outline-none"
              />
            </div>
            <div className="border-t border-border/60 pt-3">
              <FieldLabel>URL Slug</FieldLabel>
              <div className="flex items-stretch">
                <span className="flex items-center px-3 text-xs text-muted-foreground bg-muted border border-border border-r-0 rounded-l-lg whitespace-nowrap">
                  /blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  data-testid="input-post-slug"
                  placeholder="seo-friendly-url"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-r-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Content editor card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Post Content</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/60 flex-wrap bg-muted/10">
              <ToolbarBtn onClick={() => fmt("bold")} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("italic")} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("underline")} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("strikeThrough")} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-5 bg-border mx-1" />
              <ToolbarBtn onClick={() => fmt("formatBlock", "H2")} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("formatBlock", "H3")} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("formatBlock", "P")} title="Paragraph"><Type className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-5 bg-border mx-1" />
              <ToolbarBtn onClick={() => fmt("insertUnorderedList")} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("insertOrderedList")} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-5 bg-border mx-1" />
              <ToolbarBtn onClick={insertLink} title="Insert link"><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("insertHorizontalRule")} title="Divider"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-5 bg-border mx-1" />
              <ToolbarBtn onClick={() => fmt("undo")} title="Undo"><Undo2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => fmt("redo")} title="Redo"><Redo2 className="w-3.5 h-3.5" /></ToolbarBtn>
            </div>

            {/* Editable area */}
            <div
              ref={editorRef}
              contentEditable
              data-testid="editor-content"
              data-placeholder="Start writing your post content here… Use the toolbar above to format headings, lists, links, and more."
              className="min-h-[320px] p-5 text-sm text-foreground leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_hr]:border-border [&_hr]:my-4 [&_strong]:font-bold [&_em]:italic"
            />
          </div>

          {/* SEO card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">SEO Meta Information</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel>Meta Title</FieldLabel>
                  <span className={`text-xs font-mono ${metaTitle.length > 55 ? "text-orange-400" : "text-muted-foreground"}`}>
                    {metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  className={themedInput}
                  placeholder="Page title for search engines…"
                  maxLength={60}
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel>Meta Description</FieldLabel>
                  <span className={`text-xs font-mono ${metaDescription.length > 150 ? "text-orange-400" : "text-muted-foreground"}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  className={`${themedInput} resize-none`}
                  rows={3}
                  placeholder="Brief description for search engine results…"
                  maxLength={160}
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4">

          {/* Featured Image */}
          <SideCard icon={<ImageIcon className="w-4 h-4" />} title="Featured Image">
            <div>
              <FieldLabel>Image URL</FieldLabel>
              <input
                type="url"
                className={themedInput}
                placeholder="https://…"
                value={featuredImage}
                onChange={e => setFeaturedImage(e.target.value)}
              />
              {featuredImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.parentElement!.style.display = "none")}
                  />
                </div>
              )}
            </div>
          </SideCard>

          {/* Category */}
          <SideCard icon={<Folder className="w-4 h-4" />} title="Category">
            <div>
              <FieldLabel>Assign Category</FieldLabel>
              <select
                className={themedInput}
                value={categoryId ?? ""}
                onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
                data-testid="select-category"
              >
                <option value="">— No Category —</option>
                {categoriesData?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </SideCard>

          {/* Tags */}
          <SideCard icon={<Tag className="w-4 h-4" />} title="Tags">
            <div>
              <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] bg-background border border-border rounded-lg focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-colors">
                {selectedTags.map(tagId => {
                  const t = tagsData?.find(x => x.id === tagId);
                  if (!t) return null;
                  return (
                    <span key={t.id} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs font-medium">
                      {t.name}
                      <button type="button" onClick={() => setSelectedTags(selectedTags.filter(i => i !== t.id))}
                        className="opacity-60 hover:opacity-100 transition-opacity ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                <input
                  type="text"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-[80px]"
                  placeholder={selectedTags.length === 0 ? "Add tag…" : ""}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Press Enter or comma to add</p>
            </div>
          </SideCard>

          {/* Video */}
          <SideCard icon={<Video className="w-4 h-4" />} title="Video">
            <div>
              <FieldLabel>Video Link</FieldLabel>
              <input
                type="url"
                className={themedInput}
                placeholder="YouTube or Vimeo URL…"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">YouTube and Vimeo links auto-embed</p>
            </div>
          </SideCard>

          {/* Position */}
          <SideCard icon={<Pin className="w-4 h-4" />} title="Post Position">
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPosition(p.value)}
                  className={`flex flex-col gap-0.5 p-3 rounded-lg border text-left transition-all ${
                    position === p.value
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className={`text-[10px] ${position === p.value ? "text-primary/70" : "text-muted-foreground"}`}>{p.desc}</span>
                </button>
              ))}
            </div>
          </SideCard>

        </div>
      </div>
    </AdminLayout>
  );
}
