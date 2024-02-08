import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDWRCQJZICwUoSYxNK-WSmNJw-cgLnh8zY",
    authDomain: "finance-flex.firebaseapp.com",
    projectId: "finance-flex",
    storageBucket: "finance-flex.appspot.com",
    messagingSenderId: "385506967561",
    appId: "1:385506967561:web:010f5fd9cb9786ac8db8d8",
    measurementId: "G-RTFKBXJV40"
};
  
// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
