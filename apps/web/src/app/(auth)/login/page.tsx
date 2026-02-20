"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Firebase 로그인 후 → 백엔드 인증 공통 처리
   * ✅ 로그인 성공하면 온보딩 intro로 이동
   */
  const loginToBackend = async (idToken: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) {
      alert("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
      return;
    }

    const res = await fetch(`${apiBase}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (res.status === 401) {
      console.error("401 UNAUTHORIZED: 토큰 없음/만료/검증 실패");
      alert("인증에 실패했습니다. 다시 로그인해주세요.");
      return;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`BACKEND ERROR ${res.status}:`, body);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const data = await res.json().catch(() => null);
    console.log("BACKEND RESPONSE:", data);

    // ✅ 로그인 성공 → 온보딩 intro로 이동
    router.replace("/onboarding/intro");
  };

  /**
   * 이메일 로그인
   */
  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 1) Firebase Email 로그인
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 2) 토큰 발급
      const idToken = await result.user.getIdToken();

      // 3) 백엔드 인증 + 온보딩 이동
      await loginToBackend(idToken);
    } catch (err: any) {
      console.error("이메일 로그인 실패:", err);

      if (err.code === "auth/user-not-found") alert("존재하지 않는 계정입니다.");
      else if (err.code === "auth/wrong-password") alert("비밀번호가 틀렸습니다.");
      else if (err.code === "auth/invalid-email") alert("이메일 형식이 올바르지 않습니다.");
      else alert("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구글 로그인
   */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      await loginToBackend(idToken);
    } catch (err) {
      console.error("구글 로그인 실패:", err);
      alert("구글 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-[calc(100vh-70px)] bg-[#FAFAFA] flex justify-center pt-10 md:pt-[153px] pb-24 md:pb-[180px] px-4">
        <section
            className="w-full max-w-[628px] rounded-[28px] md:rounded-[40px] bg-white px-6 md:px-[60px] pt-8 md:pt-[60px] pb-10 md:pb-[70px] relative"
            style={{ boxShadow: "0px 4px 4px 2px rgba(176, 201, 101, 0.2)" }}
        >
          <h1 className="text-[20px] md:text-[25px] font-bold leading-[30px] md:leading-[35px] text-black">
            로그인하고 편리하게
            <br />
            이용해보세요
          </h1>

          {/* 이메일 로그인 */}
          <div className="mt-10 md:mt-[94px] space-y-4 md:space-y-[18px]">
            <input
                type="email"
                placeholder="이메일을 입력해 주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[56px] md:h-[73px] rounded-[16px] md:rounded-[20px] border border-[#D9D9D9] px-4 md:px-6 text-[16px] md:text-[18px] text-black placeholder:text-[#BDBDBD] outline-none focus:border-[#B0C965]"
            />
            <input
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[56px] md:h-[73px] rounded-[16px] md:rounded-[20px] border border-[#D9D9D9] px-4 md:px-6 text-[16px] md:text-[18px] text-black placeholder:text-[#BDBDBD] outline-none focus:border-[#B0C965]"
            />
          </div>

          {/* 로그인 버튼 */}
          <div className="mt-8 md:mt-[47px] flex justify-center">
            <button
                type="button"
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full md:w-[477px] h-[56px] md:h-[73px] rounded-[16px] md:rounded-[20px] text-[18px] md:text-[22px] font-semibold text-[#2E2E2E] bg-[linear-gradient(106deg,rgba(176,201,101,0.9)_13%,rgba(255,255,255,0.9)_127%)] hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </div>

          {/* 구글 로그인 */}
          <div className="mt-4 md:mt-[24px] flex justify-center">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full md:w-[477px] h-[56px] md:h-[73px] rounded-[16px] md:rounded-[20px] border border-[#BDBDBD] bg-white flex items-center justify-center gap-3 md:gap-4 hover:bg-[#FAFAFA] transition disabled:opacity-50"
            >
              <Image src="/images/google-icon.png" alt="Google" width={26} height={26} />
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
      </main>
  );
}