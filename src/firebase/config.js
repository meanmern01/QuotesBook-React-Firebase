import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyACn8ymAhLMoCHaQG_3QRz38t2hcUQDVhY",
  authDomain: "quotesbook-ae596.firebaseapp.com",
  projectId: "quotesbook-ae596",
  storageBucket: "quotesbook-ae596.appspot.com",
  messagingSenderId: "214540384599",
  appId: "1:214540384599:web:05081abc20c5cb06d9e612",
  measurementId: "G-0QCK80XEZ5",
};

// firebase.initializeApp(firebaseConfig);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  // Firestore setting as per environment
  // if (window.location.hostname === "localhost") {
  //   console.log("localhost detected");
  //   firebase.firestore().settings({
  //     host: "localhost:8080",
  //     ssl: false,
  //   });
  //   firebase.functions().useFunctionsEmulator("http://localhost:5001");
  // }
} else {
  firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();
const firebaseStorage = firebase.storage();
const auth = firebase.auth();
const functions = firebase.functions();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();
const timeStamp = firebase.firestore.FieldValue.serverTimestamp();
const increment = firebase.firestore.FieldValue.increment(1);
const decrement = firebase.firestore.FieldValue.increment(-1);

export {
  db,
  firebaseStorage,
  auth,
  functions,
  googleProvider,
  facebookProvider,
  timeStamp,
  increment,
  decrement,
};

// Fake collections for local emulators
// uid: 'fasfdaf948a96f',
// displayName: 'Prashant',
// photoURL: 'fasfafewerdf454f5s4',
// text: 'hello'
// favoritesCount: 2,
// starsCount: 3,
