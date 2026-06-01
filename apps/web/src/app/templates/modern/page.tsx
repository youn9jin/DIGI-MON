"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import ModernMarketTemplate, {
  type ModernMarketTemplateData,
} from "@/components/templates/ModernMarketTemplate";
import { getMarketPageContent } from "@/lib/api/market-page";
import { getMe } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { mapModernMarketPageContent } from "@/lib/market-page-template-data";

function ModernTemplatePreviewContent() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const [templateData, setTemplateData] = useState<Partial<ModernMarketTemplateData>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const me = await getMe(currentUser);
        if (!pageId) {
          setTemplateData({
            ...(me.marketName ? { marketName: me.marketName } : {}),
            ...(me.address ? { address: me.address } : {}),
          });
          return;
        }

        const content = await getMarketPageContent(pageId);
        setTemplateData(mapModernMarketPageContent(content, me));
      } catch {
        // Preview can still render with sample data if profile data is unavailable.
      }
    });

    return () => unsubscribe();
  }, [pageId]);

  return <ModernMarketTemplate data={templateData} previewMode />;
}

export default function ModernTemplatePreviewPage() {
  return (
    <Suspense fallback={<ModernMarketTemplate previewMode />}>
      <ModernTemplatePreviewContent />
    </Suspense>
  );
}
