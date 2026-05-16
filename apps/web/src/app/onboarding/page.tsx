"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import styles from "./onboarding.module.css";

const TOTAL_STEPS = 10;

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="1 / 10" data-node-id="148:1812">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <Image
          key={index}
          src={
            index === 0
              ? "/images/onboarding/step-active.svg"
              : "/images/onboarding/step-inactive.svg"
          }
          alt=""
          width={index === 0 ? 25 : 22}
          height={index === 0 ? 25 : 22}
          className={index === 0 ? styles.stepActive : styles.stepInactive}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [marketName, setMarketName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!marketName.trim()) {
      return;
    }

    saveOnboardingData({ marketName });
    router.push("/onboarding/step-2");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:1795">
        <Header />

        <div className={styles.illustration} data-node-id="148:1809">
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
          className={styles.card}
          aria-labelledby="onboarding-question"
          data-node-id="148:1810"
          onSubmit={handleSubmit}
        >
          <div className={styles.questionText} data-node-id="148:1811">
            <p>질문 1.</p>
            <label id="onboarding-question" htmlFor="market-name">
              시장 이름을 입력해주세요.
            </label>
          </div>

          <input
            id="market-name"
            name="marketName"
            type="text"
            autoComplete="organization"
            className={styles.shortAnswer}
            aria-label="소속된 시장 이름"
            data-node-id="148:1711"
            required
            value={marketName}
            onChange={(event) => setMarketName(event.target.value)}
          />

          <button type="submit" className={styles.nextButton} data-node-id="148:1834">
            다음
          </button>
        </form>

        <StepIndicator />
      </div>
    </main>
  );
}
