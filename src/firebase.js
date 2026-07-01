import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Cuidado-Marlene
const firebaseConfig = {
  apiKey: "AIzaSyARHckUY1R5v_M3m1l6TYSaky3Kjrxa9IE",
  authDomain: "cuidado-marlene.firebaseapp.com",
  projectId: "cuidado-marlene",
  storageBucket: "cuidado-marlene.appspot.com",
  messagingSenderId: "917075890176",
  appId: "1:917075890176:web:b56914647e93461b9b88e5"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore y lo exporta para poder usarlo en otros archivos
export const db = getFirestore(app);