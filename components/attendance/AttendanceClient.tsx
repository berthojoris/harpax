"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { calculateDistanceMeters } from "@/lib/distance";
import type { AttendancePageData } from "@/server/services/workforce.service";

type NotificationState = {
  type: "success" | "info" | "error";
  title: string;
  message: string;
};

type AttendanceResponse = {
  success?: boolean;
  message?: string;
  recordedAt?: string;
};

function getClockLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function Notification({ notification, onClose }: { notification: NotificationState | null; onClose: () => void }) {
  const config = {
    success: ["check_circle", "bg-success/15 text-success", "bg-success"],
    info: ["info", "bg-primary/15 text-primary", "bg-primary"],
    error: ["error", "bg-danger/15 text-danger", "bg-danger"],
  } as const;

  const [icon, iconClass, progressClass] = notification ? config[notification.type] : config.info;

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/50 bg-white/90 px-4 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-out ${
          notification ? "translate-y-0 opacity-100" : "translate-y-[-150%] opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          <span className="material-symbols-outlined material-symbols-filled text-[22px]">{icon}</span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold text-ink">{notification?.title ?? "Info"}</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-ink-tertiary">
            {notification?.message ?? "Validasi absensi sedang diproses."}
          </p>
        </div>
        <button
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-black/5"
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
        <div className="absolute bottom-0 left-4 right-4 h-[2px] overflow-hidden rounded-full bg-black/5">
          <div className={`h-full origin-left rounded-full ${progressClass} ${notification ? "animate-[shrink_4s_linear_forwards]" : ""}`} />
        </div>
      </div>
    </div>
  );
}

