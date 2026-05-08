"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import styles from "../onboarding.module.css";

const TOTAL_STEPS = 10;
const ACTIVE_STEP = 9;

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="10 / 10" data-node-id="148:2392">
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

export default function OnboardingStepTenPage() {
  const router = useRouter();
  const [managerName, setManagerName] = useState("");
  const [managerRole, setManagerRole] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
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

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.contactNextButton}`}
            data-node-id="148:2415"
          >
            완료
          </button>
        </form>

        <StepIndicator />
      </div>
    </main>
  );
}
