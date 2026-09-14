"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { Loader2, NotebookPen, Plus } from "lucide-react";

import {
  addNote,
  type AddNoteState,
  type ClinicalNote,
} from "@/lib/actions/note.actions";

const CATEGORIES = [
  "Consultation",
  "Follow-up",
  "Test result",
  "Referral",
  "Phone call",
  "Administrative",
];

/**
 * Clinical notes panel.
 *
 * Append-only by design (see lib/actions/note.actions.ts). There is no
 * edit and no delete control, and that is not an omission: a clinical
 * record that can be quietly rewritten after the fact is worthless as
 * evidence. Corrections are added as a new note.
 */
export function ClinicalNotes({
  patientId,
  notes,
}: {
  patientId: string;
  notes: ClinicalNote[];
}) {
  const [state, formAction] = useFormState<AddNoteState, FormData>(addNote, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className="card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2.5">
          <NotebookPen className="size-4 text-ink-subtle" aria-hidden />
          <h2 className="t-h3 text-ink">Clinical notes ({notes.length})</h2>
        </div>
        <span className="t-small text-ink-subtle">Append-only</span>
      </div>

      <form ref={formRef} action={formAction} className="border-b border-line p-5">
        <input type="hidden" name="patientId" value={patientId} />

        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="note-author"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
            >
              Your name
            </label>
            <input
              id="note-author"
              name="author"
              required
              placeholder="Dr. A. Whitfield"
              className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[0.875rem] text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="note-category"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
            >
              Type
            </label>
            <select
              id="note-category"
              name="category"
              defaultValue="Consultation"
              className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[0.875rem] text-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <label
          htmlFor="note-body"
          className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
        >
          Note
        </label>
        <textarea
          id="note-body"
          name="body"
          required
          rows={3}
          placeholder="What was discussed, observed, or actioned."
          className="w-full rounded-md border border-line-strong bg-surface p-3 text-[0.875rem] leading-relaxed text-ink"
        />

        {state.error && (
          <p role="alert" className="mt-2.5 shad-error">
            {state.error}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="t-small text-ink-subtle">
            Saved notes cannot be edited or deleted.
          </p>
          <SaveButton />
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="p-5 t-small text-ink-muted">
          No notes recorded yet. The first entry above becomes part of this
          patient&apos;s permanent record.
        </p>
      ) : (
        <ol className="divide-y divide-line">
          {notes.map((note) => (
            <li key={note.$id} className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="pill pill-info">{note.category}</span>
                <span className="text-[0.8125rem] font-semibold text-ink">
                  {note.author}
                </span>
                <time
                  dateTime={note.$createdAt}
                  className="t-small text-ink-subtle"
                >
                  {new Date(note.$createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-brand-600 px-4 text-[0.875rem] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Plus className="size-4" aria-hidden />
      )}
      {pending ? "Saving" : "Add note"}
    </button>
  );
}
