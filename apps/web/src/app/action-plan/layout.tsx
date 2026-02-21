"use client";

import AuthHeader from "@/components/layout/AuthHeader";

export default function ActionPlanLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AuthHeader />
            {children}
        </>
    );
}