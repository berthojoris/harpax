import Image from "next/image";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { formatDuration } from "@/lib/dates";
import type { DashboardSummary } from "@/server/services/workforce.service";

type ProfileViewProps = {
  summary: DashboardSummary;
};

export function ProfileView({ summary }: ProfileViewProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AppHeader user={summary.user} subtitle="Profil Pegawai" />

      <main className="safe-bottom mx-auto grid max-w-6xl gap-5 px-4 pt-5 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 p-5 text-white shadow-lift sm:p-6">
          <div className="dot-pattern absolute inset-0 opacity-20" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative">
              {summary.user.avatarUrl ? (
                <Image
                  className="relative h-28 w-28 rounded-3xl border-4 border-white/30 object-cover shadow-soft"
                  alt={`Foto profil ${summary.user.name}`}
                  src={summary.user.avatarUrl}
                  width={112}
                  height={112}
                  priority
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white/30 bg-white/10">
                  <span className="material-symbols-outlined text-5xl">account_circle</span>
                </div>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{summary.user.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">Employee ID WF-EMP-001</span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-white ring-1 ring-success/30">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Aktif
            </span>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-white/60">event_available</span>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Kehadiran</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold">
                {summary.month.consistency}
                <span className="text-lg font-bold text-white/60">%</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-white/60">schedule</span>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Total Jam</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{formatDuration(summary.week.totalWorkMinutes)}</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="animate-fade-up delay-100 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">Informasi Pegawai</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success ring-1 ring-success/10">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Verified
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["mail", "Email", summary.user.email, "bg-primary/10 text-primary"],
                ["work", "Role", "Employee", "bg-accent/10 text-accent"],
                ["location_city", "Kantor", summary.office.name, "bg-primary/10 text-primary"],
                ["watch_later", "Shift", `${summary.shift.name} ${summary.shift.startTime} - ${summary.shift.endTime}`, "bg-warning/10 text-warning"],
              ].map(([icon, label, value, colorClass]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-canvas p-4 ring-1 ring-border/60">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">{label}</p>
                    <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up delay-200 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Preferensi Absensi</h2>
            <div className="mt-4 divide-y divide-border">
              {[
                ["location_on", "Radius kantor", `${summary.office.allowedRadiusMeters} meter dari titik kantor`, "chevron_right"],
                ["notifications", "Pengingat absen", "Aktif sebelum shift dimulai", "On"],
                ["security", "Keamanan sesi", "Cookie HTTP-only dan session tersimpan aman", "chevron_right"],
              ].map(([icon, title, description, right]) => (
                <div key={title} className="-mx-1 flex items-center justify-between rounded-xl px-3 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="text-sm text-ink-tertiary">{description}</p>
                    </div>
                  </div>
                  {right === "On" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success ring-1 ring-success/10">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                      On
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-ink-muted">chevron_right</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <LogoutButton className="danger-lift flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger-soft px-5 py-3.5 text-sm font-bold text-danger transition hover:bg-danger/10">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar dari akun
          </LogoutButton>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
