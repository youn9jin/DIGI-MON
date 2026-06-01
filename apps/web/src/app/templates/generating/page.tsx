"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import {
  createMarketPage,
  subscribeMarketPageStatus,
  type MarketPageApiError,
  type MarketPageStatus,
} from "@/lib/api/market-page";
import styles from "./template-generating.module.css";

const logoImage =
  "/images/onboarding/generating-background.png";
const heroLogoImage = "/images/onboarding/generating-hero-logo.png";

export default function TemplateGeneratingPage() {
  const hasStarted = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<MarketPageStatus>("PENDING");
  const [errorMessage, setErrorMessage] = useState("");
  const [pageId, setPageId] = useState<string | number | null>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let isMounted = true;

    async function startGeneration() {
      try {
        setStatus("PENDING");
        setErrorMessage("");

        const created = await createMarketPage();
        if (!isMounted) return;

        setPageId(created.pageId);
        window.sessionStorage.setItem("generated_market_page_id", String(created.pageId));

        unsubscribeRef.current = await subscribeMarketPageStatus(created.pageId, {
          onDone: (result) => {
            if (!isMounted) return;
            setStatus("DONE");
            setPageId(result.pageId ?? created.pageId);
            window.sessionStorage.setItem(
              "generated_market_page_id",
              String(result.pageId ?? created.pageId),
            );
          },
          onFailed: (result) => {
            if (!isMounted) return;
            setStatus("FAILED");
            setErrorMessage(result.error ?? "AI 웹페이지 생성에 실패했습니다. 다시 시도해주세요.");
          },
          onError: (error) => {
            if (!isMounted) return;
            setStatus("FAILED");
            setErrorMessage(error.message);
          },
        });
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as MarketPageApiError;
        setStatus("FAILED");
        setErrorMessage(apiError.message ?? "웹페이지 생성 요청에 실패했습니다.");
      }
    }

    startGeneration();

    return () => {
      isMounted = false;
      hasStarted.current = false;
      unsubscribeRef.current?.();
    };
  }, []);

  function handleRetry() {
    hasStarted.current = false;
    unsubscribeRef.current?.();
    window.location.reload();
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.backgroundMark} aria-hidden="true">
        <Image alt="" width={1550} height={791} priority src={logoImage} />
      </div>

      <div className={styles.heroLogo} aria-hidden="true">
        <Image
          alt=""
          width={447}
          height={314}
          priority
          className={styles.heroLogoImage}
          src={heroLogoImage}
        />
      </div>

      <section className={styles.content} aria-label="웹페이지 생성 중">
        <h1>
          {status === "DONE"
            ? "우리 시장 맞춤 웹페이지 생성 완료"
            : status === "FAILED"
              ? "웹페이지 생성에 실패했어요"
              : "우리 시장 맞춤 웹페이지 만드는 중"}
        </h1>
        <p>
          {status === "FAILED"
            ? errorMessage
            : "입력해주신 정보를 바탕으로 웹사이트를 만들고 있어요"}
          <br />
          {status === "DONE"
            ? "웹페이지 관리 화면에서 결과를 확인해보세요"
            : "기다리시는 동안 웹페이지 관리 방법을 확인해보세요"}
        </p>
        {pageId && <span className={styles.pageId}>생성 요청 번호 {pageId}</span>}
      </section>

      {status === "FAILED" ? (
        <button className={styles.guideButton} type="button" onClick={handleRetry}>
          다시 생성하기
        </button>
      ) : (
        <Link className={styles.guideButton} href="/">
          홈 화면에서 웹페이지 수정 방법 확인하기
        </Link>
      )}
    </main>
  );
}
