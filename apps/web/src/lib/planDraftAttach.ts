// src/lib/planDraftAttach.ts
import { auth } from "@/lib/firebase";

const DRAFT_STORAGE_KEY = "digimon_draft";

type DraftLocal = {
    draftId: number;
    attachToken?: string;
    attachTokenExpiresAt?: string;
};

function safeReadDraftLocal(): DraftLocal | null {
    try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.draftId === "number") return parsed as DraftLocal;
        return null;
    } catch {
        return null;
    }
}

function safeWriteDraftLocal(data: DraftLocal) {
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch {}
}

export async function attachAnonymousDraftIfExists(): Promise<void> {
    const local = safeReadDraftLocal();
    if (!local?.draftId || !local?.attachToken) return;

    if (local.attachTokenExpiresAt) {
        const exp = Date.parse(local.attachTokenExpiresAt);
        if (!Number.isNaN(exp) && exp <= Date.now()) {
            safeWriteDraftLocal({ draftId: local.draftId });
            return;
        }
    }

    const user = auth.currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) return;

    const url = `${apiBase}/api/plan-drafts/${local.draftId}/attach`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ attachToken: local.attachToken }),
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success && json?.data?.attached === true) {
        // attach 성공 → attachToken 제거(명세)
        safeWriteDraftLocal({ draftId: local.draftId });
        return;
    }
}