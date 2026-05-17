import Image from "next/image";
import styles from "@/app/onboarding/onboarding.module.css";

const TOTAL_STEPS = 10;

interface StepIndicatorProps {
  /** 현재 활성 스텝 (1~10) */
  step: number;
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  const activeIndex = step - 1;

  return (
    <div
      className={styles.stepIndicator}
      aria-label={`${step} / ${TOTAL_STEPS}`}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <Image
          key={index}
          src={
            index === activeIndex
              ? "/images/onboarding/step-active.svg"
              : "/images/onboarding/step-inactive.svg"
          }
          alt=""
          width={index === activeIndex ? 25 : 22}
          height={index === activeIndex ? 25 : 22}
          className={index === activeIndex ? styles.stepActive : styles.stepInactive}
        />
      ))}
    </div>
  );
}
