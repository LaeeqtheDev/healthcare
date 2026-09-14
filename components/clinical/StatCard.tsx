import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A worklist counter.
 *
 * The original used a decorative background image per card, which made the
 * number itself low-contrast and meant the three cards read as branding
 * rather than as data. This version puts the figure first at a size you
 * can read across a desk, and adds the one line of interpretation that
 * makes a count actionable: what a member of staff should do about it.
 */
export const StatCard = ({
  tone,
  count,
  label,
  hint,
  icon: Icon,
}: {
  tone: "ok" | "warn" | "crit";
  count: number;
  label: string;
  hint: string;
  icon: LucideIcon;
}) => {
  return (
    <div className="card flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="t-label text-ink-subtle">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            tone === "ok" && "bg-ok-50 text-ok-700",
            tone === "warn" && "bg-warn-50 text-warn-700",
            tone === "crit" && "bg-crit-50 text-crit-700"
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>

      <p className="text-[2.5rem] font-bold leading-none tracking-[-0.02em] text-ink">
        {count}
      </p>

      <p className="t-small text-ink-muted">{hint}</p>
    </div>
  );
};

export default StatCard;
