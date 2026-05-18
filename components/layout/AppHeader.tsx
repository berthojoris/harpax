import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { WorkForceLogo } from "@/components/layout/WorkForceLogo";
import type { AuthenticatedUser } from "@/server/domain/types";

type AppHeaderProps = {
  user: AuthenticatedUser;
  subtitle?: string;
  backHref?: string;
  compact?: boolean;
};

export function AppHeader({ user, subtitle = "Mobile Attendance", backHref, compact = false }: AppHeaderProps) {
  return (
    <header className="glass-header sticky top-0 z-40 border-b border-border/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {backHref ? (
          <Link
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-tertiary transition hover:border-primary hover:text-primary"
            href={backHref}
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3">
            <WorkForceLogo size={compact ? 32 : 40} />
          </Link>
        )}

        {backHref ? (
          <div className="flex items-center gap-2">
            <WorkForceLogo size={28} />
            <p className="sr-only">{subtitle}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-tertiary transition hover:border-primary/40 hover:text-primary hover:shadow-soft"
            aria-label="Buka notifikasi"
            type="button"
          >
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
          </button>
          <details className="relative">
            <summary
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-white text-ink-tertiary transition hover:border-primary/40 hover:shadow-soft"
              aria-label="Buka menu akun"
            >
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={`Foto profil ${user.name}`} width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[21px]">account_circle</span>
              )}
            </summary>
            <div className="animate-fade-up absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
              <Link className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink transition hover:bg-canvas" href="/profile">
                <span className="material-symbols-outlined text-[20px] text-ink-muted">person</span>
                Profil
              </Link>
              <LogoutButton className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-sm font-bold text-danger transition hover:bg-danger-soft">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </LogoutButton>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
