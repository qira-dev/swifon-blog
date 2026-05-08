import { Layout } from "@/components/layout/Layout";
import {
  ChevronRight, Mail, MapPin, Send, Loader2, CheckCircle,
  MessageSquare, Clock, ExternalLink, Zap, Globe,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { useSubmitContact, useSocialLinks } from "@/lib/api-hooks";
import { useState } from "react";

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p === "twitter" || p === "x") return "𝕏";
  if (p === "facebook") return "f";
  if (p === "instagram") return "◎";
  if (p === "youtube") return "▶";
  if (p === "linkedin") return "in";
  if (p === "github") return "⌥";
  if (p === "discord") return "⌗";
  if (p === "telegram") return "✈";
  return platform.charAt(0).toUpperCase();
}

export default function Contact() {
  const { t } = useTranslation();
  const submitMutation = useSubmitContact();
  const { data: socialLinks } = useSocialLinks();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeLinks = (socialLinks || []).filter((l) => l.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    try {
      await submitMutation.mutateAsync({ name, email, subject, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {}
  };

  return (
    <Layout>
      <div className="py-8 px-4 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t("contact")}</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <MessageSquare className="w-4 h-4" />
            Get In Touch
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{t("contactUs")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("contactSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">

          {/* Info column */}
          <div className="md:col-span-1 space-y-4">
            {/* Email card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{t("email")}</h3>
              <a
                href="mailto:hello@qirahub.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                hello@qirahub.com
              </a>
            </div>

            {/* Location card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{t("location")}</h3>
              <p className="text-sm text-muted-foreground">San Francisco, CA<br />United States</p>
            </div>

            {/* Response time card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground">Usually within<br />24–48 hours</p>
            </div>

            {/* Social links */}
            {activeLinks.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> Follow Us
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border hover:border-primary/30 rounded-lg text-xs font-medium transition-all"
                    >
                      <span>{getSocialIcon(link.platform)}</span>
                      <span>{link.platform}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
              <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Quick Links
              </h3>
              <div className="space-y-2 text-sm">
                <Link href="/comparisons" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                  <span>Product Comparisons</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/compare-tool" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                  <span>Compare Tool</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/reviews" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                  <span>Product Reviews</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/blog" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                  <span>Blog</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="md:col-span-2 bg-card border border-card-border rounded-2xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t("messageSent") || "Message Sent!"}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {t("messageSentDesc") || "Thank you for reaching out. We'll get back to you within 24–48 hours."}
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t("sendAnother") || "Send Another Message"}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-foreground mb-1">{t("message")}</h2>
                  <p className="text-sm text-muted-foreground">Fill in the form below and we'll respond shortly.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t("name")}</label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t("email")}</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("subject") || "Subject"}</label>
                    <Input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="How can we help?"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("message")}</label>
                    <Textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us more about what you need..."
                      className="min-h-[160px] bg-background resize-none"
                      required
                    />
                  </div>

                  {submitMutation.isError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2 font-semibold"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {t("send")}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      We typically respond within 24–48 hours.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
