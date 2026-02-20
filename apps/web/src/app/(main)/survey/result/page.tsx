"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function GlassCard({
                       children,
                       className = "",
                       style,
                   }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={[
                "rounded-[20px] bg-[rgba(255,255,255,0.7)]",
                "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]",
                "flex items-center justify-center",
                className,
            ].join(" ")}
            style={style}
        >
            {children}
        </div>
    );
}

type PrimaryAction = {
    actionCode: string;
    title: string;
    summary: string;
    estimatedMinutes: number;
};

export default function SurveyResultPage() {
    const router = useRouter();

    const [readyForGuest, setReadyForGuest] = useState(false);
    const [primaryAction, setPrimaryAction] = useState<PrimaryAction | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.replace("/action-plan");
            else setReadyForGuest(true);
        });
        return () => unsub();
    }, [router]);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("planDraftResponse");
            if (!raw) return;

            const parsed = JSON.parse(raw);
            const pa = parsed?.initialPlan?.primaryAction;

            if (pa?.title) {
                setPrimaryAction({
                    actionCode: pa.actionCode,
                    title: pa.title,
                    summary: pa.summary,
                    estimatedMinutes: pa.estimatedMinutes,
                });
            }
        } catch (e) {
            console.warn("Failed to load planDraftResponse:", e);
        }
    }, []);

    if (!readyForGuest) return null;

    return (
        <main className="w-full bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[121px]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:min-h-[calc(100vh-70px)] py-14 gap-12 lg:gap-6">
                    {/* ── 왼쪽: 텍스트 블록 ── */}
                    <div className="flex flex-col lg:max-w-[560px]">
                        <h1
                            className="font-bold text-black whitespace-nowrap"
                            style={{ fontSize: "clamp(26px, 3.5vw, 50px)", lineHeight: "1.56" }}
                        >
                            사장님에게 딱 맞는 액션플랜은...
                        </h1>

                        <p
                            className="mt-10 font-bold text-black"
                            style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: "1.55" }}
                        >
                            {primaryAction?.title ?? "액션플랜을 불러오는 중..."}
                        </p>

                        <p
                            className="mt-3 font-semibold text-[#868686]"
                            style={{ fontSize: "clamp(14px, 1.7vw, 24px)", lineHeight: "1.46" }}
                        >
                            {primaryAction?.summary ?? "잠시만 기다려주세요."}
                            <br />
                            {primaryAction
                                ? `#무료 #${primaryAction.estimatedMinutes}분 소요 #언제든 수정 가능`
                                : "#무료 #10분 소요 #언제든 수정 가능"}
                        </p>

                        <Link
                            href="/login"
                            className="mt-9 inline-flex items-center justify-center rounded-[20px] font-semibold text-[#2E2E2E] transition-opacity hover:opacity-90 self-start"
                            style={{
                                width: "clamp(240px, 31.5vw, 453px)",
                                height: "clamp(50px, 5.1vw, 73px)",
                                fontSize: "clamp(14px, 1.53vw, 22px)",
                                backgroundImage:
                                    "linear-gradient(106.54deg, rgba(176,201,101,0.9) 13.215%, rgba(255,255,255,0.9) 127.46%)",
                            }}
                        >
                            로그인하고 가게 등록 시작하기
                        </Link>
                    </div>

                    {/* ── 오른쪽: 카드 3개 ── */}
                    <div className="flex-shrink-0 self-center lg:self-auto">
                        <div className="w-[min(405px,90vw)] mx-auto flex flex-col items-center gap-5">
                            <GlassCard className="w-[80%] aspect-[324/293] mx-auto lg:translate-x-[4px]">
                                <div className="relative w-[42%] h-[58%]">
                                    <Image
                                        src="/images/result-menu.png"
                                        alt="메뉴판 뱃지"
                                        fill
                                        sizes="180px"
                                        style={{ objectFit: "contain" }}
                                        priority
                                    />
                                </div>
                            </GlassCard>

                            <GlassCard className="w-full aspect-[405/366] mx-auto">
                                <div className="relative w-[58%] h-[72%]">
                                    <Image
                                        src="/images/result-googlemap.png"
                                        alt="구글 지도 아이콘"
                                        fill
                                        sizes="240px"
                                        style={{ objectFit: "contain" }}
                                        priority
                                    />
                                </div>
                            </GlassCard>

                            <GlassCard className="w-[80%] aspect-[324/293] mx-auto lg:translate-x-[4px]">
                                <div className="relative w-[60%] h-[60%]">
                                    <Image
                                        src="/images/result-review.png"
                                        alt="리뷰 뱃지"
                                        fill
                                        sizes="200px"
                                        style={{ objectFit: "contain" }}
                                        priority
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}