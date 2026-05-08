import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, RefreshCw, Save, Loader2, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function generateKey(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function fetchKeyInfo(token: string | null) {
  if (!token) return null;
  const res = await fetch("/api/auth/admin-key", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function updateAdminKey(newKey: string, token: string | null) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch("/api/auth/admin-key", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update admin key");
  }
  return res.json();
}

export default function AdminSecuritySettings() {
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyInfo, setKeyInfo] = useState<{ hasCustomKey: boolean; keyPreview: string | null } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const { toast } = useToast();

  const getToken = () => sessionStorage.getItem("qirahub_user_token");

  useEffect(() => {
    fetchKeyInfo(getToken())
      .then(setKeyInfo)
      .finally(() => setLoadingInfo(false));
  }, []);

  function handleGenerate() {
    const key = generateKey(32);
    setNewKey(key);
    setConfirmKey(key);
    setShowNew(true);
    setShowConfirm(true);
  }

  function handleCopy() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    toast({ title: "Key copied to clipboard" });
  }

  async function handleSave() {
    if (!newKey) { toast({ title: "Please enter a new key", variant: "destructive" }); return; }
    if (newKey.length < 8) { toast({ title: "Key must be at least 8 characters", variant: "destructive" }); return; }
    if (newKey !== confirmKey) { toast({ title: "Keys do not match", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await updateAdminKey(newKey, getToken());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setNewKey("");
      setConfirmKey("");
      const info = await fetchKeyInfo(getToken());
      setKeyInfo(info);
      toast({ title: "Admin key updated successfully. Use the new key to log in next time." });
    } catch (err: any) {
      toast({ title: err.message || "Failed to update admin key", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your admin access key and security configuration.</p>
        </div>

        {/* Current key status */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Admin Key Status</h2>
              <p className="text-xs text-muted-foreground">Current state of your admin access key</p>
            </div>
          </div>
          <div className="p-6">
            {loadingInfo ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading key status...</span>
              </div>
            ) : keyInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {keyInfo.hasCustomKey ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {keyInfo.hasCustomKey ? "Custom admin key is set" : "Using default admin key"}
                    </p>
                    {keyInfo.keyPreview && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{keyInfo.keyPreview}</p>
                    )}
                    {!keyInfo.hasCustomKey && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                        For security, set a custom admin key before going to production.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to load key status.</p>
            )}
          </div>
        </div>

        {/* Change admin key */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border">
            <h2 className="font-semibold text-foreground">Change Admin Key</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Set a new admin key. Must be at least 8 characters. Save it in a safe place — you will need it to log in with the key method.</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleGenerate} className="gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Generate Secure Key
              </Button>
              {newKey && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-key">New Admin Key</Label>
              <div className="relative">
                <Input
                  id="new-key"
                  type={showNew ? "text" : "password"}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter new admin key (min. 8 characters)"
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newKey && <p className="text-xs text-muted-foreground">{newKey.length} characters</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-key">Confirm New Key</Label>
              <div className="relative">
                <Input
                  id="confirm-key"
                  type={showConfirm ? "text" : "password"}
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  placeholder="Confirm new admin key"
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmKey && newKey && confirmKey !== newKey && (
                <p className="text-xs text-red-500">Keys do not match</p>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving || !newKey || !confirmKey} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved!" : saving ? "Saving..." : "Update Admin Key"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
