"use client";

import Image from "next/image";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      // 1) Firebase Google 로그인
      const result = await signInWithPopup(auth, googleProvider);

      // 2) Firebase ID Token 얻기
      const idToken = await result.user.getIdToken();

      // 3) 백엔드 호출 (/api/me)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // 4) 응답 처리
      if (res.status === 401) {
        console.error("401 UNAUTHORIZED: 토큰 없음/만료/검증 실패");
        return;
      }

      const data = await res.json();
      console.log("BACKEND RESPONSE:", data);

      // 5) 임시 라우팅 (나중에 missing 기반 분기로 바꾸면 됨)
      if (data?.missing?.includes("role")) router.push("/onboarding/role");
      else router.push("/");
    } catch (err) {
      console.error("구글 로그인 실패:", err);
    }
  };

  return (
    <main
      className="
        min-h-[calc(100vh-70px)]
        bg-[#FAFAFA]
        flex justify-center
        pt-10 md:pt-[153px]
        pb-24 md:pb-[180px]
        px-4
      "
    >
      <section
        className="
          w-full max-w-[628px]
          rounded-[28px] md:rounded-[40px]
          bg-white
          px-6 md:px-[60px]
          pt-8 md:pt-[60px]
          pb-10 md:pb-[70px]
          relative
        "
        style={{
          boxShadow: "0px 4px 4px 2px rgba(176, 201, 101, 0.2)",
        }}
      >
        <h1 className="text-[20px] md:text-[25px] font-bold leading-[30px] md:leading-[35px] text-black">
          로그인하고 편리하게
          <br />
          이용해보세요
        </h1>

        <div className="mt-10 md:mt-[94px] space-y-4 md:space-y-[18px]">
          <input
            type="text"
            placeholder="아이디를 입력해 주세요"
            className="
              w-full h-[56px] md:h-[73px]
              rounded-[16px] md:rounded-[20px]
              border border-[#D9D9D9]
              px-4 md:px-6
              text-[16px] md:text-[18px] text-black
              placeholder:text-[#BDBDBD]
              outline-none
              focus:border-[#B0C965]
            "
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            className="
              w-full h-[56px] md:h-[73px]
              rounded-[16px] md:rounded-[20px]
              border border-[#D9D9D9]
              px-4 md:px-6
              text-[16px] md:text-[18px] text-black
              placeholder:text-[#BDBDBD]
              outline-none
              focus:border-[#B0C965]
            "
          />
        </div>

        <div className="mt-4 md:mt-[18px] flex justify-end items-center gap-3 text-[13px] md:text-[15px] text-black">
          <button type="button" className="hover:text-[#B0C965]">
            아이디 찾기
          </button>
          <span>|</span>
          <button type="button" className="hover:text-[#B0C965]">
            비밀번호 찾기
          </button>
        </div>

        {/* 버튼 */}
        <div className="mt-8 md:mt-[47px] flex justify-center">
          <button
            type="button"
            className="
              w-full md:w-[477px]
              h-[56px] md:h-[73px]
              rounded-[16px] md:rounded-[20px]
              text-[18px] md:text-[22px]
              font-semibold text-[#2E2E2E]
              bg-[linear-gradient(106deg,rgba(176,201,101,0.9)_13%,rgba(255,255,255,0.9)_127%)]
              hover:opacity-90 transition
            "
          >
            로그인
          </button>
        </div>

        <div className="mt-4 md:mt-[24px] flex justify-center">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="
              w-full md:w-[477px]
              h-[56px] md:h-[73px]
              rounded-[16px] md:rounded-[20px]
              border border-[#BDBDBD]
              bg-white
              flex items-center justify-center gap-3 md:gap-4
              hover:bg-[#FAFAFA]
              transition
            "
          >
            <Image
              src="/images/google-icon.png"
              alt="Google"
              width={26}
              height={26}
              className="md:w-[30px] md:h-[30px]"
            />
            <span className="text-[15px] md:text-[18px] font-medium text-black">
              구글 계정으로 로그인하기
            </span>
          </button>
        </div>

        <div className="mt-4 md:mt-[18px] text-center text-[13px] md:text-[15px] text-[#656565]">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="text-[#B0C965] font-bold hover:underline">
            회원가입
          </Link>
        </div>
      </section>

      {/* 도움 요청하기 */}
      <div className="fixed bottom-6 right-4 md:bottom-[44px] md:right-[64px]">
        <button
          type="button"
          className="
            w-[160px] md:w-[193px]
            h-[60px] md:h-[74px]
            rounded-[50px]
            bg-[#E0F0AF]
            shadow-[0px_2px_6px_rgba(0,0,0,0.15)]
            text-[15px] md:text-[18px]
            font-semibold text-[#585858]
            hover:opacity-90 transition
          "
        >
          도움 요청하기
        </button>
      </div>
    </main>
  );
}