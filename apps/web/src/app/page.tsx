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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCtaHref("/intro");
        return;
      }

      try {
        const me = await getMe(user);
        setCtaHref(await getWebsiteEntryPath(me));
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
