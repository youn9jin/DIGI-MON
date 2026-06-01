"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as XLSX from "xlsx";
import Header from "@/components/layout/Header";
import {
  saveMarketPageSetup,
  type MarketPageApiError,
  type MarketPageSection,
  type TemplateType,
} from "@/lib/api/market-page";
import { createStores, type StoreCreateItem } from "@/lib/api/stores";
import styles from "./template-info.module.css";

const backgroundImage = "/images/templates/info-preview/info-background.png";

const textFields = [
  {
    id: "intro" as const,
    title: "시장 소개 작성하기",
    placeholder: "시장 소개를 작성해주세요.",
    rows: 4,
  },
  {
    id: "history" as const,
    title: "시장 역사 작성하기",
    placeholder: "시장 역사를 작성해주세요.",
    rows: 4,
  },
  {
    id: "directions" as const,
    title: "시장 찾아오는 길 작성하기",
    placeholder:
      "지도에서 제공하는 내용보다 더 쉬운 길찾기 방법이 있다면 알려주세요. 예) 충무로역 6번 출구에서 직진한 후 메가커피 골목으로 들어오면 시장 주 출입구가 있습니다.",
    rows: 4,
  },
];

const setupStorageKey = "market_page_setup_draft";
const generatedPageIdStorageKey = "generated_market_page_id";
const generationVersionStorageKey = "market_page_generation_version";

type PreviewTarget = "intro" | "history" | "directions" | "stores";

interface PreviewConfig {
  title: string;
  modalClassName: string;
  canvasClassName: string;
  images: {
    alt: string;
    className: string;
    sizes: string;
    src: string;
  }[];
  highlights?: string[];
  instruction?: string;
  instructionClassName?: string;
}

interface SetupDraft {
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
}

const storeHeaderMap: Record<keyof StoreCreateItem, string[]> = {
  name: ["name", "점포명", "가게명", "상호명", "상호"],
  category: ["category", "업종", "카테고리", "분류"],
  items: ["items", "취급품목", "취급 품목", "대표메뉴", "대표 메뉴", "품목"],
  operatingHours: ["operating_hours", "operatingHours", "영업시간", "운영시간", "운영 시간"],
  yearsOfOperation: ["years_of_operation", "yearsOfOperation", "운영연수", "운영 연수"],
  contact: ["contact", "연락처", "전화번호", "대표 연락처"],
  description: ["description", "점포소개", "점포 소개", "소개"],
};

const commonPreviewConfig: PreviewConfig = {
  title: "미리보기",
  modalClassName: styles.previewModalDefault,
  canvasClassName: styles.previewCanvasDefault,
  images: [
    {
      alt: "선택한 템플릿 미리보기",
      className: styles.previewImageFill,
      sizes: "1074px",
      src: "/images/templates/info-preview/directions-preview.png",
    },
  ],
  highlights: [styles.directionsHighlight],
  instruction: "흰색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
  instructionClassName: styles.previewInstructionLight,
};

const template3PreviewConfigs: Record<PreviewTarget, PreviewConfig> = {
  intro: {
    title: "미리보기",
    modalClassName: styles.previewModalDefault,
    canvasClassName: styles.previewCanvasIntro,
    images: [
      {
        alt: "시장 소개 글 위치 미리보기",
        className: styles.previewImageFill,
        sizes: "1149px",
        src: "/images/templates/info-preview/intro-preview.png",
      },
    ],
    highlights: [styles.introHighlight],
    instruction: "흰색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
    instructionClassName: styles.previewInstructionDark,
  },
  history: {
    title: "미리보기",
    modalClassName: styles.previewModalDefault,
    canvasClassName: styles.previewCanvasHistory,
    images: [
      {
        alt: "시장 역사 글 위치 미리보기",
        className: styles.previewImageFill,
        sizes: "919px",
        src: "/images/templates/info-preview/history-preview.png",
      },
    ],
    highlights: [styles.historyHighlightTop, styles.historyHighlightBottom],
    instruction: "검정색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
    instructionClassName: styles.previewInstructionDark,
  },
  directions: commonPreviewConfig,
  stores: {
    title: "미리보기",
    modalClassName: styles.previewModalStores,
    canvasClassName: styles.previewCanvasStores,
    images: [
      {
        alt: "점포 검색 페이지 미리보기",
        className: styles.storePreviewLeft,
        sizes: "549px",
        src: "/images/templates/info-preview/stores-preview-left.png",
      },
      {
        alt: "점포 상세 페이지 미리보기",
        className: styles.storePreviewRight,
        sizes: "549px",
        src: "/images/templates/info-preview/stores-preview-right.png",
      },
    ],
  },
};

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

