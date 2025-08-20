// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration (use your own config here)
const firebaseConfig = {
  apiKey: "AIzaSyCrTcvt4_3oj7gOPTozO7-ffks6Yil0E1o",
  authDomain: "commbridge-19d06.firebaseapp.com",
  databaseURL: "https://commbridge-19d06-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "commbridge-19d06",
  storageBucket: "commbridge-19d06.firebasestorage.app",
  messagingSenderId: "822561286549",
  appId: "1:822561286549:web:e737caf0e2500bf916ee9c",
  measurementId: "G-BMJY9GSV0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app if needed elsewhere
export default app;
