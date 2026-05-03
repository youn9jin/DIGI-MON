"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingRolePage() {
    const router = useRouter();

    const handleOwner = () => {
        try {
            localStorage.setItem("digimon_role", "OWNER");
        } catch {}
        router.push("/onboarding/industry");
    };

    const handleHelper = () => {
        // ✅ 도우미 온보딩은 일단 제외
        alert("도우미 온보딩은 준비 중이에요!");
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
            "
                    >
                        <h1 className="text-left text-[22px] md:text-[25px] font-bold leading-[32px] md:leading-[35px] text-black">
                            DIGI-MON 서비스를 이용하려면
                            <br />
                            역할 선택이 필요해요
                        </h1>

                        <div className="mt-10 grid grid-cols-1 gap-8 md:mt-[55px] md:grid-cols-2 md:gap-[30px]">
                            {/* 사장님 */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="
                    w-full max-w-[308px]
                    rounded-[20px] bg-[#F7F7F7]
                    shadow-[0px_2px_2px_1px_rgba(0,0,0,0.25)]
                    aspect-[308/396]
                    relative overflow-hidden
                  "
                                >
                                    <Image
                                        src="/images/owner.png"
                                        alt="사장님"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOwner}
                                    className="
                    mt-6 h-[74px] w-full max-w-[308px]
                    rounded-[20px]
                    text-[20px] font-medium text-[#313131]
                    hover:opacity-90 transition
                  "
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #B0C965 0%, #FFFFFF 147.56%)",
                                    }}
                                >
                                    사장님이에요
                                </button>
                            </div>

                            {/* 도우미 */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="
                    w-full max-w-[308px]
                    rounded-[20px] bg-[#F7F7F7]
                    shadow-[0px_2px_2px_1px_rgba(0,0,0,0.25)]
                    aspect-[308/396]
                    relative overflow-hidden
                  "
                                >
                                    <Image
                                        src="/images/helper.png"
                                        alt="도우미"
                                        fill
                                        className="object-contain"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleHelper}
                                    className="
                    mt-6 h-[74px] w-full max-w-[308px]
                    rounded-[20px]
                    text-[20px] font-medium text-[#313131]
                    hover:opacity-90 transition
                  "
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #B0C965 0%, #FFFFFF 147.56%)",
                                    }}
                                >
                                    도우미예요
                                </button>
                            </div>
                        </div>

                        {/* (원래 있던 뒤로가기 링크는 너가 수정해둔 버전 유지해도 OK) */}
                        <Link
                            href="/landing-hero-auth"
                            className="
                absolute
                left-[clamp(20px,5.2vw,75px)]
                bottom-[72px]
                inline-flex items-center gap-2
                text-[15px] leading-[20px] text-black
              "
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
                            설문 결과 화면으로 돌아가기
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}