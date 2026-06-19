import { getFirestore, Firestore } from "firebase/firestore";
import { app, isFirebaseConfigured } from "./config";

let db: Firestore | null = null;

if (isFirebaseConfigured && app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firestore Client SDK:", error);
  }
}

export { db };
