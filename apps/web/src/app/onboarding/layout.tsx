"use client";

import LogoHeader from "@/components/layout/LogoHeader";

export default function OnboardingLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <LogoHeader />
            {children}
        </>
    );
}