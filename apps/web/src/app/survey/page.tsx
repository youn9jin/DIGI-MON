"use client";

import Image from "next/image";
import { useState } from "react";
import QuestionBox from "@/components/survey/QuestionBox";

const TOTAL_STEPS = 6;

const STEP_1 = {
  title: "사장님 가게의 업종을 골라주세요.",
  options: [
    "제조업",
    "도매 및 소매업",
    "숙박 및 음식점업",
    "건설업",
    "정보통신업",
    "예술, 스포츠 및 여가 관련 서비스업",
  ],
  helpLinkLabel: "세부 기준이 궁금해요" as const,
};

const STEP_2 = {
  title:
    "현재 가게 정보가 온라인에 얼마나 정리되어 있나요?",
  options: [
    "전혀 정리되지 않음(검색해도 나오지 않음)",
    "기본 정보만 확인 가능함(이름, 위치)",
    "판매 품목 및 사진 일부 확인 가능함",
    "정보 대부분 정리되어있음",
    "항상 직접 관리하고 있음",
  ],
} as const;

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | null>>({
    1: null,
    2: null,
  });

  const stepConfig = currentStep === 1 ? STEP_1 : STEP_2;
  const selected = answers[currentStep] ?? null;
  const isStep1 = currentStep === 1;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleSubmit = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("survey complete", answers);
    }
  };

  const progressPercent =
    (currentStep - 1) / TOTAL_STEPS * 100 +
    (selected ? (1 / TOTAL_STEPS) * 100 : 0);

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      <div className="absolute inset-0 flex justify-center">
        <div className="mt-[-20px] w-full max-w-[1517px] rounded-[30px] bg-[#fafafa]" />
      </div>

      <div className="absolute inset-x-0 top-[185px] flex justify-center pointer-events-none">
        <div className="w-full max-w-[1432px]">
          <Image
            src="/images/survey-bg.png"
            alt="배경 이미지"
            width={1432}
            height={799}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-[150px] pb-16">
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
            helpLinkLabel={isStep1 ? STEP_1.helpLinkLabel : undefined}
            onHelpClick={isStep1 ? () => console.log("open help") : undefined}
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
