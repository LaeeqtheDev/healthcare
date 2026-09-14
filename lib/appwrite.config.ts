import * as sdk from "node-appwrite";

/**
 * Appwrite client configuration.
 *
 * Every value below was previously read with a non-null assertion (`!`) at
 * the call site, which means a missing or misspelled environment variable
 * did not surface until a patient was halfway through a form and Appwrite
 * rejected the write. The check below moves that failure to startup, where
 * whoever deployed it will actually see it.
 */
export const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NOTE_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
} = process.env;

const REQUIRED = {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
};

const missing = Object.entries(REQUIRED)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  // Warn rather than throw: throwing here would break `next build`, which
  // does not need live credentials. The message names the variables so the
  // fix is obvious, instead of a 400 from Appwrite three screens later.
  console.warn(
    `\n[appwrite] Missing environment variables: ${missing.join(", ")}.\n` +
      `Patient registration and booking will fail until these are set in .env.\n`
  );
}

/**
 * Attribute names expected on the Appwrite collections.
 *
 * Kept here as a single reference because a mismatch between these and the
 * collection schema is the failure this project has already hit once:
 * the register form sent `userID` while the collection declared `userId`,
 * and Appwrite returned
 *   Invalid document structure: Missing required attribute "userId"
 * Appwrite attribute keys are case-sensitive. If you add a field, add it
 * in both places and match the casing exactly.
 */
export const PATIENT_ATTRIBUTES = [
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
] as const;

/** Clinical notes are optional. Their absence degrades one panel rather
 * than breaking the patient record, so NOTE_COLLECTION_ID is deliberately
 * not in the REQUIRED list above. */
export const NOTE_ATTRIBUTES = [
  "patientId",
  "author",
  "category",
  "body",
] as const;

const client = new sdk.Client();

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);
