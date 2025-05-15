import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDIMc3SNDIslvaQ0MTMvCqy56z7K22boTE",
  authDomain: "tracking-app-fb09c.firebaseapp.com",
  projectId: "tracking-app-fb09c",
  storageBucket: "tracking-app-fb09c.appspot.com",
  messagingSenderId: "67297876813",
  appId: "1:67297876813:web:8e0feb3f66b9f9804d7504",
  measurementId: "G-L601BTYGTF"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Use existing app
}

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db };