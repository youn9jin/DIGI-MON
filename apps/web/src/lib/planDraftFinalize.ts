// src/lib/planDraftFinalize.ts
import { auth } from "@/lib/firebase";

const DRAFT_STORAGE_KEY = "digimon_draft";

type DraftLocal = {
    draftId: number;
};

function safeReadDraftId(): number | null {
    try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.draftId === "number") return parsed.draftId;
        return null;
    } catch {
        return null;
    }
}

/**
 * 온보딩 완료 후 1회:
 * draftId 기반으로 최종 실행 플랜(finalPlan)을 확정(finalize)한다.
 * - 서버는 idempotent(이미 FINALIZED면 기존 결과를 200으로 반환)
 */
export async function finalizePlanDraft(): Promise<any> {
    const draftId = safeReadDraftId();
    if (!draftId) throw new Error("draftId가 없습니다. 설문을 먼저 진행해주세요.");

    const user = auth.currentUser;
    if (!user) throw new Error("로그인이 필요합니다.");

    const idToken = await user.getIdToken();

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");

    const url = `${apiBase}/api/plan-drafts/${draftId}/finalize`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // 명세: {} 전송(추후 확장)
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
        const code = json?.error?.code;
        const msg =
            json?.error?.message ||
            `finalize 실패 (HTTP ${res.status}${code ? `, ${code}` : ""})`;
        throw new Error(msg);
    }

    // 필요하면 저장해서 action-plan 페이지에서 바로 쓰게 할 수 있음
    try {
        sessionStorage.setItem("finalPlanResponse", JSON.stringify(json.data));
    } catch {}

    return json.data;
}