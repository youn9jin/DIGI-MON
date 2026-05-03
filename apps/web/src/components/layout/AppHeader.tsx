"use client";

import { useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import AuthHeader from "@/components/layout/AuthHeader";
import { useAuthUser } from "@/lib/useAuthUser";
import { attachAnonymousDraftIfExists } from "@/lib/planDraftAttach";

export default function AppHeader() {
    const { ready, isLoggedIn } = useAuthUser();

    // 같은 탭에서 중복 attach 호출 방지
    const didRunRef = useRef(false);

    useEffect(() => {
        if (!ready) return;
        if (!isLoggedIn) return;

        if (didRunRef.current) return;
        didRunRef.current = true;

        // 로그인 직후: localStorage에 익명 draft가 있으면 attach 1회 시도
        attachAnonymousDraftIfExists().catch((e) => {
            console.warn("attachAnonymousDraftIfExists error:", e);
        });
    }, [ready, isLoggedIn]);

    if (!ready) return <div className="h-[70px] w-full" />;

    return isLoggedIn ? <AuthHeader /> : <Header />;
}