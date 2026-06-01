"use client";

import { useRouter } from "next/navigation";
import styles from "./TemplatePreviewStatus.module.css";

interface TemplatePreviewStatusProps {
  message: string;
  title: string;
}

const generatedPageIdStorageKey = "generated_market_page_id";

export default function TemplatePreviewStatus({
  message,
  title,
}: TemplatePreviewStatusProps) {
  const router = useRouter();

  function handleRetry() {
    window.sessionStorage.removeItem(generatedPageIdStorageKey);
    router.push("/templates/generating");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1>{title}</h1>
        <p>{message}</p>
        <button type="button" onClick={handleRetry}>
          다시 생성하기
        </button>
      </section>
    </main>
  );
}
