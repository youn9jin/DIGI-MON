"use client";

import Image from "next/image";

export default function AuthHeader() {
  return (
    <header
      className="
        sticky top-0 z-50
        h-[70px] w-full
        bg-white/60 backdrop-blur
        shadow-[0px_2px_2px_0px_rgba(169,169,169,0.25)]
      "
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="relative h-[30px] w-[30px]">
          <Image
              src="/images/logo.png"
              alt="DIGI-MON"
              width={30}
              height={30}
              className="h-auto"
              priority
            />
          </div>
          <span className="text-[20px] font-semibold text-[#353535] whitespace-nowrap">
            DIGI-MON
          </span>
        </div>
      </div>
    </header>
  );
}
