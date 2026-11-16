import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
  Settings,
  Star,
  Sun,
} from "lucide-react";

/**
 * Single source of truth for the sidebar and the header breadcrumb,
 * so navigation never drifts out of sync with the router.
 */
export const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/tasks", label: "All Tasks", icon: ListTodo },
      { to: "/today", label: "Today", icon: Sun },
      { to: "/upcoming", label: "Upcoming", icon: CalendarClock },
      { to: "/completed", label: "Completed", icon: CheckCircle2 },
      { to: "/important", label: "Important", icon: Star },
    ],
  },
  {
    label: "Planning",
    items: [
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

const PAGE_META = Object.fromEntries(
  NAV_SECTIONS.flatMap((section) =>
    section.items.map((item) => [
      item.to,
      { section: section.label, title: item.label },
    ]),
  ),
);

export function getPageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/tasks/")) {
    return { section: "Workspace", title: "Task details" };
  }
  return { section: "Workspace", title: "TaskFlow" };
}
