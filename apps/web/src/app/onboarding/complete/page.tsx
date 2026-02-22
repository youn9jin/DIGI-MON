"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "@/lib/useAuthUser";
import { attachAnonymousDraftIfExists } from "@/lib/planDraftAttach";
import { finalizePlanDraft } from "@/lib/planDraftFinalize";

const LS_KEYS = {
    industry: "digimon_industry",
    storeName: "digimon_store_name",
    adminArea: "digimon_store_location",
    ageGroup: "digimon_age_group",
};

// age 라벨 -> enum
const AGE_LABEL_TO_ENUM: Record<string, string> = {
    "10대": "AGE_10S",
    "20대": "AGE_20S",
    "30대": "AGE_30S",
    "40대": "AGE_40S",
    "50대": "AGE_50S",
    "60대 이상": "AGE_60_PLUS",
};

type SaveState = "idle" | "saving" | "success" | "error";
type FinalizeState = "idle" | "finalizing" | "success" | "error";

function normalizeAgeEnum(value: string) {
    const v = (value || "").trim();
    if (!v) return "";
    if (Object.values(AGE_LABEL_TO_ENUM).includes(v)) return v; // 이미 enum이면 그대로
    return AGE_LABEL_TO_ENUM[v] || "";
}

function isValidCountryCode2(code: string) {
    return /^[A-Z]{2}$/.test(code);
}

export default function OnboardingCompletePage() {
    const { user, ready, isLoggedIn } = useAuthUser();

    const [saveState, setSaveState] = useState<SaveState>("idle");
    const [finalizeState, setFinalizeState] = useState<FinalizeState>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const onboardingUrl = apiBase ? `${apiBase}/api/owners/onboarding` : "";

    const payload = useMemo(() => {
        if (typeof window === "undefined") return null;

        const industryTag = (localStorage.getItem(LS_KEYS.industry) || "").trim(); // enum
        const ageRaw = localStorage.getItem(LS_KEYS.ageGroup) || "";
        const ageGroup = normalizeAgeEnum(ageRaw);

        const storeName = (localStorage.getItem(LS_KEYS.storeName) || "").trim();
        const adminArea = (localStorage.getItem(LS_KEYS.adminArea) || "").trim();

        return {
            industryTag,
            ageGroup,
            storeName,
            location: {
                countryCode: "KR",
                adminArea,
            },
            // openedAt: 프론트는 보내지 않음
        };
    }, []);

    async function saveOnboardingOnce() {
        if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
        if (!payload) throw new Error("온보딩 데이터가 없습니다.");
        if (!ready) throw new Error("로그인 상태를 확인 중입니다.");
        if (!isLoggedIn || !user) throw new Error("로그인이 필요합니다.");

        // 필수 검증(명세)
        if (!payload.industryTag) throw new Error("업종 값이 비어있습니다. 업종을 다시 선택해주세요.");
        if (!payload.ageGroup) throw new Error("연령대 값이 올바르지 않습니다. 연령대를 다시 선택해주세요.");
        if (!payload.storeName) throw new Error("상호명이 비어있습니다. 상호명을 입력해주세요.");
        if (!payload.location.adminArea) throw new Error("가게 위치가 비어있습니다. 위치를 입력해주세요.");
        if (!isValidCountryCode2(payload.location.countryCode)) {
            throw new Error("국가코드(countryCode)는 대문자 2글자여야 합니다. 예: KR");
        }

        setSaveState("saving");
        setErrorMsg("");

        const token = await user.getIdToken();

        const res = await fetch(onboardingUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        // 201(최초) / 200(업데이트) 모두 성공 처리
        if (res.status === 200 || res.status === 201) {
            setSaveState("success");
            return;
        }

        let msg = `온보딩 저장 실패 (HTTP ${res.status})`;
        try {
            const json = await res.json();
            msg = json?.error?.message || json?.message || msg;
        } catch {}

        setSaveState("error");
        setErrorMsg(msg);
    }

    async function finalizeOnce() {
        setFinalizeState("finalizing");
        setErrorMsg("");

        try {
            // ✅ 1) 먼저 attach 시도 (익명 draft -> 내 계정에 귀속)
            await attachAnonymousDraftIfExists();

            // ✅ 2) 그 다음 finalize
            await finalizePlanDraft();

            setFinalizeState("success");
        } catch (e: any) {
            setFinalizeState("error");
            setErrorMsg(e?.message || "finalize 중 오류가 발생했습니다.");
        }
    }

    // complete 진입 시:
    // 1) onboarding 저장 1회
    // 2) 성공하면 finalize 1회
    useEffect(() => {
        if (!ready) return;
        if (saveState !== "idle") return;

        saveOnboardingOnce().catch((e) => {
            setSaveState("error");
            setErrorMsg(e?.message || "온보딩 저장 중 오류가 발생했습니다.");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]);

    useEffect(() => {
        if (saveState !== "success") return;
        if (finalizeState !== "idle") return;

        finalizeOnce();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveState]);

    const canGoNext = saveState === "success" && finalizeState === "success";

    const titleText =
        saveState === "saving"
            ? "가게 정보를 저장하는 중입니다..."
            : saveState === "error"
                ? "가게 정보 저장에 실패했습니다"
                : finalizeState === "finalizing"
                    ? "맞춤 실행 플랜을 생성하는 중입니다..."
                    : finalizeState === "error"
                        ? "실행 플랜 생성에 실패했습니다"
                        : "가게 정보 등록이 완료되었습니다";

    return (
        <main className="min-h-[calc(100vh-70px)] w-full bg-[#FAFAFA]">
            <div className="mx-auto w-full max-w-[1440px] px-6 pt-[70px] pb-16">
                <div className="flex flex-col items-center justify-center mt-[60px]">
                    <div className="relative w-[194px] h-[166px]">
                        <Image
                            src="/images/complete.svg"
                            alt="온보딩 완료"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className="mt-[30px] text-[45px] font-semibold leading-[38px] text-black text-center">
                        {titleText}
                    </h1>

                    {(saveState === "error" || finalizeState === "error") && (
                        <div className="mt-4 max-w-[560px] text-center">
                            <p className="text-[15px] text-red-600">{errorMsg}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    // 다시 시도: onboarding부터 다시
                                    setSaveState("idle");
                                    setFinalizeState("idle");
                                    setErrorMsg("");
                                }}
                                className="mt-4 h-[45px] px-6 rounded-[12px] bg-white border border-red-200 text-red-600 hover:opacity-90 transition"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {canGoNext ? (
                        <Link
                            href="/survey/action"
                            className="
                mt-[40px]
                flex items-center justify-center
                w-[453px] h-[73px]
                rounded-[20px]
                text-[22px] font-semibold text-[#2E2E2E]
                hover:opacity-90 transition
              "
                            style={{
                                backgroundImage:
                                    "linear-gradient(106.541684deg, rgba(176,201,101,0.9) 13.215%, rgba(255,255,255,0.9) 127.46%)",
                            }}
                        >
                            맞춤 액션플랜 하러가기
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="
                mt-[40px]
                flex items-center justify-center
                w-[453px] h-[73px]
                rounded-[20px]
                text-[22px] font-semibold text-[#2E2E2E]
                opacity-50 cursor-not-allowed
              "
                            style={{
                                backgroundImage:
                                    "linear-gradient(106.541684deg, rgba(176,201,101,0.9) 13.215%, rgba(255,255,255,0.9) 127.46%)",
                            }}
                        >
                            {saveState === "saving"
                                ? "저장 중..."
                                : finalizeState === "finalizing"
                                    ? "플랜 생성 중..."
                                    : "저장 완료 후 이동 가능"}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}