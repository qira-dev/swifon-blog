import { useEffect } from "react";
import { useSiteSetting } from "@/lib/api-hooks";

function useSiteSettingValue(key: string): string {
  const { data } = useSiteSetting(key);
  return data?.value ?? "";
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

function upsertLink(rel: string, type: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  if (type) el.setAttribute("type", type);
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.querySelector(`script[data-global-seo="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-global-seo", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function GlobalSeoHead() {
  const siteName        = useSiteSettingValue("site_name");
  const siteTagline     = useSiteSettingValue("site_tagline");
  const metaTitle       = useSiteSettingValue("meta_title");
  const metaDescription = useSiteSettingValue("meta_description");
  const metaKeywords    = useSiteSettingValue("meta_keywords");
  const faviconUrl      = useSiteSettingValue("favicon_url");
  const ogImageUrl      = useSiteSettingValue("og_image_url");
  const twitterHandle   = useSiteSettingValue("twitter_handle");
  const robotsMeta      = useSiteSettingValue("robots_meta");
  const siteUrl         = useSiteSettingValue("site_url");
  const googleVerify    = useSiteSettingValue("google_site_verification");
  const authorName      = useSiteSettingValue("author_name");

  const effectiveTitle = metaTitle || (siteName && siteTagline ? `${siteName} – ${siteTagline}` : siteName);
  const effectiveUrl   = siteUrl || window.location.origin;

  useEffect(() => {
    if (effectiveTitle) document.title = effectiveTitle;
  }, [effectiveTitle]);

  useEffect(() => {
    upsertMeta("meta", "name", "description", "content", metaDescription);
    upsertMeta("meta", "property", "og:description", "content", metaDescription);
    upsertMeta("meta", "name", "twitter:description", "content", metaDescription);
  }, [metaDescription]);

  useEffect(() => {
    upsertMeta("meta", "name", "keywords", "content", metaKeywords);
  }, [metaKeywords]);

  useEffect(() => {
    const robots = robotsMeta || "index, follow";
    upsertMeta("meta", "name", "robots", "content", robots);
    upsertMeta("meta", "name", "googlebot", "content", robots);
  }, [robotsMeta]);

  useEffect(() => {
    if (siteName) {
      upsertMeta("meta", "property", "og:site_name", "content", siteName);
      upsertMeta("meta", "property", "og:title", "content", effectiveTitle || siteName);
      upsertMeta("meta", "name", "twitter:title", "content", effectiveTitle || siteName);
    }
  }, [siteName, effectiveTitle]);

  useEffect(() => {
    upsertMeta("meta", "property", "og:type", "content", "website");
    upsertMeta("meta", "property", "og:url", "content", effectiveUrl);
    upsertLink("canonical", "", effectiveUrl);
  }, [effectiveUrl]);

  useEffect(() => {
    if (ogImageUrl) {
      upsertMeta("meta", "property", "og:image", "content", ogImageUrl);
      upsertMeta("meta", "property", "og:image:width", "content", "1200");
      upsertMeta("meta", "property", "og:image:height", "content", "630");
      upsertMeta("meta", "name", "twitter:image", "content", ogImageUrl);
    }
  }, [ogImageUrl]);

  useEffect(() => {
    upsertMeta("meta", "name", "twitter:card", "content", "summary_large_image");
    if (twitterHandle) {
      const handle = twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`;
      upsertMeta("meta", "name", "twitter:site", "content", handle);
      upsertMeta("meta", "name", "twitter:creator", "content", handle);
    }
  }, [twitterHandle]);

  useEffect(() => {
    if (googleVerify) {
      upsertMeta("meta", "name", "google-site-verification", "content", googleVerify);
    }
  }, [googleVerify]);

  useEffect(() => {
    if (authorName) {
      upsertMeta("meta", "name", "author", "content", authorName);
    }
  }, [authorName]);

  useEffect(() => {
    if (faviconUrl) {
      upsertLink("icon", "image/x-icon", faviconUrl);
      upsertLink("shortcut icon", "image/x-icon", faviconUrl);
    }
  }, [faviconUrl]);

  useEffect(() => {
    if (!siteName) return;
    const webSiteSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${effectiveUrl}/#website`,
          url: effectiveUrl,
          name: siteName,
          description: metaDescription || undefined,
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${effectiveUrl}/blog?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          "@id": `${effectiveUrl}/#organization`,
          name: siteName,
          url: effectiveUrl,
          logo: {
            "@type": "ImageObject",
            url: ogImageUrl || faviconUrl || undefined,
          },
          ...(twitterHandle ? { sameAs: [`https://twitter.com/${twitterHandle.replace("@", "")}`] } : {}),
        },
      ],
    };
    upsertJsonLd("global", webSiteSchema);
  }, [siteName, effectiveUrl, metaDescription, ogImageUrl, faviconUrl, twitterHandle]);

  return null;
}
