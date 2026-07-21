import { getStorage, FirebaseStorage } from "firebase/storage";
import { app, isFirebaseConfigured } from "./config";

let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured && app) {
  try {
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Storage Client SDK:", error);
  }
}

export { storage };
