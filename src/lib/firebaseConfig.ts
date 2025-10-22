// src/lib/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDy2BQ8FksyF7NY5-za3JCdFszEMk0EJpw",
  authDomain: "nordil-premiacoes.firebaseapp.com",
  projectId: "nordil-premiacoes",
  storageBucket: "nordil-premiacoes.appspot.com",
  messagingSenderId: "112684553211857247564",
  appId: "1:402599973201:web:199a284d73b69496e90370"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
