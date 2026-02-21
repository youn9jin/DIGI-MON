"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Step1CompletePage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) router.replace("/login");
            else setReady(true);
        });
        return () => unsub();
    }, [router]);

    if (!ready) return null;

    return (
        <main className="w-full min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[83px] pt-[150px] pb-[120px]">
                <div className="flex flex-col items-center text-center">
                    {/* ✅ 타이틀 (Figma 위치/크기 느낌 유지) */}
                    <h1 className="text-black font-semibold text-[clamp(34px,3.2vw,50px)] leading-[clamp(46px,4.2vw,68px)] whitespace-pre-line">
                        {"구글 지도에\n가게 정보 등록 완료!"}
                    </h1>

                    {/* ✅ 서브 문구 */}
                    <p className="mt-[10px] text-[#797979] font-semibold text-[clamp(16px,1.6vw,25px)] leading-[clamp(26px,3.8vw,65px)]">
                        이제 지도 앱에서 사장님 가게를 검색할 수 있어요
                    </p>

                    {/* ✅ 이미지 (Figma: 400x400) */}
                    <div className="mt-[28px] flex justify-center">
                        <div
                            className="relative"
                            style={{
                                width: "clamp(280px, 38vw, 400px)",
                                height: "clamp(280px, 38vw, 400px)",
                            }}
                        >
                            <Image
                                src="/images/map-register-complete.svg"
                                alt="가게 정보 등록 완료"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* ✅ 버튼 2개: Figma 기준 304x73, gap 17 */}
                    {/* 모바일: 304px 이하에서는 꽉 차게, 그 이상은 304 고정 */}
                    <div className="mt-[44px] w-full flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-[17px]">
                        {/* 다음 1개도 해볼게요 (연두) */}
                        <Link
                            href="/action-plan/step-2"
                            className="
                flex items-center justify-center
                rounded-[20px]
                font-semibold text-[#2E2E2E]
                hover:opacity-90 transition
              "
                            style={{
                                width: "min(304px, 100%)",
                                height: "73px",
                                background: "#C9D99A",
                                fontSize: "18px",
                            }}
                        >
                            다음 1개도 해볼게요
                        </Link>

                        {/* 오늘은 여기까지 (회색) */}
                        <Link
                            href="/mypage"
                            className="
                flex items-center justify-center
                rounded-[20px]
                font-semibold text-[#2E2E2E]
                hover:opacity-90 transition
              "
                            style={{
                                width: "min(304px, 100%)",
                                height: "73px",
                                background: "#ECEDE7",
                                fontSize: "18px",
                            }}
                        >
                            오늘은 여기까지
                        </Link>
                    </div>

                    {/* ✅ 하단 멘트 (Figma: 15px) */}
                    <p className="mt-[18px] text-[#474747] font-medium text-[15px] text-center max-w-[520px]">
                        다음 액션플랜은 상단바 ‘마이페이지&apos; 및 홈화면에서 언제든지 확인 가능해요
                    </p>
                </div>
            </div>
        </main>
    );
}