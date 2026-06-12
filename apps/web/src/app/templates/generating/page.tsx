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
import { getGenerationErrorMessage } from "@/lib/generation-error";
import { getGeneratedMarketPageHref } from "@/lib/market-page-template-data";
import styles from "./template-generating.module.css";

const logoImage =
  "/images/onboarding/generating-background.png";
const heroLogoImage = "/images/onboarding/generating-hero-logo.png";
const generatedPageIdStorageKey = "generated_market_page_id";
const generatedPublicMarketIdStorageKey = "generated_market_public_market_id";
const generationInProgressStorageKey = "market_page_generation_in_progress";
const setupStorageKey = "market_page_setup_draft";
const generationVersionStorageKey = "market_page_generation_version";
let createMarketPagePromise: ReturnType<typeof createMarketPage> | null = null;
let createMarketPagePromiseKey: string | null = null;
type GenerationViewStatus = MarketPageStatus | "CONNECTION_LOST";

function getGenerationRequestKey(): string {
  if (typeof window === "undefined") return "server";

  return (
    window.sessionStorage.getItem(generationVersionStorageKey) ??
    window.sessionStorage.getItem(setupStorageKey) ??
    "default"
  );
}

export default function TemplateGeneratingPage() {
  const hasStarted = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<GenerationViewStatus>("PENDING");
  const [errorMessage, setErrorMessage] = useState("");
  const [pageId, setPageId] = useState<string | number | null>(null);
  const [publicMarketId, setPublicMarketId] = useState<string | number | null>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const generatedHrefId = publicMarketId ?? pageId;

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let isMounted = true;

    async function subscribeStatus(targetPageId: string | number) {
      unsubscribeRef.current = await subscribeMarketPageStatus(targetPageId, {
        onDone: (result) => {
          if (!isMounted) return;
          const generatedId = result.pageId ?? targetPageId;
          const publicId = result.marketId ?? generatedId;
          setStatus("DONE");
          setShowCompletionAlert(true);
          setPageId(generatedId);
          setPublicMarketId(publicId);
          window.sessionStorage.setItem(
            generatedPageIdStorageKey,
            String(generatedId),
          );
          window.sessionStorage.setItem(
            generatedPublicMarketIdStorageKey,
            String(publicId),
          );
          window.sessionStorage.removeItem(generationInProgressStorageKey);
        },
        onFailed: (result) => {
          if (!isMounted) return;
          createMarketPagePromise = null;
          createMarketPagePromiseKey = null;
          window.sessionStorage.removeItem(generatedPageIdStorageKey);
          window.sessionStorage.removeItem(generatedPublicMarketIdStorageKey);
          window.sessionStorage.removeItem(generationInProgressStorageKey);
          setStatus("FAILED");
          setShowCompletionAlert(false);
          setErrorMessage(getGenerationErrorMessage(result.error));
        },
        onError: (error) => {
          if (!isMounted) return;
          createMarketPagePromise = null;
          createMarketPagePromiseKey = null;
          setStatus("CONNECTION_LOST");
          setShowCompletionAlert(false);
          setErrorMessage(getGenerationErrorMessage(error.message, error.status));
        },
      });
    }

    async function startGeneration() {
      try {
        setStatus("PENDING");
        setErrorMessage("");
        setShowCompletionAlert(false);
        window.sessionStorage.setItem(generationInProgressStorageKey, "true");

        const storedPageId = window.sessionStorage.getItem(generatedPageIdStorageKey);
        if (storedPageId) {
          setPageId(storedPageId);
          const storedPublicId = window.sessionStorage.getItem(
            generatedPublicMarketIdStorageKey,
          );
          if (storedPublicId) {
            setPublicMarketId(storedPublicId);
          }
          await subscribeStatus(storedPageId);
          return;
        }

        const requestKey = getGenerationRequestKey();
        if (createMarketPagePromiseKey !== requestKey) {
          createMarketPagePromise = null;
          createMarketPagePromiseKey = requestKey;
        }

        createMarketPagePromise ??= createMarketPage();
        const created = await createMarketPagePromise;
        if (!isMounted) return;

        setPageId(created.pageId);
        setPublicMarketId(created.marketId ?? created.pageId);
        window.sessionStorage.setItem(generatedPageIdStorageKey, String(created.pageId));
        window.sessionStorage.setItem(
          generatedPublicMarketIdStorageKey,
          String(created.marketId ?? created.pageId),
        );

        await subscribeStatus(created.pageId);
      } catch (error) {
        createMarketPagePromise = null;
        createMarketPagePromiseKey = null;
        if (!isMounted) return;
        const apiError = error as MarketPageApiError;
        window.sessionStorage.removeItem(generatedPageIdStorageKey);
        window.sessionStorage.removeItem(generatedPublicMarketIdStorageKey);
        window.sessionStorage.removeItem(generationInProgressStorageKey);
        setStatus("FAILED");
        setShowCompletionAlert(false);
        setErrorMessage(
          getGenerationErrorMessage(apiError.message, apiError.status),
        );
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
    createMarketPagePromise = null;
    createMarketPagePromiseKey = null;
    window.sessionStorage.removeItem(generatedPageIdStorageKey);
    window.sessionStorage.removeItem(generatedPublicMarketIdStorageKey);
    window.sessionStorage.removeItem(generationInProgressStorageKey);
    window.location.reload();
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      {showCompletionAlert && (
        <aside
          className={styles.completionAlert}
          role="status"
          aria-live="polite"
          aria-label="웹사이트 생성 완료 알림"
        >
          <span className={styles.alertLogo} aria-hidden="true">
            <Image
              src="/images/onboarding/market-illustration.png"
              alt=""
              width={283}
              height={286}
              className={styles.alertLogoImage}
            />
          </span>
          <strong>웹사이트 생성 완료 알림</strong>
          <p>웹사이트 생성이 완료되었습니다. 생성된 웹사이트를 확인하세요!</p>
        </aside>
      )}

      <div className={styles.designStage}>
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

        <section
          className={`${styles.content} ${status === "DONE" ? styles.doneContent : ""}`}
          aria-label={status === "DONE" ? "웹페이지 생성 완료" : "웹페이지 생성 중"}
        >
          <h1>
            {status === "DONE"
              ? "우리 시장 맞춤 웹페이지 생성 완료"
              : status === "CONNECTION_LOST"
                ? "생성 상태 확인이 잠시 끊겼어요"
                : status === "FAILED"
                ? "웹페이지 생성에 실패했어요"
                : "우리 시장 맞춤 웹페이지 만드는 중"}
          </h1>
          <p>
            {status === "FAILED" || status === "CONNECTION_LOST"
              ? errorMessage
              : "입력해주신 정보를 바탕으로 웹사이트를 만들고 있어요"}
            <br />
            {status === "DONE"
              ? "웹페이지 관리 화면에서 결과를 확인해보세요"
              : status === "CONNECTION_LOST"
                ? "웹사이트 관리 화면에서 생성 결과를 다시 확인해주세요"
                : "기다리시는 동안 웹페이지 관리 방법을 확인해보세요"}
          </p>
          {status === "DONE" && pageId && (
            <span className={styles.pageId}>생성 요청 번호 {pageId}</span>
          )}
        </section>

        {status === "FAILED" ? (
          <button className={styles.guideButton} type="button" onClick={handleRetry}>
            다시 생성하기
          </button>
        ) : status === "CONNECTION_LOST" ? (
          <Link className={styles.guideButton} href="/dashboard">
            웹사이트 관리로 이동
          </Link>
        ) : status === "DONE" && generatedHrefId ? (
          <Link
            className={`${styles.guideButton} ${styles.doneButton}`}
            href={getGeneratedMarketPageHref(generatedHrefId)}
          >
            생성된 웹페이지 확인하기
          </Link>
        ) : (
          <Link className={styles.guideButton} href="/">
            홈 화면에서 웹페이지 수정 방법 확인하기
          </Link>
        )}
      </div>
    </main>
  );
}
