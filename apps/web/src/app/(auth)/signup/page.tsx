"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onChange =
      (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
      };

  /**
   * Firebase ID Token을 서버에 전달 → users 자동 생성/갱신
   */
  const syncUserWithBackend = async (idToken: string) => {
    if (!apiBase) {
      alert("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
      throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("이름을 입력해주세요.");
    if (!form.email.trim()) return alert("이메일을 입력해주세요.");
    if (!form.password.trim()) return alert("비밀번호를 입력해주세요.");

    try {
      setLoading(true);

      // 1️⃣ Firebase 회원가입
      const result = await createUserWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
      );

      // 2️⃣ Firebase 프로필 이름 설정
      await updateProfile(result.user, {
        displayName: form.name.trim(),
      });

      // 3️⃣ ID Token 발급
      const idToken = await result.user.getIdToken();

      // 4️⃣ 서버 동기화 (/api/me)
      const me = await syncUserWithBackend(idToken);
      if (!me) return;

      // 5️⃣ 완료 페이지 이동
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
              w-full max-w-[849px]
              rounded-[40px] bg-white
              shadow-[0px_2px_2px_0px_#B0C965]
              px-[clamp(20px,5.2vw,75px)]
              pt-[55px] pb-[56px]
            "
            >
              <h1 className="text-center font-bold text-[30px] leading-[38px] text-black">
                DIGI-MON 회원가입
              </h1>

              <form onSubmit={handleEmailSignup} className="mt-[70px]">
                <div className="flex flex-col gap-[44px]">

                  <div>
                    <label className="block font-medium text-[20px] text-[#737373]">
                      이름
                    </label>
                    <input
                        value={form.name}
                        onChange={onChange("name")}
                        className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[20px] text-[#737373]">
                      이메일
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={onChange("email")}
                        className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[20px] text-[#737373]">
                      비밀번호
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={onChange("password")}
                        className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[20px] text-[#737373]">
                      전화번호
                    </label>
                    <input
                        value={form.phone}
                        onChange={onChange("phone")}
                        className="mt-[18px] w-full border-b border-[#CFCFCF] pb-[10px] outline-none"
                    />
                  </div>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="
                  mt-[65px]
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
                  {loading ? "가입 중..." : "다음"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
  );
}
