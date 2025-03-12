import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb_-ML_c9NhdvNrGwG6pKQ6vBySkN7Gng",
  authDomain: "llmedicare-f27b0.firebaseapp.com",
  projectId: "llmedicare-f27b0",
  storageBucket: "llmedicare-f27b0.appspot.com",
  messagingSenderId: "265307308848",
  appId: "1:265307308848:web:df3c5e9d7c670d05e8b629",
  measurementId: "G-G6YN1HNE0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
