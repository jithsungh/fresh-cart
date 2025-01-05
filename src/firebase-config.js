// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkHqR11h99b_P03DIED7fDXuC_bRGgBug",
  authDomain: "fresh-cart-8d752.firebaseapp.com",
  databaseURL: "https://fresh-cart-8d752-default-rtdb.firebaseio.com",
  projectId: "fresh-cart-8d752",
  storageBucket: "fresh-cart-8d752.firebasestorage.app",
  messagingSenderId: "521659104489",
  appId: "1:521659104489:web:0476c2cfa7c736805bc478",
  measurementId: "G-4RXCRF24VE"
};


// Initialize Fireba
firebase.initializeApp(firebaseConfig);


// Initialize Firestore
const firestore = firebase.firestore();
const db = firebase.firestore();

export { firebase, firestore ,db };
