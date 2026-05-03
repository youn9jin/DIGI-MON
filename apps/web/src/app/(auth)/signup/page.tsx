"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const syncUserWithBackend = async (idToken: string) => {
    if (!apiBase) {
      alert("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
      throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
    }

    const res = await fetch(`${apiBase}/api/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (res.status === 401) {
      console.error("401 UNAUTHORIZED: 토큰 없음/만료/검증 실패");
      alert("인증에 실패했습니다. 다시 로그인해주세요.");
      return null;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`BACKEND ERROR ${res.status}:`, body);
      alert("서버 오류가 발생했습니다.");
      return null;
    }

    return res.json();
  };

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.password.trim()) return false;
    if (!form.passwordConfirm.trim()) return false;
    if (form.password !== form.passwordConfirm) return false;
    return true;
  }, [form]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("이름을 입력해주세요.");
    if (!form.email.trim()) return alert("이메일을 입력해주세요.");
    if (!form.password.trim()) return alert("비밀번호를 입력해주세요.");
    if (!form.passwordConfirm.trim())
      return alert("비밀번호 확인을 입력해주세요.");
    if (form.password !== form.passwordConfirm)
      return alert("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);

      // 1) Firebase 회원가입
      const result = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // 2) 표시명(가게 이름) 설정
      await updateProfile(result.user, {
        displayName: form.name.trim(),
      });

      // 3) ID Token
      const idToken = await result.user.getIdToken();

      // 4) 백엔드 동기화
      const me = await syncUserWithBackend(idToken);
      if (!me) return;

      // 5) 완료 페이지
      router.push("/signup/complete");
    } catch (err: any) {
      console.error("회원가입 실패:", err);

      if (err.code === "auth/email-already-in-use")
        alert("이미 가입된 이메일입니다.");
      else if (err.code === "auth/invalid-email")
        alert("이메일 형식이 올바르지 않습니다.");
      else if (err.code === "auth/weak-password")
        alert("비밀번호가 너무 약합니다. (6자 이상)");
      else alert("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FAFAFA]">
        <div className="mx-auto w-full max-w-[1440px] px-6 pt-[70px] pb-16">
        <div className="flex justify-center">
          <section
            className="
              relative
              w-full max-w-[849px]
              rounded-[40px] bg-white
              shadow-[0px_2px_2px_0px_#B0C965]
              px-[clamp(20px,5.2vw,75px)]
              pt-[55px] pb-[56px]
            "
          >
            {/* 타이틀 (2줄) */}
            <h1 className="text-center text-[30px] font-bold leading-[38px] text-black">
              <span className="block">DIGI-MON 회원가입</span>
              <span className="block">(사장님)</span>
            </h1>

            <form onSubmit={handleEmailSignup} className="mt-[70px]">
              <div className="flex flex-col gap-[44px]">
                {/* 가게 이름 */}
                <div>
                  <label className="block text-[20px] font-medium text-[#737373]">
                    이름
                  </label>
                  <input
                        value={form.name}
                        onChange={onChange("name")}
                    className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-[20px] font-medium text-[#737373]">
                    이메일(ID)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                    className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-[20px] font-medium text-[#737373]">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={onChange("password")}
                    className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-[20px] font-medium text-[#737373]">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={form.passwordConfirm}
                    onChange={onChange("passwordConfirm")}
                    className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                  />
                </div>
              </div>

              {/* 이전 화면으로 (Figma: 좌하단) */}
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-3 inline-flex items-center gap-1 text-[15px] leading-[20px] text-black"
              >
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
                이전 화면으로
              </button>

              {/* 확인 버튼 (Figma: 확인) */}
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="
                  mt-[45px]
                  mx-auto block
                  h-[74px] w-[308px]
                  rounded-[20px]
                  text-[20px] font-medium text-[#313131]
                  hover:opacity-90 transition
                  disabled:opacity-50
                "
                style={{
                  background:
                    "linear-gradient(90deg, #B0C965 0%, #FFFFFF 147.56%)",
                }}
              >
                {loading ? "가입 중..." : "확인"}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* 도움 요청하기 버튼 */}
      <button
        type="button"
        onClick={() => router.push("/help")}
        className="
          fixed bottom-8 right-8
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
