"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionBox from "@/components/survey/QuestionBox";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const TOTAL_STEPS = 5;

const STEP_1 = {
  title: "구글 지도에서 가게 이름을 검색하면 바로 찾을 수 있나요?",
  options: ["바로 나온다", "잘 모르겠다", "안 나온다"],
} as const;

const STEP_2 = {
  title: "기본 정보(가게 위치, 영업시간 등)가 정확하게 보이나요?",
  options: ["다 맞게 있다", "일부만 있거나 틀림", "없다 / 모르겠다"],
} as const;

const STEP_3 = {
  title: "가게에서 판매하는 품목이나 제공 서비스가 사진이나 설명으로 잘 보이나요?",
  options: ["충분히 있다", "조금만 있다", "거의 없다"],
} as const;

const STEP_4 = {
  title: "온라인 상으로 가게 소식을 전할 수 있는 방법이 있나요?",
  options: ["있다 (카카오 채널, 메시지 등)", "있는지 모르겠다", "없다"],
} as const;

const STEP_5 = {
  title: "지금 가장 먼저 해결하고 싶은 것은 무엇인가요?",
  options: [
    "가게 접근성 높이기",
    "가게를 좋아보이게 하기",
    "연락이 잘 오게 하기",
    "잘 모르겠다",
  ],
} as const;

const DRAFT_STORAGE_KEY = "digimon_draft";
const SESSION_RESULT_KEY = "planDraftResponse";

type DraftLocal = {
  guestKey: string;
  draftId: number;
  attachToken: string;
  attachTokenExpiresAt: string;
};

type PlanAction = {
  actionCode: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  steps?: Array<{ step_title: string; description: string }>;
};

type PlanDraftResponse = {
  guestKey: string;
  draftId: number;
  attachToken: string;
  attachTokenExpiresAt: string;
  digitalLevel: string;
  initialPlan: PlanAction[];
};

function buildSurveyPayload(answers: Record<number, string | null>) {
  const a1 = answers[1];
  const a2 = answers[2];
  const a3 = answers[3];
  const a4 = answers[4];
  const a5 = answers[5];

  if (!a1 || !a2 || !a3 || !a4 || !a5) return null;

  const q1Map = {
    "바로 나온다": "EASY_FOUND",
    "잘 모르겠다": "NOT_SURE",
    "안 나온다": "NOT_FOUND",
  } as const;

  const q2Map = {
    "다 맞게 있다": "ALL_CORRECT",
    "일부만 있거나 틀림": "PARTIAL_OR_WRONG",
    "없다 / 모르겠다": "NONE_OR_UNKNOWN",
  } as const;

  const q3Map = {
    "충분히 있다": "ENOUGH",
    "조금만 있다": "SOME",
    "거의 없다": "BARELY",
  } as const;

  const q4Map = {
    "있다 (카카오 채널, 메시지 등)": "HAS_CHANNEL",
    "있는지 모르겠다": "NOT_SURE",
    "없다": "NO_CHANNEL",
  } as const;

  const q5Map = {
    "가게 접근성 높이기": "INCREASE_ACCESSIBILITY",
    "가게를 좋아보이게 하기": "LOOK_BETTER",
    "연락이 잘 오게 하기": "GET_MORE_CONTACTS",
    "잘 모르겠다": "NOT_SURE",
  } as const;

  return {
    survey: {
      q1MapSearchable: q1Map[a1 as keyof typeof q1Map],
      q2MapInfoAccurate: q2Map[a2 as keyof typeof q2Map],
      q3MenuVisible: q3Map[a3 as keyof typeof q3Map],
      q4ContactChannel: q4Map[a4 as keyof typeof q4Map],
      q5PrimaryGoal: q5Map[a5 as keyof typeof q5Map],
    },
  };
}

function safeReadDraftLocal(): DraftLocal | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
        parsed?.guestKey &&
        typeof parsed.guestKey === "string" &&
        typeof parsed.draftId === "number" &&
        typeof parsed.attachToken === "string" &&
        typeof parsed.attachTokenExpiresAt === "string"
    ) {
      return parsed as DraftLocal;
    }
    return null;
  } catch {
    return null;
  }
}

