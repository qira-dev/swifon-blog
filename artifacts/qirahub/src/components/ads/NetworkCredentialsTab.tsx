import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Save, Loader2, CheckCircle2, ChevronDown, ChevronRight,
  Key, Shield, Wifi, Eye, EyeOff, Info,
} from "lucide-react";
import {
  useAdNetworkCredentials,
  useUpdateAdNetworkCredential,
  type AdNetworkCredential,
} from "@/lib/api-hooks";
import { AD_NETWORKS, type NetworkDef } from "@/lib/ad-networks";

function CredentialCard({ net, saved }: { net: NetworkDef; saved: AdNetworkCredential | undefined }) {
  const update = useUpdateAdNetworkCredential();
  const [expanded, setExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(saved?.isEnabled ?? false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (saved) {
      try {
        const parsed = JSON.parse(saved.credentials);
        setFields(parsed);
      } catch {
        setFields({});
      }
      setIsEnabled(saved.isEnabled);
    }
  }, [saved]);

  if (net.credentialFields.length === 0) return null;

  const hasRequiredFields = net.credentialFields
    .filter((f) => f.required)
    .every((f) => (fields[f.key] ?? "").trim() !== "");

  const isConfigured = !!saved && hasRequiredFields && saved.isEnabled;

  async function handleSave() {
    try {
      await update.mutateAsync({ network: net.value, credentials: fields, isEnabled });
      setDirty(false);
      toast({ title: `${net.label} credentials saved` });
    } catch {
      toast({ title: "Failed to save credentials", variant: "destructive" });
    }
  }

  async function handleToggle(enabled: boolean) {
    const newEnabled = enabled;
    setIsEnabled(newEnabled);
    setDirty(true);
    try {
      await update.mutateAsync({ network: net.value, credentials: fields, isEnabled: newEnabled });
      toast({
        title: newEnabled
          ? `${net.label} enabled`
          : `${net.label} disabled`,
      });
      setDirty(false);
    } catch {
      toast({ title: "Failed to toggle network", variant: "destructive" });
      setIsEnabled(!newEnabled);
    }
  }

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  return (
    <div
      className={`border rounded-xl transition-all duration-200 ${
        isConfigured
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConfigured ? "bg-green-500" : saved ? "bg-yellow-500" : "bg-muted-foreground/30"
            }`}
          />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${net.color}`}>
            {net.label}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block truncate">
            {isConfigured
              ? "Active & configured"
              : saved && !isEnabled
              ? "Configured but disabled"
              : "Not configured"}
          </span>
          <span className="ml-auto shrink-0 text-muted-foreground">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        </button>

        {/* Enable toggle */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>

      {/* Expanded credential fields */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4">
          {net.hint && (
            <div className="flex items-start gap-2 bg-muted/60 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{net.hint}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {net.credentialFields.map((field) => {
              const isSecret = field.type === "password";
              const show = showSecrets[field.key] ?? false;
              return (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {isSecret ? (
                      <Shield className="w-3 h-3 text-primary" />
                    ) : (
                      <Key className="w-3 h-3 text-muted-foreground" />
                    )}
                    <label className="text-xs font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      type={isSecret && !show ? "password" : "text"}
                      value={fields[field.key] ?? ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="bg-background text-xs pr-8"
                    />
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {field.hint && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{field.hint}</p>
                  )}
                </div>
              );
            })}
          </div>

          {net.canAutoGenerate && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-code generation enabled
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Once credentials are saved, individual ad units only need a{" "}
                {net.slotLabel ?? "Slot ID"} — the full embed code is generated automatically.
              </p>
            </div>
          )}

          {net.slotLabel && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-foreground mb-0.5">{net.slotLabel}</p>
              <p className="text-[10px] text-muted-foreground">{net.slotHint}</p>
              <p className="text-[10px] text-primary mt-1">
                Enter this per ad unit when creating individual ads in the Ad Manager.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={update.isPending || !dirty}
              className="h-8 text-xs gap-1.5"
            >
              {update.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Credentials
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NetworkCredentialsTab() {
  const { data: credentialRows, isLoading } = useAdNetworkCredentials();

  const credentialMap: Record<string, AdNetworkCredential> = {};
  for (const row of credentialRows ?? []) {
    credentialMap[row.network] = row;
  }

  const networksWithFields = AD_NETWORKS.filter((n) => n.credentialFields.length > 0);
  const configuredCount = networksWithFields.filter(
    (n) => credentialMap[n.value]?.isEnabled
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" />
              Ad Network Credentials
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Store API keys, publisher IDs, and secrets per network. Enable a network to auto-configure ads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{configuredCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{networksWithFields.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Supported</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status overview bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {networksWithFields.map((net) => {
          const cred = credentialMap[net.value];
          const enabled = cred?.isEnabled ?? false;
          let parsed: Record<string, string> = {};
          try { parsed = cred ? JSON.parse(cred.credentials) : {}; } catch { }
          const hasData = net.credentialFields.filter((f) => f.required).every((f) => (parsed[f.key] ?? "").trim());
          return (
            <div
              key={net.value}
              className={`border rounded-lg px-3 py-2 flex items-center gap-2 ${
                enabled && hasData ? net.color : "border-border/40 bg-muted/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  enabled && hasData
                    ? "bg-green-500"
                    : hasData
                    ? "bg-yellow-500"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span className="text-xs font-medium truncate">{net.label}</span>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {networksWithFields.map((net) => (
            <CredentialCard
              key={net.value}
              net={net}
              saved={credentialMap[net.value]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
