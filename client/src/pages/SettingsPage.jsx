import { LogOut, Lock, Palette, UserRound } from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import PlaceholderPanel from "../components/ui/PlaceholderPanel.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Control your profile, password and how TaskFlow looks on this device."
    >
      <section className="panel p-5 sm:p-6" aria-labelledby="appearance-heading">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong dark:text-brand">
            <Palette className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="appearance-heading"
              className="text-sm font-semibold text-ink"
            >
              Appearance
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Choose a theme. Your preference is stored in this browser and
              applied before the app renders.
            </p>
          </div>
        </div>
        <ThemeToggle variant="segmented" className="mt-5" />
      </section>

      <PlaceholderPanel
        title="Profile details"
        phase="Phase 2"
        icon={UserRound}
        description="Saving a display name will call PATCH /api/users/me once JWT authentication is implemented."
      >
        <fieldset disabled className="grid gap-4 sm:grid-cols-2">
          <Field
            id="settings-name"
            label="Display name"
            placeholder="Your name"
            defaultValue=""
          />
          <Field
            id="settings-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            defaultValue=""
            hint="Email changes are out of scope for this version."
          />
        </fieldset>
        <Button className="mt-4" disabled>
          Save changes
        </Button>
      </PlaceholderPanel>

      <PlaceholderPanel
        title="Change password"
        phase="Phase 2"
        icon={Lock}
        description="Requires the current password, then hashes the new one with bcrypt before storing it."
      >
        <fieldset disabled className="grid gap-4 sm:grid-cols-3">
          <Field
            id="settings-current-password"
            label="Current password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <Field
            id="settings-new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <Field
            id="settings-confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat new password"
          />
        </fieldset>
        <Button className="mt-4" disabled>
          Update password
        </Button>
      </PlaceholderPanel>

      <section className="panel p-5 sm:p-6" aria-labelledby="session-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="session-heading" className="text-sm font-semibold text-ink">
                Session
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Signing out clears the HttpOnly session cookie. Available once
                authentication lands in Phase 2.
              </p>
            </div>
          </div>
          <Button variant="secondary" disabled>
            Sign out
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}
