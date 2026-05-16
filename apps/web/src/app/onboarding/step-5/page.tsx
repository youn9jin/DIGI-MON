"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import styles from "../onboarding.module.css";

const TOTAL_STEPS = 10;
const ACTIVE_STEP = 4;

const STORE_COUNT_OPTIONS = [
  "10개 이상 20개 미만",
  "20개 이상 30개 미만",
  "30개 이상 40개 미만",
  "40개 이상 50개 미만",
  "50개 이상",
];

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="5 / 10" data-node-id="164:1871">
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

export default function OnboardingStepFivePage() {
  const router = useRouter();
  const [selectedStoreCount, setSelectedStoreCount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStoreCount) {
      return;
    }

    saveOnboardingData({ totalStores: selectedStoreCount });
    router.push("/onboarding/step-6");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="164:1856">
        <Header />

        <div className={styles.illustration} data-node-id="164:1870">
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
          className={`${styles.card} ${styles.storeCountCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="164:1893"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.storeCountQuestion}`}
            data-node-id="164:1894"
          >
            <p>질문 5.</p>
            <label id="onboarding-question">시장의 총 점포 수를 선택해주세요.</label>
          </div>

          <div className={styles.storeCountOptionList} role="radiogroup" aria-labelledby="onboarding-question">
            {STORE_COUNT_OPTIONS.map((option) => (
              <label
                key={option}
                className={`${styles.marketTypeOption} ${
                  selectedStoreCount === option ? styles.marketTypeOptionSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="storeCount"
                  value={option}
                  checked={selectedStoreCount === option}
                  onChange={(event) => setSelectedStoreCount(event.target.value)}
                />
                <span className={styles.optionBullet} />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.storeCountNextButton}`}
            data-node-id="148:1713"
          >
            다음
          </button>
        </form>

        <StepIndicator />
      </div>
    </main>
  );
}
