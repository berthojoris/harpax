import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { formatDuration } from "@/lib/dates";
import type { AttendanceFilter } from "@/server/domain/types";
import type { MonthlyReport } from "@/server/services/workforce.service";

type ReportViewProps = {
  report: MonthlyReport;
};

const filters: Array<{ value: AttendanceFilter; label: string }> = [
  { value: "all", label: "Semua Data" },
  { value: "on_time", label: "Tepat Waktu" },
  { value: "late", label: "Terlambat" },
  { value: "overtime", label: "Lembur" },
  { value: "special", label: "Cuti / Sakit" },
];

function statusClass(status: string): string {
  if (status === "late") return "bg-warning-soft text-warning";
  if (status === "overtime") return "bg-primary/10 text-primary";
  if (status === "sick" || status === "leave") return "bg-canvas text-ink-muted border border-border";
  if (status === "pending" || status === "incomplete") return "bg-primary/10 text-primary";
  return "bg-success-soft text-success";
}

function chartColor(status: string): string {
  if (status === "late") return "from-warning to-warning/40";
  if (status === "sick" || status === "leave" || status === "absent") return "from-ink-muted to-ink-muted/30";
  if (status === "overtime") return "from-accent to-primary/40";
  return "from-primary to-primary/40";
}

export function ReportView({ report }: ReportViewProps) {
  const nextPage = report.pagination.page + 1;
  const totalHours = formatDuration(report.summary.totalWorkMinutes);
  const averageHours = formatDuration(report.summary.averageWorkMinutesPerDay);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AppHeader user={report.user} subtitle="Laporan Kehadiran" />

      <main className="safe-bottom mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-6 text-white shadow-lift sm:p-7">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/70">Bulan {report.monthLabel}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Laporan Kehadiran</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Pantau total jam kerja, ketepatan waktu, dan riwayat absensi dalam satu tampilan.
                </p>
              </div>
              <a
                href={`/api/reports/export?month=${report.month}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined material-symbols-filled text-[14px]">download</span>
                Ekspor
              </a>
            </div>

            <div className="relative mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-white/60">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <p className="text-xs font-bold uppercase tracking-wide">Total Jam</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold">{totalHours}</p>
                <p className="mt-1 text-xs text-white/60">Bulan ini</p>
              </div>
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-white/60">
                  <span className="material-symbols-outlined text-[16px]">avg_time</span>
                  <p className="text-xs font-bold uppercase tracking-wide">Rata-rata</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold">{averageHours}</p>
                <p className="mt-1 text-xs text-white/60">Per hari</p>
              </div>
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-white/60">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <p className="text-xs font-bold uppercase tracking-wide">Terlambat</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold">{report.summary.lateDays}x</p>
                <p className="mt-1 text-xs text-white/60">Dari {report.summary.totalAttendanceDays} hari</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up delay-100 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-ink">Tren Jam Kerja</h2>
                <p className="mt-0.5 text-sm text-ink-muted">Data bulan berjalan</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                <span className="material-symbols-outlined material-symbols-filled text-[14px]">check_circle</span>
                On Track
              </span>
            </div>

            <div className="relative mt-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between">
                <div className="border-t border-dashed border-border/60" />
                <div className="border-t border-dashed border-border/60" />
                <div className="border-t border-dashed border-border/60" />
                <div className="border-t border-dashed border-border/60" />
                <div className="border-t border-border/80" />
              </div>
              <div className="relative flex h-40 items-end gap-[6px] px-1 pb-0 sm:gap-2">
                {report.chart.length > 0 ? (
                  report.chart.map((item, index) => (
                    <div
                      key={item.date}
                      title={`${item.date}: ${formatDuration(item.workMinutes)}`}
                      className={`chart-bar bar-grow flex-1 rounded-t-lg bg-gradient-to-t ${chartColor(item.status)}`}
                      style={{ height: `${item.heightPercent}%`, animationDelay: `${index * 0.05}s` }}
                    />
                  ))
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-canvas text-sm font-semibold text-ink-muted">
                    Belum ada data grafik.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Hadir", report.summary.totalAttendanceDays, "event_available", "bg-success-soft text-success", "bg-success"],
            ["Tepat Waktu", report.summary.onTimeDays, "timer", "bg-primary/10 text-primary", "bg-primary"],
            ["Lembur", formatDuration(report.summary.overtimeDays * 60), "schedule", "bg-warning-soft text-warning", "bg-warning"],
            ["Sakit", report.summary.sickDays, "medical_services", "bg-canvas text-ink-muted", "bg-ink-muted"],
          ].map(([label, value, icon, iconClass, borderClass]) => (
            <div key={label as string} className="stat-card hover-lift relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className={`absolute left-0 right-0 top-0 h-1 rounded-t-2xl ${borderClass}`} />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-ink-tertiary">{label}</span>
                  <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
                  <span className="material-symbols-outlined material-symbols-filled text-[24px]">{icon}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="no-scrollbar animate-fade-up delay-400 -mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                className={
                  filter.value === report.filter
                    ? "tab-pill tab-active rounded-full px-5 py-2.5 text-sm font-bold"
                    : "tab-pill rounded-full border border-border bg-white px-5 py-2.5 text-sm font-bold text-ink-tertiary hover:bg-canvas"
                }
                href={`/report?month=${report.month}&filter=${filter.value}`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="animate-fade-up delay-500 mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Riwayat Kehadiran</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Urut dari data terbaru</p>
            </div>
          </div>

          <div>
            {report.records.length > 0 ? (
              report.records.map((record) => (
                <article key={record.id} className="row-hover grid gap-3 border-t border-border first:border-t-0 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                      <p className="font-bold text-ink">{record.dayLabel}</p>
                    </div>
                    <p className="mt-1 pl-6 text-sm text-ink-muted">{record.notes ?? record.durationLabel}</p>
                  </div>
                  {record.status === "sick" || record.status === "leave" ? (
                    <div className="rounded-xl border border-border/60 bg-canvas p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Catatan</p>
                      <p className="mt-1 font-bold text-ink-secondary">{record.notes ?? "Tidak masuk kerja"}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/60 bg-canvas p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Masuk</p>
                        <p className="mt-1 text-lg font-extrabold text-ink">{record.checkIn}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-canvas p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Keluar</p>
                        <p className="mt-1 text-lg font-extrabold text-ink">{record.checkOut}</p>
                      </div>
                    </div>
                  )}
                  <span className={`status-badge w-fit rounded-full px-3.5 py-1.5 text-sm font-bold ${statusClass(record.status)}`}>
                    {record.statusLabel}
                  </span>
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-sm font-semibold text-ink-muted">No records match this filter.</div>
            )}
          </div>
        </section>

        {report.pagination.hasMore ? (
          <div className="animate-fade-up delay-600 mt-6 flex justify-center">
            <Link
              className="load-more-btn flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-bold text-primary shadow-card"
              href={`/report?month=${report.month}&filter=${report.filter}&page=${nextPage}`}
            >
              Muat Lebih Banyak
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
          </div>
        ) : null}
      </main>

      <BottomNavigation />
    </div>
  );
}