export function AttendanceClient({ data }: { data: AttendancePageData }) {
  const router = useRouter();
  const [clock, setClock] = useState(getClockLabel);
  const [isPending, setIsPending] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [locationState, setLocationState] = useState<{
    status: "idle" | "detecting" | "valid" | "invalid" | "denied" | "error";
    distanceMeters: number | null;
    accuracyMeters: number | null;
  }>({ status: "idle", distanceMeters: null, accuracyMeters: null });

  const mode = data.today.action;
  const isCheckout = mode === "check_out";
  const isComplete = mode === "complete";
  const buttonLabel = isComplete ? "Absensi Selesai" : isCheckout ? "Absen Keluar Sekarang" : "Absen Masuk Sekarang";
  const title = isCheckout ? "Absen Keluar" : "Absen Masuk";

  const locationLabel = useMemo(() => {
    if (locationState.status === "detecting") return "Mendeteksi lokasi...";
    if (locationState.status === "valid") return "Dalam Radius Kantor";
    if (locationState.status === "invalid") return "Di Luar Radius Kantor";
    if (locationState.status === "denied") return "Izin Lokasi Ditolak";
    if (locationState.status === "error") return "Lokasi Tidak Tersedia";
    return "Validasi saat submit";
  }, [locationState.status]);

  function showNotification(next: NotificationState) {
    setNotification(next);
    window.setTimeout(() => setNotification(null), 4000);
  }

  useEffect(() => {
    const interval = window.setInterval(() => setClock(getClockLabel()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  async function getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      });
    });
  }

  async function handleSubmit() {
    if (isPending || isComplete) return;
    if (!navigator.onLine) {
      showNotification({
        type: "error",
        title: "Offline",
        message: "Attendance action requires an internet connection.",
      });
      return;
    }

    setIsPending(true);
    setLocationState((current) => ({ ...current, status: "detecting" }));

    try {
      const position = await getLocation();
      const distanceMeters = calculateDistanceMeters(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        {
          latitude: data.office.latitude,
          longitude: data.office.longitude,
        },
      );

      setLocationState({
        status: distanceMeters <= data.office.allowedRadiusMeters ? "valid" : "invalid",
        distanceMeters,
        accuracyMeters: position.coords.accuracy,
      });

      const endpoint = isCheckout ? "/api/attendance/check-out" : "/api/attendance/check-in";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        }),
      });
      const result = (await response.json().catch(() => null)) as AttendanceResponse | null;

      if (!response.ok) {
        showNotification({
          type: "error",
          title: "Gagal",
          message: result?.message ?? "Unable to record attendance. Please try again.",
        });
        return;
      }

      showNotification({
        type: "success",
        title: "Berhasil",
        message: `${result?.message ?? (isCheckout ? "Berhasil Absen Keluar" : "Berhasil Absen Masuk")}. Waktu tercatat: ${result?.recordedAt ?? clock} .`,
      });
      window.setTimeout(() => router.refresh(), 900);
    } catch (error) {
      const geolocationError = error as GeolocationPositionError;
      setLocationState({
        status: geolocationError.code === geolocationError.PERMISSION_DENIED ? "denied" : "error",
        distanceMeters: null,
        accuracyMeters: null,
      });
      showNotification({
        type: "error",
        title: "Gagal",
        message:
          geolocationError.code === geolocationError.PERMISSION_DENIED
            ? "Location permission is required to record attendance."
            : "Unable to detect your location. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <AppHeader user={data.user} backHref="/dashboard" subtitle={title} compact />

      <main className="safe-bottom mx-auto grid max-w-5xl gap-5 px-4 pt-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="animate-fade-up relative overflow-hidden rounded-2xl p-5 text-white shadow-lift sm:p-6">
          <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600" />
          <div className="dot-pattern absolute inset-0 opacity-30" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/70">{data.currentDateLabel}</p>
                <p className="mt-3 text-5xl font-extrabold leading-none tracking-tight">{clock}</p>
                <p className="mt-2 text-sm font-semibold text-white/60">WIB - Server time</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                {isComplete ? "Selesai" : "Siap Absen"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">Shift</p>
                <p className="mt-2 text-lg font-bold">
                  {data.shift.startTime} - {data.shift.endTime}
                </p>
                <p className="mt-1 text-xs text-white/60">{data.shift.name}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">Status</p>
                <p className="mt-2 text-lg font-bold">{mode === "check_out" ? "Sudah Masuk" : mode === "complete" ? "Selesai" : "On Time"}</p>
                <p className="mt-1 text-xs text-white/60">Grace {data.shift.gracePeriodMinutes} menit</p>
              </div>
            </div>

            <button
              className="btn-lift mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-white to-slate-100 px-5 py-4 text-base font-bold text-primary shadow-lg shadow-primary-900/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleSubmit}
              disabled={isPending || isComplete}
            >
              <span className="material-symbols-outlined material-symbols-filled text-[28px]">fingerprint</span>
              {isPending ? "Memproses Lokasi..." : buttonLabel}
            </button>
            <p className="mt-4 text-center text-sm leading-6 text-white/65">Pastikan Anda berada di area kantor.</p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="animate-fade-up delay-100 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <div className="relative h-56 bg-slate-100 sm:h-64">
              <iframe
                className="z-0 h-full w-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.office.longitude - 0.025}%2C${data.office.latitude - 0.015}%2C${data.office.longitude + 0.025}%2C${data.office.latitude + 0.015}&layer=mapnik&marker=${data.office.latitude}%2C${data.office.longitude}`}
                title="Peta lokasi kantor"
              />
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-primary-900/30 via-primary-900/5 to-transparent" />
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="relative">
                  <div className="ripple-ring absolute -inset-10 rounded-full border border-primary/20" />
                  <div className="ripple-ring-delay absolute -inset-10 rounded-full border border-primary/15" />
                  <div className="pulse-ring absolute -inset-5 rounded-full bg-primary/10" />
                  <div className="pulse-ring-delay absolute -inset-3 rounded-full bg-primary/15" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-600 text-white shadow-lift ring-4 ring-white">
                    <span className="material-symbols-outlined material-symbols-filled">my_location</span>
                  </div>
                </div>
              </div>
              <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/60 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
                <p className={`flex items-center gap-1 text-xs font-bold ${locationState.status === "invalid" || locationState.status === "denied" ? "text-danger" : "text-success"}`}>
                  <span className="material-symbols-outlined material-symbols-filled text-[14px]">
                    {locationState.status === "invalid" || locationState.status === "denied" ? "error" : "verified"}
                  </span>
                  {locationLabel}
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-tertiary">
                  {locationState.accuracyMeters ? `Akurasi GPS ${Math.round(locationState.accuracyMeters)}m` : "GPS akan diminta saat absen"}
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                  <span className="material-symbols-outlined material-symbols-filled">location_on</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink">{data.office.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-tertiary">
                    {data.office.address}.{" "}
                    {locationState.distanceMeters
                      ? `Jarak Anda ${locationState.distanceMeters}m dari titik kantor.`
                      : `Radius absensi ${data.office.allowedRadiusMeters}m dari titik kantor.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-up delay-200 grid gap-3 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-card transition hover:shadow-soft">
              <div className={`absolute left-0 top-0 h-1 w-full ${locationState.status === "invalid" || locationState.status === "denied" ? "bg-danger" : "bg-success"}`} />
              <div className={locationState.status === "invalid" || locationState.status === "denied" ? "flex items-center gap-2 text-danger" : "flex items-center gap-2 text-success"}>
                <span className={locationState.status === "invalid" || locationState.status === "denied" ? "flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft" : "flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft"}>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Lokasi</span>
              </div>
              <p className="mt-3 text-xl font-extrabold text-ink">
                {locationState.status === "invalid" || locationState.status === "denied" ? "Tidak Valid" : locationState.status === "detecting" ? "Cek..." : "Siap"}
              </p>
              <p className="mt-1 text-xs font-medium text-ink-tertiary">
                {locationState.distanceMeters ? `${locationState.distanceMeters}m / ${data.office.allowedRadiusMeters}m` : `Radius ${data.office.allowedRadiusMeters}m`}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-card transition hover:shadow-soft">
              <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
              <div className="flex items-center gap-2 text-primary">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-[18px]">wifi</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Jaringan</span>
              </div>
              <p className="mt-3 text-xl font-extrabold text-ink">Stabil</p>
              <p className="mt-1 text-xs font-medium text-ink-tertiary">Online</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-card transition hover:shadow-soft">
              <div className="absolute left-0 top-0 h-1 w-full bg-warning" />
              <div className="flex items-center gap-2 text-warning">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Toleransi</span>
              </div>
              <p className="mt-3 text-xl font-extrabold text-ink">{data.shift.gracePeriodMinutes}m</p>
              <p className="mt-1 text-xs font-medium text-ink-tertiary">Grace period</p>
            </div>
          </div>

          <section className="animate-fade-up delay-300 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Alur Absensi Hari Ini</h2>
            <div className="relative mt-5 space-y-0">
              <div className="timeline-line" />
              <div className={`relative flex gap-4 pb-6 ${mode === "check_in" ? "" : "opacity-80"}`}>
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-600 text-white shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined material-symbols-filled text-[18px]">login</span>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-ink">Absen Masuk</p>
                  <p className="mt-0.5 text-sm text-ink-tertiary">
                    {data.today.checkInAt ? `Tercatat ${data.today.checkInLabel}` : "Aktif sekarang, belum tercatat."}
                  </p>
                </div>
              </div>
              <div className={`relative flex gap-4 ${mode === "check_out" ? "" : "opacity-55"}`}>
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-muted ring-1 ring-border">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-ink-secondary">Absen Keluar</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {data.today.checkOutAt ? `Tercatat ${data.today.checkOutLabel}` : "Terbuka setelah absen masuk berhasil."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
