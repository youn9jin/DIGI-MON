import Image from "next/image";
import Header from "@/components/layout/Header";
import styles from "@/app/dashboard/manage.module.css";

type DashboardOperationPendingProps = {
  type: "template" | "detail";
};

const pendingCopy = {
  template: {
    title: "우리 시장 웹페이지 템플릿 바꾸는 중",
    description: "기존 템플릿에서 선택하신 템플릿으로 웹사이트 디자인을 바꾸고 있어요",
  },
  detail: {
    title: "우리 시장 웹사이트 상세 정보 바꾸는 중",
    description: "입력해주신 정보를 바탕으로 웹페이지 내용을 수정하고 있어요",
  },
} as const;

export default function DashboardOperationPending({ type }: DashboardOperationPendingProps) {
  const copy = pendingCopy[type];

  return (
    <main className={`${styles.page} ${styles.operationPage}`}>
      <Header variant="operation" />
      <div className={styles.operationBackground} aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="88vw"
          src="/images/onboarding/generating-background.png"
        />
      </div>
      <section className={styles.operationHero} aria-live="polite">
        <div className={styles.operationCopy}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className={styles.operationLogo} aria-hidden="true">
          <Image
            alt=""
            fill
            priority
            sizes="32vw"
            src="/images/onboarding/generating-hero-logo.png"
          />
        </div>
      </section>
    </main>
  );
}
