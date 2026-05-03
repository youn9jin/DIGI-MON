import LogoHeader from "@/components/layout/LogoHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <LogoHeader />
      {children}
    </div>
  );
}
