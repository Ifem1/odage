import { SensitivityLevel } from "@/lib/types";

const styles: Record<SensitivityLevel, string> = {
  low: "bg-verdigris/10 text-verdigris",
  medium: "bg-faded-umber/15 text-faded-umber",
  high: "bg-oxide-red/10 text-oxide-red",
  severe: "bg-oxide-red/20 text-oxide-red",
};

export default function SensitivityBadge({ level }: { level: SensitivityLevel }) {
  return (
    <span
      className={`font-mono-detail inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide ${styles[level]}`}
    >
      {level} sensitivity
    </span>
  );
}
