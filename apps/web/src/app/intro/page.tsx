"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/firebase";
import { getMe, getWebsiteEntryPath } from "@/lib/api/me";
import styles from "../landing.module.css";

export default function IntroPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const me = await getMe(user);
        router.replace(await getWebsiteEntryPath(me));
      } catch {
        router.replace("/onboarding");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <main className={styles.viewport}>
        <div className={styles.canvas}>
          <Header />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:1868">
        <Header />

        <div className={styles.illustration} data-node-id="148:1882">
          <Image
            src="/images/onboarding/market-illustration.png"
            alt=""
            width={1550}
            height={1550}
            priority
            className={styles.illustrationImage}
          />
        </div>

        <h1 className={styles.heroTitle} data-node-id="148:1884">
          {"우리 시장 맞춤형 웹사이트를 만들려면\n회원가입이 필요해요"}
        </h1>

        <p className={styles.heroSub} data-node-id="148:1887">
          회원가입 이후에 기입하신 정확한 정보를 바탕으로 내가 직접 수정할 수 있는 웹사이트를 만들 수 있어요
        </p>

        <Link
          href="/signup"
          className={styles.ctaButton}
          data-node-id="148:1885"
        >
          회원가입 바로 하러 가기
        </Link>
      </div>
    </main>
  );
}
