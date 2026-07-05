import { badgeClass } from "@/app/lib/status";

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClass(
        status,
      )}`}
    >
      {label ?? status}
    </span>
  );
}
