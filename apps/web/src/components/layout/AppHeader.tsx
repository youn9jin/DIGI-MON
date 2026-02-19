"use client";

import Header from "@/components/layout/Header";
import AuthHeader from "@/components/layout/AuthHeader";
import { useAuthUser } from "@/lib/useAuthUser";

export default function AppHeader() {
    const { ready, isLoggedIn } = useAuthUser();

    if (!ready) return <div className="h-[70px] w-full" />;

    return isLoggedIn ? <AuthHeader /> : <Header />;
}
