import DOMPurify from "dompurify";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteSetting } from "@/lib/api-hooks";

export default function Terms() {
  const { t } = useTranslation();
  const { data, isLoading } = useSiteSetting("terms_of_service");

  const hasCustomContent = !!data?.value;

  return (
    <Layout>
      <div className="py-12 sm:py-16 px-4 max-w-3xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">{t("termsTitle")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{t("termsTitle")}</h1>
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
            <p>{t("termsIntro")}</p>
            <h2>{t("useOfContent")}</h2>
            <p>{t("useOfContentText")}</p>
            <h2>{t("acceptableUse")}</h2>
            <p>{t("acceptableUseText")}</p>
            <h2>{t("disclaimerTitle")}</h2>
            <p>{t("disclaimerText")}</p>
            <h2>{t("contact")}</h2>
            <p>{t("termsContactText")} <Link href="/contact" className="text-primary hover:underline">{t("contactUs")}</Link>.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
