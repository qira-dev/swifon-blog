import { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { resetPassword } from "@/lib/user-auth";
import { Lock, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const params = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsNotMatch"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("passwordMinChars"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(params.token, newPassword);
      setSuccess(true);
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

          {success ? (
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
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{t("resetYourPassword")}</h1>
              <p className="text-sm text-muted-foreground mb-8 text-center">{t("enterNewPassword")}</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("newPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("atLeast6Chars")}
                      className="pl-10"
                      required
                      data-testid="input-reset-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">{t("confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("repeatPassword")}
                      className="pl-10"
                      required
                      data-testid="input-reset-confirm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base" disabled={loading} data-testid="btn-reset-password">
                  {loading ? t("loading") : t("resetPassword")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
