import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#6366F1";
const PRIORITY_COLORS = {
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "12px",
  color: "var(--ink)",
  fontSize: "12px",
};

function shortWeekday(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

export function CompletionsBarChart({ data }) {
  return (
    <div className="text-ink-muted">
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={shortWeekday}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "var(--surface-muted)" }}
            labelFormatter={(value) =>
              new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })
            }
            formatter={(value) => [value, "Completed"]}
          />
          <Bar dataKey="completed" fill={BRAND} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityPieChart({ byPriority }) {
  const data = ["High", "Medium", "Low"]
    .map((label) => ({
      name: label,
      value: byPriority?.[label.toLowerCase()] ?? 0,
    }))
    .filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-muted">
        No tasks to chart yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-ink-muted sm:flex-row">
      <div className="h-40 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={62}
              paddingAngle={3}
              stroke="var(--surface)"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 sm:w-1/2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[entry.name] }}
              aria-hidden="true"
            />
            <span className="text-ink">{entry.name}</span>
            <span className="ml-auto text-xs tabular-nums text-ink-muted">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryBarChart({ data }) {
  const rows = (data ?? []).filter((row) => row.count > 0);

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-muted">
        No tasks to chart yet.
      </p>
    );
  }

  return (
    <div className="text-ink-muted">
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 42)}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke="var(--line)" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "var(--surface-muted)" }}
            formatter={(value) => [value, "Tasks"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color || BRAND} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
