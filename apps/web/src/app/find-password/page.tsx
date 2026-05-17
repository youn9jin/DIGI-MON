"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/layout/Header";
import EmailInput from "@/components/ui/EmailInput";
import styles from "../auth.module.css";

type Status = "idle" | "loading" | "sent" | "error";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("sent");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setErrorMessage("해당 이메일로 가입된 계정을 찾을 수 없습니다.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("유효하지 않은 이메일 형식입니다.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage("오류가 발생했습니다. 다시 시도해주세요.");
      }
      setStatus("error");
    }
  }

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

        {status === "sent" ? (
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>이메일을 보냈습니다</h1>
            <p style={{ color: "#3b3b3b", fontSize: "clamp(13px, 1.042vw, 20px)", lineHeight: 1.7, marginBottom: "clamp(16px, 1.667vw, 32px)" }}>
              <strong>{email}</strong>으로 비밀번호 재설정 링크를 발송했습니다.
            </p>
            <p style={{ color: "#6b6b6b", fontSize: "clamp(11px, 0.938vw, 18px)", lineHeight: 1.6, marginBottom: "clamp(24px, 2.5vw, 48px)" }}>
              이메일이 도착하지 않으면 스팸함을 확인하거나, 잠시 후 다시 시도해주세요.
            </p>
            <Link
              href="/login"
              className={`${styles.button} ${styles.primaryButton}`}
              style={{ textDecoration: "none" }}
            >
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit} noValidate>
            <h1 className={styles.cardTitle}>비밀번호 찾기</h1>

            <p style={{ color: "#6b6b6b", fontSize: "clamp(11px, 0.938vw, 18px)", lineHeight: 1.6, marginBottom: "clamp(16px, 1.667vw, 32px)" }}>
              가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>

            <div className={styles.inputGroup}>
              <EmailInput
                id="find-password-email"
                value={email}
                onChange={setEmail}
                variant="box"
                placeholder="이메일을 입력해 주세요"
              />
            </div>

            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}

            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={status === "loading" || email.trim() === ""}
            >
              {status === "loading" ? "전송 중..." : "재설정 링크 보내기"}
            </button>

            <p className={styles.bottomText} style={{ marginTop: "clamp(12px, 1.25vw, 24px)" }}>
              <Link href="/login">로그인으로 돌아가기</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
