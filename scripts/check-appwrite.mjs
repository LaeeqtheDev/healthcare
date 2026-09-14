/**
 * Schema checker.
 *
 * Compares the attributes the application writes against the attributes
 * that actually exist on the Appwrite collections, and reports any
 * mismatch, including case-only mismatches.
 *
 * This exists because of a real failure: the register form sent `userID`
 * while the collection declared `userId`, and every registration failed
 * with
 *
 *   Invalid document structure: Missing required attribute "userId"
 *
 * Appwrite attribute keys are case-sensitive, and a case-only difference
 * is close to invisible in a code review. Run this after any schema change
 * and it will name the offending field in one line.
 *
 * Usage:
 *   node scripts/check-appwrite.mjs
 *
 * Reads the same .env the app does.
 */

import { readFileSync } from "node:fs";
import { Client, Databases } from "node-appwrite";

// Minimal .env loader so this runs without extra dependencies.
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // No .env; fall back to the real environment.
}

const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NOTE_COLLECTION_ID,
} = process.env;

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error(
    "Missing NEXT_PUBLIC_ENDPOINT, PROJECT_ID, API_KEY or DATABASE_ID in .env"
  );
  process.exit(1);
}

/** What lib/actions/patient.actions.ts writes. */
const PATIENT_FIELDS = [
  "userId",
  "name",
  "email",
  "phone",
  "birthDate",
  "gender",
  "address",
  "occupation",
  "emergencyContactName",
  "emergencyContactNumber",
  "primaryPhysician",
  "insuranceProvider",
  "insurancePolicyNumber",
  "allergies",
  "currentMedication",
  "familyMedicalHistory",
  "pastMedicalHistory",
  "identificationType",
  "identificationNumber",
  "identificationDocument",
  "identificationDocumentURL",
  "privacyConsent",
];

/** What lib/actions/appointment.actions.ts writes. */
const APPOINTMENT_FIELDS = [
  "userId",
  "patient",
  "primaryPhysician",
  "reason",
  "schedule",
  "status",
  "note",
  "cancellationReason",
];

/** What lib/actions/note.actions.ts writes. */
const NOTE_FIELDS = ["patientId", "author", "category", "body"];

const databases = new Databases(
  new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
);

async function checkCollection(label, collectionId, expected) {
  if (!collectionId) {
    console.log(`\n${label}: SKIPPED (collection id not set in .env)`);
    return true;
  }

  const collection = await databases.getCollection(DATABASE_ID, collectionId);
  const actual = collection.attributes.map((a) => a.key);
  const actualLower = new Map(actual.map((k) => [k.toLowerCase(), k]));

  console.log(`\n${label}  (${collection.name})`);

  let ok = true;

  for (const field of expected) {
    if (actual.includes(field)) continue;

    const caseMatch = actualLower.get(field.toLowerCase());
    if (caseMatch) {
      ok = false;
      console.log(
        `  CASE MISMATCH  app writes "${field}" but the collection has "${caseMatch}"`
      );
    } else {
      ok = false;
      console.log(`  MISSING        "${field}" does not exist on the collection`);
    }
  }

  const unused = actual.filter((k) => !expected.includes(k));
  for (const k of unused) {
    console.log(`  unused         "${k}" exists but the app never writes it`);
  }

  // A required attribute the app does not send fails EVERY write, which is
  // the specific shape of the bug this script was written for.
  const requiredMissing = collection.attributes
    .filter((a) => a.required && !expected.includes(a.key))
    .map((a) => a.key);

  for (const k of requiredMissing) {
    ok = false;
    console.log(
      `  BLOCKING       "${k}" is REQUIRED but the app never sends it. Every write will fail.`
    );
  }

  if (ok) console.log("  OK, every field the app writes exists and matches.");
  return ok;
}

const results = [];
results.push(
  await checkCollection("Patient collection", PATIENT_COLLECTION_ID, PATIENT_FIELDS)
);
results.push(
  await checkCollection(
    "Appointment collection",
    APPOINTMENT_COLLECTION_ID,
    APPOINTMENT_FIELDS
  )
);

results.push(
  await checkCollection("Clinical note collection", NOTE_COLLECTION_ID, NOTE_FIELDS)
);

console.log("");
if (results.every(Boolean)) {
  console.log("Schema looks correct.");
} else {
  console.log("Schema problems found above. Fix these before testing the forms.");
  process.exit(1);
}
