"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type MeState = {
    role?: string;
    onboarded?: boolean;
};

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    const [me, setMe] = useState<MeState | null>(null);
    const [meReady, setMeReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            setReady(true);

            // 로그아웃이면 me 정보 초기화
            if (!u) {
                setMe(null);
                setMeReady(true);
                return;
            }

            // 로그인 상태면 /api/me로 onboarded 확인
            try {
                setMeReady(false);

                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
                if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL missing");

                const idToken = await u.getIdToken();
                const res = await fetch(`${apiBase}/api/me`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                const json = await res.json().catch(() => null);

                // 성공 형태: { success: true, data: { role, onboarded, ... } }
                if (res.ok && json?.success) {
                    setMe({
                        role: json?.data?.role,
                        onboarded: Boolean(json?.data?.onboarded),
                    });
                } else {
                    // 실패하면 일단 me는 null로 두고 진행
                    setMe(null);
                }
            } catch (e) {
                setMe(null);
            } finally {
                setMeReady(true);
            }
        });

        return () => unsub();
    }, []);

    const isLoggedIn = !!user;

    return {
        user,
        ready,
        isLoggedIn,
        me,            // { role, onboarded }
        meReady,       // me 정보까지 준비됐는지
        role: me?.role,
        onboarded: Boolean(me?.onboarded),
    };
}