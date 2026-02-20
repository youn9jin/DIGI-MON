"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function OnboardingStoreNamePage() {
    const router = useRouter();
    const [storeName, setStoreName] = useState("");

    const canSubmit = storeName.trim().length > 0;

    const onSubmit = () => {
        if (!canSubmit) return;

        try {
            localStorage.setItem("digimon_store_name", storeName.trim());
        } catch {}

        // TODO: 다음 단계 라우트로 변경
        alert(`상호명 저장 완료: ${storeName.trim()}`);
        // router.push("/onboarding/next");
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
              min-h-[398px]
              flex flex-col
            "
                    >
                        {/* 타이틀 */}
                        <h1 className="text-left text-[22px] md:text-[25px] font-bold leading-[32px] md:leading-[35px] text-black">
                            DIGI-MON 서비스를 이용하려면
                            <br />
                            사장님 가게 상호명이 필요해요
                        </h1>

                        {/* 입력 */}
                        <div className="mt-10">
                            <input
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="상호명을 입력해주세요"
                                className="
                  w-full h-[70px]
                  rounded-[20px]
                  border border-[#BBB]
                  px-6
                  text-[18px] text-black
                  outline-none
                  focus:border-[#B0C965]
                "
                            />

                            {/* ✅ Figma처럼: 입력창 바로 아래 왼쪽에 '이전 화면으로' */}
                            <div className="mt-3">
                                <Link
                                    href="/onboarding/industry"
                                    className="inline-flex items-center gap-2 text-[12px] leading-[16px] text-[#2e2e2e]"
                                >
                                    <span className="text-[14px] leading-none">‹</span>
                                    이전 화면으로 돌아가기
                                </Link>
                            </div>
                        </div>

                        {/* ✅ 버튼은 아래쪽 가운데 */}
                        <div className="mt-10 flex justify-center">
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
                                        "linear-gradient(153.74761036584698deg, rgb(255, 255, 255) 23.938%, rgb(176, 201, 101) 122.54%)",
                                }}
                            >
                                입력 완료
                            </button>
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