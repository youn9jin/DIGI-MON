"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/layout/Header";
import styles from "./landing.module.css";

export default function LandingPage() {
  const [ctaHref, setCtaHref] = useState<string>("/intro");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCtaHref("/intro");
        return;
      }

      // 로그인 상태 → 온보딩 여부 확인
      try {
        const idToken = await user.getIdToken();
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const res = await fetch(`${baseUrl}/api/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCtaHref(data.marketId ? "/dashboard" : "/onboarding");
        } else {
          setCtaHref("/onboarding");
        }
      } catch {
        setCtaHref("/onboarding");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas}>
        <Header />

        {/* 배경 일러스트 — full opacity, 모바일에서도 유지 */}
        <div className={styles.illustrationLanding} aria-hidden="true">
          <Image
            src="/images/onboarding/market-illustration.png"
            alt=""
            width={1550}
            height={1550}
            priority
            className={styles.illustrationImageFull}
          />
        </div>

        {/* CTA 버튼 */}
        <Link href={ctaHref} className={styles.heroCtaButton}>
          우리 시장 맞춤 웹사이트 만들러 가기
        </Link>

        {/* 하단 chevron */}
        <div className={styles.scrollArrow} aria-hidden="true">
          <svg
            viewBox="0 0 50 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4L25 24L46 4"
              stroke="#103567"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </main>
  );
}
