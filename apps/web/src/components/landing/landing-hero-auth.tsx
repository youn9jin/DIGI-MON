"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingHeroAuth() {
    return (
        <div className="w-full bg-white overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 md:px-8">
                <section className="relative flex min-h-[calc(100vh-70px)] flex-col items-center justify-start pt-10 md:pt-14">
                    {/* 배경 일러스트 */}
                    <div className="pointer-events-none absolute left-1/2 top-[210px] z-0 w-[min(1100px,95vw)] -translate-x-1/2 md:top-[240px]">
                        <div className="relative aspect-[968/540] w-full">
                            <Image
                                src="/images/main-hero.svg"
                                alt="메인 일러스트"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* 텍스트 */}
                    <div className="relative z-10 w-full max-w-4xl text-center">
                        <h1 className="font-semibold text-[#2e2e2e]">
                            <span className="block text-[28px] leading-[1.2] sm:text-[36px] md:text-[60px] md:leading-[72px]">
                                다음 디지털 전환,
                            </span>

                            <span className="block h-[6px] md:h-[10px]" aria-hidden="true" />

                            <span className="block text-[28px] leading-[1.2] sm:text-[36px] md:text-[60px] md:leading-[72px]">
                                지금 시작해볼까요?
                            </span>
                        </h1>

                        {/* CTA */}
                        <div className="mt-6 flex justify-center md:mt-8">
                            <Link
                                href="/action-plan"
                                className="
                                    flex items-center justify-center
                                    h-[56px] w-full max-w-[420px]
                                    rounded-[20px] px-4
                                    text-[18px] font-semibold text-[#2e2e2e]
                                    transition-opacity hover:opacity-90
                                    md:h-[73px] md:max-w-[453px] md:text-[22px]
                                "
                                style={{
                                    backgroundImage:
                                        "linear-gradient(106.54deg, rgba(176, 201, 101, 0.9) 13.215%, rgba(255, 255, 255, 0.9) 127.46%)",
                                }}
                            >
                                다음 액션 플랜 하러가기
                            </Link>
                        </div>
                    </div>

                    {/* 스크롤 아이콘 */}
                    <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
                        <div className="relative h-[21px] w-[46px]">
                            <Image
                                src="/images/scroll.svg"
                                alt="스크롤"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="h-[420px] md:h-[520px]" aria-hidden="true" />
                </section>
            </div>
        </div>
    );
}