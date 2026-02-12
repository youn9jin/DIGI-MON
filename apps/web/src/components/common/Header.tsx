"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header
      className="
        sticky top-0 z-50
        h-[70px] w-full
        shadow-[0px_2px_2px_0px_rgba(169,169,169,0.25)]
        bg-white/60 backdrop-blur
      "
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-8">
        {/* 왼쪽: 로고 + DIGI-MON */}
        <div className="flex items-center gap-3">
          {/* 로고 이미지 */}
          <div className="relative h-[30px] w-[30px]">
            <Image
              src="/images/logo.png"
              alt="DIGI-MON"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="text-[20px] font-semibold text-[#353535] whitespace-nowrap">
            DIGI-MON
          </span>
        </div>

        {/* 오른쪽: 사용방법 | 로그인 회원가입 */}
        <nav className="flex items-center gap-4 md:gap-6 text-[17px]">
          {/* 사용방법  */}
          <a
            href="#"
            className="hidden md:inline-block text-[#535353] hover:opacity-80"
          >
            사용방법
          </a>

          {/* 구분선 */}
          <span className="hidden md:inline-block">
            <div className="relative h-[17px] w-[1px]">
              <Image
                src="/images/divider.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </span>

          <a href="#" className="text-black hover:opacity-80">
            로그인
          </a>
          <a href="#" className="text-black hover:opacity-80">
            회원가입
          </a>
        </nav>
      </div>
    </header>
  );
}
