import { CalendarCheck2, Clock3, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Clinical status pill.
 *
 * Each status carries an icon AND a text label, not just a colour. Around
 * 1 in 12 men has some colour vision deficiency, and "which of these rows
 * needs attention" is not a question to answer in hue alone. The previous
 * version used a coloured dot image with the same shape for every state.
 */
const MAP = {
  scheduled: { cls: "pill-ok", Icon: CalendarCheck2, label: "Scheduled" },
  pending: { cls: "pill-warn", Icon: Clock3, label: "Pending" },
  cancelled: { cls: "pill-crit", Icon: XCircle, label: "Cancelled" },
} as const;

export const StatusBadge = ({ status }: { status: Status }) => {
  const entry = MAP[status as keyof typeof MAP] ?? MAP.pending;
  const { cls, Icon, label } = entry;

  return (
    <span className={cn("pill", cls)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
};

export default StatusBadge;
