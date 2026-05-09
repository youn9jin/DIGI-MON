import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import styles from "../../landing.module.css";

export default function SignupCompletePage() {
  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:1888">
        <Header />

        <div className={styles.illustration}>
          <Image
            src="/images/onboarding/market-illustration.png"
            alt=""
            width={1550}
            height={1550}
            priority
            className={styles.illustrationImage}
          />
        </div>

        <h1
          className={`${styles.heroTitle} ${styles.heroTitleComplete}`}
          data-node-id="148:1904"
        >
          회원가입이 완료되었습니다
        </h1>

        <p
          className={`${styles.heroSub} ${styles.heroSubComplete}`}
          data-node-id="148:1907"
        >
          10가지 정보 기입 후 본격적으로 맞춤형 웹사이트 제작이 가능해요
        </p>

        <Link
          href="/onboarding"
          className={`${styles.ctaButton} ${styles.ctaButtonComplete}`}
          data-node-id="148:1905"
        >
          정보 기입 바로 하러 가기
        </Link>
      </div>
    </main>
  );
}
