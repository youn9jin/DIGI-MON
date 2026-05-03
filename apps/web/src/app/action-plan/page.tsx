"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type StepItem = {
    step: number;
    cta: string;
    href: string;
    helperText?: string; // 1단계 아래에만 보이도록
};

export default function ActionPlanPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    // ✅ 로그인 필수
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) router.replace("/login");
            else setReady(true);
        });
        return () => unsub();
    }, [router]);

    const steps = useMemo<StepItem[]>(
        () => [
            {
                step: 1,
                cta: "지도 서비스 열기",
                href: "/action-plan/step-1",
                helperText: "‘지도 서비스 열기’ 누르고 설명 확인하기",
            },
            {
                step: 2,
                cta: "가게 정보 입력하기",
                href: "/action-plan/step-2",
            },
            {
                step: 3,
                cta: "사진 1장 올리기 (선택)",
                href: "/action-plan/step-3",
            },
        ],
        []
    );

    if (!ready) return null;

    return (
        <main className="w-full bg-white">
            {/* 헤더는 (main)/layout.tsx의 AppHeader가 렌더링 */}

            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[45px] pt-[130px] pb-[120px]">
                {/* Title */}
                <h1 className="text-black font-bold text-[44px] leading-[1.15] tracking-[-0.02em]">
                    단계별로 차근차근 알려드릴게요
                </h1>
                <p className="mt-2 text-[#2E2E2E] font-semibold text-[20px] leading-[1.4]">
                    구글 지도에 가게 등록하기
                </p>

                {/* Cards */}
                <section className="mt-10">
                    <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:gap-[30px]">
                        {steps.map((s) => (
                            <div key={s.step} className="flex flex-col items-center">
                                {/* Card (428x433) */}
                                <div
                                    className="
                    w-full
                    rounded-[20px]
                    bg-white
                    border
                    shadow-[0px_2px_6px_rgba(0,0,0,0.10)]
                    flex flex-col
                    items-center
                    justify-between
                  "
                                    style={{
                                        // 데스크탑에선 Figma 사이즈 느낌 유지
                                        height: "433px",
                                        borderColor: "#D7E2A9", // 연한 연두 테두리
                                        maxWidth: "428px",
                                    }}
                                >
                                    {/* top: step label */}
                                    <div className="pt-[40px] text-center">
                                        <p className="text-black font-semibold text-[22px]">
                                            {s.step}단계
                                        </p>
                                    </div>

                                    {/* bottom: button inside card */}
                                    <div className="pb-[38px]">
                                        <Link
                                            href={s.href}
                                            className="
                        flex items-center justify-center
                        rounded-[20px]
                        font-semibold
                        text-[#2E2E2E]
                        hover:opacity-90
                        transition
                      "
                                            style={{
                                                width: "280px",
                                                height: "60px",
                                                background: "#C9D99A", // 버튼 연두 단색
                                            }}
                                        >
                                            {s.cta}
                                        </Link>
                                    </div>
                                </div>

                                {/* helper text (only step 1) */}
                                {s.helperText && (
                                    <p className="mt-5 text-[14px] text-[#2E2E2E] text-center">
                                        {s.helperText}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Help button (bottom-right fixed) */}
                <div className="fixed right-6 bottom-6 lg:right-[45px] lg:bottom-[35px]">
                    <Link
                        href="/help"
                        className="flex items-center justify-center rounded-[999px] font-semibold text-[#2E2E2E] hover:opacity-90 transition shadow-[0px_6px_18px_rgba(0,0,0,0.12)]"
                        style={{
                            width: "193px",
                            height: "74px",
                            background: "#C9D99A",
                        }}
                    >
                        도움 요청하기
                    </Link>
                </div>
            </div>
        </main>
    );
}