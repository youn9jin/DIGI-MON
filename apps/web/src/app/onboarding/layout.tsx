"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExitModal from "@/components/ui/ExitModal";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      // 온보딩 내부 이동은 그냥 허용
      if (href.startsWith("/onboarding")) return;

      // 외부 이동 시도 → 모달
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
      setShowModal(true);
    }

    // capture phase로 등록해야 Next.js Link보다 먼저 잡힘
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    // 현재 위치를 히스토리에 한 번 더 쌓아서 뒤로 가기를 가로챌 수 있게 함
    history.pushState(null, "", window.location.href);

    function handlePopState() {
      // 뒤로 가기가 눌리면 다시 현재 위치를 쌓아서 실제 이동을 막음
      history.pushState(null, "", window.location.href);
      setPendingHref(null);
      setShowModal(true);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleLeave() {
    setShowModal(false);
    if (pendingHref) {
      router.push(pendingHref);
    } else {
      // 뒤로 가기로 모달이 떴을 때 → 실제로 뒤로 이동
      router.back();
    }
  }

  function handleClose() {
    setShowModal(false);
    setPendingHref(null);
  }

  return (
    <>
      {children}
      {showModal && (
        <ExitModal onLeave={handleLeave} onClose={handleClose} />
      )}
    </>
  );
}
