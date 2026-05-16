"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import styles from "../onboarding.module.css";

const TOTAL_STEPS = 10;
const ACTIVE_STEP = 8;

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="9 / 10" data-node-id="148:2351">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <Image
          key={index}
          src={
            index === ACTIVE_STEP
              ? "/images/onboarding/step-active.svg"
              : "/images/onboarding/step-inactive.svg"
          }
          alt=""
          width={index === ACTIVE_STEP ? 25 : 22}
          height={index === ACTIVE_STEP ? 25 : 22}
          className={index === ACTIVE_STEP ? styles.stepActive : styles.stepInactive}
        />
      ))}
    </div>
  );
}

export default function OnboardingStepNinePage() {
  const router = useRouter();
  const [introduction, setIntroduction] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveOnboardingData({ introduction });
    router.push("/onboarding/step-10");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2336">
        <Header />

        <div className={styles.illustration} data-node-id="148:2350">
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
          data-node-id="148:2372"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.contactQuestion}`}
            data-node-id="148:2373"
          >
            <p>질문 9.</p>
            <label id="onboarding-question">시장 한 줄 소개글을 작성해주세요(선택)</label>
          </div>

          <input
            type="text"
            className={`${styles.shortAnswer} ${styles.contactInput}`}
            name="introduction"
            aria-labelledby="onboarding-question"
            placeholder="빈 칸으로 제출 시 작성해주신 정보를 바탕으로 AI가 한 줄 소개를 생성합니다."
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
          />

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.contactNextButton}`}
            data-node-id="148:2374"
          >
            다음
          </button>
        </form>

        <StepIndicator />
      </div>
    </main>
  );
}
