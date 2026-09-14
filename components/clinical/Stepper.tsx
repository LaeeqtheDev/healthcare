import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Booking progress indicator.
 *
 * Patient-facing forms in healthcare are long, and the registration form
 * here is very long. Without a visible position, a patient three screens
 * into a medical history has no idea whether there are two steps left or
 * twelve, and that uncertainty is where people abandon the form and phone
 * the practice instead, which defeats the point of the product.
 */
const STEPS = ["Your details", "Medical history", "Book a visit"] as const;

export function Stepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold",
                  done && "bg-ok-500 text-white",
                  active && "bg-brand-600 text-white",
                  !done && !active && "bg-raised text-ink-subtle"
                )}
                aria-hidden
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[0.8125rem] font-medium",
                  active ? "text-ink" : "text-ink-subtle"
                )}
              >
                {label}
                {active && <span className="sr-only"> (current step)</span>}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className="mx-1 hidden h-px w-6 bg-line sm:block"
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The reassurance line that belongs on every patient screen collecting
 * health information. Practices lose form completions to exactly this
 * unanswered question.
 */
export function PrivacyNote() {
  return (
    <p className="mt-8 rounded-md border border-line bg-raised/60 p-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
      Your information is sent directly to the practice over an encrypted
      connection and is visible only to clinical staff. It is never used for
      marketing and never sold.
    </p>
  );
}
