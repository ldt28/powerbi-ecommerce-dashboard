import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Platform Config ─────────────────────────────────────────────────────────

type Platform =
  | "amazon"
  | "bigcommerce"
  | "ebay"
  | "walmart"
  | "google_analytics"
  | "meta_ads"
  | "tiktok_ads";

interface PlatformDef {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  fields: { key: "credential1" | "credential2" | "credential3" | "credential4" | "credential5"; label: string; placeholder: string; secret?: boolean }[];
  docsUrl: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "amazon",
    name: "Amazon Seller Central",
    icon: "🛒",
    color: "#FF9900",
    docsUrl: "https://sellercentral.amazon.com/apps/manage",
    fields: [
      { key: "credential1", label: "Seller ID", placeholder: "A2EUQ1WTGCTBG2" },
      { key: "credential2", label: "Marketplace ID", placeholder: "ATVPDKIKX0DER (US)" },
      { key: "credential3", label: "LWA Client ID", placeholder: "amzn1.application-oa2-client..." },
      { key: "credential4", label: "LWA Client Secret", placeholder: "••••••••", secret: true },
      { key: "credential5", label: "LWA Refresh Token", placeholder: "Atzr|...", secret: true },
    ],
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    icon: "🏪",
    color: "#34232F",
    docsUrl: "https://support.bigcommerce.com/s/article/Store-API-Accounts",
    fields: [
      { key: "credential1", label: "Store Hash", placeholder: "abc123xyz" },
      { key: "credential2", label: "API Access Token", placeholder: "••••••••", secret: true },
    ],
  },
  {
    id: "ebay",
    name: "eBay",
    icon: "🔴",
    color: "#E53238",
    docsUrl: "https://developer.ebay.com/my/keys",
    fields: [
      { key: "credential1", label: "App ID (Client ID)", placeholder: "MyApp-12345-..." },
      { key: "credential2", label: "Cert ID (Client Secret)", placeholder: "••••••••", secret: true },
      { key: "credential3", label: "Dev ID", placeholder: "xxxxxxxx-xxxx-xxxx-..." },
      { key: "credential4", label: "OAuth User Refresh Token", placeholder: "v^1.1#i^1#r^1...", secret: true },
    ],
  },
  {
    id: "walmart",
    name: "Walmart Marketplace",
    icon: "🔵",
    color: "#0071CE",
    docsUrl: "https://developer.walmart.com/doc/us/mp/us-mp-gettingstarted/",
    fields: [
      { key: "credential1", label: "Client ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "credential2", label: "Client Secret", placeholder: "••••••••", secret: true },
    ],
  },
  {
    id: "google_analytics",
    name: "Google Analytics 4",
    icon: "📊",
    color: "#F4B400",
    docsUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    fields: [
      { key: "credential1", label: "GA4 Property ID", placeholder: "properties/123456789" },
      { key: "credential2", label: "Service Account JSON", placeholder: '{"type":"service_account","project_id":"..."}', secret: true },
    ],
  },
  {
    id: "meta_ads",
    name: "Meta Ads (Facebook/Instagram)",
    icon: "📘",
    color: "#1877F2",
    docsUrl: "https://developers.facebook.com/apps/",
    fields: [
      { key: "credential1", label: "App ID", placeholder: "123456789012345" },
      { key: "credential2", label: "App Secret", placeholder: "••••••••", secret: true },
      { key: "credential3", label: "Long-Lived Access Token", placeholder: "EAABsbCS...", secret: true },
      { key: "credential4", label: "Ad Account ID", placeholder: "act_123456789" },
    ],
  },
  {
    id: "tiktok_ads",
    name: "TikTok Ads",
    icon: "🎵",
    color: "#010101",
    docsUrl: "https://ads.tiktok.com/marketing_api/apps/",
    fields: [
      { key: "credential1", label: "Access Token", placeholder: "••••••••", secret: true },
      { key: "credential2", label: "Advertiser ID", placeholder: "1234567890123456" },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValues = Partial<Record<"credential1" | "credential2" | "credential3" | "credential4" | "credential5" | "label", string>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [form, setForm] = useState<FormValues>({});
  const [showSecrets, setShowSecrets] = useState(false);

  const { data: connections, refetch } = trpc.liveData.listConnections.useQuery();
  const saveMutation = trpc.liveData.saveConnection.useMutation({
    onSuccess: () => { toast.success("Credentials saved!"); refetch(); setActivePlatform(null); setForm({}); },
    onError: (e) => toast.error(`Save failed: ${e.message}`),
  });
  const testMutation = trpc.liveData.testConnection.useMutation({
    onSuccess: (r) => {
      if (r.ok) toast.success("✅ Connection test passed!");
      else toast.error(`❌ Test failed: ${r.error}`);
      refetch();
    },
    onError: (e) => toast.error(`Test error: ${e.message}`),
  });
  const removeMutation = trpc.liveData.removeConnection.useMutation({
    onSuccess: () => { toast.success("Platform disconnected"); refetch(); },
    onError: (e) => toast.error(`Remove failed: ${e.message}`),
  });

  const connectedMap = new Map((connections ?? []).map((c: any) => [c.platform, c]));
  const def = PLATFORMS.find((p) => p.id === activePlatform);

  function handleSave() {
    if (!activePlatform || !def) return;
    saveMutation.mutate({ platform: activePlatform, label: form.label || def.name, ...form });
  }

  function handleTest(platform: Platform) {
    testMutation.mutate({ platform });
  }

  function handleRemove(platform: Platform) {
    if (!confirm(`Disconnect ${PLATFORMS.find(p => p.id === platform)?.name}? Cached data will be kept.`)) return;
    removeMutation.mutate({ platform });
  }

  return (
    <div className="connections-page">
      <div className="connections-header">
        <h1>Platform Connections</h1>
        <p>Connect your marketplaces and ad platforms to pull live data into your dashboard.</p>
      </div>

      <div className="platforms-grid">
        {PLATFORMS.map((p) => {
          const conn = connectedMap.get(p.id);
          const isConnected = !!conn;
          const testStatus = conn?.lastTestStatus;

          return (
            <div
              key={p.id}
              className={`platform-card ${isConnected ? "connected" : ""} ${activePlatform === p.id ? "active" : ""}`}
              style={{ "--accent": p.color } as React.CSSProperties}
            >
              <div className="platform-card-header">
                <span className="platform-icon">{p.icon}</span>
                <div className="platform-info">
                  <h3>{p.name}</h3>
                  {isConnected ? (
                    <span className={`status-badge ${testStatus === "ok" ? "ok" : testStatus === "error" ? "error" : "idle"}`}>
                      {testStatus === "ok" ? "✅ Connected" : testStatus === "error" ? "❌ Error" : "⏳ Saved"}
                    </span>
                  ) : (
                    <span className="status-badge not-connected">Not connected</span>
                  )}
                </div>
              </div>

              <div className="platform-card-actions">
                {isConnected ? (
                  <>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => { setActivePlatform(p.id); setForm({ label: conn.label }); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={testMutation.isPending}
                      onClick={() => handleTest(p.id)}
                    >
                      Test
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemove(p.id)}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => { setActivePlatform(p.id); setForm({ label: p.name }); }}
                  >
                    Connect
                  </button>
                )}
              </div>

              {isConnected && conn.lastSyncedAt && (
                <p className="last-synced">Last synced: {new Date(conn.lastSyncedAt).toLocaleString()}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Credential Form Modal */}
      {activePlatform && def && (
        <div className="modal-backdrop" onClick={() => setActivePlatform(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="platform-icon">{def.icon}</span>
              <h2>Connect {def.name}</h2>
              <button className="modal-close" onClick={() => setActivePlatform(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Connection Label</label>
                <input
                  type="text"
                  value={form.label ?? def.name}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. My Amazon US Store"
                />
              </div>

              {def.fields.map((field) => (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  <input
                    type={field.secret && !showSecrets ? "password" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    autoComplete="off"
                  />
                </div>
              ))}

              <div className="form-toggle">
                <input id="show-secrets" type="checkbox" checked={showSecrets} onChange={(e) => setShowSecrets(e.target.checked)} />
                <label htmlFor="show-secrets">Show secrets</label>
              </div>

              <a className="docs-link" href={def.docsUrl} target="_blank" rel="noreferrer">
                📖 How to get {def.name} credentials →
              </a>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setActivePlatform(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={saveMutation.isPending}
                onClick={handleSave}
              >
                {saveMutation.isPending ? "Saving…" : "Save & Encrypt"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .connections-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
        .connections-header { margin-bottom: 2rem; }
        .connections-header h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-primary, #fff); margin: 0 0 .4rem; }
        .connections-header p { color: var(--text-secondary, #94a3b8); margin: 0; }

        .platforms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }

        .platform-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          padding: 1.25rem;
          transition: border-color .2s, box-shadow .2s;
        }
        .platform-card.connected { border-color: rgba(var(--accent, #64748b), .4); }
        .platform-card.active { border-color: rgba(var(--accent, #64748b), .7); box-shadow: 0 0 0 2px rgba(var(--accent,#64748b),.2); }
        .platform-card:hover { border-color: rgba(255,255,255,.18); }

        .platform-card-header { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
        .platform-icon { font-size: 1.6rem; }
        .platform-info h3 { margin: 0; font-size: .95rem; font-weight: 600; color: var(--text-primary, #fff); }

        .status-badge { display: inline-block; font-size: .7rem; font-weight: 600; padding: .15rem .5rem; border-radius: 999px; margin-top: .2rem; }
        .status-badge.ok { background: rgba(34,197,94,.15); color: #22c55e; }
        .status-badge.error { background: rgba(239,68,68,.15); color: #ef4444; }
        .status-badge.idle { background: rgba(234,179,8,.12); color: #eab308; }
        .status-badge.not-connected { background: rgba(255,255,255,.06); color: #94a3b8; }

        .platform-card-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
        .last-synced { margin: .75rem 0 0; font-size: .7rem; color: #64748b; }

        .btn { padding: .4rem .9rem; border-radius: 8px; font-size: .8rem; font-weight: 600; cursor: pointer; border: none; transition: opacity .15s, background .15s; }
        .btn:disabled { opacity: .5; cursor: not-allowed; }
        .btn-primary { background: #6366f1; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #4f52c9; }
        .btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.2); }
        .btn-outline:hover { background: rgba(255,255,255,.07); }
        .btn-ghost { background: transparent; color: #94a3b8; }
        .btn-ghost:hover:not(:disabled) { color: #fff; background: rgba(255,255,255,.06); }
        .btn-danger { background: rgba(239,68,68,.15); color: #ef4444; }
        .btn-danger:hover { background: rgba(239,68,68,.25); }
        .btn-sm { padding: .3rem .7rem; font-size: .75rem; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
        }
        .modal-panel {
          background: #0f172a; border: 1px solid rgba(255,255,255,.1); border-radius: 18px;
          width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0,0,0,.6);
        }
        .modal-header { display: flex; align-items: center; gap: .75rem; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,.07); }
        .modal-header h2 { flex: 1; margin: 0; font-size: 1.1rem; font-weight: 700; color: #fff; }
        .modal-close { background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: .25rem .5rem; border-radius: 6px; }
        .modal-close:hover { color: #fff; background: rgba(255,255,255,.07); }
        .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,.07); display: flex; gap: .75rem; justify-content: flex-end; }

        .form-group { display: flex; flex-direction: column; gap: .35rem; }
        .form-group label { font-size: .78rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
        .form-group input {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; padding: .6rem .9rem; color: #fff; font-size: .9rem; font-family: monospace;
          outline: none; transition: border-color .15s;
        }
        .form-group input:focus { border-color: #6366f1; }

        .form-toggle { display: flex; align-items: center; gap: .5rem; font-size: .82rem; color: #94a3b8; }
        .form-toggle input { accent-color: #6366f1; width: 14px; height: 14px; }
        .form-toggle label { cursor: pointer; }

        .docs-link { font-size: .82rem; color: #6366f1; text-decoration: none; }
        .docs-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
