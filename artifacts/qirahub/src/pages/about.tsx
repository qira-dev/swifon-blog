import DOMPurify from "dompurify";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteSetting } from "@/lib/api-hooks";

export default function About() {
  const { t } = useTranslation();
  const { data: titleData, isLoading: loadingTitle } = useSiteSetting("about_title");
  const { data: contentData, isLoading: loadingContent } = useSiteSetting("about_content");

  const hasCustomContent = !!contentData?.value;
  const isLoading = loadingTitle || loadingContent;

  return (
    <Layout>
      <div className="py-12 sm:py-16 px-4 max-w-3xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">{t("aboutUs")}</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          </div>
        ) : hasCustomContent ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              {titleData?.value || t("aboutTitle")}
            </h1>
            <div
              className="prose-theme max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentData.value) }}
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{t("aboutTitle")}</h1>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              {t("aboutDesc1")}
            </p>
            <p className="text-foreground/70 mb-6 leading-relaxed">
              {t("aboutDesc2")}
            </p>
            <p className="text-foreground/70 leading-relaxed">
              {t("aboutDesc3")}
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
