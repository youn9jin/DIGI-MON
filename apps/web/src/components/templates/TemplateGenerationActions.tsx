"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createMarketPage,
  getMarketPageStatus,
  type MarketPageApiError,
  type TemplateType,
} from "@/lib/api/market-page";
import styles from "./ClassicMarketTemplate.module.css";

interface TemplateGenerationActionsProps {
  templateType: TemplateType;
  previewHref: string;
}

function subscribeToEmbedState() {
  return () => {};
}

function getEmbeddedSnapshot() {
  return window.self !== window.top;
}

function getServerEmbeddedSnapshot() {
  return false;
}

export default function TemplateGenerationActions({
  templateType,
  previewHref,
}: TemplateGenerationActionsProps) {
  const router = useRouter();
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isEmbeddedPreview = useSyncExternalStore(
    subscribeToEmbedState,
    getEmbeddedSnapshot,
    getServerEmbeddedSnapshot,
  );

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  if (isEmbeddedPreview) return null;

  async function pollUntilDone(jobId: string | number) {
    try {
      const result = await getMarketPageStatus(jobId);

      if (result.status === "DONE") {
        setIsGenerating(false);
        const pageId = result.pageId ?? jobId;
        router.push(`${previewHref}?pageId=${encodeURIComponent(String(pageId))}`);
        return;
      }

      if (result.status === "FAILED") {
        setIsGenerating(false);
        window.alert(result.error ?? "AI 웹페이지 생성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      pollTimer.current = setTimeout(() => pollUntilDone(jobId), 5000);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      window.alert(apiError.message ?? "생성 상태 확인에 실패했습니다.");
    }
  }

  async function handleGenerate() {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await createMarketPage(templateType);
      pollUntilDone(result.jobId);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      window.alert(apiError.message ?? "웹페이지 생성 요청에 실패했습니다.");
    }
  }

  return (
    <div className={styles.previewActions}>
      <Link href="/templates">목록</Link>
      <button
        className={styles.primaryAction}
        disabled={isGenerating}
        type="button"
        onClick={handleGenerate}
      >
        {isGenerating ? "생성 중..." : "이 템플릿 선택"}
      </button>
    </div>
  );
}
