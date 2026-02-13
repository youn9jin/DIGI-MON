import AuthHeader from "@/components/layout/AuthHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AuthHeader />
      {children}
    </div>
  );
}
