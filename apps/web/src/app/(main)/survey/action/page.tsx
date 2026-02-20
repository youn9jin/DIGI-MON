"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type PrimaryAction = {
    actionCode: string;
    title: string;
    summary: string;
    estimatedMinutes: number;
};

export default function SurveyActionPage() {
    const router = useRouter();
    const [readyForAuthed, setReadyForAuthed] = useState(false);
    const [primaryAction, setPrimaryAction] = useState<PrimaryAction | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) router.replace("/login");
            else setReadyForAuthed(true);
        });
        return () => unsub();
    }, [router]);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("planDraftResponse");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const pa = parsed?.initialPlan?.primaryAction;
            if (pa?.title) setPrimaryAction(pa);
        } catch (e) {
            console.warn(e);
        }
    }, []);

    if (!readyForAuthed) return null;

    const title = primaryAction?.title ?? "구글 지도에\n가게 등록하기";
    const summary =
        primaryAction?.summary ?? "근처 검색 유입이 빠르게 늘어날 수 있는 방법";
    const mins = primaryAction?.estimatedMinutes ?? 10;

    return (
        <main className="w-full min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-[121px] py-14">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-10">
                    {/* ── LEFT ── */}
                    <div className="flex flex-col justify-center min-w-0 lg:max-w-[620px] flex-1">
                        <h1
                            className="font-semibold text-black whitespace-nowrap"
                            style={{ fontSize: "clamp(24px, 3.5vw, 50px)", lineHeight: "1.56" }}
                        >
                            사장님에게 딱 맞는 액션플랜은...
                        </h1>

                        <p
                            className="mt-6 font-bold text-black whitespace-pre-line"
                            style={{ fontSize: "clamp(20px, 2.9vw, 42px)", lineHeight: "1.55" }}
                        >
                            {title}
                        </p>

                        <p
                            className="mt-3 font-semibold text-[#868686]"
                            style={{ fontSize: "clamp(13px, 1.7vw, 24px)", lineHeight: "35px" }}
                        >
                            {summary}
                            <br />
                            {`#무료 #${mins}분 소요 #언제든 수정 가능`}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
                            <Link
                                href="/store/register"
                                className="flex items-center justify-center rounded-[20px] font-semibold text-[#2E2E2E] hover:opacity-90 transition-opacity whitespace-nowrap"
                                style={{
                                    height: "73px",
                                    padding: "0 24px",
                                    fontSize: "clamp(15px, 1.5vw, 22px)",
                                    backgroundImage:
                                        "linear-gradient(106.54deg, rgba(176,201,101,0.9) 13.215%, rgba(255,255,255,0.9) 127.46%)",
                                }}
                            >
                                가게 등록 시작하기
                            </Link>

                            <Link
                                href="/action-plan"
                                className="flex items-center justify-center rounded-[20px] font-semibold text-[#2E2E2E] hover:opacity-90 transition-opacity whitespace-nowrap"
                                style={{
                                    height: "73px",
                                    padding: "0 24px",
                                    fontSize: "clamp(15px, 1.5vw, 22px)",
                                    background: "#ECEDE7",
                                }}
                            >
                                이미 실행된 액션플랜이에요
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT CARDS ── */}
                    <div
                        className="flex-shrink-0 flex flex-col items-center gap-[18px]"
                        style={{ width: "clamp(280px, 28vw, 405px)" }}
                    >
                        {/* 카드 1 – 메뉴 */}
                        <div
                            className="rounded-[20px] bg-[rgba(255,255,255,0.7)] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center"
                            style={{ width: "80%", aspectRatio: "324 / 293" }}
                        >
                            <div className="relative" style={{ width: "40%", paddingBottom: "58%" }}>
                                <Image
                                    src="/images/result-menu.svg"   // ✅ SVG로 변경
                                    alt="메뉴 아이콘"
                                    fill
                                    sizes="(max-width: 768px) 35vw, 160px"
                                    style={{ objectFit: "contain" }}
                                    priority
                                />
                            </div>
                        </div>

                        {/* 카드 2 – 구글맵 */}
                        <div
                            className="w-full rounded-[20px] bg-[rgba(255,255,255,0.7)] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center"
                            style={{ aspectRatio: "405 / 366" }}
                        >
                            <div className="relative" style={{ width: "57%", paddingBottom: "70%" }}>
                                <Image
                                    src="/images/result-googlemap.svg" // ✅ SVG로 변경
                                    alt="구글 지도 아이콘"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 260px"
                                    style={{ objectFit: "contain" }}
                                    priority
                                />
                            </div>
                        </div>

                        {/* 카드 3 – 리뷰 */}
                        <div
                            className="rounded-[20px] bg-[rgba(255,255,255,0.7)] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center"
                            style={{ width: "80%", aspectRatio: "324 / 293" }}
                        >
                            <div className="relative" style={{ width: "61%", paddingBottom: "58%" }}>
                                <Image
                                    src="/images/result-review.svg"
                                    alt="리뷰 아이콘"
                                    fill
                                    sizes="(max-width: 768px) 35vw, 240px"
                                    style={{ objectFit: "contain" }}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}