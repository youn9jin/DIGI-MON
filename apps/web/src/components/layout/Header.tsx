"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMe, hasGeneratedMarketPage } from "@/lib/api/me";
import styles from "./Header.module.css";

interface HeaderProps {
  variant?: "default" | "builder" | "operation";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [websiteHref, setWebsiteHref] =
    useState<
      "/intro" | "/onboarding" | "/dashboard/not-created" | "/dashboard"
    >("/dashboard/not-created");
  const [websiteCheckHref, setWebsiteCheckHref] = useState("/intro");
  const [canCheckWebsite, setCanCheckWebsite] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setWebsiteHref("/intro");
        setWebsiteCheckHref("/intro");
        setCanCheckWebsite(false);
        setReady(true);
        return;
      }

      try {
        const me = await getMe(currentUser);
        const hasPage = await hasGeneratedMarketPage(me);
        const entryPath = hasPage ? "/dashboard" : "/dashboard/not-created";
        setWebsiteHref(entryPath);
        setCanCheckWebsite(hasPage && me.marketId != null);
        setWebsiteCheckHref(
          hasPage && me.marketId != null
            ? `/markets/${encodeURIComponent(String(me.marketId))}`
            : entryPath,
        );
      } catch {
        setWebsiteHref("/dashboard/not-created");
        setWebsiteCheckHref("/dashboard/not-created");
        setCanCheckWebsite(false);
      }

      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 12);

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const headerClassName = `${styles.header} ${isScrolled ? styles.scrolledHeader : ""}`;
  const websiteCheckOpensNewTab = websiteCheckHref.startsWith("/markets/");
  const handleWebsiteCheck = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (canCheckWebsite) return;
    event.preventDefault();
    window.alert("아직 웹사이트가 생성되지 않았습니다.");
  };

  if (variant === "builder" || variant === "operation") {
    const displayName = user?.displayName || user?.email?.split("@")[0] || "사용자";
    const isOperationHeader = variant === "operation";

    return (
      <header className={`${headerClassName} ${styles.builderHeader}`}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSlot}>
              <Link href="/">
                <div className={styles.logoMark}>
                  <Image
                    src="/images/onboarding/market-illustration.png"
                    alt="WithOn"
                    width={283}
                    height={286}
                    priority
                    className={styles.logoImage}
                  />
                </div>
              </Link>
            </div>

            <nav className={styles.primaryNav} aria-label="주요 메뉴">
              <Link href="/#withon-guide">사용방법</Link>
              <Link href={websiteHref}>웹사이트 관리</Link>
              {!isOperationHeader && (
                <Link
                  href={websiteCheckHref}
                  onClick={handleWebsiteCheck}
                  target={websiteCheckOpensNewTab ? "_blank" : undefined}
                  rel={websiteCheckOpensNewTab ? "noopener noreferrer" : undefined}
                >
                  웹사이트 확인
                </Link>
              )}
            </nav>
          </div>

          <nav className={styles.authNav} aria-label="사용자 메뉴">
            {!isOperationHeader && ready && user && (
              <span className={styles.userName}>{displayName}님</span>
            )}
            <a href="/mypage">마이페이지</a>
          </nav>
        </div>
      </header>
    );
  }

  // 깜빡임 방지: auth 상태 확인 전엔 아무것도 렌더하지 않음
  if (!ready) {
    return (
      <header className={headerClassName}>
        <div className={styles.headerInner} />
      </header>
    );
  }

  if (user) {
    // 로그인 상태
    const displayName = user.displayName || "사용자";

    return (
      <header className={headerClassName}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSlot}>
              <Link href="/">
                <div className={styles.logoMark}>
                  <Image
                    src="/images/onboarding/market-illustration.png"
                    alt="WithOn"
                    width={283}
                    height={286}
                    priority
                    className={styles.logoImage}
                  />
                </div>
              </Link>
            </div>

            <nav className={styles.primaryNav} aria-label="주요 메뉴">
              <Link href="/#withon-guide">사용방법</Link>
              <Link href={websiteHref}>웹사이트 관리</Link>
              <Link
                href={websiteCheckHref}
                onClick={handleWebsiteCheck}
                target={websiteCheckOpensNewTab ? "_blank" : undefined}
                rel={websiteCheckOpensNewTab ? "noopener noreferrer" : undefined}
              >
                웹사이트 확인
              </Link>
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
    <header className={headerClassName}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <div className={styles.logoSlot}>
            <Link href="/">
              <div className={styles.logoMark}>
                <Image
                  src="/images/onboarding/market-illustration.png"
                  alt="WithOn"
                  width={283}
                  height={286}
                  priority
                  className={styles.logoImage}
                />
              </div>
            </Link>
          </div>

          <nav className={styles.primaryNav} aria-label="주요 메뉴">
            <Link href="/#withon-guide">사용방법</Link>
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
