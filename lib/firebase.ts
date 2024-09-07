// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlwZ0bjR8Alvxd-S_bFKutbgrIGikAoCA",
  authDomain: "fir-nodejs-f6cec.firebaseapp.com",
  databaseURL: "https://fir-nodejs-f6cec-default-rtdb.firebaseio.com",
  projectId: "fir-nodejs-f6cec",
  storageBucket: "fir-nodejs-f6cec.appspot.com",
  messagingSenderId: "804658107004",
  appId: "1:804658107004:web:e1acb431250cd91abeeff9",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const storage = getStorage(app);
