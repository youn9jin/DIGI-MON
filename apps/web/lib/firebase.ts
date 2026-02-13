import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAx86S3M4VJ68kGtGb7BamCjV1hiSydWyo",
    authDomain: "digi-mon-server.firebaseapp.com",
    projectId: "digi-mon-server",
    storageBucket: "digi-mon-server.firebasestorage.app",
    messagingSenderId: "1043404218738",
    appId: "1:1043404218738:web:eada51aa18f368f1187deb",
};

// 이미 초기화된 앱이 있으면 재사용 (Next.js 필수 패턴)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);