"use client";

import Image from "next/image";
import { type FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import Header from "@/components/layout/Header";
import {
  type MarketPageApiError,
  type TemplateType,
  type UpdateMarketPageTextRequest,
  updateMarketPageText,
} from "@/lib/api/market-page";
import styles from "../manage.module.css";

const setupStorageKey = "market_page_setup_draft";

type MarketTextFieldId = "marketIntro" | "summary" | "history" | "intro1" | "intro2" | "parking";

type MarketField = {
  id: MarketTextFieldId;
  label: string;
  placeholder: string;
  rows: 1 | 4;
};

type SetupDraft = {
  templateType?: TemplateType | string | null;
};

const marketFieldsByTemplate: Record<TemplateType, MarketField[]> = {
  TEMPLATE_1: [
    {
      id: "marketIntro",
      label: "1. 시장 소개 수정하기(300자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "intro1",
      label: "2. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "3. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "4. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치)",
      rows: 1,
    },
  ],
  TEMPLATE_2: [
    {
      id: "summary",
      label: "1. 시장 한 줄 소개 수정하기(50자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "history",
      label: "2. 시장 역사 수정하기(200자 이내)",
      placeholder: "(기존 시장 역사 내용)",
      rows: 4,
    },
    {
      id: "intro1",
      label: "3. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "4. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "5. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치)",
      rows: 1,
    },
  ],
  TEMPLATE_3: [
    {
      id: "summary",
      label: "1. 시장 한 줄 소개 수정하기(50자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "intro1",
      label: "2. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "3. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "4. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치 정보)",
      rows: 1,
    },
  ],
};

const textApiFieldByTemplate: Record<
  TemplateType,
  Partial<Record<MarketTextFieldId, keyof UpdateMarketPageTextRequest>>
> = {
  TEMPLATE_1: {
    marketIntro: "introContent",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
  TEMPLATE_2: {
    summary: "heroSubtitle",
    history: "historyText",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
  TEMPLATE_3: {
    summary: "heroSubtitle",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
};

const textMaxLengthByApiField: Record<keyof UpdateMarketPageTextRequest, number> = {
  heroSubtitle: 50,
  introContent: 300,
  feature1Description: 300,
  feature2Description: 300,
  historyText: 200,
  directionsText: 500,
};

function getTemplateType(value?: string | null): TemplateType | null {
  if (value === "TEMPLATE_1" || value === "TEMPLATE_2" || value === "TEMPLATE_3") {
    return value;
  }

  return null;
}

function getInitialTemplateType(): TemplateType {
  if (typeof window === "undefined") return "TEMPLATE_1";

  const queryTemplate = getTemplateType(new URLSearchParams(window.location.search).get("template"));
  if (queryTemplate) return queryTemplate;

  try {
    const savedDraft = window.sessionStorage.getItem(setupStorageKey);
    if (!savedDraft) return "TEMPLATE_1";

    const parsed = JSON.parse(savedDraft) as SetupDraft;
    return getTemplateType(parsed.templateType) ?? "TEMPLATE_1";
  } catch {
    return "TEMPLATE_1";
  }
}

function subscribeToTemplateType() {
  return () => {};
}

function getFieldMaxLength(apiField?: keyof UpdateMarketPageTextRequest) {
  return apiField ? textMaxLengthByApiField[apiField] : undefined;
}

export default function InfoEditPage() {
  const [tab, setTab] = useState<"market" | "store">("market");
  const [marketValues, setMarketValues] = useState<Partial<Record<MarketTextFieldId, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const templateType = useSyncExternalStore<TemplateType>(
    subscribeToTemplateType,
    getInitialTemplateType,
    () => "TEMPLATE_1",
  );

  const marketFields = marketFieldsByTemplate[templateType];
  const apiFieldByFieldId = useMemo(() => textApiFieldByTemplate[templateType], [templateType]);

  function updateFieldValue(fieldId: MarketTextFieldId, value: string) {
    setMarketValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
    setSaveMessage("");
    setSaveError("");
  }

  async function handleSaveMarketText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = marketFields.reduce<UpdateMarketPageTextRequest>((result, field) => {
      const apiField = apiFieldByFieldId[field.id];
      const value = marketValues[field.id]?.trim();

      if (apiField && value) {
        result[apiField] = value;
      }

      return result;
    }, {});

    if (Object.keys(payload).length === 0) {
      setSaveError("수정할 내용을 입력해주세요.");
      setSaveMessage("");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      await updateMarketPageText(payload);
      setSaveMessage("수정한 문구를 저장했어요.");
    } catch (error) {
      const apiError = error as Partial<MarketPageApiError>;
      setSaveError(apiError.message ?? "문구 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />
      <div className={styles.backgroundMark} aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="80vw"
          src="/images/onboarding/generating-background.png"
        />
      </div>

      <section className={styles.titleBlock}>
        <h1>웹사이트 상세 정보 수정하기</h1>
        <p>웹페이지 상세 정보 수정 방법은 ‘사용방법&apos; 탭에서 확인하실 수 있습니다.</p>
      </section>

      <section className={`${styles.panel} ${styles.editPanel}`} aria-label="웹사이트 상세 정보 수정">
        <div className={styles.tabs} role="tablist" aria-label="수정 항목">
          <button
            className={`${styles.tab} ${tab === "market" ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === "market"}
            onClick={() => setTab("market")}
          >
            시장 정보 수정
          </button>
          <button
            className={`${styles.tab} ${tab === "store" ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === "store"}
            onClick={() => setTab("store")}
          >
            가게 정보 수정
          </button>
        </div>

        {tab === "market" ? (
          <form className={styles.form} onSubmit={handleSaveMarketText}>
            {marketFields.map((field) => (
              <div className={styles.field} key={`${templateType}-${field.id}`}>
                <label htmlFor={`${templateType}-${field.id}`}>{field.label}</label>
                {field.rows === 1 ? (
                  <input
                    id={`${templateType}-${field.id}`}
                    maxLength={getFieldMaxLength(apiFieldByFieldId[field.id])}
                    placeholder={field.placeholder}
                    value={marketValues[field.id] ?? ""}
                    onChange={(event) => updateFieldValue(field.id, event.target.value)}
                  />
                ) : (
                  <textarea
                    id={`${templateType}-${field.id}`}
                    maxLength={getFieldMaxLength(apiFieldByFieldId[field.id])}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    value={marketValues[field.id] ?? ""}
                    onChange={(event) => updateFieldValue(field.id, event.target.value)}
                  />
                )}
              </div>
            ))}
            {saveError ? <p className={styles.formError}>{saveError}</p> : null}
            {saveMessage ? <p className={styles.formMessage}>{saveMessage}</p> : null}
            <button className={styles.saveButton} type="submit" disabled={isSaving}>
              {isSaving ? "저장 중" : "저장하기"}
            </button>
          </form>
        ) : (
          <div className={styles.storePlaceholder}>가게 정보 수정 화면은 준비 중입니다.</div>
        )}
      </section>
    </main>
  );
}
