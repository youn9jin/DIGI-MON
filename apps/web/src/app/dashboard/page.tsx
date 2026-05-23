"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/layout/Header";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [marketName, setMarketName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);

      try {
        const idToken = await currentUser.getIdToken();
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const res = await fetch(`${baseUrl}/api/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.marketId) {
            // 온보딩 미완료 → 온보딩으로
            router.replace("/onboarding");
            return;
          }
          setMarketName(data.marketName ?? "");
        }
      } catch {
        // 네트워크 오류 무시
      } finally {
        setLoading(false);
      }
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
      <main style={{ paddingTop: "clamp(88px, 15svh, 140px)", paddingLeft: "clamp(20px, 8.333vw, 160px)", paddingRight: "clamp(20px, 8.333vw, 160px)" }}>
        <h1 style={{ fontSize: "clamp(20px, 2.083vw, 40px)", fontWeight: 700, color: "#000", marginBottom: 8 }}>
          {marketName ? `${marketName} 관리` : "웹사이트 관리"}
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: "clamp(13px, 1.042vw, 20px)", marginBottom: 40 }}>
          안녕하세요, {user?.displayName ?? "사용자"}님. 대시보드 기능이 준비 중입니다.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px, 20vw, 280px), 1fr))",
          gap: "clamp(16px, 1.667vw, 32px)",
        }}>
          {["웹사이트 미리보기", "상품 관리", "이벤트 관리", "방문자 통계"].map((item) => (
            <div
              key={item}
              style={{
                padding: "clamp(20px, 2.083vw, 40px)",
                borderRadius: "clamp(12px, 1.25vw, 24px)",
                background: "#fce6d5",
                boxShadow: "0 2px 12px rgba(9,128,68,0.08)",
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b6b6b",
                fontSize: "clamp(13px, 1.042vw, 20px)",
                fontWeight: 500,
              }}
            >
              {item} (준비 중)
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
