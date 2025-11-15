// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjKDY1sJ-7_JzNpx2BZCl_30ro1XJDGK4",
  authDomain: "studio-7832907928-cd13e.firebaseapp.com",
  projectId: "studio-7832907928-cd13e",
  storageBucket: "studio-7832907928-cd13e.firebasestorage.app",
  messagingSenderId: "475421225827",
  appId: "1:475421225827:web:da9cf38217dd4f18325956"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);