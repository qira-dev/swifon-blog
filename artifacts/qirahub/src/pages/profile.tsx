import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import {
  useAuthStore,
  changePassword,
  updateEmail,
  updateProfile,
} from "@/lib/user-auth";
import { AvatarPicker, AvatarDisplay, AvatarSVG, getAvatarDef, AVATARS } from "@/components/AvatarPicker";
import { User, Mail, Lock, Save, Eye, EyeOff, Sparkles, ChevronRight } from "lucide-react";

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-card-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="font-bold text-base text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const selectedDef = getAvatarDef(avatarUrl);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await updateProfile({ displayName, bio, avatarUrl: avatarUrl || undefined });
      updateUser(updated);
      toast({ title: t("profileUpdated") });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;
    setEmailLoading(true);
    try {
      const { email, token: newToken } = await updateEmail(newEmail, emailPassword);
      updateUser({ email });
      if (newToken && token) setAuth({ ...user!, email }, newToken);
      setNewEmail(""); setEmailPassword("");
      toast({ title: t("emailUpdated") });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: t("passwordsNotMatch"), variant: "destructive" }); return;
    }
    if (newPassword.length < 6) {
      toast({ title: t("passwordMinChars"), variant: "destructive" }); return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      toast({ title: t("passwordChanged") });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <Layout>
      <div className="py-8 px-4 max-w-2xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-3 h-3 mx-1.5" />
          <span className="text-foreground">{t("myProfile")}</span>
        </div>

        {/* Profile hero banner */}
        <div
          className="relative rounded-xl overflow-hidden border border-card-border"
          style={{
            background: selectedDef
              ? `radial-gradient(ellipse at 20% 50%, ${selectedDef.bg1}cc 0%, ${selectedDef.bg2} 100%)`
              : "radial-gradient(ellipse at 20% 50%, #003340cc 0%, #001a24 100%)",
          }}
        >
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex items-center gap-6 px-6 py-8">
            {/* Avatar preview */}
            <div
              className="relative shrink-0"
              style={selectedDef ? {
                filter: `drop-shadow(0 0 16px ${selectedDef.accent}60)`,
              } : {}}
            >
              <AvatarDisplay avatarUrl={avatarUrl || user.avatarUrl} size={88} />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {selectedDef && (
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: selectedDef.accent + "22", color: selectedDef.accent, border: `1px solid ${selectedDef.accent}40` }}
                  >
                    {selectedDef.name}
                  </span>
                )}
                {user.isAdmin && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Admin
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-white truncate">
                {user.displayName || user.username}
              </h1>
              <p className="text-sm opacity-60 text-white mt-1 truncate">@{user.username} · {user.email}</p>
              {user.bio && (
                <p className="text-sm text-white/70 mt-2 line-clamp-2">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile info + avatar picker */}
        <SectionCard icon={<User className="w-4 h-4" />} title={t("profileInfo")}>
          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Name & Bio */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-semibold">{t("name")}</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("name")}
                  className="bg-background border-card-border focus:border-primary"
                  data-testid="input-profile-displayname"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-semibold">{t("bio")}</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("bioPlaceholder")}
                  className="flex w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[72px] resize-none"
                  data-testid="input-profile-bio"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <Label className="text-foreground text-sm font-semibold">{t("chooseAvatar")}</Label>
                <span className="text-xs text-muted-foreground ml-auto">{AVATARS.length} characters</span>
              </div>

              {/* Selected avatar preview */}
              {selectedDef && (
                <div
                  className="flex items-center gap-4 px-4 py-3 rounded-lg border"
                  style={{ background: selectedDef.bg1 + "40", borderColor: selectedDef.ring + "50" }}
                >
                  <AvatarSVG def={selectedDef} size={48} isSelected />
                  <div>
                    <p className="font-bold text-sm text-foreground">{selectedDef.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDef.category} series</p>
                  </div>
                  <div
                    className="ml-auto w-3 h-3 rounded-full"
                    style={{ background: selectedDef.accent, boxShadow: `0 0 6px ${selectedDef.accent}` }}
                  />
                </div>
              )}

              {/* Grid picker */}
              <div className="bg-background/60 border border-card-border rounded-xl p-4">
                <AvatarPicker selected={avatarUrl} onSelect={setAvatarUrl} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="gap-2 font-bold"
              data-testid="btn-save-profile"
            >
              <Save className="h-4 w-4" />
              {profileLoading ? t("loading") : t("saveChanges")}
            </Button>
          </form>
        </SectionCard>

        {/* Update email */}
        <SectionCard icon={<Mail className="w-4 h-4" />} title={t("updateEmail")}>
          <p className="text-sm text-muted-foreground mb-5">
            {t("currentEmail")}:{" "}
            <span className="font-semibold text-foreground">{user.email}</span>
          </p>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-semibold">{t("newEmail")}</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newemail@example.com"
                required
                className="bg-background border-card-border"
                data-testid="input-new-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-semibold">{t("confirmWithPassword")}</Label>
              <Input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder={t("enterPassword")}
                required
                className="bg-background border-card-border"
                data-testid="input-email-password"
              />
            </div>
            <Button type="submit" disabled={emailLoading} variant="outline" className="gap-2 border-card-border" data-testid="btn-update-email">
              <Mail className="h-4 w-4" />
              {emailLoading ? t("loading") : t("updateEmail")}
            </Button>
          </form>
        </SectionCard>

        {/* Change password */}
        <SectionCard icon={<Lock className="w-4 h-4" />} title={t("changePassword")}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { label: t("currentPassword"), value: currentPassword, onChange: setCurrentPassword, testId: "input-current-password" },
              { label: t("newPassword"), value: newPassword, onChange: setNewPassword, testId: "input-new-password", placeholder: t("atLeast6Chars") },
              { label: t("confirmPassword"), value: confirmNewPassword, onChange: setConfirmNewPassword, testId: "input-confirm-new-password", placeholder: t("repeatPassword") },
            ].map(({ label, value, onChange, testId, placeholder }) => (
              <div key={testId} className="space-y-2">
                <Label className="text-foreground text-sm font-semibold">{label}</Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || t("enterPassword")}
                    required
                    className="bg-background border-card-border pr-10"
                    data-testid={testId}
                  />
                  {testId === "input-current-password" && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords(!showPasswords)}
                      tabIndex={-1}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="submit" disabled={passwordLoading} variant="outline" className="gap-2 border-card-border" data-testid="btn-change-password">
              <Lock className="h-4 w-4" />
              {passwordLoading ? t("loading") : t("changePassword")}
            </Button>
          </form>
        </SectionCard>

      </div>
    </Layout>
  );
}
