"use client";

import Link from "next/link";
import styles from "./TemplatePreviewStatus.module.css";

interface TemplatePreviewStatusProps {
  message: string;
  title: string;
}

export default function TemplatePreviewStatus({
  message,
  title,
}: TemplatePreviewStatusProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link href="/templates/generating">생성 화면으로 돌아가기</Link>
      </section>
    </main>
  );
}
