"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Shares one open/closed boolean between MenuToggleButton (rendered
// inside AppHeader, a server component) and MobileSidebarFrame
// (wrapping AppSidebar, also a server component) — they're siblings in
// the render tree, not parent/child, so context is the right tool here
// rather than lifting state into either server component (which can't
// hold client state) or threading a function prop across the server/
// client boundary (functions can't serialize across it).
const MobileNavContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav must be used within MobileNavProvider");
  return ctx;
}

export function MenuToggleButton() {
  const { open, setOpen } = useMobileNav();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="-ml-1.5 rounded-md p-1.5 text-fg hover:bg-white/5 md:hidden"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {open ? (
          <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        ) : (
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}

// Wraps the (server-rendered) AppSidebar. Desktop: normal static
// column, always visible. Mobile: a fixed off-canvas drawer, slid in
// via transform when `open`, with a tap-to-dismiss backdrop — the
// sidebar itself renders only once either way, so no duplicate query.
export function MobileSidebarFrame({ children }: { children: ReactNode }) {
  const { open, setOpen } = useMobileNav();
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 md:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </div>
    </>
  );
}
