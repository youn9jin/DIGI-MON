"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SurveyOption from "@/components/survey/SurveyOption";
import DetailCriteriaModal from "@/components/onboarding/DetailCriteriaModal";

type IndustryOption = { label: string; code: string };

export default function OnboardingIndustryPage() {
    const router = useRouter();

    const options = useMemo<IndustryOption[]>(
        () => [
            { label: "제조업", code: "ELECTRONICS_MANUFACTURING" },
            { label: "도매 및 소매업", code: "WHOLESALE_RETAIL" },
            { label: "숙박 및 음식점업", code: "ACCOMMODATION_FOOD" },
            { label: "건설업", code: "CONSTRUCTION" },
            { label: "정보통신업", code: "INFORMATION_COMMUNICATION" },
            { label: "예술, 스포츠 및 여가관련 서비스업", code: "ARTS_SPORTS_LEISURE" },
        ],
        []
    );

    const [selected, setSelected] = useState<IndustryOption | null>(null);
    const [openHelp, setOpenHelp] = useState(false);

    const canSubmit = !!selected;

    const onSubmit = () => {
        if (!selected) return;

        try {
            localStorage.setItem("digimon_industry", selected.code);
        } catch {}

        router.push("/onboarding/store-name");
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
                        <h1 className="text-left text-[22px] md:text-[25px] font-bold leading-[32px] md:leading-[35px] text-black">
                            DIGI-MON 서비스를 이용하려면
                            <br />
                            사장님 가게 업종 선택이 필요해요
                        </h1>

                        <div className="mt-10 md:mt-[45px] space-y-[11px]">
                            {options.map((opt) => (
                                <SurveyOption
                                    key={opt.code}
                                    label={opt.label}
                                    selected={selected?.code === opt.code}
                                    onClick={() => setSelected(opt)}
                                    className="max-w-none"
                                />
                            ))}
                        </div>

                        <div className="mt-auto pt-10">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/onboarding/role"
                                    className="inline-flex items-center gap-2 text-[15px] leading-[20px] text-black"
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

                                <button
                                    type="button"
                                    onClick={() => setOpenHelp(true)}
                                    className="text-[12px] font-medium text-[#535353] underline underline-offset-2 hover:text-[#2e2e2e]"
                                >
                                    세부 기준이 궁금해요
                                </button>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={onSubmit}
                                    className="
                    h-[45px] w-[161px]
                    rounded-[15px]
                    text-[16px] font-medium text-[#2e2e2e]
                    transition-opacity hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(153.74761036584698deg, rgb(255, 255, 255) 0.938%, rgb(176, 201, 101) 122.54%)",
                                    }}
                                >
                                    선택 완료
                                </button>
                            </div>
                        </div>

                        <DetailCriteriaModal open={openHelp} onClose={() => setOpenHelp(false)} />
                    </section>
                </div>
            </div>

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