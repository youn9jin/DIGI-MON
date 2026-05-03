"use client";

type SurveyOptionProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

export default function SurveyOption({
  label,
  selected,
  onClick,
  className,
}: SurveyOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative w-full max-w-[917px] h-[73px] rounded-[15px] text-left overflow-hidden",
        selected
          ? "border border-[#b0c965] bg-[#b0c965]" 
          : "border-[0.6px] border-[#dedede] bg-white", 
        className ?? "",
      ].join(" ")}
    >
      {/* 선택 상태일 때만 내부 연두 배경 레이어 */}
      {selected && (
        <>
          <div className="absolute inset-0 rounded-[15px] bg-[#b0c965]" />
          <div className="absolute inset-y-0 right-0 left-[4px] rounded-[15px] bg-[#e9efd8]" />
        </>
      )}

      {/* 내용 영역 */}
      <div className="relative z-10 flex h-full items-center px-6">
        {/* 왼쪽 동그라미*/}
        <span
          className={[
            "relative shrink-0 rounded-full h-[26px] w-[26px]",
            selected
              ? "bg-white border-[1.4px] border-[#b0c965]" // 선택
              : "bg-[#f7f7f7] border border-[#f0f0f0]", // 미선택
          ].join(" ")}
        >
          {selected && (
            <span className="absolute left-1/2 top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b0c965]" />
          )}
        </span>

        {/* 라벨 텍스트 */}
        <span className="ml-4 text-[18px] leading-[1.2] text-black">
          {label}
        </span>
      </div>
    </button>
  );
}