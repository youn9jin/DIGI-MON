"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { getMe } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import styles from "./dashboard.module.css";

const actions = [
  {
    href: "/dashboard/info-edit",
    image: "/images/dashboard/info-edit.png",
    imageClassName: styles.infoImage,
    label: "웹사이트 상세 정보 수정하기",
  },
  {
    href: "/dashboard/template-change",
    image: "/images/dashboard/template-change.png",
    imageClassName: styles.templateImage,
    label: "다른 템플릿으로 교체하기",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      try {
        const me = await getMe(currentUser);
        if (!me.marketId) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // 네트워크 오류가 있어도 관리 화면 자체는 보여준다.
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Header variant="builder" />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.backgroundMark} aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="80vw"
          src="/images/onboarding/generating-background.png"
        />
      </div>

      <section className={styles.hero} aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">우리 시장 웹페이지 수정하기</h1>
        <p>웹페이지 수정 방법은 ‘사용방법&apos; 탭에서 확인하실 수 있습니다.</p>
      </section>

      <section className={styles.actionGrid} aria-label="웹사이트 관리 메뉴">
        {actions.map((action) => (
          <Link className={styles.actionCard} href={action.href} key={action.label}>
            <span className={styles.imageWrap} aria-hidden="true">
              <Image
                alt=""
                className={action.imageClassName}
                fill
                sizes="266px"
                src={action.image}
              />
            </span>
            <strong>{action.label}</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
