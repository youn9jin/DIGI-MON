"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import styles from "../auth.module.css";

export default function FindIdPage() {
  return (
    <main className={styles.viewport}>
      <div className={styles.canvas}>
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

        <div className={styles.card}>
          <h1 className={styles.cardTitle}>아이디 찾기</h1>

          <p style={{ color: "#3b3b3b", fontSize: "clamp(13px, 1.042vw, 20px)", lineHeight: 1.7, marginBottom: "clamp(16px, 1.667vw, 32px)" }}>
            WithOn은 <strong>이메일 주소</strong>를 아이디로 사용합니다.
            <br />
            회원가입 시 입력한 이메일 주소가 곧 아이디입니다.
          </p>

          <p style={{ color: "#6b6b6b", fontSize: "clamp(11px, 0.938vw, 18px)", lineHeight: 1.6, marginBottom: "clamp(24px, 2.5vw, 48px)" }}>
            이메일 주소가 기억나지 않으시면 가입 시 사용한 이메일 계정을 확인해 보세요.
            구글 계정으로 로그인한 경우 해당 구글 이메일이 아이디입니다.
          </p>

          <Link
            href="/login"
            className={`${styles.button} ${styles.primaryButton}`}
            style={{ textDecoration: "none" }}
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
