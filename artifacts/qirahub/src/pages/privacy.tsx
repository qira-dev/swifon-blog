import DOMPurify from "dompurify";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteSetting } from "@/lib/api-hooks";

export default function Privacy() {
  const { t } = useTranslation();
  const { data, isLoading } = useSiteSetting("privacy_policy");

  const hasCustomContent = !!data?.value;

  return (
    <Layout>
      <div className="py-12 sm:py-16 px-4 max-w-3xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">{t("privacyTitle")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{t("privacyTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}: March 2026</p>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          </div>
        ) : hasCustomContent ? (
          <div
            className="prose-theme max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.value) }}
          />
        ) : (
          <div className="prose-theme max-w-none">
            <p>{t("privacyIntro")}</p>
            <h2>{t("infoWeCollect")}</h2>
            <p>{t("infoWeCollectText")}</p>
            <h2>{t("cookiesTitle")}</h2>
            <p>{t("cookiesText")}</p>
            <h2>{t("contact")}</h2>
            <p>{t("privacyContactText")} <Link href="/contact" className="text-primary hover:underline">{t("contactUs")}</Link>.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
