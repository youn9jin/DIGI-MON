"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  subscribeMarketPageStatus,
  type MarketPageApiError,
} from "@/lib/api/market-page";
import { getGeneratedMarketPageHref } from "@/lib/market-page-template-data";
import styles from "./GenerationCompletionWatcher.module.css";

const generatedPageIdStorageKey = "generated_market_page_id";
const generatedPublicMarketIdStorageKey = "generated_market_public_market_id";
const generationInProgressStorageKey = "market_page_generation_in_progress";

export default function GenerationCompletionWatcher() {
  const pathname = usePathname();
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [error, setError] = useState<MarketPageApiError | null>(null);
  const shouldWatch = pathname !== "/templates/generating";
  const generatedHref = useMemo(
    () => (generatedId ? getGeneratedMarketPageHref(generatedId) : null),
    [generatedId],
  );

  useEffect(() => {
    if (!shouldWatch) return undefined;

    const pageId = window.sessionStorage.getItem(generatedPageIdStorageKey);
    const isInProgress = window.sessionStorage.getItem(
      generationInProgressStorageKey,
    );

    if (!pageId || isInProgress !== "true") return undefined;

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    subscribeMarketPageStatus(pageId, {
      onDone: (result) => {
        if (!isMounted) return;
        const publicId = result.marketId ?? result.pageId ?? pageId;
        window.sessionStorage.setItem(
          generatedPageIdStorageKey,
          String(result.pageId ?? pageId),
        );
        window.sessionStorage.setItem(
          generatedPublicMarketIdStorageKey,
          String(publicId),
        );
        window.sessionStorage.removeItem(generationInProgressStorageKey);
        setError(null);
        setGeneratedId(String(publicId));
      },
      onFailed: (result) => {
        if (!isMounted) return;
        window.sessionStorage.removeItem(generationInProgressStorageKey);
        setError({
          status: 0,
          message: result.error ?? "웹사이트 생성에 실패했습니다.",
        });
      },
      onError: (nextError) => {
        if (!isMounted) return;
        setError(nextError);
      },
    })
      .then((nextUnsubscribe) => {
        unsubscribe = nextUnsubscribe;
      })
      .catch((nextError: MarketPageApiError) => {
        if (!isMounted) return;
        setError(nextError);
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [shouldWatch]);

  useEffect(() => {
    if (!generatedId && !error) return undefined;

    const timeout = window.setTimeout(() => {
      setGeneratedId(null);
      setError(null);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [generatedId, error]);

  if (!generatedHref && !error) return null;

  return (
    <aside
      className={styles.alert}
      role="status"
      aria-live="polite"
      aria-label={generatedHref ? "웹사이트 생성 완료 알림" : "웹사이트 생성 실패 알림"}
    >
      <span className={styles.logo} aria-hidden="true">
        <Image
          src="/images/onboarding/market-illustration.png"
          alt=""
          width={283}
          height={286}
          className={styles.logoImage}
        />
      </span>
      <strong>
        {generatedHref ? "웹사이트 생성 완료 알림" : "웹사이트 생성 실패 알림"}
      </strong>
      {generatedHref ? (
        <Link href={generatedHref}>생성된 웹사이트를 확인하세요.</Link>
      ) : (
        <p>{error?.message ?? "웹사이트 생성 상태를 확인하지 못했습니다."}</p>
      )}
    </aside>
  );
}
