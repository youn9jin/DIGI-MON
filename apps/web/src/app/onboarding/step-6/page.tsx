"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { saveOnboardingData } from "@/lib/onboarding-store";
import StepIndicator from "@/components/ui/StepIndicator";
import styles from "../onboarding.module.css";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

function TimeSelect({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour, setHour] = useState(value ? value.split(":")[0] : "");
  const [minute, setMinute] = useState(value ? value.split(":")[1] : "");

  function handleHourChange(h: string) {
    setHour(h);
    onChange(h && minute ? `${h}:${minute}` : "");
  }

  function handleMinuteChange(m: string) {
    setMinute(m);
    onChange(hour && m ? `${hour}:${m}` : "");
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.4vw, 8px)", flex: 1 }}>
      <select
        name={`${name}Hour`}
        aria-label={`${label} 시`}
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        style={{ flex: 1 }}
      >
        <option value="">시</option>
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span style={{ fontWeight: 500, color: "#3b3b3b", flexShrink: 0 }}>:</span>
      <select
        name={`${name}Minute`}
        aria-label={`${label} 분`}
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        style={{ flex: 1 }}
      >
        <option value="">분</option>
        {MINUTE_OPTIONS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </span>
  );
}

export default function OnboardingStepSixPage() {
  const router = useRouter();
  const [weekdayOpen, setWeekdayOpen] = useState("");
  const [weekdayClose, setWeekdayClose] = useState("");
  const [weekendOpen, setWeekendOpen] = useState("");
  const [weekendClose, setWeekendClose] = useState("");
  const [closedSunday, setClosedSunday] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!weekdayOpen || !weekdayClose || !weekendOpen || !weekendClose) {
      return;
    }

    saveOnboardingData({ weekdayOpen, weekdayClose, weekendOpen, weekendClose, closedSunday });
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
              <TimeSelect
                name="weekdayOpen"
                label="평일 운영 시작 시간"
                value={weekdayOpen}
                onChange={setWeekdayOpen}
              />
              <span>~</span>
              <TimeSelect
                name="weekdayClose"
                label="평일 운영 종료 시간"
                value={weekdayClose}
                onChange={setWeekdayClose}
              />
            </div>
          </fieldset>

          <fieldset className={`${styles.hoursFieldset} ${styles.weekendHours}`}>
            <legend>주말(토 ~ 일)</legend>
            <div className={styles.timeRangeInput}>
              <TimeSelect
                name="weekendOpen"
                label="주말 운영 시작 시간"
                value={weekendOpen}
                onChange={setWeekendOpen}
              />
              <span>~</span>
              <TimeSelect
                name="weekendClose"
                label="주말 운영 종료 시간"
                value={weekendClose}
                onChange={setWeekendClose}
              />
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
          >
            다음
          </button>
        </form>

        <StepIndicator step={6} />
      </div>
    </main>
  );
}
