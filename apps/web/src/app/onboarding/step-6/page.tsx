"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  getOnboardingData,
  saveOnboardingData,
} from "@/lib/onboarding-store";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

interface TimeValue {
  hour: string;
  minute: string;
}

function splitTime(value?: string): TimeValue {
  const [hour = "", minute = ""] = value?.split(":") ?? [];
  return { hour, minute };
}

function TimeField({
  name,
  label,
  unit,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  unit: "시" | "분";
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.timeField}>
      <select
        name={name}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        <option value="" aria-label={`${unit} 선택`} />
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span>{unit}</span>
    </label>
  );
}

export default function OnboardingStepSixPage() {
  const router = useRouter();
  const [savedData] = useState(getOnboardingData);
  const [weekdayOpen, setWeekdayOpen] = useState<TimeValue>(() =>
    splitTime(savedData.weekdayOpen),
  );
  const [weekdayClose, setWeekdayClose] = useState<TimeValue>(() =>
    splitTime(savedData.weekdayClose),
  );
  const [weekendOpen, setWeekendOpen] = useState<TimeValue>(() =>
    splitTime(savedData.weekendOpen),
  );
  const [weekendClose, setWeekendClose] = useState<TimeValue>(() =>
    splitTime(savedData.weekendClose),
  );
  const [closedSunday, setClosedSunday] = useState(
    savedData.closedSunday ?? false,
  );

  const isComplete = [
    weekdayOpen.hour,
    weekdayOpen.minute,
    weekdayClose.hour,
    weekdayClose.minute,
    weekendOpen.hour,
    weekendOpen.minute,
    weekendClose.hour,
    weekendClose.minute,
  ].every(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isComplete) return;

    saveOnboardingData({
      weekdayOpen: `${weekdayOpen.hour}:${weekdayOpen.minute}`,
      weekdayClose: `${weekdayClose.hour}:${weekdayClose.minute}`,
      weekendOpen: `${weekendOpen.hour}:${weekendOpen.minute}`,
      weekendClose: `${weekendClose.hour}:${weekendClose.minute}`,
      closedSunday,
    });
    router.push("/onboarding/step-7");
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.canvas} data-node-id="148:2210">
        <Header />

        <div className={styles.illustration} data-node-id="148:2224">
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
          className={`${styles.card} ${styles.hoursCard}`}
          aria-labelledby="onboarding-question"
          data-node-id="148:2246"
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.hoursQuestion}`}
            data-node-id="148:2247"
          >
            <p>질문 6.</p>
            <label id="onboarding-question">요일별 시장 운영 시간을 입력해주세요</label>
          </div>

          <fieldset className={`${styles.hoursFieldset} ${styles.weekdayHours}`}>
            <legend>평일(월 ~ 금)</legend>
            <div className={styles.timeRangeInput}>
              <div className={styles.timePair}>
                <TimeField
                  name="weekdayOpenHour"
                  label="평일 운영 시작 시"
                  unit="시"
                  options={HOUR_OPTIONS}
                  value={weekdayOpen.hour}
                  onChange={(hour) =>
                    setWeekdayOpen((current) => ({ ...current, hour }))
                  }
                />
                <TimeField
                  name="weekdayOpenMinute"
                  label="평일 운영 시작 분"
                  unit="분"
                  options={MINUTE_OPTIONS}
                  value={weekdayOpen.minute}
                  onChange={(minute) =>
                    setWeekdayOpen((current) => ({ ...current, minute }))
                  }
                />
              </div>
              <span className={styles.rangeWord}>부터</span>
              <div className={styles.timePair}>
                <TimeField
                  name="weekdayCloseHour"
                  label="평일 운영 종료 시"
                  unit="시"
                  options={HOUR_OPTIONS}
                  value={weekdayClose.hour}
                  onChange={(hour) =>
                    setWeekdayClose((current) => ({ ...current, hour }))
                  }
                />
                <TimeField
                  name="weekdayCloseMinute"
                  label="평일 운영 종료 분"
                  unit="분"
                  options={MINUTE_OPTIONS}
                  value={weekdayClose.minute}
                  onChange={(minute) =>
                    setWeekdayClose((current) => ({ ...current, minute }))
                  }
                />
              </div>
              <span className={styles.rangeWord}>까지</span>
            </div>
          </fieldset>

          <fieldset className={`${styles.hoursFieldset} ${styles.weekendHours}`}>
            <legend>주말(토 ~ 일)</legend>
            <div className={styles.timeRangeInput}>
              <div className={styles.timePair}>
                <TimeField
                  name="weekendOpenHour"
                  label="주말 운영 시작 시"
                  unit="시"
                  options={HOUR_OPTIONS}
                  value={weekendOpen.hour}
                  onChange={(hour) =>
                    setWeekendOpen((current) => ({ ...current, hour }))
                  }
                />
                <TimeField
                  name="weekendOpenMinute"
                  label="주말 운영 시작 분"
                  unit="분"
                  options={MINUTE_OPTIONS}
                  value={weekendOpen.minute}
                  onChange={(minute) =>
                    setWeekendOpen((current) => ({ ...current, minute }))
                  }
                />
              </div>
              <span className={styles.rangeWord}>부터</span>
              <div className={styles.timePair}>
                <TimeField
                  name="weekendCloseHour"
                  label="주말 운영 종료 시"
                  unit="시"
                  options={HOUR_OPTIONS}
                  value={weekendClose.hour}
                  onChange={(hour) =>
                    setWeekendClose((current) => ({ ...current, hour }))
                  }
                />
                <TimeField
                  name="weekendCloseMinute"
                  label="주말 운영 종료 분"
                  unit="분"
                  options={MINUTE_OPTIONS}
                  value={weekendClose.minute}
                  onChange={(minute) =>
                    setWeekendClose((current) => ({ ...current, minute }))
                  }
                />
              </div>
              <span className={styles.rangeWord}>까지</span>
            </div>
          </fieldset>

          <label className={styles.sundayClosedLabel}>
            <input
              type="checkbox"
              name="closedSunday"
              checked={closedSunday}
              onChange={(event) => setClosedSunday(event.target.checked)}
            />
            <span>일요일에는 시장을 운영하지 않습니다.</span>
          </label>

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.hoursNextButton}`}
            data-node-id="148:2248"
            disabled={!isComplete}
          >
            다음
          </button>
        </form>

        <StepIndicator step={6} />
      </div>
    </main>
  );
}
