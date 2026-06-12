"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/firebase";
import { getMe } from "@/lib/api/me";
import styles from "../manage.module.css";

export default function WebsiteNotCreatedPage() {
  const [creationHref, setCreationHref] = useState("/onboarding");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCreationHref("/login");
        return;
      }

      try {
        const me = await getMe(user);
        setCreationHref(me.marketId ? "/templates" : "/onboarding");
      } catch {
        setCreationHref("/onboarding");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className={`${styles.page} ${styles.operationPage}`}>
      <Header variant="operation" />
      <div className={styles.operationBackground} aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="88vw"
          src="/images/onboarding/generating-background.png"
        />
      </div>
      <section className={`${styles.operationHero} ${styles.notCreatedHero}`}>
        <div className={`${styles.operationCopy} ${styles.notCreatedCopy}`}>
          <h1>아직 웹사이트 제작 전이에요</h1>
          <p>웹사이트 관리를 하기 위해서는 우리 시장 웹사이트 제작이 필요해요.</p>
        </div>
        <Link className={styles.notCreatedButton} href={creationHref}>
          웹사이트 제작 하러 가기
        </Link>
      </section>
    </main>
  );
}
