"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingData, saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";

export default function OnboardingStepEightPage() {
  const router = useRouter();
  const [contactNumber, setContactNumber] = useState(
    () => getOnboardingData().contactNumber ?? "",
  );

  function formatPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveOnboardingData({ contactNumber });
    router.push("/onboarding/step-9");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2296">
        <Header />

        <div className={styles.illustration} data-node-id="148:2310">
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
          data-node-id="148:2332"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.contactQuestion}`}
            data-node-id="148:2333"
          >
            <p>질문 8.</p>
            <label id="onboarding-question">시장 대표 연락처를 입력해주세요 (선택)</label>
          </div>

          <input
            type="tel"
            className={`${styles.shortAnswer} ${styles.contactInput}`}
            name="contactNumber"
            aria-labelledby="onboarding-question"
            value={contactNumber}
            onChange={(e) => setContactNumber(formatPhoneNumber(e.target.value))}
          />

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.contactNextButton}`}
            data-node-id="148:2334"
          >
            다음
          </button>
        </form>

        <StepIndicator step={8} />
      </div>
    </main>
  );
}
