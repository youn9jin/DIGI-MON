"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearDashboardOperationToast,
  dashboardOperationToastEvent,
  readDashboardOperationToast,
  type DashboardOperationToastType,
} from "@/lib/dashboard-operation-toast";
import styles from "./DashboardOperationToast.module.css";

const toastCopy: Record<DashboardOperationToastType, { title: string; message: string }> = {
  template: {
    title: "웹사이트 템플릿 변경 완료 알림",
    message: "웹사이트 템플릿 변경이 완료되었습니다. 변경된 웹사이트를 확인하세요!",
  },
  detail: {
    title: "웹사이트 상세 정보 변경 완료 알림",
    message: "웹사이트 상세 정보 변경이 완료되었습니다. 변경된 웹사이트를 확인하세요!",
  },
};

export default function DashboardOperationToast() {
  const pathname = usePathname();
  const [type, setType] = useState<DashboardOperationToastType | null>(null);

  useEffect(() => {
    const syncToast = () => {
      const payload = readDashboardOperationToast();
      setType(payload?.type ?? null);
    };

    syncToast();
    window.addEventListener(dashboardOperationToastEvent, syncToast);
    window.addEventListener("storage", syncToast);
    window.addEventListener("focus", syncToast);

    return () => {
      window.removeEventListener(dashboardOperationToastEvent, syncToast);
      window.removeEventListener("storage", syncToast);
      window.removeEventListener("focus", syncToast);
    };
  }, [pathname]);

  useEffect(() => {
    if (!type) return undefined;

    const timeout = window.setTimeout(() => {
      clearDashboardOperationToast();
      setType(null);
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [type]);

  if (!type) return null;

  const copy = toastCopy[type];

  return (
    <aside
      className={styles.toast}
      role="status"
      aria-live="polite"
      aria-label={copy.title}
    >
      <span className={styles.logo} aria-hidden="true">
        <Image
          src="/images/onboarding/market-illustration.png"
          alt=""
          width={283}
          height={286}
          className={styles.logoImage}
        />
      </span>
      <div className={styles.copy}>
        <strong>{copy.title}</strong>
        <p>{copy.message}</p>
      </div>
    </aside>
  );
}
