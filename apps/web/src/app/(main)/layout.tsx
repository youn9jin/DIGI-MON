import AppHeader from "@/components/layout/AppHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppHeader />
            {children}
        </>
    );
}
