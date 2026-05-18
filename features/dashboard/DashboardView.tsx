import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { formatDuration, formatTimeWithZone } from "@/lib/dates";
import type { DashboardSummary } from "@/server/services/workforce.service";

type DashboardViewProps = {
  summary: DashboardSummary;
};

function WeekDayCard({ day }: { day: DashboardSummary["week"]["days"][number] }) {
  const styles = {
    completed: "bg-success-soft text-success",
    today: "bg-primary/[0.06] text-primary ring-2 ring-primary/20",
    pending: "bg-canvas text-ink-muted",
    late: "bg-warning-soft text-warning",
    special: "bg-canvas text-ink-muted",
  }[day.status];

  const icon =
    day.status === "completed" ? "check" : day.status === "late" ? "schedule" : day.status === "special" ? "medical_services" : "more_horiz";

  return (
    <div className={`rounded-xl p-3 text-center transition hover:shadow-soft ${styles}`}>
      <p className="text-xs font-extrabold">{day.label}</p>
      <div className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 ring-1 ring-current/10">
        {day.status === "today" ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        ) : (
          <span className={`material-symbols-outlined text-[18px] ${day.status === "completed" ? "material-symbols-filled" : ""}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-bold">{day.durationLabel}</p>
    </div>
  );
}

function AttendanceActionCards({ today }: { today: DashboardSummary["today"] }) {
  const checkInActive = today.action === "check_in";
  const checkOutActive = today.action === "check_out";

  return (
    <section className="animate-fade-up delay-100 grid gap-3 sm:grid-cols-2">
      <Link
        href={checkInActive ? "/attendance" : "#"}
        aria-disabled={!checkInActive}
        className={
          checkInActive
            ? "group card-hover rounded-2xl border border-primary/15 bg-white p-4 shadow-card"
            : "rounded-2xl border border-border bg-white p-4 opacity-70 shadow-card"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={
                checkInActive
                  ? "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-lift"
                  : "flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success"
              }
            >
              <span className="material-symbols-outlined material-symbols-filled">login</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold">Absen Masuk</h2>
              <p className="text-sm font-medium text-ink-tertiary">
                {checkInActive ? "Rekam lokasi dan waktu masuk" : "Sudah tercatat"}
              </p>
            </div>
          </div>
          <span className={`material-symbols-outlined ${checkInActive ? "text-primary group-hover:translate-x-1" : "text-success"} transition`}>
            {checkInActive ? "arrow_forward" : "check_circle"}
          </span>
        </div>
        <div className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 ${checkInActive ? "bg-primary/[0.08]" : "bg-success-soft"}`}>
          <span className={`text-sm font-bold ${checkInActive ? "text-primary-700" : "text-success"}`}>
            {checkInActive ? "Siap digunakan" : "Tercatat"}
          </span>
          <span className={`text-sm font-extrabold ${checkInActive ? "text-primary" : "text-success"}`}>{today.checkInLabel}</span>
        </div>
      </Link>

      <Link
        href={checkOutActive ? "/attendance" : "#"}
        aria-disabled={!checkOutActive}
        className={
          checkOutActive
            ? "group card-hover rounded-2xl border border-primary/15 bg-white p-4 shadow-card"
            : "rounded-2xl border border-border bg-white p-4 opacity-65 shadow-card"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={
                checkOutActive
                  ? "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-lift"
                  : "flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-ink-muted"
              }
            >
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-ink-secondary">Absen Keluar</h2>
              <p className="text-sm font-medium text-ink-muted">
                {checkOutActive ? "Rekam lokasi dan waktu pulang" : today.action === "complete" ? "Sudah tercatat" : "Aktif setelah absen masuk"}
              </p>
            </div>
          </div>
          <span className={`material-symbols-outlined ${checkOutActive ? "text-primary group-hover:translate-x-1" : "text-ink-muted"} transition`}>
            {checkOutActive ? "arrow_forward" : today.action === "complete" ? "check_circle" : "lock"}
          </span>
        </div>
        <div className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 ${checkOutActive ? "bg-primary/[0.08]" : "bg-canvas"}`}>
          <span className={`text-sm font-bold ${checkOutActive ? "text-primary-700" : "text-ink-muted"}`}>
            {checkOutActive ? "Siap digunakan" : today.action === "complete" ? "Selesai" : "Belum tersedia"}
          </span>
          <span className={`text-sm font-extrabold ${checkOutActive ? "text-primary" : "text-ink-muted"}`}>{today.checkOutLabel}</span>
        </div>
      </Link>
    </section>
  );
}

export function DashboardView({ summary }: DashboardViewProps) {
  const currentTime = formatTimeWithZone(new Date().toISOString()).replace(" WIB", "");
  const progressPercent = Math.round(summary.week.progress * 100);
  const firstName = summary.user.name.split(" ")[0] ?? summary.user.name;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AppHeader user={summary.user} />

      <main className="safe-bottom mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <section className="space-y-5">
          <div className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 shadow-lift">
            <div className="animate-float absolute -left-16 -top-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="animate-float-slow absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative px-5 py-6 text-white sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/70">{summary.today.dateLabel}</p>
                  <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                    <span className="shimmer-text">Selamat Pagi, {firstName}</span>
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
                    Shift {summary.shift.name.toLowerCase()} hari ini aktif. Validasi lokasi kantor digunakan saat absen.
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                  On Site
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/55">Jam Sekarang</p>
                  <p className="mt-2 text-3xl font-extrabold">{currentTime}</p>
                  <p className="mt-1 text-xs font-semibold text-white/60">WIB</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/55">Jadwal Shift</p>
                  <p className="mt-2 text-xl font-extrabold">
                    {summary.shift.startTime} - {summary.shift.endTime}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/60">Grace period {summary.shift.gracePeriodMinutes} menit</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/55">Status Hari Ini</p>
                  <p className="mt-2 text-xl font-extrabold">
                    {summary.today.action === "complete" ? "Selesai" : summary.today.action === "check_out" ? "Sudah Masuk" : "Belum Absen"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/60">
                    {summary.today.action === "check_out" ? "Keluar tersedia" : summary.today.action === "check_in" ? "Masuk tersedia" : "Absensi lengkap"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AttendanceActionCards today={summary.today} />

          <section className="animate-fade-up delay-200 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Kehadiran Minggu Ini</h2>
                <p className="mt-1 text-sm font-medium text-ink-tertiary">Target 40 jam kerja dalam 5 hari</p>
              </div>
              <Link href="/report" className="rounded-xl border border-border px-3 py-1.5 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/5">
                Detail
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {summary.week.days.map((day) => (
                <WeekDayCard key={day.date} day={day} />
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-canvas p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink-tertiary">Total Jam Kerja</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary">
                    {formatDuration(summary.week.totalWorkMinutes)}{" "}
                    <span className="text-sm font-semibold text-ink-muted">/ {formatDuration(summary.week.targetWorkMinutes)}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-success-soft px-3 py-1.5 text-sm font-extrabold text-success">
                  {progressPercent >= 20 ? "On Track" : "Mulai"}
                </div>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </section>
        </section>

        <aside className="space-y-5">
          <section className="animate-fade-up delay-300 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold">Lokasi & Jaringan</h2>
                <p className="mt-1 text-sm font-medium text-ink-tertiary">Validasi area absensi saat ini</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success shadow-soft">
                <span className="material-symbols-outlined material-symbols-filled">my_location</span>
              </span>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-xl border border-border">
              <iframe
                className="h-48 w-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${summary.office.longitude - 0.025}%2C${summary.office.latitude - 0.015}%2C${summary.office.longitude + 0.025}%2C${summary.office.latitude + 0.015}&layer=mapnik&marker=${summary.office.latitude}%2C${summary.office.longitude}`}
                title="Peta kantor"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-extrabold text-white drop-shadow-md">{summary.office.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-white/90 drop-shadow-md">{summary.office.address}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-success-soft p-3 transition hover:shadow-soft">
                <div className="flex items-center gap-2 text-success">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider">Radius</span>
                </div>
                <p className="mt-2 text-lg font-extrabold text-success">{summary.office.allowedRadiusMeters}m</p>
                <p className="text-xs font-semibold text-success/75">Diizinkan</p>
              </div>
              <div className="rounded-xl bg-primary/[0.06] p-3 transition hover:shadow-soft">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[18px]">wifi</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider">Jaringan</span>
                </div>
                <p className="mt-2 text-lg font-extrabold text-primary">Stabil</p>
                <p className="text-xs font-semibold text-primary/75">Online</p>
              </div>
            </div>
          </section>

          <section className="animate-fade-up delay-400 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Ringkasan Bulan Ini</h2>
              <span className="rounded-xl bg-warning-soft px-3 py-1 text-xs font-extrabold text-warning">{summary.month.monthLabel}</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-2xl font-extrabold text-ink">{summary.month.attendedDays}</p>
                <p className="mt-1 text-xs font-bold text-ink-tertiary">Hadir</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-2xl font-extrabold text-ink">{summary.month.lateDays}</p>
                <p className="mt-1 text-xs font-bold text-ink-tertiary">Terlambat</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-2xl font-extrabold text-ink">{formatDuration(summary.month.overtimeMinutes)}</p>
                <p className="mt-1 text-xs font-bold text-ink-tertiary">Lembur</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["Konsistensi", summary.month.consistency, "bg-success", "text-success"],
                ["Ketepatan waktu", summary.month.punctuality, "bg-gradient-to-r from-primary to-accent", "text-primary"],
              ].map(([label, value, barClass, textClass]) => (
                <div key={label as string}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-bold text-ink-secondary">{label}</span>
                    <span className={`font-extrabold ${textClass}`}>{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-up delay-500 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Aktivitas Terakhir</h2>
              <Link href="/report" className="text-sm font-bold text-primary transition hover:text-primary-700">
                Lihat
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {summary.recentActivities.map((activity) => (
                <div key={`${activity.title}-${activity.description}`} className="flex items-center gap-3 rounded-xl bg-canvas p-3 transition hover:bg-success-soft/40">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.status === "warning" ? "bg-warning-soft text-warning" : activity.status === "info" ? "bg-primary/10 text-primary" : "bg-success-soft text-success"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {activity.status === "warning" ? "schedule" : activity.status === "info" ? "info" : "check_circle"}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{activity.title}</p>
                    <p className="text-xs font-semibold text-ink-tertiary">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <BottomNavigation />
    </div>
  );
}
