interface PageSeoOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterImage?: string;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  siteName?: string;
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(selector: string, attr: string, attrVal: string, contentAttr: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`${selector}[${attr}="${attrVal}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute(contentAttr, content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.querySelector(`script[data-page-seo="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-page-seo", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  const el = document.querySelector(`script[data-page-seo="${id}"]`);
  if (el) el.remove();
}

export function setPageMeta(opts: PageSeoOptions) {
  if (opts.title) document.title = opts.title;

  upsertMeta("meta", "name", "description", "content", opts.description || "");
  upsertMeta("meta", "name", "keywords", "content", opts.keywords || "");
  if (opts.author) upsertMeta("meta", "name", "author", "content", opts.author);

  if (opts.canonicalUrl) upsertLink("canonical", opts.canonicalUrl);

  upsertMeta("meta", "property", "og:type", "content", opts.ogType || "website");
  if (opts.title) upsertMeta("meta", "property", "og:title", "content", opts.title);
  upsertMeta("meta", "property", "og:description", "content", opts.description || "");
  if (opts.ogUrl) upsertMeta("meta", "property", "og:url", "content", opts.ogUrl);
  if (opts.ogImage) upsertMeta("meta", "property", "og:image", "content", opts.ogImage);
  if (opts.siteName) upsertMeta("meta", "property", "og:site_name", "content", opts.siteName);

  upsertMeta("meta", "name", "twitter:card", "content", opts.twitterCard || "summary_large_image");
  if (opts.title) upsertMeta("meta", "name", "twitter:title", "content", opts.title);
  upsertMeta("meta", "name", "twitter:description", "content", opts.description || "");
  if (opts.twitterImage || opts.ogImage) {
    upsertMeta("meta", "name", "twitter:image", "content", (opts.twitterImage || opts.ogImage)!);
  }

  if (opts.publishedAt) upsertMeta("meta", "property", "article:published_time", "content", opts.publishedAt);
  if (opts.modifiedAt) upsertMeta("meta", "property", "article:modified_time", "content", opts.modifiedAt);

  if (opts.jsonLd) {
    upsertJsonLd("page", opts.jsonLd);
  } else {
    removeJsonLd("page");
  }
}

export function resetPageMeta() {
  removeJsonLd("page");
}
