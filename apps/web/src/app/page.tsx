"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMe, getWebsiteEntryPath } from "@/lib/api/me";
import Header from "@/components/layout/Header";
import styles from "./landing.module.css";

export default function LandingPage() {
  const [ctaHref, setCtaHref] = useState<string>("/intro");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCtaHref("/intro");
        setHasWebsite(false);
        setIsAuthReady(true);
        return;
      }

      try {
        const me = await getMe(user);
        const entryPath = await getWebsiteEntryPath(me);
        setCtaHref(entryPath);
        setHasWebsite(entryPath === "/dashboard");
      } catch {
        setCtaHref("/onboarding");
        setHasWebsite(false);
      } finally {
        setIsAuthReady(true);
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
        {isAuthReady && (
          <Link href={ctaHref} className={styles.heroCtaButton}>
            {hasWebsite
              ? "우리 시장 맞춤 웹사이트 관리하러 가기"
              : "우리 시장 맞춤 웹사이트 만들러 가기"}
          </Link>
        )}

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
