import { useEffect, type ReactNode } from "react";
import { APP_TITLE } from "./title.js";

export function PlayChrome({
  connection,
  accountLabel,
  signedIn,
  settingsOpen,
  onOpenSettings,
  onCloseSettings,
  onShowGate,
  onSignOut,
  authNotice,
}: {
  connection: string;
  accountLabel: string;
  signedIn: boolean;
  settingsOpen: boolean;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  onShowGate: () => void;
  onSignOut: () => void;
  authNotice: ReactNode;
}) {
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, onCloseSettings]);

  return (
    <header className="chrome play-header">
      <a className="skip-command" href="#play-command">
        Skip to command
      </a>
      {authNotice}
      <div className="play-toolbar">
        <div className="play-brand">
          <span className="collegium-seal" aria-hidden="true">
            ✦
          </span>
          <div>
            <span className="eyebrow">An academy among the trees</span>
            <h1>{APP_TITLE}</h1>
          </div>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
        >
          <GearIcon />
        </button>
        {signedIn ? (
          <button type="button" onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <button type="button" onClick={onShowGate}>
            Sign in
          </button>
        )}
      </div>
      {settingsOpen ? (
        <div className="settings-overlay" onClick={onCloseSettings}>
          <div
            className="settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-heading">
              <h2 id="settings-heading">Settings</h2>
              <button type="button" onClick={onCloseSettings}>
                Close
              </button>
            </div>
            <p className="small-copy">
              <span className={`connection-dot ${connection}`} aria-hidden="true" />
              {connection === "connected" ? "Connected" : "Reconnecting"}. {accountLabel}
            </p>
            <p className="small-copy">
              Typed commands stay the way you play. The compass, avatars, and shortcuts only prepare
              or send those same words.
            </p>
            <p className="auth-actions">
              {signedIn ? (
                <button type="button" onClick={onSignOut}>
                  Sign out
                </button>
              ) : (
                <button type="button" onClick={onShowGate}>
                  Sign in
                </button>
              )}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 2.4h3.6l.4 2.2a6.8 6.8 0 0 1 1.9.8l2-1.1 2.5 2.5-1.1 2a6.8 6.8 0 0 1 .8 1.9l2.2.4v3.6l-2.2.4a6.8 6.8 0 0 1-.8 1.9l1.1 2-2.5 2.5-2-1.1a6.8 6.8 0 0 1-1.9.8l-.4 2.2h-3.6l-.4-2.2a6.8 6.8 0 0 1-1.9-.8l-2 1.1-2.5-2.5 1.1-2a6.8 6.8 0 0 1-.8-1.9L2.4 13.8v-3.6l2.2-.4a6.8 6.8 0 0 1 .8-1.9l-1.1-2 2.5-2.5 2 1.1a6.8 6.8 0 0 1 1.9-.8Zm1.8 6.2a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z"
      />
    </svg>
  );
}
