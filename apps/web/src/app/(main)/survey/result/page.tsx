"use client";

import Image from "next/image";
import Link from "next/link";

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

export default function SurveyResultPage() {
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
              구글 지도에
              <br />
              가게 등록하기
            </p>

            <p
              className="mt-3 font-semibold text-[#868686]"
              style={{ fontSize: "clamp(14px, 1.7vw, 24px)", lineHeight: "1.46" }}
            >
              근처 검색 유입이 빠르게 늘어날 수 있는 방법
              <br />
              #무료 #10분 소요 #언제든 수정 가능
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

          {/* ── 오른쪽: 카드 3개 (센터 정렬 + 피그마처럼 작은 카드 약간 오른쪽) ── */}
          <div className="flex-shrink-0 self-center lg:self-auto">
            {/* 기준 너비: 피그마 큰 카드 405px */}
            <div className="w-[min(405px,90vw)] mx-auto flex flex-col items-center gap-5">
              {/* 위 카드: 메뉴판 (작은 카드 324/405 = 80%) */}
              <GlassCard
                className="w-[80%] aspect-[324/293] mx-auto lg:translate-x-[4px]"
              >
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

              {/* 가운데 카드: 구글지도 (큰 카드) */}
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

              {/* 아래 카드: 리뷰 (작은 카드 80%) */}
              <GlassCard
                className="w-[80%] aspect-[324/293] mx-auto lg:translate-x-[4px]"
              >
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
