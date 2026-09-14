"use server";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // 409 means the email or phone already belongs to a user, which is
    // the normal returning-patient path rather than a failure.
    if (error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      if (existingUser.users.length > 0) {
        return parseStringify(existingUser.users[0]);
      }
    }

    console.error("[createUser] failed:", error);
    // Rethrow rather than returning undefined. Swallowing this made a
    // failed signup look identical to a successful one from the UI.
    throw new Error(
      "We could not start your booking. Please check your details and try again."
    );
  }
};

export const getUser = async (userId: string) => {
  try {
    return parseStringify(await users.get(userId));
  } catch (error) {
    console.error("[getUser] failed:", error);
    throw new Error("We could not load your details.");
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    /* ── FIX ────────────────────────────────────────────────────────
     * The document creation used to live INSIDE `if (identificationDocument)`.
     * A patient who did not upload an ID got no document created, no
     * error, and a silent `undefined` return. The form then did nothing
     * and they sat on the page re-submitting.
     *
     * The upload is now optional and separate from the record, which is
     * what it always should have been: the ID document is one field on a
     * patient, not a precondition for having one.
     * ─────────────────────────────────────────────────────────────── */
    let fileFields: Record<string, string | null> = {};

    if (identificationDocument) {
      const blob = identificationDocument.get("blobFile") as Blob | null;
      const fileName = identificationDocument.get("fileName") as string | null;

      if (blob && fileName) {
        const inputFile = InputFile.fromBuffer(blob, fileName);
        const file = await storage.createFile(
          BUCKET_ID!,
          ID.unique(),
          inputFile
        );

        fileFields = {
          identificationDocument: file.$id,
          identificationDocumentURL: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`,
        };
      }
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      { ...patient, ...fileFields }
    );

    return parseStringify(newPatient);
  } catch (error: any) {
    console.error("[registerPatient] failed:", error);

    /* Appwrite's schema errors are the single most common failure here and
     * the message is genuinely useful to whoever set up the collection, so
     * it is surfaced rather than replaced with "something went wrong". It
     * names an attribute, never patient data. */
    if (error?.type === "document_invalid_structure") {
      throw new Error(
        `The practice's patient records are misconfigured: ${error?.response?.message ?? error.message}. Staff: check the attribute names on the patient collection in Appwrite.`
      );
    }

    throw new Error(
      "We could not save your details. Please try again, or call the practice."
    );
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      // Was Query.equal('userID', ...) — wrong casing, so this never
      // matched anything even once records existed. The attribute is
      // `userId`, matching types/index.d.ts and the appointment
      // collection.
      [Query.equal("userId", userId)]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error("[getPatient] failed:", error);
    return undefined;
  }
};

/**
 * Fetch a patient by their Appwrite document id, for the staff record view.
 *
 * Separate from getPatient() above, which looks up by the Appwrite *user*
 * id during the booking flow. Both exist because the two ids are genuinely
 * different things and conflating them is how the wrong record gets opened.
 */
export const getPatientById = async (patientId: string) => {
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );
    return parseStringify(patient);
  } catch (error) {
    console.error("[getPatientById] failed:", error);
    return undefined;
  }
};

/** Every patient, for the staff directory. */
export const listPatients = async () => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt"), Query.limit(200)]
    );
    return parseStringify(patients.documents);
  } catch (error) {
    console.error("[listPatients] failed:", error);
    return [];
  }
};
