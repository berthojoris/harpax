import Image from "next/image";

type WorkForceLogoProps = {
  size?: number;
  dark?: boolean;
};

export function WorkForceLogo({ size = 40, dark = false }: WorkForceLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.svg" alt="WorkForce Logo" width={size} height={size} priority />
      <div>
        <p className={dark ? "text-lg font-extrabold leading-5 text-white" : "text-lg font-extrabold leading-5 text-primary"}>
          Work<span className={dark ? "text-emerald-200" : "text-success"}>Force</span>
        </p>
        <p className={dark ? "text-xs font-semibold text-white/65" : "text-xs font-semibold text-ink-tertiary"}>
          Mobile Attendance
        </p>
      </div>
    </div>
  );
}
