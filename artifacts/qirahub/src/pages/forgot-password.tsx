import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { forgotPassword, resetPassword } from "@/lib/user-auth";
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, MailCheck } from "lucide-react";

type Step = "email" | "check-email" | "password" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [location] = useLocation();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlEmail = params.get("email");
    if (urlToken) {
      setToken(urlToken);
      if (urlEmail) setEmail(decodeURIComponent(urlEmail));
      setStep("password");
    }
  }, [location]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.emailSent) {
        setStep("check-email");
      } else if (result.token) {
        setToken(result.token);
        setStep("password");
      }
    } catch (err: any) {
      setError(err.message || t("requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsNotMatch"));
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err.message || t("requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">

          <div className="flex items-center gap-2 mb-8 justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">
                Qira<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          {step === "success" ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t("passwordResetSuccess")}</h1>
              <p className="text-sm text-muted-foreground">{t("passwordResetSuccessDesc")}</p>
              <Link href="/login">
                <Button className="mt-4">{t("signIn")}</Button>
              </Link>
            </div>
          ) : step === "check-email" ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <MailCheck className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>.
                The link expires in 15 minutes.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => { setStep("email"); setError(""); }}
                >
                  try again
                </button>.
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4">{t("backToLogin")}</Button>
              </Link>
            </div>
          ) : step === "password" ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-1">{t("resetYourPassword")}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("enterNewPassword")}
                </p>
                {email && <p className="text-xs text-primary mt-1 font-medium">{email}</p>}
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("newPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="pl-10 pr-10"
                      required
                      autoFocus
                      data-testid="input-reset-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">{t("confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("repeatPassword")}
                      className="pl-10 pr-10"
                      required
                      data-testid="input-reset-confirm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                  data-testid="btn-reset-password"
                >
                  {loading ? t("loading") : t("resetPassword")}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setNewPassword(""); setConfirmPassword(""); }}
                  className="text-sm text-primary hover:underline flex items-center gap-1 justify-center mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Use a different email
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{t("forgotPassword")}</h1>
              <p className="text-sm text-muted-foreground mb-8 text-center">
                {t("forgotPasswordSubtitle")}
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                      autoFocus
                      data-testid="input-forgot-email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                  data-testid="btn-send-reset"
                >
                  {loading ? t("loading") : "Continue"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary hover:underline flex items-center gap-1 justify-center">
                  <ArrowLeft className="h-3 w-3" />
                  {t("backToLogin")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
