"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const onChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 회원가입 API 연결

    router.push("/signup/complete");
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
            {/* 타이틀 */}
            <h1 className="text-center font-bold text-[30px] leading-[38px] text-black">
              DIGI-MON 회원가입
            </h1>

            <form onSubmit={onSubmit} className="mt-[70px]">
              {/* 입력 영역 */}
              <div className="flex flex-col gap-[44px]">
                {/* 이름 */}
                <div>
                  <label className="block font-medium text-[20px] leading-[35px] text-[#737373]">
                    이름
                  </label>
                  <input
                    value={form.name}
                    onChange={onChange("name")}
                    className="
                      mt-[18px] w-full bg-transparent
                      text-[18px] text-black
                      outline-none border-b border-[#CFCFCF]
                      pb-[10px]
                    "
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block font-medium text-[20px] leading-[35px] text-[#737373]">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                    className="
                      mt-[18px] w-full bg-transparent
                      text-[18px] text-black
                      outline-none border-b border-[#CFCFCF]
                      pb-[10px]
                    "
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block font-medium text-[20px] leading-[35px] text-[#737373]">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={onChange("password")}
                    className="
                      mt-[18px] w-full bg-transparent
                      text-[18px] text-black
                      outline-none border-b border-[#CFCFCF]
                      pb-[10px]
                    "
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block font-medium text-[20px] leading-[35px] text-[#737373]">
                    전화번호
                  </label>
                  <input
                    value={form.phone}
                    onChange={onChange("phone")}
                    className="
                      mt-[18px] w-full bg-transparent
                      text-[18px] text-black
                      outline-none border-b border-[#CFCFCF]
                      pb-[10px]
                    "
                  />
                </div>
              </div>

              <div className="mt-[14px]">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 text-[15px] leading-[20px] text-black"
                >
                  <span className="inline-block -mt-[1px] text-[16px]">‹</span>
                  이전 화면으로
                </button>

                {/* 다음 버튼*/}
                <button
                  type="submit"
                  className="
                    mt-[65px]
                    mx-auto block
                    h-[74px] w-[308px]
                    rounded-[20px]
                    text-[20px] font-medium text-[#313131]
                    hover:opacity-90 transition
                  "
                  style={{
                    background:
                      "linear-gradient(90deg, #B0C965 0%, #FFFFFF 147.56%)",
                  }}
                >
                  다음
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
