import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import styles from "./template-generating.module.css";

const logoImage =
  "/images/onboarding/generating-background.png";
const heroLogoImage = "/images/onboarding/generating-hero-logo.png";

export default function TemplateGeneratingPage() {
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
        <h1>우리 시장 맞춤 웹페이지 만드는 중</h1>
        <p>
          입력해주신 정보를 바탕으로 웹사이트를 만들고 있어요
          <br />
          기다리시는 동안 웹페이지 관리 방법을 확인해보세요
        </p>
      </section>

      <Link className={styles.guideButton} href="/">
        홈 화면에서 웹페이지 수정 방법 확인하기
      </Link>
    </main>
  );
}
