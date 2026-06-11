"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingData, saveOnboardingData } from "@/lib/onboarding-store";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";

const BUSINESS_TYPES = ["농/수산물", "음식점", "의류", "생활용품", "기타"];

export default function OnboardingStepFourPage() {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    () => getOnboardingData().mainCategories ?? [],
  );

  function toggleBusinessType(type: string) {
    setSelectedTypes((currentTypes) =>
      currentTypes.includes(type)
        ? currentTypes.filter((currentType) => currentType !== type)
        : [...currentTypes, type],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedTypes.length === 0) {
      return;
    }

    saveOnboardingData({ mainCategories: selectedTypes });
    router.push("/onboarding/step-5");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2076">
        <Header />

        <div className={styles.illustration} data-node-id="148:2090">
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
          className={`${styles.card} ${styles.businessCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="148:2091"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.businessQuestion}`}
            data-node-id="148:2092"
          >
            <p>질문 4.</p>
            <label id="onboarding-question">시장을 구성하고 있는 업종을 모두 선택해주세요.</label>
          </div>

          <div className={styles.businessOptionList} aria-labelledby="onboarding-question">
            {BUSINESS_TYPES.map((type) => {
              const selected = selectedTypes.includes(type);

              return (
                <label
                  key={type}
                  className={`${styles.marketTypeOption} ${
                    selected ? styles.marketTypeOptionSelected : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    name="businessTypes"
                    value={type}
                    checked={selected}
                    onChange={() => toggleBusinessType(type)}
                  />
                  <span className={styles.optionBullet} />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.businessNextButton}`}
            data-node-id="148:1713"
          >
            다음
          </button>
        </form>

        <StepIndicator step={4} />
      </div>
    </main>
  );
}
