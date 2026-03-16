import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage} from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDQWZbNsxqB8hi3eovf10WNUHywIXD59us",
  authDomain: "drug-helper-1c86b.firebaseapp.com",
  projectId: "drug-helper-1c86b",
  storageBucket: "drug-helper-1c86b.firebasestorage.app",
  messagingSenderId: "558677554799",
  appId: "1:558677554799:web:7b39ed276c5b0bbec5bf9a",
  measurementId: "G-TFRCTJW7VZ"
};

const actionCodeSettings = {
  url: 'http://localhost:3000/reset-password',
  handleCodeInApp: true
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default actionCodeSettings;