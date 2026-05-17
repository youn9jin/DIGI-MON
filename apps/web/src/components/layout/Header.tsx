"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./Header.module.css";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 깜빡임 방지: auth 상태 확인 전엔 아무것도 렌더하지 않음
  if (!ready) {
    return (
      <header className={styles.header}>
        <div className={styles.headerInner} />
      </header>
    );
  }

  if (user) {
    // 로그인 상태
    const displayName = user.displayName || "사용자";

    return (
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSlot}>
              <Link href="/">
                <div className={styles.logoMark}>
                  <Image
                    src="/images/onboarding/market-illustration.png"
                    alt="DIGI-MON"
                    width={283}
                    height={286}
                    priority
                    className={styles.logoImage}
                  />
                </div>
              </Link>
            </div>

            <nav className={styles.primaryNav} aria-label="주요 메뉴">
              <a href="#">사용방법</a>
              <a href="#">커뮤니티</a>
              <a href="/dashboard">웹사이트 관리</a>
            </nav>
          </div>

          <nav className={styles.authNav} aria-label="인증 메뉴">
            <span className={styles.userName}>{displayName}님</span>
            <a href="/mypage">마이페이지</a>
            <button
              className={styles.logoutButton}
              onClick={() => signOut(auth)}
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // 비로그인 상태
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <div className={styles.logoSlot}>
            <Link href="/">
              <div className={styles.logoMark}>
                <Image
                  src="/images/onboarding/market-illustration.png"
                  alt="DIGI-MON"
                  width={283}
                  height={286}
                  priority
                  className={styles.logoImage}
                />
              </div>
            </Link>
          </div>

          <nav className={styles.primaryNav} aria-label="주요 메뉴">
            <a href="#">사용방법</a>
            <a href="#">커뮤니티</a>
          </nav>
        </div>

        <nav className={styles.authNav} aria-label="인증 메뉴">
          <a href="/login">로그인</a>
          <Image
            src="/images/onboarding/header-divider.svg"
            alt=""
            width={1}
            height={19}
            className={styles.headerDivider}
          />
          <a href="/signup">회원가입</a>
        </nav>
      </div>
    </header>
  );
}
