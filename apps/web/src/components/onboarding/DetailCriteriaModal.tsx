"use client";

import { useEffect } from "react";

type DetailCriteriaModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function DetailCriteriaModal({
  open,
  onClose,
}: DetailCriteriaModalProps) {
  useEffect(() => {
    if (!open) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-criteria-title"
    >
      {/* dim */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-default"
        onClick={onClose}
        aria-label="close modal background"
      />

      {/* modal box */}
      <div className="relative z-[1000] w-full max-w-[613px] max-h-[85vh] bg-white rounded-t-[24px] rounded-b-[12px] border border-[#a0c49d] shadow-[0px_4px_20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
        {/* content area */}
        <div
          id="detail-criteria-title"
          className="px-8 pt-8 pb-8 overflow-y-auto text-left flex-1"
        >
          <p className="text-[15px] leading-[22px] text-black">
            소상공인은{" "}
            <span className="font-semibold text-black">
              상시 근로자가 5명 미만인 소기업
            </span>
            을 뜻해요.
          </p>

          <div className="h-5" />

          <p className="text-[16px] font-bold leading-[22px] text-black">
            상시 근로자란?
          </p>
          <div className="h-2" />
          <div className="text-[14px] leading-[22px] text-black space-y-2">
            <p className="m-0">
              상시 근로자는 1개월 동안 60시간 이상 일한 근로자예요.
            </p>
            <p className="m-0">
              일용근로자, 3개월 이내의 계약을 맺어 단기적으로 근로하는 사람
              등은 제외합니다.
            </p>
            <p className="m-0">
              정확한 기준은{" "}
              <span className="font-semibold text-[#b0c965]">
                [근로기준법] 제2조제1항제1호
              </span>
              에서 확인할 수 있어요.
            </p>
          </div>

          <div className="h-5" />

          <p className="text-[16px] font-bold leading-[22px] text-black">
            소기업이란?
          </p>
          <div className="h-2" />
          <div className="text-[14px] leading-[22px] text-black space-y-2">
            <p className="m-0">
              정부는 기업의 연평균 매출액을 기준으로 중기업, 소기업으로
              나눠요.
            </p>
            <p className="m-0">
              더 많은 업종의 매출액 기준이 궁금하다면{" "}
              <span className="font-semibold text-[#b0c965]">중소벤처기업부 </span>
              자료를 참고하세요.
            </p>
          </div>

          <div className="h-5" />

          <p className="text-[16px] font-bold leading-[22px] text-black">
            연평균 매출액 기준
          </p>
          <ul className="mt-2 list-disc pl-5 text-[14px] leading-[22px] text-black space-y-1">
            <li>도매 및 소매업 : 50억원 이하</li>
            <li>
              전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업 : 120억원 이하
            </li>
            <li>농업, 임업 및 어업 : 80억원 이하</li>
            <li>전문, 과학 및 기술 서비스업 : 30억원 이하</li>
            <li>숙박 및 음식점업 : 10억원 이하</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
