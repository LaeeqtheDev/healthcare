"use server";

import { ID, Query } from "node-appwrite";

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
import {InputFile} from 'node-appwrite/file'

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Check existing user
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error("An error occurred while creating a new user:", error);
  }
};



export const getUser = async(userID: string) => {
  try {
    const user = await users.get(userID)
    return parseStringify(user);
  } catch (error) {
    console.log(error)
    
  }
}


export const registerPatient=async ({identificationDocument, ...patient}:RegisterUserParams) => {
  try {
    let file;
    if(identificationDocument){
      const inputFile= InputFile.fromBuffer(
        identificationDocument?.get('blobFile') as Blob,
        identificationDocument?.get('fileName') as string,
      )
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
      const newPatient = await databases.createDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        ID.unique(),
        {identificationDocument: file?.$id || null,
          identificationDocumentURL: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
          ...patient
        }
      )
      return parseStringify(newPatient)
    }
  } catch (error) {
    console.log(error)
  }
}



export const getPatient = async(userID: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [
        Query.equal('userID', userID)
      ]
    )
    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error)
    
  }
}
