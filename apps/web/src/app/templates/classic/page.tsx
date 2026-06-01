"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import ClassicMarketTemplate, {
  type ClassicMarketTemplateData,
} from "@/components/templates/ClassicMarketTemplate";
import { getMarketPageContent } from "@/lib/api/market-page";
import { getMe } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { mapClassicMarketPageContent } from "@/lib/market-page-template-data";

export default function ClassicTemplatePreviewPage() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const [templateData, setTemplateData] = useState<Partial<ClassicMarketTemplateData>>({});

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
        setTemplateData(mapClassicMarketPageContent(content, me));
      } catch {
        // Preview can still render with sample data if profile data is unavailable.
      }
    });

    return () => unsubscribe();
  }, [pageId]);

  return <ClassicMarketTemplate data={templateData} previewMode />;
}
