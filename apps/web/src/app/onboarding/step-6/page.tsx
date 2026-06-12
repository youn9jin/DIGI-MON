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

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

interface TimeValue {
  hour: string;
  minute: string;
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
type Day = (typeof DAYS)[number];

function isDay(value: string): value is Day {
  return DAYS.includes(value as Day);
}

function isWeekday(day: Day) {
  return day !== "토" && day !== "일";
}

function getInitialDays(data: ReturnType<typeof getOnboardingData>): Day[] {
  const savedDays = data.operatingDays?.filter(isDay);
  if (savedDays?.length) return DAYS.filter((day) => savedDays.includes(day));

  const inferred: Day[] = [];
  if (data.weekdayOpen || data.weekdayClose) {
    inferred.push("월", "화", "수", "목", "금");
  }
  if (data.weekendOpen || data.weekendClose) {
    inferred.push("토");
    if (!data.closedSunday) inferred.push("일");
  }
  return inferred;
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
  const [closedHolidays, setClosedHolidays] = useState(
    savedData.closedHolidays ?? false,
  );
  const [selectedDays, setSelectedDays] = useState<Day[]>(() =>
    getInitialDays(savedData),
  );
  const [activeDay, setActiveDay] = useState<Day | null>(
    () => getInitialDays(savedData)[0] ?? null,
  );
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const activeIsWeekday = activeDay ? isWeekday(activeDay) : true;
  const activeOpen = activeIsWeekday ? weekdayOpen : weekendOpen;
  const activeClose = activeIsWeekday ? weekdayClose : weekendClose;
  const hasWeekday = selectedDays.some(isWeekday);
  const hasWeekend = selectedDays.some((day) => !isWeekday(day));
  const weekdayIsComplete = [
    weekdayOpen.hour,
    weekdayOpen.minute,
    weekdayClose.hour,
    weekdayClose.minute,
  ].every(Boolean);
  const weekendIsComplete = [
    weekendOpen.hour,
    weekendOpen.minute,
    weekendClose.hour,
    weekendClose.minute,
  ].every(Boolean);
  const isComplete =
    selectedDays.length > 0 &&
    (!hasWeekday || weekdayIsComplete) &&
    (!hasWeekend || weekendIsComplete);

  function updateActiveOpen(next: TimeValue) {
    if (activeIsWeekday) {
      setWeekdayOpen(next);
      if (!weekendOpen.hour && !weekendOpen.minute && hasWeekend) {
        setWeekendOpen(next);
      }
    } else {
      setWeekendOpen(next);
      if (!weekdayOpen.hour && !weekdayOpen.minute && hasWeekday) {
        setWeekdayOpen(next);
      }
    }
  }

  function updateActiveClose(next: TimeValue) {
    if (activeIsWeekday) {
      setWeekdayClose(next);
      if (!weekendClose.hour && !weekendClose.minute && hasWeekend) {
        setWeekendClose(next);
      }
    } else {
      setWeekendClose(next);
      if (!weekdayClose.hour && !weekdayClose.minute && hasWeekday) {
        setWeekdayClose(next);
      }
    }
  }

  function selectDay(day: Day) {
    setActiveDay(day);
    setIsDayPickerOpen(false);
  }

  function toggleDay(day: Day) {
    setSelectedDays((current) => {
      const isRemoving = current.includes(day);
      const next = isRemoving
        ? current.filter((selectedDay) => selectedDay !== day)
        : DAYS.filter(
            (candidate) => current.includes(candidate) || candidate === day,
          );

      if (isRemoving && activeDay === day) {
        setActiveDay(next[0] ?? null);
      } else if (!isRemoving) {
        setActiveDay(day);
      }

      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isComplete) {
      setValidationMessage("운영 요일과 시간을 모두 입력해주세요.");
      return;
    }

    setValidationMessage("");
    const fallbackOpen = hasWeekday ? weekdayOpen : weekendOpen;
    const fallbackClose = hasWeekday ? weekdayClose : weekendClose;

    saveOnboardingData({
      weekdayOpen: `${hasWeekday ? weekdayOpen.hour : fallbackOpen.hour}:${hasWeekday ? weekdayOpen.minute : fallbackOpen.minute}`,
      weekdayClose: `${hasWeekday ? weekdayClose.hour : fallbackClose.hour}:${hasWeekday ? weekdayClose.minute : fallbackClose.minute}`,
      weekendOpen: `${hasWeekend ? weekendOpen.hour : fallbackOpen.hour}:${hasWeekend ? weekendOpen.minute : fallbackOpen.minute}`,
      weekendClose: `${hasWeekend ? weekendClose.hour : fallbackClose.hour}:${hasWeekend ? weekendClose.minute : fallbackClose.minute}`,
      operatingDays: selectedDays,
      closedSunday: !selectedDays.includes("일"),
      closedHolidays,
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
          noValidate
          onSubmit={handleSubmit}
        >
          <div
            className={`${styles.questionText} ${styles.hoursQuestion}`}
            data-node-id="148:2247"
          >
            <p>질문 6.</p>
            <label id="onboarding-question">요일별 시장 운영 시간을 입력해주세요</label>
          </div>

          <div className={styles.daySelectorArea}>
            <div className={styles.daySelector} aria-label="운영 요일 선택">
              {selectedDays.map((day) => {
                const isActive = activeDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    className={[
                      styles.dayButton,
                      styles.dayButtonSelected,
                      isActive ? styles.dayButtonActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed="true"
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
              <button
                type="button"
                className={styles.addDayButton}
                aria-label="운영 요일 추가"
                aria-expanded={isDayPickerOpen}
                onClick={() => setIsDayPickerOpen((current) => !current)}
              >
                +
              </button>
            </div>

            {isDayPickerOpen && (
              <div className={styles.dayPicker} aria-label="추가할 요일 선택">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={[
                      styles.dayPickerButton,
                      selectedDays.includes(day)
                        ? styles.dayPickerButtonSelected
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selectedDays.includes(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          <fieldset className={`${styles.hoursFieldset} ${styles.singleHours}`}>
            <legend>
              {activeDay ? `${activeDay}요일 운영 시간` : "운영 시간"}
            </legend>
            {activeDay ? (
              <div className={styles.timeRangeInput}>
                <div className={styles.timePair}>
                  <TimeField
                    name="openHour"
                    label={`${activeDay}요일 운영 시작 시`}
                    unit="시"
                    options={HOUR_OPTIONS}
                    value={activeOpen.hour}
                    onChange={(hour) =>
                      updateActiveOpen({ ...activeOpen, hour })
                    }
                  />
                  <TimeField
                    name="openMinute"
                    label={`${activeDay}요일 운영 시작 분`}
                    unit="분"
                    options={MINUTE_OPTIONS}
                    value={activeOpen.minute}
                    onChange={(minute) =>
                      updateActiveOpen({ ...activeOpen, minute })
                    }
                  />
                </div>
                <span className={styles.rangeWord}>부터</span>
                <div className={styles.timePair}>
                  <TimeField
                    name="closeHour"
                    label={`${activeDay}요일 운영 종료 시`}
                    unit="시"
                    options={HOUR_OPTIONS}
                    value={activeClose.hour}
                    onChange={(hour) =>
                      updateActiveClose({ ...activeClose, hour })
                    }
                  />
                  <TimeField
                    name="closeMinute"
                    label={`${activeDay}요일 운영 종료 분`}
                    unit="분"
                    options={MINUTE_OPTIONS}
                    value={activeClose.minute}
                    onChange={(minute) =>
                      updateActiveClose({ ...activeClose, minute })
                    }
                  />
                </div>
                <span className={styles.rangeWord}>까지</span>
              </div>
            ) : (
              <p className={styles.dayPrompt}>
                + 버튼을 눌러 운영 요일을 추가해주세요.
              </p>
            )}
          </fieldset>

          <label className={styles.holidayClosedLabel}>
            <input
              type="checkbox"
              name="closedHolidays"
              checked={closedHolidays}
              onChange={(event) => setClosedHolidays(event.target.checked)}
            />
            <span>공휴일에는 시장을 운영하지 않습니다.</span>
          </label>

          {validationMessage && (
            <p className={styles.hoursValidationMessage} role="alert">
              {validationMessage}
            </p>
          )}

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
