"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Header from "@/components/layout/Header";
import {
  getPublicMarketPageContent,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import { getMe, type MeResponse } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import styles from "./mypage.module.css";

type CopyState = "idle" | "copied";

function getMarketImage(content: MarketPageContentResponse | null) {
  return (
    content?.heroImageUrl ??
    content?.introImageUrls?.find((url) => Boolean(url)) ??
    content?.logoImageUrl ??
    null
  );
}

function formatEmpty(value: string | number | null | undefined, fallback = "정보 없음") {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [content, setContent] = useState<MarketPageContentResponse | null>(null);
  const [origin, setOrigin] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOrigin(window.location.origin);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      try {
        const nextMe = await getMe(currentUser);
        setMe(nextMe);

        if (nextMe.marketId) {
          try {
            const pageContent = await getPublicMarketPageContent(nextMe.marketId);
            setContent(pageContent);
          } catch {
            setContent(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const websiteUrl = useMemo(() => {
    if (!origin || !me?.marketId) return "";
    return `${origin}/markets/${me.marketId}`;
  }, [me?.marketId, origin]);

  const displayName = formatEmpty(me?.name ?? user?.displayName, "상인회");
  const displayEmail = formatEmpty(me?.email ?? user?.email, "이메일 정보 없음");
  const marketName = formatEmpty(content?.marketName ?? me?.marketName, "시장 이름");
  const marketAddress = formatEmpty(content?.address ?? me?.address, "주소 정보 없음");
  const marketContact = formatEmpty(content?.contact ?? me?.phone, "연락처 정보 없음");
  const marketImage = getMarketImage(content);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleCopy() {
    if (!websiteUrl) return;
    await navigator.clipboard.writeText(websiteUrl);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Header variant="builder" />
        <div className={styles.loading}>불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="마이페이지 메뉴">
          <Link className={`${styles.sidebarButton} ${styles.active}`} href="/mypage">
            전체 보기
          </Link>
          <a className={styles.sidebarButton} href="#profile">
            내 정보
          </a>
          <Link
            className={styles.sidebarButton}
            href={me?.marketId ? `/markets/${me.marketId}` : "/templates"}
          >
            웹사이트 확인
          </Link>
          <button className={`${styles.sidebarButton} ${styles.logout}`} onClick={handleLogout}>
            로그아웃
          </button>
        </aside>

        <section className={styles.content} aria-labelledby="mypage-title">
          <h1 id="mypage-title" className={styles.pageTitle}>
            마이페이지
          </h1>

          <section id="profile" className={styles.infoSection} aria-labelledby="profile-title">
            <h2 id="profile-title">내 정보</h2>
            <p>상인회 계정 정보와 연결된 시장 정보를 확인할 수 있어요</p>

            <div className={styles.cardGrid}>
              <article className={styles.profileCard}>
                <h3>상인회 프로필</h3>
                <div className={styles.avatar} aria-hidden="true">
                  {displayName.slice(0, 1)}
                </div>
                <dl className={styles.profileList}>
                  <div>
                    <dt>이름</dt>
                    <dd>{displayName}</dd>
                  </div>
                  <div>
                    <dt>아이디</dt>
                    <dd>{formatEmpty(me?.uid ?? user?.uid, "아이디 정보 없음")}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{displayEmail}</dd>
                  </div>
                </dl>
                <button className={styles.secondaryButton} type="button">
                  상인회 정보 수정하기
                </button>
              </article>

              <article className={styles.marketCard}>
                <h3>시장 정보</h3>
                <div className={styles.marketBody}>
                  <div className={styles.marketImage}>
                    {marketImage ? (
                      <Image alt={`${marketName} 대표 이미지`} fill sizes="301px" src={marketImage} />
                    ) : (
                      <span>대표 이미지</span>
                    )}
                  </div>

                  <dl className={styles.marketList}>
                    <div>
                      <dt>시장 이름</dt>
                      <dd>{marketName}</dd>
                    </div>
                    <div>
                      <dt>시장 상세 주소</dt>
                      <dd>{marketAddress}</dd>
                    </div>
                    <div>
                      <dt>시장 대표 연락처</dt>
                      <dd>{marketContact}</dd>
                    </div>
                    <div>
                      <dt>시장 운영 시간</dt>
                      <dd>운영 시간 정보 없음</dd>
                    </div>
                  </dl>
                </div>
                <Link className={styles.secondaryButton} href="/mypage/market-info-edit">
                  시장 상세 정보 수정하기
                </Link>
              </article>
            </div>
          </section>

          <section className={styles.websiteSection} aria-labelledby="website-title">
            <h2 id="website-title">웹사이트 확인</h2>

            <div className={styles.linkBlock}>
              <h3>웹사이트 링크</h3>
              <div className={styles.linkRow}>
                <span>{websiteUrl || "웹사이트 링크"}</span>
                <button type="button" onClick={handleCopy} disabled={!websiteUrl}>
                  {copyState === "copied" ? "복사 완료" : "복사하기"}
                </button>
              </div>
            </div>

            <div className={styles.manageShortcut}>
              <div>
                <h3>웹사이트 관리 바로가기</h3>
                <p>웹사이트 상세 정보와 템플릿을 수정할 수 있어요</p>
              </div>
              <Link href="/dashboard">웹사이트 관리 바로가기</Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