function safeWriteDraftLocal(data: DraftLocal) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

function safeWriteSessionResult(data: {
  draftId: number;
  digitalLevel: string;
  initialPlan: PlanAction[];
}) {
  try {
    sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("sessionStorage save failed:", e);
  }
}

async function createPlanDraft(
  answers: Record<number, string | null>
): Promise<PlanDraftResponse> {
  const payloadBase = buildSurveyPayload(answers);
  if (!payloadBase) throw new Error("설문 답변이 완성되지 않았어요.");

  const local = safeReadDraftLocal();
  const body = local?.guestKey ? { guestKey: local.guestKey, ...payloadBase } : payloadBase;

  console.log("[createPlanDraft] 요청 전송");
  const res = await fetch("/api/plan-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  console.log("[createPlanDraft] 응답:", {
    status: res.status,
    success: json?.success,
    hasData: !!json?.data,
    initialPlanLength: Array.isArray(json?.data?.initialPlan) ? json.data.initialPlan.length : 0,
  });

  if (!res.ok || !json?.success) {
    const msg = json?.error?.message || `요청 실패 (${res.status})`;
    throw new Error(msg);
  }

  if (!json?.data) {
    throw new Error("응답 데이터가 없어요.");
  }

  return json.data as PlanDraftResponse;
}

export default function SurveyPage() {
  const router = useRouter();

  const [readyForGuest, setReadyForGuest] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/action-plan");
      else setReadyForGuest(true);
    });
    return () => unsub();
  }, [router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepConfig = useMemo(() => {
    return currentStep === 1
        ? STEP_1
        : currentStep === 2
            ? STEP_2
            : currentStep === 3
                ? STEP_3
                : currentStep === 4
                    ? STEP_4
                    : STEP_5;
  }, [currentStep]);

  const selected = answers[currentStep] ?? null;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selected) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = await createPlanDraft(answers);

      safeWriteDraftLocal({
        guestKey: data.guestKey,
        draftId: data.draftId,
        attachToken: data.attachToken,
        attachTokenExpiresAt: data.attachTokenExpiresAt,
      });

      safeWriteSessionResult({
        draftId: data.draftId,
        digitalLevel: data.digitalLevel,
        initialPlan: data.initialPlan,
      });

      router.push("/survey/result");
    } catch (e: any) {
      setSubmitError(e?.message ?? "알 수 없는 오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent =
      ((currentStep - 1) / TOTAL_STEPS) * 100 +
      (selected ? (1 / TOTAL_STEPS) * 100 : 0);

  if (!readyForGuest) return null;

  return (
      <div className="relative min-h-screen w-full bg-[#fafafa]">
        <div className="absolute left-1/2 -translate-x-1/2 top-[185px] w-full max-w-[1432px] pointer-events-none">
          <Image
              src="/images/survey-bg.svg"
              alt="배경 이미지"
              width={1432}
              height={799}
              className="w-full h-auto object-contain"
              priority
          />
        </div>

        <main className="relative z-10 flex flex-col items-center px-4 pt-[140px] pb-[120px]">
          <p className="text-center text-[16px] md:text-[18px] text-[#6e6e6e] max-w-[720px]">
            로그인 후 &apos;내 가게&apos;에서 언제든지 정보를 수정할 수 있어요!
          </p>

          <div className="mt-8 w-full flex justify-center">
            <QuestionBox
                step={currentStep}
                totalSteps={TOTAL_STEPS}
                title={stepConfig.title}
                options={[...stepConfig.options]}
                selected={selected}
                onSelect={handleSelect}
                onSubmit={handleSubmit}
            />
          </div>

          <div className="mt-10 w-full max-w-[597px]">
            <div className="h-[8px] w-full rounded-[41px] border border-[#b0c965] bg-white overflow-hidden">
              <div
                  className="h-full rounded-[41px] bg-[#b0c965] transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 w-full max-w-[597px]">
            {isSubmitting && (
                <p className="text-center text-sm text-[#6e6e6e]">
                  액션플랜을 생성 중이에요… 잠시만 기다려주세요.
                </p>
            )}
            {submitError && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {submitError}
                </p>
            )}
          </div>
        </main>
      </div>
  );
}