import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { useTaskDialogs } from "../../hooks/useTaskDialogs.jsx";

const SIDEBAR_KEY = "taskflow:sidebar-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const skipFocusRef = useRef(null);
  const { openCreate, dialogs } = useTaskDialogs();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Navigating to another page should always close the mobile drawer.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape and lock background scrolling while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="skip-link flex h-9 w-40 items-center justify-center rounded-md bg-brand text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
        ref={skipFocusRef}
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={closeMobile}
          quickAdd={openCreate}
        />

        {mobileOpen ? (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileNav={() => setMobileOpen(true)} />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            <Outlet />
          </main>
        </div>
      </div>
      {dialogs}
    </div>
  );
}
