"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

/**
 * Revenue recovery calculator.
 *
 * This is the highest-converting element on the page, and the reason is
 * structural: it turns a generic claim into the reader's own number in
 * about five seconds. A practice manager who watches a five-figure sum
 * appear against their own patient volume has done the selling themselves,
 * and arrives at the demo already arguing your case internally.
 *
 * Two rules it follows, both deliberate:
 *
 *  1. It uses THEIR numbers, never an industry statistic. Every competitor
 *     quotes a no-show percentage from a study nobody has read. A practice
 *     manager knows their own figure, and taking it as input means we are
 *     not publishing a claim we cannot source.
 *
 *  2. The recovery figure is a RANGE, labelled an estimate, with a line
 *     saying a single confident number would be a guess. Being the one
 *     vendor who admits this reads as competence rather than weakness, and
 *     it stops the number being quoted back at you in month three.
 *
 * Runs entirely in the browser, and the card says so, because people are
 * reasonably wary of typing practice revenue into someone else's form.
 */

const RECOVERY_LOW = 0.2;
const RECOVERY_HIGH = 0.4;
const WORKING_WEEKS = 50;

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "GBP", locale: "en-GB" },
  { code: "EUR", locale: "de-DE" },
  { code: "PKR", locale: "en-PK" },
  { code: "AED", locale: "en-AE" },
  { code: "INR", locale: "en-IN" },
] as const;

export function RevenueCalculator() {
  const [perWeek, setPerWeek] = useState(120);
  const [value, setValue] = useState(180);
  const [rate, setRate] = useState(12);
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(
    CURRENCIES[0]
  );

  const money = (n: number) =>
    new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(n);

  const { lost, low, high, missed } = useMemo(() => {
    // 50 weeks rather than 52, so the figure does not quietly assume a
    // practice that never closes.
    const missedAppointments =
      Math.round((perWeek * rate) / 100) * WORKING_WEEKS;
    const lostTotal = missedAppointments * value;
    return {
      missed: missedAppointments,
      lost: lostTotal,
      low: lostTotal * RECOVERY_LOW,
      high: lostTotal * RECOVERY_HIGH,
    };
  }, [perWeek, value, rate]);

  return (
    <div className="card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="size-4 text-ink-subtle" aria-hidden />
          <h3 className="t-h3 text-ink">What no-shows cost you</h3>
        </div>
        <select
          aria-label="Currency"
          value={currency.code}
          onChange={(e) =>
            setCurrency(
              CURRENCIES.find((c) => c.code === e.target.value) ?? CURRENCIES[0]
            )
          }
          className="h-8 rounded-md border border-line-strong bg-surface px-2 text-[0.75rem] font-semibold text-ink"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="space-y-6 border-b border-line p-6 md:border-b-0 md:border-r">
          <Slider
            label="Appointments per week"
            hint="Across all clinicians, a normal week."
            value={perWeek}
            min={10}
            max={600}
            step={5}
            onChange={setPerWeek}
            format={(v) => v.toLocaleString(currency.locale)}
          />
          <Slider
            label="Average appointment value"
            hint="Your average, not your highest-value procedure."
            value={value}
            min={20}
            max={1500}
            step={10}
            onChange={setValue}
            format={(v) => money(v)}
          />
          <Slider
            label="No-show and late-cancel rate"
            hint="Your own figure. Your front desk will know it."
            value={rate}
            min={1}
            max={35}
            step={1}
            onChange={setRate}
            format={(v) => `${v}%`}
          />
        </div>

        <div className="flex flex-col justify-between bg-brand-50/50 p-6">
          <div>
            <p className="t-label text-ink-subtle">Empty chairs, per year</p>
            <p className="mt-2 text-[clamp(1.9rem,5vw,2.75rem)] font-bold leading-none tracking-[-0.02em] text-ink">
              {money(lost)}
            </p>
            <p className="t-small mt-3 text-ink-muted">
              Roughly{" "}
              <span className="font-semibold text-ink">
                {missed.toLocaleString(currency.locale)}
              </span>{" "}
              appointments a year that were booked and did not happen, across{" "}
              {WORKING_WEEKS} working weeks.
            </p>
          </div>

          <div className="mt-6 border-t border-brand-500/20 pt-5">
            <p className="t-label text-brand-700">
              Plausible recovery with automated reminders
            </p>
            <p className="mt-1.5 text-[1.25rem] font-bold text-brand-600">
              {money(low)} to {money(high)}
            </p>
            <p className="t-small mt-2.5 leading-relaxed text-ink-muted">
              An estimate, shown as a range on purpose. Reminders and one-tap
              rescheduling reduce no-shows; they do not remove them. Any
              vendor quoting you one confident number here is guessing.
            </p>

            <Link
              href="/patients"
              className="group mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-brand-700"
            >
              See it working
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>

      <p className="border-t border-line bg-raised/50 px-6 py-3 text-[0.75rem] text-ink-subtle">
        Runs entirely in your browser. Nothing is sent anywhere, and the
        figures are yours rather than an industry average.
      </p>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.8125rem] font-semibold text-ink">
          {label}
        </label>
        <span className="text-[0.9375rem] font-bold text-brand-600">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="nf-range w-full"
      />
      <p className="mt-1.5 text-[0.75rem] text-ink-subtle">{hint}</p>
    </div>
  );
}
