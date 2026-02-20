"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthHeader() {
    const router = useRouter();
    const [name, setName] = useState<string>("");

    // ✅ (선택) 백엔드 /api/me 에서 이름 가져오기 (이미 로그인은 이 방식 쓰고 있었지)
    useEffect(() => {
        const run = async () => {
            const u = auth.currentUser;
            if (!u) return;

            try {
                const idToken = await u.getIdToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                if (!res.ok) return;

                const data = await res.json();
                // 백엔드 응답에서 name 키가 있다고 가정 (없으면 email 앞부분 fallback)
                setName(data?.name || u.displayName || u.email?.split("@")[0] || "");
            } catch {
                // 실패하면 firebase 정보로 fallback
                setName(auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "");
            }
        };
        run();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/"); // 홈으로
    };

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
                {/* 왼쪽: 로고 */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative h-[30px] w-[30px]">
                        <Image src="/images/logo.svg" alt="logo" width={19} height={30} />
                    </div>
                    <span className="text-[20px] font-semibold text-[#353535] whitespace-nowrap">
            DIGI-MON
          </span>
                </Link>

                {/* 오른쪽 메뉴 */}
                <nav className="flex items-center gap-4 md:gap-6 text-[17px] text-[#535353]">
                    {/* 이름 */}
                    <span className="hidden md:inline-block whitespace-nowrap">
            {name ? `${name}님` : "회원님"}
          </span>

                    {/* 구분선 */}
                    <span className="hidden md:inline-block">
            <div className="relative h-[17px] w-[1px]">
              <Image src="/images/divider.svg" alt="" fill className="object-contain" />
            </div>
          </span>

                    <Link href="/guide" className="hover:opacity-80">
                        사용방법
                    </Link>

                    <Link href="/action-plan" className="hover:opacity-80">
                        액션플랜 레시피
                    </Link>

                    <Link href="/mypage" className="hover:opacity-80">
                        마이페이지
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-[#535353] hover:text-[#b0c965] transition whitespace-nowrap"
                    >
                        로그아웃
                    </button>
                </nav>
            </div>
        </header>
    );
}
