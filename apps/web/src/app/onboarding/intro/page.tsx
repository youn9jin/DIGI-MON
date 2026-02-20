"use client";

import Link from "next/link";

export default function OnboardingIntroPage() {
    return (
        <div className="w-full bg-[#FAFAFA] overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 md:px-8">
                <section className="relative flex min-h-[calc(100vh-70px)] flex-col items-center justify-start pt-10 md:pt-14">
                    {/* 중앙 카드 */}
                    <div
                        className="
              relative
              w-full max-w-[849px]
              rounded-[40px] bg-white
              shadow-[0px_2px_2px_0px_#B0C965]
              px-[clamp(20px,5.2vw,75px)]
              pt-[55px] pb-[56px]
              min-h-[772px]
            "
                    >
                        {/* Placeholder */}
                        <div className="mx-auto max-w-[640px] pt-10 text-center">
                            <h1 className="text-[28px] font-bold text-[#222]">
                                온보딩 페이지 (설명)
                            </h1>

                            <p className="mt-4 text-[16px] leading-[26px] text-[#666]">
                                Figma 디자인이 아직 확정되지 않아
                                <br />
                                페이지 틀만 먼저 구현해두었습니다.
                            </p>
                        </div>

                        {/* ✅ 다음 버튼: 역할 선택으로 이동 */}
                        <Link
                            href="/onboarding/role"
                            className="
                absolute left-1/2 bottom-[88px]
                -translate-x-1/2
                flex items-center justify-center
                h-[74px] w-[308px]
                rounded-[20px]
                text-[20px] font-medium text-[#313131]
                hover:opacity-90 transition
              "
                            style={{
                                background:
                                    "linear-gradient(90deg, #B0C965 0%, #FFFFFF 147.56%)",
                            }}
                        >
                            다음
                        </Link>

                        {/* 좌하단: 돌아가기 */}
                        <Link
                            href="/landing-hero"
                            className="
                absolute left-[26px] bottom-[26px]
                inline-flex items-center gap-1
                text-[15px] leading-[20px] text-black
              "
                        >
                            ← 설문 결과 화면으로 돌아가기
                        </Link>
                    </div>

                    {/* 도움 요청하기 버튼 */}
                    <Link
                        href="/help"
                        className="
              fixed bottom-8 right-8 z-20
              flex items-center justify-center
              h-[74px] w-[193px]
              rounded-[50px]
              bg-[#E0F0AF]
              shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]
              text-[18px] font-semibold text-[#585858]
              hover:opacity-90 transition
            "
                    >
                        도움 요청하기
                    </Link>
                </section>
            </div>
        </div>
    );
}