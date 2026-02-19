"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionBox from "@/components/survey/QuestionBox";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const TOTAL_STEPS = 5;

const STEP_1 = {
  title: "구글 지도에서 가게 이름을 검색하면 바로 찾을 수 있나요?",
  options: ["바로 나온다", "잘 모르겠다", "안 나온다"],
} as const;

const STEP_2 = {
  title: "기본 정보(가게 위치, 영업시간 등)가 정확하게 보이나요?",
  options: ["다 맞게 있다", "일부만 있거나 틀림", "없다 / 모르겠다"],
} as const;

const STEP_3 = {
  title: "가게에서 판매하는 품목이나 제공 서비스가 사진이나 설명으로 잘 보이나요?",
  options: ["충분히 있다", "조금만 있다", "거의 없다"],
} as const;

const STEP_4 = {
  title: "온라인 상으로 가게 소식을 전할 수 있는 방법이 있나요?",
  options: ["있다 (카카오 채널, 메시지 등)", "있는지 모르겠다", "없다"],
} as const;

const STEP_5 = {
  title: "지금 가장 먼저 해결하고 싶은 것은 무엇인가요?",
  options: [
    "가게 접근성 높이기",
    "가게를 좋아보이게 하기",
    "연락이 잘 오게 하기",
    "잘 모르겠다",
  ],
} as const;

export default function SurveyPage() {
  const router = useRouter();

  // ✅ 로그인 상태면 이 페이지 못 보게
  const [readyForGuest, setReadyForGuest] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/action-plan");
      } else {
        setReadyForGuest(true);
      }
    });
    return () => unsub();
  }, [router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });

  const stepConfig =
      currentStep === 1
          ? STEP_1
          : currentStep === 2
              ? STEP_2
              : currentStep === 3
                  ? STEP_3
                  : currentStep === 4
                      ? STEP_4
                      : STEP_5;

  const selected = answers[currentStep] ?? null;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleSubmit = () => {
    if (!selected) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    try {
      sessionStorage.setItem("surveyAnswers", JSON.stringify(answers));
    } catch (e) {
      console.warn("sessionStorage save failed:", e);
    }

    router.push("/survey/result");
  };

  const progressPercent =
      ((currentStep - 1) / TOTAL_STEPS) * 100 +
      (selected ? (1 / TOTAL_STEPS) * 100 : 0);

  // ✅ 게스트 확인 전에는 깜빡임 방지
  if (!readyForGuest) return null;

  return (
      <div className="relative min-h-screen w-full bg-[#fafafa]">
        {/* 배경 일러스트 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[185px] w-full max-w-[1432px] pointer-events-none">
          <Image
              src="/images/survey-bg.png"
              alt="배경 이미지"
              width={1432}
              height={799}
              className="w-full h-auto object-contain"
              priority
          />
        </div>

        {/* 컨텐츠 */}
        <main className="relative z-10 flex flex-col items-center px-4 pt-[140px] pb-[120px]">
          <p className="text-center text-[16px] md:text-[18px] text-[#6e6e6e] max-w-[720px]">
            로그인 후 &apos;내 가게&apos;에서 언제든지 정보를 수정할 수 있어요!
          </p>

          <div className="mt-8 w-full flex justify-center">
            <QuestionBox
                step={currentStep}
                totalSteps={TOTAL_STEPS}
                title={stepConfig.title}
                options={[...stepConfig.options]}
                selected={selected}
                onSelect={handleSelect}
                onSubmit={handleSubmit}
            />
          </div>

          <div className="mt-10 w-full max-w-[597px]">
            <div className="h-[8px] w-full rounded-[41px] border border-[#b0c965] bg-white overflow-hidden">
              <div
                  className="h-full rounded-[41px] bg-[#b0c965] transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </main>
      </div>
  );
}
