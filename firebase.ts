import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDI-Whsd--DNeHIq9uGBG3dIAvfugU54RE",
  authDomain: "zonagm-2d565.firebaseapp.com",
  projectId: "zonagm-2d565",
  storageBucket: "zonagm-2d565.firebasestorage.app",
  messagingSenderId: "722302164898",
  appId: "1:722302164898:web:672a736c851e3266f81cfb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
