import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // TODO: Add your Firebase project configuration
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
