"use client";

import Image from "next/image";
import { useState } from "react";
import QuestionBox from "@/components/survey/QuestionBox";

const OPTIONS = [
  "제조업",
  "도매 및 소매업",
  "숙박 및 음식점업",
  "건설업",
  "정보통신업",
  "예술, 스포츠 및 여가 관련 서비스업",
];

export default function SurveyPage() {
  const [selected, setSelected] = useState<string | null>(null);

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

      {/* 본문 */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-[150px] pb-16">
        {/* 안내 문구 */}
        <p className="text-center text-[16px] md:text-[18px] text-[#6e6e6e] max-w-[720px]">
          로그인 후 ‘내 가게&apos;에서 언제든지 정보를 수정할 수 있어요!
        </p>

        {/* 질문 박스*/}
        <div className="mt-8 w-full flex justify-center">
        <QuestionBox
            step={1}
            totalSteps={6}
            title="사장님 가게의 업종을 골라주세요."
            options={OPTIONS}
            selected={selected}
            onSelect={setSelected}
            onSubmit={() => console.log("next")}
            helpLinkLabel="세부 기준이 궁금해요"
            onHelpClick={() => console.log("open help")}
          />
        </div>

        {/* 진행바 */}
        <div className="mt-10 w-full max-w-[597px]">
          <div className="h-[8px] w-full rounded-[41px] border border-[#b0c965] bg-white overflow-hidden">
            <div
              className="h-full rounded-[41px] bg-[#b0c965] transition-[width] duration-300"
              style={{ width: selected ? "22%" : "0%" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
