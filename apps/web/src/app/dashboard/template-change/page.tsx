"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardOperationPending from "@/components/dashboard/DashboardOperationPending";
import Header from "@/components/layout/Header";
import {
  type MarketPageApiError,
  type TemplateType,
  updateMarketPageTemplate,
} from "@/lib/api/market-page";
import { publishDashboardOperationToast } from "@/lib/dashboard-operation-toast";
import { waitForMinimumPendingTime } from "@/lib/minimum-pending";
import styles from "../manage.module.css";

const setupStorageKey = "market_page_setup_draft";

const templates = [
  {
    id: "TEMPLATE_1" as const,
    href: "/templates/editorial",
    label: "에디토리얼형",
    image: "/images/dashboard/manage-template-1.png",
    thumbClassName: styles.templateOne,
  },
  {
    id: "TEMPLATE_2" as const,
    href: "/templates/modern",
    label: "다크 모던형",
    image: "/images/templates/info-preview/template2-intro-preview.png",
    thumbClassName: styles.templateTwo,
  },
  {
    id: "TEMPLATE_3" as const,
    href: "/templates/classic",
    label: "클래식 시장형",
    image: "/images/templates/template-classic-gradient.png",
    thumbClassName: styles.templateThree,
  },
];

type SetupDraft = {
  templateType?: TemplateType | string | null;
};

function getTemplateType(value?: string | null): TemplateType | null {
  if (value === "TEMPLATE_1" || value === "TEMPLATE_2" || value === "TEMPLATE_3") {
    return value;
  }

  return null;
}

function getInitialTemplateType(): TemplateType {
  if (typeof window === "undefined") return "TEMPLATE_1";

  try {
    const savedDraft = window.sessionStorage.getItem(setupStorageKey);
    if (!savedDraft) return "TEMPLATE_1";

    const parsed = JSON.parse(savedDraft) as SetupDraft;
    return getTemplateType(parsed.templateType) ?? "TEMPLATE_1";
  } catch {
    return "TEMPLATE_1";
  }
}

function updateSetupDraftTemplate(templateType: TemplateType) {
  if (typeof window === "undefined") return;

  try {
    const savedDraft = window.sessionStorage.getItem(setupStorageKey);
    const parsed = savedDraft ? (JSON.parse(savedDraft) as SetupDraft) : {};
    window.sessionStorage.setItem(
      setupStorageKey,
      JSON.stringify({
        ...parsed,
        templateType,
      }),
    );
  } catch {
    window.sessionStorage.setItem(setupStorageKey, JSON.stringify({ templateType }));
  }
}

export default function TemplateChangePage() {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>(getInitialTemplateType);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(getInitialTemplateType);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const previewTemplateData = previewTemplate
    ? templates.find((template) => template.id === previewTemplate)
    : null;

  useEffect(() => {
    if (!previewTemplate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [previewTemplate]);

  async function handleSaveTemplate() {
    const pendingStartedAt = Date.now();
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const result = await updateMarketPageTemplate({ templateType: selectedTemplate });
      setCurrentTemplate(result.templateType);
      updateSetupDraftTemplate(result.templateType);
      await waitForMinimumPendingTime(pendingStartedAt, 2000);
      publishDashboardOperationToast("template");
      setSaveMessage("선택한 템플릿으로 교체했어요.");
    } catch (error) {
      const apiError = error as Partial<MarketPageApiError>;
      setSaveError(apiError.message ?? "템플릿 교체에 실패했습니다.");
    } finally {
      await waitForMinimumPendingTime(pendingStartedAt, 2000);
      setIsSaving(false);
    }
  }

  if (isSaving) {
    return <DashboardOperationPending type="template" />;
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
        <h1>다른 템플릿으로 교체하기</h1>
      </section>

      <section className={`${styles.panel} ${styles.templatePanel}`} aria-label="템플릿 교체">
        <div className={styles.templateGrid}>
          {templates.map((template, index) => {
            const selected = selectedTemplate === template.id;
            const isCurrent = currentTemplate === template.id;

            return (
              <div className={styles.templateOption} key={template.id}>
                <button
                  aria-label={`템플릿 ${index + 1} 선택`}
                  aria-pressed={selected}
                  className={`${styles.radio} ${selected ? styles.radioSelected : ""}`}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                />
                <div className={styles.templateBody}>
                  <button
                    className={`${styles.templateThumb} ${template.thumbClassName}`}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Image
                      alt={`템플릿 ${index + 1} 미리보기`}
                      fill
                      sizes="287px"
                      src={template.image}
                    />
                  </button>
                  {isCurrent ? (
                    <span className={styles.currentLabel}>내 템플릿</span>
                  ) : (
                    <button
                      className={styles.smallButton}
                      type="button"
                      onClick={() => setPreviewTemplate(template.id)}
                    >
                      미리보기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {saveError ? <p className={styles.formError}>{saveError}</p> : null}
        {saveMessage ? <p className={styles.formMessage}>{saveMessage}</p> : null}
        <button
          className={styles.saveButton}
          type="button"
          disabled={isSaving}
          onClick={handleSaveTemplate}
        >
          {isSaving ? "저장 중" : "저장하기"}
        </button>
      </section>

      {previewTemplate && previewTemplateData && (
        <div
          className={styles.previewOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplateData.label} 미리보기`}
        >
          <div className={styles.previewModal}>
            <button
              className={styles.closePreview}
              type="button"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewTemplate(null)}
            />
            <h2 className={styles.previewTitle}>Main Page</h2>
            <div className={styles.largePreview}>
              <iframe
                title={`${previewTemplateData.label} 디자인 미리보기`}
                src={`${previewTemplateData.href}?preview=design`}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
