"use client";

import { useState } from "react";
import SurveyOption from "@/components/survey/SurveyOption";
import DetailCriteriaModal from "@/components/onboarding/DetailCriteriaModal";

type QuestionBoxProps = {
  step: number;
  totalSteps: number;
  title: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onSubmit?: () => void;

  helpLinkLabel?: string;
  onHelpClick?: () => void;
};

export default function QuestionBox({
  step,
  totalSteps,
  title,
  options,
  selected,
  onSelect,
  onSubmit,
  helpLinkLabel,
  onHelpClick,
}: QuestionBoxProps) {
  const canSubmit = !!selected;

  // 팝업 상태(QuestionBox 내부에서 관리)
  const [openHelp, setOpenHelp] = useState(false);

  const handleHelpClick = () => {
    // 부모에서 따로 처리할 게 있으면 실행
    onHelpClick?.();
    // 그리고 모달 열기
    setOpenHelp(true);
  };

  return (
    <>
      <section className="w-full max-w-[814px] rounded-[40px] bg-white/95 shadow-[0px_4px_4px_2px_rgba(176,201,101,0.2)] px-[48px] py-[60px]">
        {/* 진행 상태 */}
        <p className="text-[#b0c965] text-[25px] font-semibold">
          {totalSteps}문제 중 {step}번째 질문
        </p>

        {/* 질문 제목 */}
        <h2 className="mt-[11px] text-[#2e2e2e] text-[22px] font-semibold">
          {title}
        </h2>

        {/* 선택지 목록 */}
        <div className="mt-[28px] space-y-[11px]">
          {options.map((opt) => (
            <SurveyOption
              key={opt}
              label={opt}
              selected={selected === opt}
              onClick={() => onSelect(opt)}
            />
          ))}
        </div>

        {/* 하단 영역 */}
        <div className="mt-[51px]">
          {/* 도움말 링크 */}
          {helpLinkLabel && (
            <div className="flex w-full justify-end mb-[28px]">
              <button
                type="button"
                onClick={handleHelpClick}
                className="text-[12px] font-medium text-[#535353] underline hover:text-[#2e2e2e]"
              >
                {helpLinkLabel}
              </button>
            </div>
          )}

          {/* 선택 완료 버튼 */}
          <div className="flex justify-center">
            <button
                type="button"
                disabled={!canSubmit}
                onClick={() => onSubmit?.()}
              className="px-[65px] py-[17px] rounded-[15px] text-[16px] font-medium text-[#2e2e2e] whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage: "linear-gradient(153.74761036584698deg, rgb(255, 255, 255) 0.938%, rgb(176, 201, 101) 122.54%)",
              }}
            >
              선택 완료
            </button>
          </div>
        </div>
      </section>

      {/* 팝업 렌더링 */}
      <DetailCriteriaModal open={openHelp} onClose={() => setOpenHelp(false)} />
    </>
  );
}
