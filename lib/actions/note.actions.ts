"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { DATABASE_ID, NOTE_COLLECTION_ID, databases } from "../appwrite.config";
import { isAuthenticated } from "../auth";
import { parseStringify } from "../utils";

/**
 * Clinical notes: the "doctor's comments" layer.
 *
 * There was nowhere to record anything about a patient beyond the booking
 * reason. A clinician could not write what happened at a visit, and the
 * next clinician had no way to read it. That is the difference between an
 * appointment booker and something a practice can actually run on.
 *
 * DESIGN DECISIONS WORTH KEEPING
 * ------------------------------
 * Notes are APPEND-ONLY. There is no update and no delete. A clinical
 * record that can be silently edited after the fact is worthless as
 * evidence, and in most jurisdictions altering one is a serious matter.
 * Corrections are made by adding a new note that supersedes the old one,
 * which is how paper charts have always worked.
 *
 * Every note records its author and an immutable timestamp. Right now the
 * author is whoever holds the shared staff passkey, which is exactly why
 * the per-user accounts limitation in lib/auth.ts matters: a note that
 * says "staff" is far less useful than one that names a clinician.
 *
 * GRACEFUL DEGRADATION: if NOTE_COLLECTION_ID is not configured, reads
 * return an empty list and the UI explains how to enable it, rather than
 * throwing. An optional feature must not take down the patient record.
 */

export type ClinicalNote = {
  $id: string;
  $createdAt: string;
  patientId: string;
  author: string;
  category: string;
  body: string;
};

/**
 * Local helper, deliberately NOT exported.
 *
 * A "use server" module may only export async functions, because every
 * export becomes a callable server-action endpoint. Exporting a plain
 * sync boolean helper from here fails the build with
 * "Only async functions are allowed to be exported in a 'use server' file".
 * Keep configuration predicates private to the module.
 */
function notesEnabled() {
  return Boolean(NOTE_COLLECTION_ID && DATABASE_ID);
}

export async function listNotes(patientId: string): Promise<ClinicalNote[]> {
  if (!notesEnabled()) return [];

  try {
    const res = await databases.listDocuments(DATABASE_ID!, NOTE_COLLECTION_ID!, [
      Query.equal("patientId", patientId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return parseStringify(res.documents);
  } catch (error) {
    console.error("[listNotes] failed:", error);
    return [];
  }
}

export type AddNoteState = { error?: string; ok?: boolean };

export async function addNote(
  _prev: AddNoteState,
  formData: FormData
): Promise<AddNoteState> {
  // Re-check auth inside the action. A server action is a public HTTP
  // endpoint: the fact that the page rendering it was gated does not gate
  // the action itself, and this one writes to the clinical record.
  if (!(await isAuthenticated())) {
    return { error: "Your session has expired. Sign in again." };
  }

  if (!notesEnabled()) {
    return {
      error:
        "Clinical notes are not configured. Set NOTE_COLLECTION_ID in .env, or run npm run setup:appwrite.",
    };
  }

  const patientId = String(formData.get("patientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "Consultation");
  const author = String(formData.get("author") ?? "").trim();

  if (!patientId) return { error: "Missing patient." };
  if (body.length < 3) return { error: "Write the note before saving it." };
  if (!author) return { error: "Enter your name so the note has an author." };

  try {
    await databases.createDocument(DATABASE_ID!, NOTE_COLLECTION_ID!, ID.unique(), {
      patientId,
      author,
      category,
      body,
    });

    revalidatePath(`/admin/patients/${patientId}`);
    return { ok: true };
  } catch (error: any) {
    console.error("[addNote] failed:", error);

    if (error?.type === "document_invalid_structure") {
      return {
        error: `The note collection schema does not match: ${error?.response?.message ?? error.message}`,
      };
    }
    return { error: "The note could not be saved. Try again." };
  }
}
