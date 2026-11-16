import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  ListTodo,
  PieChart,
  Tags,
  TrendingUp,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import PlaceholderPanel from "../components/ui/PlaceholderPanel.jsx";
import { formatWeekday } from "../utils/date.js";

function lastSevenDays() {
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    days.push(day);
  }
  return days;
}

export default function AnalyticsPage() {
  const days = lastSevenDays();

  return (
    <PageContainer
      title="Analytics"
      description="Understand your throughput, workload and follow-through. All metrics are computed from your own task records."
    >
      <PlaceholderPanel
        title="Reporting endpoints pending"
        phase="Phase 5"
        icon={TrendingUp}
        description="Every number on this page will come from GET /api/analytics/summary and GET /api/analytics/completions. Until those endpoints exist, values stay empty instead of showing estimated figures."
      />

      <section aria-label="Analytics summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total tasks" value="—" icon={ListTodo} tone="brand" />
          <StatCard
            label="Completed"
            value="—"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard label="Pending" value="—" icon={Clock3} tone="warning" />
          <StatCard
            label="Overdue"
            value="—"
            icon={AlertTriangle}
            tone="danger"
          />
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Completion rate
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Completed tasks divided by total tasks.
            </p>
          </div>
          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Phase 5
          </span>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-3xl font-semibold tracking-tight">—</p>
          <p className="pb-1 text-xs text-ink-muted">No data yet</p>
        </div>
        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
          role="img"
          aria-label="Completion rate not available yet"
        >
          <div className="h-full w-0 rounded-full bg-brand" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Daily completions
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Last 7 days</p>
            </div>
            <BarChart3
              className="h-5 w-5 text-ink-muted"
              aria-hidden="true"
            />
          </div>

          <div
            aria-hidden="true"
            className="mt-6 flex h-32 items-end gap-2 sm:gap-3"
          >
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 rounded-t-md border border-dashed border-line bg-surface-muted/50"
                style={{ height: "24%" }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] text-ink-muted sm:gap-3">
            {days.map((day) => (
              <span key={day.toISOString()}>
                {formatWeekday(day).slice(0, 3)}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Bars render from real completion timestamps in Phase 5.
          </p>
        </section>

        <PlaceholderPanel
          title="Tasks by priority"
          phase="Phase 5"
          icon={PieChart}
          description="Distribution across Low, Medium and High priority."
          className="bg-surface"
        >
          <ul className="space-y-3" aria-hidden="true">
            {["High", "Medium", "Low"].map((label) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-ink-muted">
                  {label}
                </span>
                <span className="h-2 flex-1 rounded-full bg-surface-muted" />
                <span className="w-8 text-right text-xs text-ink-muted">—</span>
              </li>
            ))}
          </ul>
        </PlaceholderPanel>
      </div>

      <PlaceholderPanel
        title="Tasks by category"
        phase="Phase 5"
        icon={Tags}
        description="Compare workload across Personal, Work, Study, Health and your custom categories. Empty states will be handled gracefully when there is no data."
      />
    </PageContainer>
  );
}
