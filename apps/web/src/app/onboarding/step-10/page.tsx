"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";
import { saveOnboardingData } from "@/lib/onboarding-store";
import { submitOnboarding, type OnboardingError } from "@/lib/api/onboarding";

export default function OnboardingStepTenPage() {
  const router = useRouter();
  const [managerName, setManagerName] = useState("");
  const [managerRole, setManagerRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    saveOnboardingData({ managerName, managerRole });
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await submitOnboarding();
      router.push("/templates");
    } catch (err) {
      const error = err as OnboardingError;
      if (error.status === 409) {
        setErrorMessage("이미 온보딩이 완료된 계정입니다.");
      } else if (error.status === 400) {
        setErrorMessage("입력 정보를 다시 확인해주세요.");
      } else if (error.status === 401) {
        setErrorMessage("로그인이 필요합니다.");
      } else {
        setErrorMessage("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2377">
        <Header />

        <div className={styles.illustration} data-node-id="148:2391">
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
          className={`${styles.card} ${styles.contactCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="148:2413"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.contactQuestion}`}
            data-node-id="148:2414"
          >
            <p>질문 10.</p>
            <label id="onboarding-question">담당자 이름 및 직책을 작성해주세요. (선택)</label>
          </div>

          <div className={styles.splitInputWrapper}>
            <input
              type="text"
              className={styles.splitInput}
              name="managerName"
              aria-label="담당자 이름"
              placeholder="예) 홍길동"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
            <input
              type="text"
              className={styles.splitInput}
              name="managerRole"
              aria-label="담당자 직책"
              placeholder="예) 시장 관리팀장"
              value={managerRole}
              onChange={(e) => setManagerRole(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p style={{
              position: "absolute",
              top: "clamp(165px, 28.7svh, 310px)",
              left: "clamp(49px, 4.844vw, 93px)",
              color: "#c43d31",
              fontSize: "clamp(12px, 1.042vw, 20px)",
              margin: 0,
            }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.nextButton} ${styles.contactNextButton}`}
            data-node-id="148:2415"
          >
            {isSubmitting ? "처리 중..." : "완료"}
          </button>
        </form>

        <StepIndicator step={10} />
      </div>
    </main>
  );
}
