import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DashboardOperationToast from "@/components/dashboard/DashboardOperationToast";
import GenerationCompletionWatcher from "@/components/templates/GenerationCompletionWatcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WithOn",
  description: "WithOn 전통시장 웹사이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <GenerationCompletionWatcher />
        <DashboardOperationToast />
      </body>
    </html>
  );
}
