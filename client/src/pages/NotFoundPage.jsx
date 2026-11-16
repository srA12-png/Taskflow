import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import { buttonStyles } from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <PageContainer title="Page not found">
      <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted text-ink-muted">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-4xl font-semibold tracking-tight">404</p>
        <h2 className="mt-2 text-base font-semibold text-ink">
          We couldn&apos;t find that page
        </h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          to="/dashboard"
          className={buttonStyles({ className: "mt-6" })}
        >
          Back to dashboard
        </Link>
      </div>
    </PageContainer>
  );
}