function getPreviewConfig(templateType: TemplateType, target: PreviewTarget): PreviewConfig {
  if (templateType === "TEMPLATE_3") {
    return template3PreviewConfigs[target];
  }

  return commonPreviewConfig;
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s_/-]/g, "");
}

function normalizeCategory(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "농/수산물" || trimmed === "농수산" || trimmed === "농수산물") {
    return "농수산물";
  }
  return trimmed;
}

function getCell(row: Record<string, unknown>, field: keyof StoreCreateItem): string {
  const aliases = storeHeaderMap[field].map(normalizeHeader);
  const entry = Object.entries(row).find(([key]) => aliases.includes(normalizeHeader(key)));
  const value = entry?.[1];
  return value == null ? "" : String(value).trim();
}

async function parseStoreSheet(file: File): Promise<StoreCreateItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  return rows
    .map((row) => ({
      name: getCell(row, "name"),
      category: normalizeCategory(getCell(row, "category")),
      items: getCell(row, "items"),
      operatingHours: getCell(row, "operatingHours"),
      yearsOfOperation: getCell(row, "yearsOfOperation"),
      contact: getCell(row, "contact"),
      description: getCell(row, "description"),
    }))
    .filter((store) => store.name.length > 0 || store.category.length > 0);
}

export default function TemplateInfoPage() {
  const router = useRouter();
  const [setupDraft] = useState<SetupDraft>(getSetupDraft);
  const [marketContent, setMarketContent] = useState({
    introText: "",
    historyText: "",
    directionsText: "",
  });
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [storeFileName, setStoreFileName] = useState("");
  const [storeUploadMessage, setStoreUploadMessage] = useState("");
  const [stores, setStores] = useState<StoreCreateItem[]>([]);
  const needsStoreFile = setupDraft.selectedSections.includes("stores");
  const previewConfig = previewTarget
    ? getPreviewConfig(setupDraft.templateType, previewTarget)
    : null;
  const isInfoComplete =
    marketContent.introText.trim().length > 0 &&
    marketContent.historyText.trim().length > 0 &&
    marketContent.directionsText.trim().length > 0 &&
    (!needsStoreFile || stores.length > 0);

  async function handleStoreFileChange(file: File | undefined) {
    setStoreUploadMessage("");
    setStores([]);

    if (!file) {
      setStoreFileName("");
      return;
    }

    setStoreFileName(file.name);
    try {
      const parsedStores = await parseStoreSheet(file);
      if (parsedStores.length === 0) {
        setStoreUploadMessage("읽을 수 있는 점포 정보가 없습니다.");
        return;
      }
      setStores(parsedStores);
      setStoreUploadMessage(`${parsedStores.length}개 점포 정보를 읽었어요.`);
    } catch {
      setStoreUploadMessage("파일을 읽지 못했습니다. xlsx 또는 csv 파일인지 확인해주세요.");
    }
  }

  async function handleInfoComplete() {
    if (isSaving || !isInfoComplete) return;

    setIsSaving(true);
    try {
      if (stores.length > 0) {
        const result = await createStores(stores);
        if (result.failedItems?.length > 0) {
          const firstFailed = result.failedItems[0];
          window.alert(
            `${result.successCount}개 등록, ${result.failedItems.length}개 실패했습니다.\n${firstFailed.name ?? "점포"}: ${firstFailed.reason}`,
          );
          setIsSaving(false);
          return;
        }
      }

      await saveMarketPageSetup({
        templateType: setupDraft.templateType,
        selectedSections: setupDraft.selectedSections,
        marketContent,
      });
      window.sessionStorage.removeItem(generatedPageIdStorageKey);
      window.sessionStorage.setItem(generationVersionStorageKey, String(Date.now()));
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
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => handleStoreFileChange(event.target.files?.[0])}
              />
              <span>{storeFileName || "파일 첨부"}</span>
            </label>
            {storeUploadMessage && (
              <p className={styles.storeUploadMessage}>{storeUploadMessage}</p>
            )}
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

      {previewConfig && (
        <div className={styles.previewOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.previewModal} ${previewConfig.modalClassName}`}>
            <button
              className={styles.closePreview}
              type="button"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewTarget(null)}
            />
            <h2>{previewConfig.title}</h2>
            <div className={`${styles.previewCanvas} ${previewConfig.canvasClassName}`}>
              {previewConfig.images.map((image) => (
                <span className={image.className} key={image.src}>
                  <Image alt={image.alt} fill sizes={image.sizes} src={image.src} />
                </span>
              ))}
              {previewConfig.highlights?.map((highlightClassName) => (
                <span
                  aria-hidden="true"
                  className={`${styles.highlightBox} ${highlightClassName}`}
                  key={highlightClassName}
                />
              ))}
            </div>
            {previewConfig.instruction && (
              <p className={previewConfig.instructionClassName}>
                {previewConfig.instruction}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
