"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./TemplatePreviewStatus.module.css";

interface TemplatePreviewStatusProps {
  message: string;
  title: string;
  tone?: "loading" | "error" | "empty";
}

const generatedPageIdStorageKey = "generated_market_page_id";

export default function TemplatePreviewStatus({
  message,
  tone = "error",
  title,
}: TemplatePreviewStatusProps) {
  const router = useRouter();

  function handleRetry() {
    window.sessionStorage.removeItem(generatedPageIdStorageKey);
    router.push("/templates/generating");
  }

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles[tone]}`}>
        <span className={styles.statusMark} aria-hidden="true" />
        <h1>{title}</h1>
        <p>{message}</p>
        <div className={styles.actions}>
          {tone === "loading" ? (
            <Link href="/mypage">마이페이지로 이동</Link>
          ) : (
            <>
              <button type="button" onClick={handleRetry}>
                다시 생성하기
              </button>
              <Link href="/mypage">관리 화면으로 이동</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
