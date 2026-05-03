"use client";

import LandingHero from "@/components/landing/landing-hero";
import LandingHeroAuth from "@/components/landing/landing-hero-auth";
import { useAuthUser } from "@/lib/useAuthUser";

export default function HomePage() {
    const { ready, isLoggedIn } = useAuthUser();

    if (!ready) return <div className="min-h-[calc(100vh-70px)]" />;

    return isLoggedIn ? <LandingHeroAuth /> : <LandingHero />;
}
