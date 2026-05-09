import Image from "next/image";
import styles from "@/app/onboarding/onboarding.module.css";

export default function Header() {
  return (
    <header className={styles.header} data-node-id="148:1796">
      <div className={styles.headerInner} data-node-id="148:1797">
        <div className={styles.headerLeft} data-node-id="148:1798">
          <div className={styles.logoSlot} data-node-id="148:1799">
            <div className={styles.logoMark} data-node-id="148:1800">
              <Image
                src="/images/onboarding/market-illustration.png"
                alt="DIGI-MON"
                width={283}
                height={286}
                priority
                className={styles.logoImage}
              />
            </div>
          </div>

          <nav className={styles.primaryNav} aria-label="주요 메뉴" data-node-id="148:1802">
            <a href="#">사용방법</a>
            <a href="#">커뮤니티</a>
          </nav>
        </div>

        <nav className={styles.authNav} aria-label="인증 메뉴" data-node-id="148:1805">
          <a href="/login">로그인</a>
          <Image
            src="/images/onboarding/header-divider.svg"
            alt=""
            width={1}
            height={19}
            className={styles.headerDivider}
          />
          <a href="/signup">회원가입</a>
        </nav>
      </div>
    </header>
  );
}
