"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/layout/Header";
import EmailInput from "@/components/ui/EmailInput";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setErrorMessage("담당자 이름을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      router.push("/signup/complete");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setErrorMessage("이미 사용 중인 이메일입니다.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("유효하지 않은 이메일 형식입니다.");
      } else if (code === "auth/weak-password") {
        setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
      } else {
        setErrorMessage("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:1943">
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

        <form
          className={`${styles.card} ${styles.signupCard}`}
          data-node-id="148:1959"
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className={`${styles.cardTitle} ${styles.cardTitleCenter}`} data-node-id="148:1972">
            회원가입 정보 입력
          </h1>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="signup-name" data-node-id="148:1961">
              담당자(상인회) 이름
            </label>
            <input
              id="signup-name"
              type="text"
              className={styles.underlineInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="signup-email" data-node-id="148:1962">
              이메일(ID)
            </label>
            <EmailInput
              id="signup-email"
              value={email}
              onChange={setEmail}
              variant="underline"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="signup-password" data-node-id="148:1963">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              className={styles.underlineInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="signup-password-confirm" data-node-id="148:1964">
              비밀번호 확인
            </label>
            <input
              id="signup-password-confirm"
              type="password"
              className={styles.underlineInput}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}

          <Link href="/login" className={styles.backButton} data-node-id="148:1973">
            {"< 이전 화면으로"}
          </Link>

          <button
            type="submit"
            className={styles.confirmButton}
            disabled={isSubmitting}
            data-node-id="148:1969"
          >
            {isSubmitting ? "처리 중..." : "확인"}
          </button>
        </form>
      </div>
    </main>
  );
}
