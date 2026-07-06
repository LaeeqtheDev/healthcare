/**
 * One-time setup script for a fresh Appwrite project.
 *
 * What it does:
 *   1. Creates a Database
 *   2. Creates a "patient" collection with all required attributes
 *   3. Creates an "appointment" collection with all required attributes
 *   4. Creates a Storage bucket for ID document uploads
 *   5. Prints the env vars you need to paste into .env.local
 *
 * Usage:
 *   1. Create a project at https://cloud.appwrite.io (or self-hosted instance)
 *   2. Go to Overview > Integrate > API Keys, create a key with scopes:
 *      databases.write, collections.write, attributes.write, buckets.write, documents.write
 *   3. Fill in the four values below (or pass as env vars)
 *   4. Run:  node scripts/setup-appwrite.mjs
 */

import { Client, Databases, Storage, ID, Permission, Role } from "node-appwrite";

const ENDPOINT = process.env.SETUP_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.SETUP_PROJECT_ID || "";
const API_KEY = process.env.SETUP_API_KEY || "";
const EXISTING_DATABASE_ID = process.env.SETUP_DATABASE_ID || "";
const EXISTING_BUCKET_ID = process.env.SETUP_BUCKET_ID || "";

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "\nMissing PROJECT_ID or API_KEY.\n" +
      "Run like this instead:\n\n" +
      "  SETUP_PROJECT_ID=xxx SETUP_API_KEY=xxx node scripts/setup-appwrite.mjs\n"
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let DATABASE_ID;
  if (EXISTING_DATABASE_ID) {
    console.log(`Reusing existing database ${EXISTING_DATABASE_ID}...`);
    DATABASE_ID = EXISTING_DATABASE_ID;
  } else {
    console.log("Creating database...");
    const database = await databases.create(ID.unique(), "CarePulse");
    DATABASE_ID = database.$id;
  }

  console.log("Creating patient collection...");
  const patientCollection = await databases.createCollection(
    DATABASE_ID,
    ID.unique(),
    "patient",
    [Permission.read(Role.any()), Permission.write(Role.any())]
  );
  const PATIENT_COLLECTION_ID = patientCollection.$id;

  const patientAttrs = [
    ["userId", "string", 255, true],
    ["name", "string", 255, true],
    ["email", "email", null, true],
    ["phone", "string", 255, true],
    ["birthDate", "datetime", null, true],
    ["gender", "enum", ["male", "female", "other"], true],
    ["address", "string", 255, true],
    ["occupation", "string", 255, true],
    ["emergencyContactName", "string", 255, true],
    ["emergencyContactNumber", "string", 255, true],
    ["primaryPhysician", "string", 255, true],
    ["insuranceProvider", "string", 255, true],
    ["insurancePolicyNumber", "string", 255, true],
    ["allergies", "string", 2000, false],
    ["currentMedication", "string", 2000, false],
    ["familyMedicalHistory", "string", 2000, false],
    ["pastMedicalHistory", "string", 2000, false],
    ["identificationType", "string", 255, false],
    ["identificationNumber", "string", 255, false],
    ["identificationDocument", "string", 255, false],
    ["identificationDocumentURL", "string", 2000, false],
    ["privacyConsent", "boolean", null, true],
  ];

  for (const [key, type, arg, required] of patientAttrs) {
    if (type === "string") {
      await databases.createStringAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        arg,
        required
      );
    } else if (type === "email") {
      await databases.createEmailAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        required
      );
    } else if (type === "datetime") {
      await databases.createDatetimeAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        required
      );
    } else if (type === "enum") {
      await databases.createEnumAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        arg,
        required
      );
    } else if (type === "boolean") {
      await databases.createBooleanAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        required
      );
    }
    await sleep(300); // avoid rate limits
  }

  console.log("Creating appointment collection...");
  const appointmentCollection = await databases.createCollection(
    DATABASE_ID,
    ID.unique(),
    "appointment",
    [Permission.read(Role.any()), Permission.write(Role.any())]
  );
  const APPOINTMENT_COLLECTION_ID = appointmentCollection.$id;

  const appointmentAttrs = [
    ["userId", "string", 255, true],
    ["patient", "string", 255, true],
    ["primaryPhysician", "string", 255, true],
    ["reason", "string", 2000, true],
    ["schedule", "datetime", null, true],
    ["status", "enum", ["pending", "scheduled", "cancelled"], true],
    ["note", "string", 2000, false],
    ["cancellationReason", "string", 2000, false],
  ];

  for (const [key, type, arg, required] of appointmentAttrs) {
    if (type === "string") {
      await databases.createStringAttribute(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        key,
        arg,
        required
      );
    } else if (type === "datetime") {
      await databases.createDatetimeAttribute(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        key,
        required
      );
    } else if (type === "enum") {
      await databases.createEnumAttribute(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        key,
        arg,
        required
      );
    }
    await sleep(300);
  }

  let BUCKET_ID;
  if (EXISTING_BUCKET_ID) {
    console.log(`Reusing existing bucket ${EXISTING_BUCKET_ID}...`);
    BUCKET_ID = EXISTING_BUCKET_ID;
  } else {
    console.log("Creating storage bucket...");
    const bucket = await storage.createBucket(
      ID.unique(),
      "identification-documents",
      [Permission.read(Role.any()), Permission.write(Role.any())]
    );
    BUCKET_ID = bucket.$id;
  }

  console.log("\n✅ Done! Paste these into your .env.local:\n");
  console.log(`NEXT_PUBLIC_ENDPOINT=${ENDPOINT}`);
  console.log(`PROJECT_ID=${PROJECT_ID}`);
  console.log(`API_KEY=${API_KEY}`);
  console.log(`DATABASE_ID=${DATABASE_ID}`);
  console.log(`PATIENT_COLLECTION_ID=${PATIENT_COLLECTION_ID}`);
  console.log(`APPOINTMENT_COLLECTION_ID=${APPOINTMENT_COLLECTION_ID}`);
  console.log(`NEXT_PUBLIC_BUCKET_ID=${BUCKET_ID}`);
  console.log(`NEXT_PUBLIC_ADMIN_PASSKEY=<pick any 6-digit code>`);
  console.log(
    "\nNote: DOCTOR_COLLECTION_ID isn't used anywhere in the current code (doctors come from constants/index.ts), so it's left out."
  );
}

main().catch((err) => {
  console.error("\nSetup failed:", err.message || err);
  process.exit(1);
});
