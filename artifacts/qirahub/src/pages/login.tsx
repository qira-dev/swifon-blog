import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { loginUser, useAuthStore } from "@/lib/user-auth";
import { adminLoginWithUser } from "@/lib/admin-auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await loginUser(email, password);
      setAuth(user, token);
      if (user.isAdmin || user.role === "moderator") {
        adminLoginWithUser(user, token);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-xl text-black">
                Q
              </div>
              <span className="font-black text-2xl tracking-tight text-foreground">
                Qira<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-foreground mb-2">{t("welcomeBack")}</h1>
            <p className="text-sm text-muted-foreground">{t("signInSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-background border-card-border focus:border-primary"
                  required
                  data-testid="input-login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-foreground">{t("password")}</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  className="pl-10 pr-10 bg-background border-card-border focus:border-primary"
                  required
                  data-testid="input-login-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-bold"
              disabled={loading}
              data-testid="btn-login"
            >
              {loading ? t("loading") : t("signIn")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              {t("signUp")}
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-card-border text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
