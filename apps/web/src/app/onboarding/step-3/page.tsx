"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import styles from "../onboarding.module.css";

const TOTAL_STEPS = 10;
const ACTIVE_STEP = 2;

const MARKET_TYPES = ["전통시장", "상점가", "복합시장"];

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="3 / 10" data-node-id="148:2048">
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

export default function OnboardingStepThreePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedType) {
      return;
    }

    router.push("/onboarding/step-4");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2031">
        <Header />

        <div className={styles.illustration} data-node-id="148:2045">
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
          className={`${styles.card} ${styles.selectionCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="148:2046"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.selectionQuestion}`}
            data-node-id="148:2047"
          >
            <p>질문 3.</p>
            <label id="onboarding-question">시장의 유형을 선택해주세요.</label>
          </div>

          <div className={styles.optionList} role="radiogroup" aria-labelledby="onboarding-question">
            {MARKET_TYPES.map((type) => (
              <label
                key={type}
                className={`${styles.marketTypeOption} ${
                  selectedType === type ? styles.marketTypeOptionSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="marketType"
                  value={type}
                  checked={selectedType === type}
                  onChange={(event) => setSelectedType(event.target.value)}
                />
                <span className={styles.optionBullet} />
                <span>{type}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.selectionNextButton}`}
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
