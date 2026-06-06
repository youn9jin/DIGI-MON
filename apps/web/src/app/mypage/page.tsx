"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Header from "@/components/layout/Header";
import DeleteAccountModal from "@/components/ui/DeleteAccountModal";
import {
  getPublicMarketPageContent,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import {
  deleteMe,
  getMe,
  getMyPage,
  type MeResponse,
  type MyPageResponse,
} from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { formatOperatingHours } from "@/lib/market-info";
import styles from "./mypage.module.css";

type CopyState = "idle" | "copied";
type MyPageView = "all" | "profile" | "website";

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
  const [myPage, setMyPage] = useState<MyPageResponse | null>(null);
  const [content, setContent] = useState<MarketPageContentResponse | null>(null);
  const [origin, setOrigin] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [activeView, setActiveView] = useState<MyPageView>("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

    function updateScale() {
      setScale(Math.min(1, (window.innerWidth - 24) / 1920));
    }

    updateScale();
    window.addEventListener("resize", updateScale);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      try {
        const [nextMe, nextMyPage] = await Promise.all([
          getMe(currentUser),
          getMyPage(currentUser).catch(() => null),
        ]);
        setMe(nextMe);
        setMyPage(nextMyPage);

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

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateScale);
    };
  }, [router]);

  const websiteUrl = useMemo(() => {
    if (!origin || !me?.marketId) return "";
    return `${origin}/markets/${me.marketId}`;
  }, [me?.marketId, origin]);

  const displayName = formatEmpty(
    myPage?.profile?.name ?? me?.name ?? user?.displayName,
    "상인회",
  );
  const displayEmail = formatEmpty(
    myPage?.profile?.email ?? me?.email ?? user?.email,
    "이메일 정보 없음",
  );
  const marketName = formatEmpty(
    content?.marketName ?? myPage?.market?.name ?? me?.marketName,
    "시장 이름",
  );
  const marketAddress = formatEmpty(
    content?.address ?? myPage?.market?.address ?? me?.address,
    "주소 정보 없음",
  );
  const marketContact = formatEmpty(
    content?.contact ?? myPage?.market?.contact ?? me?.phone,
    "연락처 정보 없음",
  );
  const marketOperatingHours = formatOperatingHours(myPage?.market?.operatingHours);
  const marketImage = getMarketImage(content);
  const canvasHeight = activeView === "website" ? "780px" : activeView === "profile" ? "870px" : "1370px";
  const canvasStyle = {
    "--mypage-scale": scale,
    "--mypage-height": canvasHeight,
  } as CSSProperties;
  const canvasClassName = [
    styles.figmaCanvas,
    activeView === "profile" ? styles.figmaCanvasProfileOnly : "",
    activeView === "website" ? styles.figmaCanvasWebsiteOnly : "",
  ]
    .filter(Boolean)
    .join(" ");

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleDeleteAccountConfirm() {
    setDeleteMessage("");

    try {
      await deleteMe(user);
      setIsDeleteModalOpen(false);
      await signOut(auth).catch(() => undefined);
      router.replace("/login");
    } catch (error) {
      setIsDeleteModalOpen(false);
      setDeleteMessage(error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.");
      window.setTimeout(() => setDeleteMessage(""), 3000);
    }
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

      <div className={styles.figmaViewport} style={canvasStyle}>
        <div className={canvasClassName}>
          <h1 className={styles.figmaPageTitle}>마이페이지</h1>

          <aside className={styles.figmaSidebar} aria-label="마이페이지 메뉴">
            <button
              className={`${styles.figmaSideButton} ${
                activeView === "all" ? styles.figmaSideActive : ""
              }`}
              type="button"
              onClick={() => setActiveView("all")}
            >
              전체 보기
            </button>
            <button
              className={`${styles.figmaSideButton} ${
                activeView === "profile" ? styles.figmaSideActive : ""
              }`}
              type="button"
              onClick={() => setActiveView("profile")}
            >
              내 정보
            </button>
            <button
              className={`${styles.figmaSideButton} ${
                activeView === "website" ? styles.figmaSideActive : ""
              }`}
              type="button"
              onClick={() => setActiveView("website")}
            >
              웹사이트 확인
            </button>
            <button className={`${styles.figmaSideButton} ${styles.figmaLogout}`} onClick={handleLogout}>
              로그아웃
            </button>
            <button
              className={`${styles.figmaSideButton} ${styles.figmaWithdraw}`}
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              회원 탈퇴
            </button>
          </aside>

          {(activeView === "all" || activeView === "profile") && (
          <section
            id="profile"
            className={styles.figmaProfileSection}
            aria-labelledby="profile-title"
          >
            <h2 id="profile-title" className={styles.figmaSectionTitle}>
              내 정보
            </h2>
            <p className={styles.figmaDescription}>
              상인회 프로필, 시장 정보 수정하기 버튼을 누르시면 관련 정보를 수정하실 수 있습니다.
            </p>

            <h3 className={styles.figmaProfileTitle}>상인회 프로필</h3>
            <article className={styles.figmaProfileCard}>
              <div className={styles.figmaAvatar}>
                <Image
                  alt="DIGI-MON 상인회 기본 프로필"
                  fill
                  sizes="123px"
                  src="/images/onboarding/market-illustration.png"
                />
              </div>
              <strong>{displayName} 님</strong>
              <p>이메일 : {displayEmail}</p>
              <Link className={styles.figmaProfileButton} href="/mypage/association-edit">
                상인회 정보 수정하기
              </Link>
            </article>

            <h3 className={styles.figmaMarketTitle}>시장 정보</h3>
            <article className={styles.figmaMarketCard}>
              <div className={styles.figmaMarketImage}>
                {marketImage ? (
                  <Image alt={`${marketName} 대표 이미지`} fill sizes="301px" src={marketImage} />
                ) : null}
              </div>
              <div className={styles.figmaMarketText}>
                <strong>대표 정보</strong>
                <b>{marketName}</b>
                <p>주소 | {marketAddress}</p>
                <p>연락처 | {marketContact}</p>
                <p>영업시간 | {marketOperatingHours}</p>
              </div>
              <Link className={styles.figmaMarketButton} href="/mypage/market-info-edit">
                시장 상세 정보 수정하기
              </Link>
            </article>
          </section>
          )}

          {(activeView === "all" || activeView === "website") && (
          <section className={styles.figmaWebsiteSection} aria-labelledby="website-title">
            <h2 id="website-title" className={styles.figmaWebsiteTitle}>
              웹사이트 확인
            </h2>
            <h3 className={styles.figmaLinkTitle}>우리 시장 웹사이트 링크</h3>
            <div className={styles.figmaLinkBox}>
              <span>{websiteUrl || "웹사이트 링크"}</span>
              <button type="button" onClick={handleCopy} disabled={!websiteUrl}>
                {copyState === "copied" ? "복사 완료" : "복사하기"}
              </button>
            </div>

            <h3 className={styles.figmaManageTitle}>웹사이트 관리 바로가기</h3>
            <p className={styles.figmaManageDescription}>
              웹사이트에 등록된 내용을 언제든지 확인하고 수정할 수 있어요. 템플릿 교체도 가능해요.
            </p>
            <Link className={styles.figmaManageButton} href="/dashboard">
              웹사이트 관리 바로가기
            </Link>
          </section>
          )}
          {deleteMessage && <p className={styles.figmaDeleteMessage}>{deleteMessage}</p>}
        </div>
      </div>
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccountConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </main>
  );
}
