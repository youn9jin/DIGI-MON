"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import ClassicMarketTemplate, {
  type ClassicMarketTemplateData,
} from "@/components/templates/ClassicMarketTemplate";
import TemplatePreviewStatus from "@/components/templates/TemplatePreviewStatus";
import { getMarketPageContent, type MarketPageApiError } from "@/lib/api/market-page";
import { getMe } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { mapClassicMarketPageContent } from "@/lib/market-page-template-data";

function ClassicTemplatePreviewContent() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const [templateData, setTemplateData] = useState<Partial<ClassicMarketTemplateData>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(Boolean(pageId));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsLoadingContent(false);
        setErrorMessage("로그인이 필요합니다.");
        return;
      }

      try {
        const me = await getMe(currentUser);
        if (!pageId) {
          setTemplateData({
            ...(me.marketName ? { marketName: me.marketName } : {}),
            ...(me.address ? { address: me.address } : {}),
          });
          setIsLoadingContent(false);
          return;
        }

        const content = await getMarketPageContent(pageId);
        setTemplateData(mapClassicMarketPageContent(content, me));
        setErrorMessage("");
      } catch (error) {
        const apiError = error as Partial<MarketPageApiError>;
        const message =
          apiError.message ??
          (error instanceof Error
            ? error.message
            : "생성된 웹페이지 콘텐츠를 불러오지 못했습니다.");
        setErrorMessage(message);
      } finally {
        setIsLoadingContent(false);
      }
    });

    return () => unsubscribe();
  }, [pageId]);

  if (isLoadingContent) {
    return (
      <TemplatePreviewStatus
        title="생성된 웹페이지를 불러오는 중"
        message="AI가 만든 텍스트를 가져오고 있어요."
      />
    );
  }

  if (errorMessage) {
    return (
      <TemplatePreviewStatus
        title="웹페이지 내용을 불러오지 못했어요"
        message={errorMessage}
      />
    );
  }

  return <ClassicMarketTemplate data={templateData} previewMode />;
}

export default function ClassicTemplatePreviewPage() {
  return (
    <Suspense fallback={<ClassicMarketTemplate previewMode />}>
      <ClassicTemplatePreviewContent />
    </Suspense>
  );
}
