import { CheckSquare, ShieldCheck, Sparkles, Timer } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Plan with clarity",
    body: "Priorities, categories and due dates in one calm workspace.",
  },
  {
    icon: Timer,
    title: "Stay on schedule",
    body: "Today, upcoming and overdue views keep deadlines visible.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your tasks are scoped to your account and never shared.",
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <div className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <CheckSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold text-white">TaskFlow</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Smart task management
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
            Turn a long to-do list into a plan you can actually finish.
          </h2>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-indigo-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Built with React, Express &amp; SQLite
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <CheckSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold">TaskFlow</span>
        </div>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
