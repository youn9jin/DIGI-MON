"use client";

import { useState } from "react";
import SurveyOption from "@/components/survey/SurveyOption";
import DetailCriteriaModal from "@/components/survey/DetailCriteriaModal";

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
      <section className="w-full max-w-[814px] rounded-[40px] bg-white/95 shadow-[0px_4px_4px_2px_rgba(176,201,101,0.2)] px-6 py-8 md:px-10 md:py-10">
        <p className="text-[#b0c965] text-[22px] md:text-[25px] font-semibold">
          {totalSteps}문제 중 {step}번째 질문
        </p>

        <h2 className="mt-4 text-[#2e2e2e] text-[18px] md:text-[22px] font-semibold">
          {title}
        </h2>

        <div className="mt-8 space-y-4">
          {options.map((opt) => (
            <SurveyOption
              key={opt}
              label={opt}
              selected={selected === opt}
              onClick={() => onSelect(opt)}
            />
          ))}
        </div>

        <div className="mt-10">
          {helpLinkLabel && (
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={handleHelpClick}
                className="text-[12px] text-[#535353] underline"
              >
                {helpLinkLabel}
              </button>
            </div>
          )}

          <div className={helpLinkLabel ? "mt-3" : "mt-0"}>
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={onSubmit}
                className={[
                  "flex items-center justify-center",
                  "rounded-[15px]",
                  "text-[16px] font-medium whitespace-nowrap",
                  "w-[161px] h-[45px]",
                  canSubmit
                    ? "text-[#2e2e2e] hover:opacity-95 transition border-0"
                    : "bg-white text-[#2e2e2e]/50 cursor-not-allowed",
                ].join(" ")}
                style={
                  canSubmit
                    ? {
                        backgroundImage:
                          "linear-gradient(153.74761036584698deg, rgb(255, 255, 255) 23.938%, rgb(176, 201, 101) 122.54%)",
                      }
                    : {
                        border: "0.6px solid #DEDEDE",
                      }
                }
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 팝업 렌더링 */}
      <DetailCriteriaModal open={openHelp} onClose={() => setOpenHelp(false)} />
    </>
  );
}
