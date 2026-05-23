"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";

export default function OnboardingStepSevenPage() {
  const router = useRouter();
  const [customerCharacteristics, setCustomerCharacteristics] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerCharacteristics.trim()) {
      return;
    }

    saveOnboardingData({ targetCustomers: customerCharacteristics });
    router.push("/onboarding/step-8");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2255">
        <Header />

        <div className={styles.illustration} data-node-id="148:2269">
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
          className={`${styles.card} ${styles.customerCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="148:2291"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.customerQuestion}`}
            data-node-id="148:2292"
          >
            <p>질문 7.</p>
            <label id="onboarding-question">방문하는 주요 고객층의 특성을 작성해주세요.</label>
          </div>

          <textarea
            className={styles.textareaAnswer}
            name="customerCharacteristics"
            aria-labelledby="onboarding-question"
            placeholder="관광 차 한국을 방문한 외국인 손님들이 많습니다, 2030 MZ 세대의 방문 손님들의 대부분입니다. 등 자유롭게 입력"
            value={customerCharacteristics}
            onChange={(e) => setCustomerCharacteristics(e.target.value)}
          />

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.customerNextButton}`}
            data-node-id="148:2293"
          >
            다음
          </button>
        </form>

        <StepIndicator step={7} />
      </div>
    </main>
  );
}
