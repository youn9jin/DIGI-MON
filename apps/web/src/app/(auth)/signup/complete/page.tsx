"use client";

import Link from "next/link";
import Image from "next/image";

export default function SignupCompletePage() {
  return (
    <main className="min-h-screen w-full bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-[70px] pb-16">
        <div className="flex flex-col items-center justify-center mt-[60px]">
          
          <div className="relative w-[320px] h-[260px]">
            <Image
              src="/images/signup-complete.png"
              alt="회원가입 완료"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <h1 className="mt-[8px] text-[45px] font-semibold text-black text-center">
            회원가입이 완료되었습니다
          </h1>

          <Link
            href="/login"
            className="
              mt-[40px]
              flex items-center justify-center
              w-[453px] h-[73px]
              rounded-[20px]
              text-[22px] font-semibold text-[#2E2E2E]
              hover:opacity-90 transition
            "
            style={{
              background:
                "linear-gradient(106.54deg, rgba(176,201,101,0.9) 13.2%, rgba(255,255,255,0.9) 127.46%)",
            }}
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    </main>
  );
}
