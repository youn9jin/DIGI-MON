"use client";

import Image from "next/image";
import { useState } from "react";
import Header from "@/components/layout/Header";
import { type TemplateType } from "@/lib/api/market-page";
import styles from "../manage.module.css";

const templates = [
  {
    id: "TEMPLATE_1" as const,
    image: "/images/dashboard/manage-template-1.png",
    thumbClassName: styles.templateOne,
  },
  {
    id: "TEMPLATE_2" as const,
    image: "/images/dashboard/manage-template-2.png",
    thumbClassName: styles.templateTwo,
  },
  {
    id: "TEMPLATE_3" as const,
    image: "/images/dashboard/manage-template-3.png",
    thumbClassName: styles.templateThree,
  },
];

export default function TemplateChangePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("TEMPLATE_1");

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
                  {selected ? (
                    <span className={styles.currentLabel}>내 템플릿</span>
                  ) : (
                    <button className={styles.smallButton} type="button">
                      미리보기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className={styles.saveButton} type="button">
          저장하기
        </button>
      </section>
    </main>
  );
}
