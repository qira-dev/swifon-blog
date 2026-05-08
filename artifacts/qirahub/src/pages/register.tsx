import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { registerUser, useAuthStore } from "@/lib/user-auth";
import { AvatarPicker } from "@/components/AvatarPicker";
import { Eye, EyeOff, Mail, Lock, User, ChevronDown, ChevronUp } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsNotMatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordMinChars"));
      return;
    }
    if (!agreedToTerms || !agreedToPrivacy) {
      setError(t("mustAgreeTerms"));
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await registerUser({
        email,
        password,
        username,
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        agreedToTerms,
        agreedToPrivacy,
      });
      setAuth(user, token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-xl text-black">
                Q
              </div>
              <span className="font-black text-2xl tracking-tight text-foreground">
                Qira<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-foreground mb-2">{t("createAccount")}</h1>
            <p className="text-sm text-muted-foreground">{t("createAccountSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold text-foreground">{t("username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="pl-10 bg-background border-card-border"
                  required
                  data-testid="input-register-username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-semibold text-foreground">{t("name")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="bg-background border-card-border"
                data-testid="input-register-displayname"
              />
            </div>

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
                  className="pl-10 bg-background border-card-border"
                  required
                  data-testid="input-register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-foreground">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("atLeast6Chars")}
                  className="pl-10 pr-10 bg-background border-card-border"
                  required
                  data-testid="input-register-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-foreground">{t("confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("repeatPassword")}
                  className="pl-10 bg-background border-card-border"
                  required
                  data-testid="input-register-confirm"
                />
              </div>
            </div>

            {/* Avatar picker toggle */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAvatars(!showAvatars)}
                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                data-testid="btn-toggle-avatars"
              >
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  {showAvatars ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />}
                </span>
                {t("chooseAvatar")}
                {avatarUrl && <span className="text-xs text-primary ml-auto font-normal">Selected</span>}
              </button>
              {showAvatars && (
                <div className="border border-card-border rounded-xl p-4 bg-background/60">
                  <AvatarPicker selected={avatarUrl} onSelect={setAvatarUrl} />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3" data-testid="checkbox-terms">
                <input
                  id="checkbox-terms-input"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-card-border accent-primary cursor-pointer shrink-0"
                />
                <label htmlFor="checkbox-terms-input" className="text-sm text-muted-foreground cursor-pointer select-none">
                  {t("agreeToTerms")}{" "}
                  <Link href="/terms" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    {t("termsOfService")}
                  </Link>
                </label>
              </div>

              <div className="flex items-start gap-3" data-testid="checkbox-privacy">
                <input
                  id="checkbox-privacy-input"
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-card-border accent-primary cursor-pointer shrink-0"
                />
                <label htmlFor="checkbox-privacy-input" className="text-sm text-muted-foreground cursor-pointer select-none">
                  {t("agreeToPrivacy")}{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    {t("privacyPolicyLink")}
                  </Link>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading} data-testid="btn-register">
              {loading ? t("loading") : t("createAccount")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              {t("signIn")}
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
