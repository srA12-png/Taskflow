import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Settings, User, LogOut, Plus } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { buttonStyles } from "../ui/Button.jsx";
import { getPageMeta } from "../../utils/navigation.js";
import { useAuth } from "../../context/AuthContext.jsx";
import TaskForm from "../tasks/TaskForm.jsx";

export default function Header({ onOpenMobileNav }) {
  const { user, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const throwAway = useRef(null);

  const [query, setQuery] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const meta = getPageMeta(pathname);

  function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(
      trimmed ? `/tasks?q=${encodeURIComponent(trimmed)}` : "/tasks"
    );
  }

  useEffect(() => {
    function handleClick(event) {
      if (throwAway.current && !throwAway.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape" && userMenuOpen) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  function handleQuickAdd() {
    setQuickAddOpen(true);
  }

  async function handleSignOut(event) {
    event.preventDefault();
    setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          aria-controls="app-sidebar"
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition hover:bg-surface-muted hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            {meta.section}
          </p>
          <p className="truncate text-sm font-semibold">{meta.title}</p>
        </div>

        <form
          role="search"
          onSubmit={handleSearch}
          className="ml-auto hidden md:block"
        >
          <label htmlFor="global-search" className="sr-only">
            Search tasks
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks…"
              className="h-10 w-56 rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink transition placeholder:text-ink-muted/80 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 lg:max-w-[280px]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <ThemeToggle />
          <Link
            to="/login"
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Quick add task"
            className={buttonStyles({ variant: "primary", size: "icon" })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex justify-end px-4 pb-3 lg:px-0" ref={throwAway}>
        <UserMenu
          menuRef={throwAway}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          initials={initials}
          user={user}
          onSignOut={handleSignOut}
        />
      </div>

      <TaskForm
        open={quickAddOpen}
        task={null}
        onClose={() => setQuickAddOpen(false)}
      />
    </header>
  );
}

function UserMenu({ menuRef, userMenuOpen, setUserMenuOpen, initials, user, onSignOut }) {
  return (
    <div
      className="flex items-start  justify-end px-4 pb-3 lg:justify-end lg:px-0"
      ref={menuRef}
      onClick={() => {
        setUserMenuOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Open user menu"
        onClick={() => setUserMenuOpen(true)}
        className="flex h-10 w-24 place-items-center justify-center gap-2 rounded-lg focus:outline-none focus-visible:outline-2 focus-visible:outline-indigo-500 hover:bg-surface hover:text-ink text-ink-muted transition"
      >
        <span
          className="h-9 w-9 shrink-0 rounded-full bg-surface-muted text-xs font-semibold text-ink"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="text-sm font-medium truncate text-ink">
          {user?.name ?? "your name"}
        </span>
      </button>
      {userMenuOpen ? (
        <div className="absolute right-4 top-12 w-72 rounded-xl border border-line bg-surface shadow-pop">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <span
              className="h-9 w-9 shrink-0 rounded-full bg-surface-muted text-xs font-semibold text-ink"
              aria-hidden="true"
            >
              {initials}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-ink transition hover:bg-surface-muted"
            onClick={() => setUserMenuOpen(false)}
          >
            <Settings className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            <span>Settings</span>
          </Link>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-ink transition hover:bg-surface-muted"
            onClick={onSignOut}
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              <span>Sign out</span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
