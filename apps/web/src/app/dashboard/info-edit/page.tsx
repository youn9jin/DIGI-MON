"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import Header from "@/components/layout/Header";
import { type TemplateType } from "@/lib/api/market-page";
import styles from "../manage.module.css";

const setupStorageKey = "market_page_setup_draft";

type MarketField = {
  id: string;
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

export default function InfoEditPage() {
  const [tab, setTab] = useState<"market" | "store">("market");
  const templateType = useSyncExternalStore<TemplateType>(
    subscribeToTemplateType,
    getInitialTemplateType,
    () => "TEMPLATE_1",
  );

  const marketFields = marketFieldsByTemplate[templateType];

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
          <form className={styles.form}>
            {marketFields.map((field) => (
              <div className={styles.field} key={`${templateType}-${field.id}`}>
                <label htmlFor={`${templateType}-${field.id}`}>{field.label}</label>
                {field.rows === 1 ? (
                  <input id={`${templateType}-${field.id}`} placeholder={field.placeholder} />
                ) : (
                  <textarea
                    id={`${templateType}-${field.id}`}
                    placeholder={field.placeholder}
                    rows={field.rows}
                  />
                )}
              </div>
            ))}
            <button className={styles.saveButton} type="button">
              저장하기
            </button>
          </form>
        ) : (
          <div className={styles.storePlaceholder}>가게 정보 수정 화면은 준비 중입니다.</div>
        )}
      </section>
    </main>
  );
}
