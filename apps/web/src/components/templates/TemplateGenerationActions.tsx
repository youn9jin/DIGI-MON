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
import { getGenerationErrorMessage } from "@/lib/generation-error";
import { getGeneratedMarketPageHref } from "@/lib/market-page-template-data";
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
}: TemplateGenerationActionsProps) {
  const router = useRouter();
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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
        const publicMarketId = result.marketId ?? result.pageId ?? jobId;
        router.push(getGeneratedMarketPageHref(publicMarketId));
        return;
      }

      if (result.status === "FAILED") {
        setIsGenerating(false);
        setFeedbackMessage(getGenerationErrorMessage(result.error));
        return;
      }

      pollTimer.current = setTimeout(() => pollUntilDone(jobId), 5000);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      setFeedbackMessage(
        getGenerationErrorMessage(apiError.message, apiError.status),
      );
    }
  }

  async function handleGenerate() {
    if (isGenerating) return;

    setIsGenerating(true);
    setFeedbackMessage("");
    try {
      const result = await createMarketPage(templateType);
      pollUntilDone(result.pageId);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      setFeedbackMessage(
        getGenerationErrorMessage(apiError.message, apiError.status),
      );
    }
  }

  return (
    <div className={styles.previewActionGroup}>
      {feedbackMessage && (
        <p className={styles.previewFeedback} role="status" aria-live="polite">
          {feedbackMessage}
        </p>
      )}
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
    </div>
  );
}
