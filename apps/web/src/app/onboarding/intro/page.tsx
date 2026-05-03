"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/useAuthUser";

export default function OnboardingIntroPage() {
    const router = useRouter();
    const { ready, isLoggedIn, meReady, me } = useAuthUser();

    const onboarded = Boolean(me?.onboarded);
    const role = String(me?.role ?? "").toUpperCase();

    useEffect(() => {
        if (!ready) return;

        // 로그인 안 했으면 로그인으로
        if (!isLoggedIn) {
            router.replace("/login");
            return;
        }

        // /api/me 로딩 끝날 때까지 기다림
        if (!meReady) return;

        // ✅ 온보딩 완료면 intro 못 들어오게 스킵
        if (onboarded && role === "OWNER") {
            router.replace("/survey/action"); // 또는 "/action-plan"
        }
    }, [ready, isLoggedIn, meReady, onboarded, role, router]);

    // 깜빡임 방지
    if (!ready || (isLoggedIn && !meReady)) return null;

    return (
        <main className="w-full bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[101px]">
                <section className="min-h-[calc(100vh-70px)] flex flex-col justify-center py-12">
                    {/* 2-column (desktop) / 1-column (mobile) */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16">
                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                            {/* Title (Figma: 42px, line-height 65px) */}
                            <h1
                                className="font-bold text-black"
                                style={{
                                    fontSize: "clamp(26px, 3vw, 42px)",
                                    lineHeight: "clamp(38px, 4.5vw, 65px)",
                                }}
                            >
                                {/* ✅ 첫 줄은 데스크탑에서 한 줄로 보이게 */}
                                <span className="block lg:whitespace-nowrap">
                  DIGI-MON 서비스를 효과적으로 이용하려면
                </span>
                                <span className="block">가게 정보 입력이 필요해요</span>
                            </h1>

                            {/* Subtitle (opacity 40%) */}
                            <p
                                className="mt-5 font-medium text-[#353535]"
                                style={{
                                    opacity: 0.4,
                                    fontSize: "clamp(14px, 1.6vw, 24px)",
                                    lineHeight: "clamp(22px, 2.6vw, 35px)",
                                }}
                            >
                                사장님 가게 맞춤 액션 플랜 제공에 필요한 과정이에요
                            </p>

                            {/* Buttons */}
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6">
                                {/* 온보딩 시작 버튼 (Figma: gradient-to-r #B0C965 42% -> #F5F5F5 148%) */}
                                <Link
                                    href="/onboarding/role"
                                    className="
                    inline-flex items-center justify-center
                    rounded-[20px]
                    text-black
                    hover:opacity-90 transition
                    font-medium
                  "
                                    style={{
                                        width: "clamp(260px, 38vw, 459px)",
                                        height: "74px",
                                        background: "#C9D99A",
                                        fontSize: "22px",
                                    }}
                                >
                                    정보 입력하고 맞춤 액션 플랜 보기
                                </Link>

                                {/* 온보딩 거부/대체 버튼 (Figma: 106deg rgba(176,201,101,0.9)->white) */}
                                <Link
                                    href="/survey/action"
                                    className="
                    inline-flex items-center justify-center
                    rounded-[20px]
                    hover:opacity-90 transition
                    font-medium text-[#2E2E2E]
                  "
                                    style={{
                                        width: "clamp(260px, 38vw, 453px)",
                                        height: "73.5px",
                                        background: "#ECEDE7",
                                        fontSize: "22px",
                                    }}
                                >
                                    맞춤 정보 없이 볼게요
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT CARD (Figma: 405 x 366, bg rgba(255,255,255,0.7), shadow) */}
                        <div className="flex-shrink-0 self-center lg:self-auto">
                            <div
                                className="
                  rounded-[20px]
                  bg-[rgba(255,255,255,0.7)]
                  shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]
                  border border-black/5
                "
                                style={{
                                    width: "min(405px, 92vw)",
                                    aspectRatio: "405 / 366",
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}