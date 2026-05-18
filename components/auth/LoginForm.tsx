"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FieldErrors = {
  email?: string[];
  password?: string[];
};

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    setErrors({});
    setMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      message?: string;
      fieldErrors?: FieldErrors;
    } | null;

    if (!response.ok) {
      setErrors(data?.fieldErrors ?? {});
      setMessage(data?.message ?? "Unable to login. Please try again.");
      setIsPending(false);
      return;
    }

    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="animate-fade-up delay-200">
        <label className="mb-1.5 block text-sm font-bold text-ink" htmlFor="email">
          Email
        </label>
        <div className="input-icon-focus relative">
          <span className="input-icon material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-ink-muted transition-colors duration-200">
            mail
          </span>
          <input
            className="glow-focus h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-sm font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-ink-muted hover:border-primary/40 focus:border-primary"
            id="email"
            name="email"
            placeholder="budi@company.com"
            required
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email ? (
          <p id="email-error" className="mt-1.5 text-xs font-semibold text-danger">
            {errors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="animate-fade-up delay-300">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-bold text-ink" htmlFor="password">
            Kata Sandi
          </label>
          <span className="text-sm font-bold text-primary">Lupa?</span>
        </div>
        <div className="input-icon-focus relative">
          <span className="input-icon material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-ink-muted transition-colors duration-200">
            lock
          </span>
          <input
            className="glow-focus h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-sm font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-ink-muted hover:border-primary/40 focus:border-primary"
            id="password"
            name="password"
            placeholder="Masukkan kata sandi"
            required
            minLength={6}
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </div>
        {errors.password ? (
          <p id="password-error" className="mt-1.5 text-xs font-semibold text-danger">
            {errors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="animate-fade-up delay-400 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink-secondary">
          <input className="h-5 w-5 rounded-md border-2 border-border text-primary focus:ring-primary/20" type="checkbox" />
          Ingat perangkat ini
        </label>
      </div>

      {message ? (
        <div className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger" role="alert">
          {message}
        </div>
      ) : null}

      <div className="animate-fade-up delay-500">
        <button
          className="btn-lift flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-600 px-4 text-sm font-bold text-white shadow-lg shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Memproses..." : "Masuk"}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
