"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/layout/Header";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100svh" }}>
        <p style={{ color: "#6b6b6b", fontFamily: "Pretendard, sans-serif" }}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", background: "#fff", fontFamily: "Pretendard, 'Noto Sans KR', sans-serif" }}>
      <Header />
      <main style={{
        paddingTop: "clamp(88px, 15svh, 140px)",
        paddingLeft: "clamp(20px, 8.333vw, 160px)",
        paddingRight: "clamp(20px, 8.333vw, 160px)",
      }}>
        <h1 style={{ fontSize: "clamp(20px, 2.083vw, 40px)", fontWeight: 700, color: "#000", marginBottom: 32 }}>
          마이페이지
        </h1>

        <div style={{
          width: "100%",
          maxWidth: 480,
          background: "#fafafa",
          borderRadius: "clamp(12px, 1.25vw, 24px)",
          padding: "clamp(24px, 2.5vw, 48px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "#a0a0a0", fontSize: "clamp(11px, 0.938vw, 18px)", marginBottom: 4 }}>이름</p>
            <p style={{ color: "#000", fontSize: "clamp(14px, 1.25vw, 24px)", fontWeight: 600 }}>
              {user?.displayName ?? "—"}
            </p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ color: "#a0a0a0", fontSize: "clamp(11px, 0.938vw, 18px)", marginBottom: 4 }}>이메일 (아이디)</p>
            <p style={{ color: "#000", fontSize: "clamp(14px, 1.25vw, 24px)", fontWeight: 600 }}>
              {user?.email ?? "—"}
            </p>
          </div>

          <button
            onClick={() => signOut(auth).then(() => router.push("/login"))}
            style={{
              width: "100%",
              height: "clamp(44px, 6.759svh, 73px)",
              border: "1.5px solid #d0d0d0",
              borderRadius: "clamp(10px, 1.042vw, 20px)",
              background: "#fff",
              color: "#3b3b3b",
              fontFamily: "inherit",
              fontSize: "clamp(13px, 1.042vw, 20px)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>

        <p style={{ marginTop: 24, color: "#a0a0a0", fontSize: "clamp(11px, 0.938vw, 18px)" }}>
          * 추가 기능(정보 수정, 탈퇴 등)은 준비 중입니다.
        </p>
      </main>
    </div>
  );
}
