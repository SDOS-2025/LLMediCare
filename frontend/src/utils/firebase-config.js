// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb_-ML_c9NhdvNrGwG6pKQ6vBySkN7Gng",
  authDomain: "llmedicare-f27b0.firebaseapp.com",
  projectId: "llmedicare-f27b0",
  storageBucket: "llmedicare-f27b0.firebasestorage.app",
  messagingSenderId: "213799874326",
  appId: "1:213799874326:web:b732e49262e22943d4aa37",
  measurementId: "G-XXVZHQHVV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);