"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/report", icon: "calendar_month", label: "History" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border/70 bg-white/92 px-4 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex flex-col items-center justify-center rounded-xl bg-primary/10 px-3 py-2 text-primary transition"
                  : "flex flex-col items-center justify-center rounded-xl px-3 py-2 text-ink-muted transition hover:bg-canvas hover:text-primary"
              }
            >
              <span className={`material-symbols-outlined text-[23px] ${isActive ? "material-symbols-filled" : ""}`}>{item.icon}</span>
              <span className="mt-1 text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
