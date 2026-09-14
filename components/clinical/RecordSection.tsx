import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function RecordSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-ink-subtle" aria-hidden />
          <h2 className="t-h3 text-ink">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * A single record field.
 *
 * `emphasis` exists because not all clinical fields are equal. Allergies
 * and current medication are the two a clinician must not miss, and
 * rendering them at the same weight as "occupation" is how they get
 * missed. Empty values say "Not recorded" rather than rendering blank:
 * "no known allergies" and "nobody asked" are different facts and a blank
 * cell conflates them.
 */
export function Field({
  label,
  value,
  emphasis,
  span,
}: {
  label: string;
  value?: string | null;
  emphasis?: "alert" | "none";
  span?: boolean;
}) {
  const empty = !value || !String(value).trim();

  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <dt className="t-label text-ink-subtle">{label}</dt>
      <dd
        className={`mt-1.5 text-[0.9375rem] leading-relaxed ${
          empty
            ? "italic text-ink-subtle"
            : emphasis === "alert"
              ? "font-semibold text-crit-700"
              : "text-ink"
        }`}
      >
        {empty ? "Not recorded" : value}
      </dd>
    </div>
  );
}
