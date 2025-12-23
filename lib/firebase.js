import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD4sKlFRjE2Gy80Q_rdguEs1GIlBffXbfI",
    authDomain: "goapp-855d0.firebaseapp.com",
    projectId: "goapp-855d0",
    storageBucket: "goapp-855d0.firebasestorage.app",
    messagingSenderId: "321875827900",
    appId: "1:321875827900:web:12518ecd59cbc8c9a4c4b9",
    measurementId: "G-6CKTLBKL5Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Check if window is defined (for Analytics compatibility in SSR or hybrid environments)
let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { db, auth, analytics };
export default app;
