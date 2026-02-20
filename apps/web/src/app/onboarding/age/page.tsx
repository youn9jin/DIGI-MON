"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SurveyOption from "@/components/survey/SurveyOption";

export default function OnboardingAgeGroupPage() {
    const router = useRouter();

    const options = useMemo(
        () => ["10대", "20대", "30대", "40대", "50대", "60대 이상"],
        []
    );

    const [selected, setSelected] = useState<string | null>(null);
    const canSubmit = !!selected;

    const onSubmit = () => {
        if (!selected) return;

        try {
            localStorage.setItem("digimon_age_group", selected);
        } catch {}

        // TODO: 다음 페이지로 변경
        router.push("/onboarding/next");
    };

    return (
        <main className="min-h-[calc(100vh-70px)] bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 pt-10 md:pt-[83px] pb-16">
                <div className="flex justify-center">
                    <section
                        className="
              relative w-full max-w-[849px]
              rounded-[40px] bg-white
              shadow-[0px_2px_2px_0px_#B0C965]
              px-[clamp(20px,5.2vw,75px)]
              pt-[55px] pb-[56px]
              min-h-[772px]
              flex flex-col
            "
                    >
                        {/* 타이틀 */}
                        <h1 className="text-left text-[22px] md:text-[25px] font-bold leading-[35px] text-black">
                            DIGI-MON 서비스를 이용하려면
                            <br />
                            사장님 나이 연령대가 필요해요
                        </h1>

                        {/* 선택지 */}
                        <div className="mt-10 md:mt-[45px] space-y-[11px]">
                            {options.map((opt) => (
                                <SurveyOption
                                    key={opt}
                                    label={opt}
                                    selected={selected === opt}
                                    onClick={() => setSelected(opt)}
                                    className="max-w-none"
                                />
                            ))}
                        </div>

                        {/* 하단 */}
                        <div className="mt-auto pt-10">
                            {/* ✅ absolute 대신 grid로 안정적으로 배치 */}
                            <div className="grid grid-cols-3 items-center">
                                {/* 왼쪽: 이전 화면 */}
                                <Link
                                    href="/onboarding/location"
                                    className="inline-flex items-center gap-2 text-[15px] leading-[20px] text-black justify-self-start"
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path
                                            d="M15 18l-6-6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    이전 화면으로 돌아가기
                                </Link>

                                {/* 가운데: 선택 완료 */}
                                <button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={onSubmit}
                                    className="
                    h-[45px] w-[161px]
                    rounded-[15px]
                    inline-flex items-center justify-center
                    text-[16px] font-medium text-[#2e2e2e]
                    whitespace-nowrap
                    transition-opacity hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    justify-self-center
                  "
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(153.74761036584698deg, rgb(255, 255, 255) 23.938%, rgb(176, 201, 101) 122.54%)",
                                    }}
                                >
                                    선택 완료
                                </button>

                                {/* 오른쪽 공간 맞추기용 */}
                                <div className="justify-self-end" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* 도움 요청하기 버튼 */}
            <button
                type="button"
                onClick={() => router.push("/help")}
                className="
          fixed bottom-8 right-8 z-20
          h-[74px] w-[193px]
          rounded-[50px]
          bg-[#E0F0AF]
          shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]
          text-[18px] font-semibold text-[#585858]
          hover:opacity-90 transition
        "
            >
                도움 요청하기
            </button>
        </main>
    );
}