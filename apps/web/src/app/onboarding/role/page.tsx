"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingRolePage() {
    const router = useRouter();

    const selectRole = (role: "OWNER" | "HELPER") => {
        try {
            localStorage.setItem("digimon_role", role);
        } catch {}
        alert(role === "OWNER" ? "사장님 선택!" : "도우미 선택!");
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
                        {/* 제목 */}
                        <h1 className="text-left text-[22px] md:text-[25px] font-bold leading-[32px] md:leading-[35px] text-black">
                            DIGI-MON 서비스를 이용하려면
                            <br />
                            역할 선택이 필요해요
                        </h1>

                        {/* 카드 영역 */}
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
                                    onClick={() => selectRole("OWNER")}
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
                                    onClick={() => selectRole("HELPER")}
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

                        {/* ✅ Figma 맞춤: 좌하단 링크 (문구/위치/정렬 수정) */}
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
                            {/* 작은 화살표 아이콘 */}
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                            >
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