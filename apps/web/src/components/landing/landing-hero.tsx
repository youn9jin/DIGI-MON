"use client";

import Image from "next/image";

export default function LandingHero() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      
      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <section className="relative flex min-h-[calc(100vh-70px)] flex-col items-center justify-start pt-10 md:pt-14">
          
          {/* Title */}
          <div className="w-full max-w-4xl text-center">
            <h1 className="font-semibold text-[#2e2e2e]">
              <span className="block text-[36px] leading-[1.15] sm:text-[46px] md:text-[70px] md:leading-[72px]">
                사장님 가게,
              </span>

              <span className="mt-2 block text-[28px] leading-[1.2] sm:text-[36px] md:text-[60px] md:leading-[72px]">
                지금 뭐부터 하면 좋을지
              </span>

              <span className="block text-[28px] leading-[1.2] sm:text-[36px] md:text-[60px] md:leading-[72px]">
                <span>1분</span> 만에 정리해드릴게요
              </span>
            </h1>

            {/* CTA */}
            <div className="mt-6 flex justify-center md:mt-8">
              <button
                type="button"
                className="h-[56px] w-full max-w-[420px] rounded-[20px] px-4 text-[18px] font-semibold text-[#2e2e2e]
                           transition-opacity hover:opacity-90
                           md:h-[73px] md:max-w-[453px] md:text-[22px]"
                style={{
                  backgroundImage:
                    "linear-gradient(106.54deg, rgba(176, 201, 101, 0.9) 13.215%, rgba(255, 255, 255, 0.9) 127.46%)",
                }}
              >
                지금 내 가게 상황 확인하기
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-10 w-full max-w-4xl md:mt-14">
            <div className="relative aspect-[968/540] w-full">
              <Image
                src="/images/main-hero.png"
                alt="메인 일러스트"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-10 flex items-center justify-center pb-10 md:mt-12">
            <div className="relative h-[21px] w-[46px]">
              <Image
                src="/images/scroll.svg"
                alt="스크롤"
                fill
                className="object-contain"
              />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
