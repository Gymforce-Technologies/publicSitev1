import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCzaoCUBy2i-isTz-KCXZRtYvba6DzJddQ",
  authDomain: "gymforce-e2476.firebaseapp.com",
  projectId: "gymforce-e2476",
  storageBucket: "gymforce-e2476.firebasestorage.app",
  messagingSenderId: "299717931162",
  appId: "1:299717931162:web:13d86f5c6a7e43a45e6f23",
  measurementId: "G-SJP816SN0X",
};

// Initialize Firebase only on client side
let app;
let analytics;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
}

export { app, analytics };
