import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { WorkForceLogo } from "@/components/layout/WorkForceLogo";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Masuk",
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const resolvedSearchParams = await searchParams;
  const nextValue = resolvedSearchParams?.next;
  const nextPath = Array.isArray(nextValue) ? nextValue[0] : nextValue;

  return (
    <main className="mx-auto grid min-h-screen w-full bg-canvas text-ink lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600" />
        <div className="dot-pattern absolute inset-0 opacity-60" />
        <div className="animate-float absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="animate-float-slow absolute right-10 top-40 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-float-delay absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-primary-600/25 blur-3xl" />

        <div className="relative z-10 p-10 xl:p-14">
          <div className="animate-fade-up">
            <WorkForceLogo dark />
          </div>

          <div className="animate-fade-up delay-200 mt-14">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              <span className="shimmer-text">WorkForce Attendance</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              Absensi mobile yang cepat, akurat, dan terhubung dengan validasi lokasi kantor.
            </p>
          </div>

          <div className="animate-fade-up delay-300 mt-10 grid gap-3">
            {[
              ["location_on", "Validasi lokasi real-time", "Pastikan absensi hanya dilakukan dalam radius kantor yang diizinkan."],
              ["analytics", "Laporan kehadiran siap pakai", "Pantau jam kerja, keterlambatan, lembur, dan riwayat harian."],
              ["shield", "Keamanan data terjaga", "Session HTTP-only dan validasi server-side untuk setiap aksi absensi."],
            ].map(([icon, title, description]) => (
              <div key={title} className="glass-card rounded-xl p-4 transition hover:bg-white/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <span className="material-symbols-outlined text-[18px] text-white">{icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 p-10 xl:p-14">
          <div className="animate-fade-up delay-500 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-extrabold text-white">4</p>
              <p className="mt-1 text-xs font-medium text-white/60">Layar inti</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">100m</p>
              <p className="mt-1 text-xs font-medium text-white/60">Radius kantor</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">PWA</p>
              <p className="mt-1 text-xs font-medium text-white/60">Siap install</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
        <div className="animate-fade-up mb-8 lg:hidden">
          <WorkForceLogo />
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="animate-fade-up delay-100">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Masuk Akun
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Selamat datang kembali</h2>
              <p className="mt-2 text-sm leading-6 text-ink-tertiary">
                Gunakan akun pegawai untuk membuka dashboard absensi.
              </p>
            </div>

            <LoginForm nextPath={nextPath} />

            <div className="animate-fade-up delay-600 mt-5 rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] to-primary-600/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-900">Akun demo</p>
                  <p className="mt-0.5 text-sm font-medium text-primary-700">budi@company.com / password123</p>
                </div>
              </div>
            </div>
          </div>

          <p className="animate-fade-up delay-700 mt-6 text-center text-sm text-ink-tertiary">
            Belum punya akun? <span className="font-bold text-primary">Hubungi administrator</span>
          </p>
        </div>
      </section>
    </main>
  );
}
