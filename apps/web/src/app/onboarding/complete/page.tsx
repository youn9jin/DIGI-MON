"use client";

import Image from "next/image";
import Link from "next/link";

export default function OnboardingCompletePage() {
    return (
        <main className="min-h-[calc(100vh-70px)] w-full bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 pt-[70px] pb-16">
                <div className="flex flex-col items-center justify-center mt-[60px]">
                    {/* 체크 이미지 */}
                    <div className="relative w-[320px] h-[260px]">
                        <Image
                            src="/images/signup-complete.png"
                            alt="온보딩 완료"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* 문구 */}
                    <h1 className="mt-[30px] text-[45px] font-semibold leading-[38px] text-black text-center">
                        가게 정보 등록이 완료되었습니다
                    </h1>

                    {/* CTA 버튼 */}
                    <Link
                        href="/mypage"
                        className="
              mt-[40px]
              flex items-center justify-center
              w-[453px] h-[73px]
              rounded-[20px]
              text-[22px] font-semibold text-[#2E2E2E]
              hover:opacity-90 transition
            "
                        style={{
                            backgroundImage:
                                "linear-gradient(106.541684deg, rgba(176,201,101,0.9) 13.215%, rgba(255,255,255,0.9) 127.46%)",
                        }}
                    >
                        맞춤 액션플랜 하러가기
                    </Link>
                </div>
            </div>
        </main>
    );
}