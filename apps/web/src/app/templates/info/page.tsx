"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  saveMarketPageSetup,
  type MarketPageApiError,
  type MarketPageSection,
  type TemplateType,
} from "@/lib/api/market-page";
import styles from "./template-info.module.css";

const backgroundImage =
  "https://www.figma.com/api/mcp/asset/3734902e-c1bf-4629-b5d5-f55aba4c23ce";
const locationPreviewImage =
  "https://www.figma.com/api/mcp/asset/2319ccd1-19b2-4d12-b6a1-72d89b228c56";

const textFields = [
  {
    id: "intro",
    title: "시장 소개 작성하기",
    placeholder: "시장 소개를 작성해주세요.",
    rows: 4,
  },
  {
    id: "history",
    title: "시장 역사 작성하기",
    placeholder: "시장 역사를 작성해주세요.",
    rows: 4,
  },
  {
    id: "directions",
    title: "시장 찾아오는 길 작성하기",
    placeholder:
      "지도에서 제공하는 내용보다 더 쉬운 길찾기 방법이 있다면 알려주세요. 예) 충무로역 6번 출구에서 직진한 후 메가커피 골목으로 들어오면 시장 주 출입구가 있습니다.",
    rows: 4,
  },
];

const setupStorageKey = "market_page_setup_draft";
const generatedPageIdStorageKey = "generated_market_page_id";

interface SetupDraft {
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
}

function getTemplateType(value: string | null): TemplateType {
  if (value === "TEMPLATE_1" || value === "TEMPLATE_2" || value === "TEMPLATE_3") {
    return value;
  }

  return "TEMPLATE_3";
}

function getSetupDraft(): SetupDraft {
  if (typeof window === "undefined") {
    return {
      templateType: "TEMPLATE_3",
      selectedSections: ["intro", "history", "directions", "stores", "tourism"],
    };
  }

  const stored = window.sessionStorage.getItem(setupStorageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<SetupDraft>;
      if (parsed.templateType && parsed.selectedSections?.length) {
        return {
          templateType: getTemplateType(parsed.templateType),
          selectedSections: parsed.selectedSections,
        };
      }
    } catch {
      window.sessionStorage.removeItem(setupStorageKey);
    }
  }

  return {
    templateType: getTemplateType(new URLSearchParams(window.location.search).get("template")),
    selectedSections: ["intro", "history", "directions", "stores", "tourism"],
  };
}

export default function TemplateInfoPage() {
  const router = useRouter();
  const [setupDraft] = useState<SetupDraft>(getSetupDraft);
  const [marketContent, setMarketContent] = useState({
    introText: "",
    historyText: "",
    directionsText: "",
  });
  const [previewTarget, setPreviewTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInfoComplete =
    marketContent.introText.trim().length > 0 &&
    marketContent.historyText.trim().length > 0 &&
    marketContent.directionsText.trim().length > 0;

  async function handleInfoComplete() {
    if (isSaving || !isInfoComplete) return;

    setIsSaving(true);
    try {
      await saveMarketPageSetup({
        templateType: setupDraft.templateType,
        selectedSections: setupDraft.selectedSections,
        marketContent,
      });
      window.sessionStorage.removeItem(generatedPageIdStorageKey);
      router.push("/templates/generating");
    } catch (error) {
      const apiError = error as MarketPageApiError;
      window.alert(apiError.message ?? "웹페이지 생성 설정 저장에 실패했습니다.");
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.backgroundMark} aria-hidden="true">
        <Image alt="" fill priority sizes="80vw" src={backgroundImage} />
      </div>

      <section className={styles.hero}>
        <h1>우리 시장 정보 입력</h1>
        <p>우리 시장만의 웹사이트를 만들기 위해서는 시장 소개, 입점 점포 정보 정보 등을 입력해주셔야해요.</p>
        <span>‘마이페이지 → 웹사이트 정보 수정하기&apos;에서 언제든지 수정 가능해요.</span>
      </section>

      <section className={styles.panel} aria-label="시장 정보 입력">
        <header className={styles.stepHeader}>
          <h2>3단계 - 시장 정보 입력하기</h2>
          <p>웹사이트를 완성하기 위해 정보를 작성해주세요. 글 작성은 AI의 도움을 받을 수 있습니다.</p>
        </header>

        <form className={styles.form}>
          {textFields.map((field, index) => (
            <section className={styles.fieldGroup} key={field.id}>
              <div className={styles.fieldTitleRow}>
                <h3>
                  {index + 1}. {field.title}
                </h3>
                <button type="button" onClick={() => setPreviewTarget(field.id)}>
                  글 위치 확인하기
                </button>
              </div>
              <textarea
                aria-label={field.title}
                placeholder={field.placeholder}
                rows={field.rows}
                value={
                  field.id === "intro"
                    ? marketContent.introText
                    : field.id === "history"
                      ? marketContent.historyText
                      : marketContent.directionsText
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setMarketContent((current) => {
                    if (field.id === "intro") return { ...current, introText: value };
                    if (field.id === "history") return { ...current, historyText: value };
                    return { ...current, directionsText: value };
                  });
                }}
              />
              <button className={styles.aiButton} type="button">
                AI 도움받기
              </button>
            </section>
          ))}

          <section className={styles.fieldGroup}>
            <div className={styles.fieldTitleRow}>
              <h3>4. 시장 점포 등록하기</h3>
              <button type="button" onClick={() => setPreviewTarget("stores")}>
                글 위치 확인하기
              </button>
            </div>
            <p className={styles.uploadHint}>
              시장 점포의 정보(영업시간, 연락처, 대표메뉴 등)가 담긴 파일을 업로드해주세요.
            </p>
            <label className={styles.fileUpload}>
              <input type="file" />
              <span>파일 첨부</span>
            </label>
          </section>
        </form>

        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            disabled={isSaving || !isInfoComplete}
            type="button"
            onClick={handleInfoComplete}
          >
            {isSaving ? "저장 중..." : "정보 입력 완료"}
          </button>
        </div>
      </section>

      {previewTarget && (
        <div className={styles.previewOverlay} role="dialog" aria-modal="true">
          <div className={styles.previewModal}>
            <button
              className={styles.closePreview}
              type="button"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewTarget(null)}
            />
            <h2>시장 소개 작성 미리보기</h2>
            <div className={styles.previewCanvas}>
              <Image
                alt="선택한 템플릿 미리보기"
                fill
                sizes="1074px"
                src={locationPreviewImage}
              />
              <div className={styles.highlightBox} aria-hidden="true" />
            </div>
            <p>흰색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다</p>
          </div>
        </div>
      )}
    </main>
  );
}
