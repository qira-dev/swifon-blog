import { useState } from "react";
import { Link, useLocation } from "wouter";
import { adminLogin, adminLoginWithUser } from "@/lib/admin-auth";
import { loginUser, useAuthStore } from "@/lib/user-auth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [mode, setMode] = useState<"key" | "account">("account");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleAccountLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await loginUser(email, password);
      const isModerator = (user as any).role === "moderator";
      if (!user.isAdmin && !isModerator) {
        setError(t("noAdminPrivileges"));
        setLoading(false);
        return;
      }
      setAuth(user, token);
      adminLoginWithUser(user as any, token);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleKeyLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await adminLogin(password);
      if (ok) {
        navigate("/admin");
      } else {
        setError(t("incorrectAdminKey"));
      }
    } catch {
      setError(t("incorrectAdminKey"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-card-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-background font-bold text-lg">
            Q
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Qira<span className="text-primary">Hub</span>
          </span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1 text-center">{t("adminSignIn")}</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {mode === "account" ? t("signInWithAccount") : t("enterAdminKey")}
        </p>

        <div className="flex rounded-lg border border-card-border mb-6 overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "account" ? "bg-primary text-background" : "bg-card text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setMode("account"); setError(""); }}
          >
            {t("account")}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "key" ? "bg-primary text-background" : "bg-card text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setMode("key"); setError(""); }}
          >
            {t("adminKeyLabel")}
          </button>
        </div>

        {mode === "account" ? (
          <form onSubmit={handleAccountLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                  autoComplete="username"
                  required
                  data-testid="input-admin-email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  className="pl-10"
                  autoComplete="current-password"
                  required
                  data-testid="input-admin-password"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="btn-admin-login">
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleKeyLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adminKey">{t("adminKeyLabel")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="adminKey"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("adminKeyLabel")}
                  className="pl-10"
                  autoComplete="current-password"
                  data-testid="input-admin-key"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="btn-admin-key-login">
              {loading ? t("signingIn") : t("signInWithKey")}
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-card-border text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
