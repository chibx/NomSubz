"use client";

import { useEffect, useState } from "react";
import { whoami, listApiKeys, generateApiKey, revokeApiKey, updateProfile, setup2FA, enable2FA, type ApiKey, type TwoFASetupData } from "@/app/lib/api";
import { EmptyState } from "@/app/components/EmptyState";

export default function SettingsPage() {
  const [appId, setAppId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // 2FA state
  const [setupData, setSetupData] = useState<TwoFASetupData | null>(null);
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState<string | null>(null);

  function refreshKeys() {
    listApiKeys().then((res) => setKeys(res.data ?? []));
  }

  useEffect(() => {
    whoami().then((res) => {
      setAppId(res.data?.app_id ?? null);
      setLoading(false);
    });
    refreshKeys();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    const res = await updateProfile({ name: name || undefined, email: email || undefined });
    setSavingProfile(false);
    setProfileMessage(res.status === 200 ? "Profile saved." : res.message || "No profile update route exists yet.");
  }

  async function handleGenerateKey() {
    setGeneratingKey(true);
    setNewKey(null);
    const res = await generateApiKey();
    setGeneratingKey(false);
    if (res.status === 200 && res.data?.key) {
      setNewKey(res.data.key);
      refreshKeys();
    }
  }

  async function handleSetup2FA() {
    setSettingUp2FA(true);
    setTwoFAMessage(null);
    const res = await setup2FA();
    setSettingUp2FA(false);
    if (res.status === 200 && res.data) {
      setSetupData(res.data);
    } else {
      setTwoFAMessage(res.message || "Failed to initiate 2FA setup.");
    }
  }

  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    setEnabling2FA(true);
    setTwoFAMessage(null);
    const res = await enable2FA(otp);
    setEnabling2FA(false);
    if (res.status === 200) {
      setTwoFAMessage("2FA enabled successfully.");
      setSetupData(null);
      setOtp("");
    } else {
      setTwoFAMessage(res.message || "Invalid code. Try again.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted">{appId ? `App ID: ${appId}` : loading ? "Loading…" : "Not signed in"}</p>

      {/* Profile */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Business profile</h2>
        <form onSubmit={handleSaveProfile} className="mt-3 max-w-md rounded-xl border border-border bg-surface p-6">
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Business name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Nigeria Ltd"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ng"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
          </div>
          {profileMessage && <p className="mb-4 text-sm text-muted">{profileMessage}</p>}
          <button type="submit" disabled={savingProfile}
            className="rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* 2FA */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Two-factor authentication</h2>
        <div className="mt-3 max-w-md rounded-xl border border-border bg-surface p-6">
          {!setupData ? (
            <>
              <p className="mb-4 text-sm text-muted">Add an extra layer of security to your account using an authenticator app.</p>
              {twoFAMessage && <p className="mb-4 text-sm text-muted">{twoFAMessage}</p>}
              <button onClick={handleSetup2FA} disabled={settingUp2FA}
                className="rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
                {settingUp2FA ? "Setting up…" : "Set up 2FA"}
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-foreground">Scan this QR code in your authenticator app</p>
              {/* Render the TOTP URI as a link — a real QR library can be added later */}
              <div className="mb-4 rounded-lg border border-border bg-background p-3">
                <p className="mb-1 text-[11px] font-medium text-muted">TOTP URI (paste into your app if QR isn&apos;t available):</p>
                <code className="break-all text-[11px] text-foreground">{setupData.totpURI}</code>
              </div>
              <p className="mb-2 text-sm font-semibold text-foreground">Backup codes — save these somewhere safe:</p>
              <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-background p-3">
                {setupData.backupCodes.map((code) => (
                  <code key={code} className="text-[12px] text-foreground">{code}</code>
                ))}
              </div>
              <form onSubmit={handleEnable2FA}>
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Enter the 6-digit code to confirm</label>
                <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="mb-4 w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-center font-mono tracking-[0.4em] text-foreground" />
                {twoFAMessage && <p className="mb-4 text-sm text-status-failed-fg">{twoFAMessage}</p>}
                <button type="submit" disabled={enabling2FA || otp.length !== 6}
                  className="w-full rounded-[7px] bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
                  {enabling2FA ? "Enabling…" : "Enable 2FA"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* API keys */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">API keys</h2>
          <button onClick={handleGenerateKey} disabled={generatingKey}
            className="rounded-[7px] bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
            {generatingKey ? "Generating…" : "Generate new key"}
          </button>
        </div>
        {newKey && (
          <div className="mt-3 rounded-lg border border-brand-tint bg-brand-soft p-4">
            <p className="text-sm font-semibold text-foreground">Copy this key now — it won&apos;t be shown again:</p>
            <code className="mt-1 block text-sm text-foreground">{newKey}</code>
          </div>
        )}
        <div className="mt-3">
          {keys.length === 0 ? (
            <EmptyState title="No API keys" description="No API keys route exists on the backend yet." />
          ) : (
            <ul className="space-y-2">
              {keys.map((key) => (
                <li key={key.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                  <div>
                    <p className="font-mono text-sm text-foreground">{key.prefix}••••••••</p>
                    <p className="mt-1 text-xs text-muted">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => revokeApiKey(key.id).then(refreshKeys)}
                    className="text-sm font-medium text-status-failed-fg hover:opacity-80">
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
