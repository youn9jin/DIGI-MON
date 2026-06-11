"use client";

export type DashboardOperationToastType = "template" | "detail";

type DashboardOperationToastPayload = {
  type: DashboardOperationToastType;
  createdAt: number;
};

export const dashboardOperationToastKey = "dashboard_operation_toast";
export const dashboardOperationToastEvent = "dashboard-operation-toast";

export function publishDashboardOperationToast(type: DashboardOperationToastType) {
  if (typeof window === "undefined") return;

  const payload: DashboardOperationToastPayload = {
    type,
    createdAt: Date.now(),
  };

  window.sessionStorage.setItem(dashboardOperationToastKey, JSON.stringify(payload));
  window.dispatchEvent(new Event(dashboardOperationToastEvent));
}

export function readDashboardOperationToast(): DashboardOperationToastPayload | null {
  if (typeof window === "undefined") return null;

  const rawPayload = window.sessionStorage.getItem(dashboardOperationToastKey);
  if (!rawPayload) return null;

  try {
    const payload = JSON.parse(rawPayload) as Partial<DashboardOperationToastPayload>;
    if (payload.type !== "template" && payload.type !== "detail") return null;
    if (typeof payload.createdAt !== "number") return null;

    return {
      type: payload.type,
      createdAt: payload.createdAt,
    };
  } catch {
    return null;
  }
}

export function clearDashboardOperationToast() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(dashboardOperationToastKey);
}
