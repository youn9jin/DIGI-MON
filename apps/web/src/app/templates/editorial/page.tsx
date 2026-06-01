"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import EditorialMarketTemplate, {
  type EditorialMarketTemplateData,
} from "@/components/templates/EditorialMarketTemplate";
import { getMarketPageContent } from "@/lib/api/market-page";
import { getMe } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { mapEditorialMarketPageContent } from "@/lib/market-page-template-data";

export default function EditorialTemplatePreviewPage() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const [templateData, setTemplateData] = useState<Partial<EditorialMarketTemplateData>>({});

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
        setTemplateData(mapEditorialMarketPageContent(content, me));
      } catch {
        // Preview can still render with sample data if profile data is unavailable.
      }
    });

    return () => unsubscribe();
  }, [pageId]);

  return <EditorialMarketTemplate data={templateData} previewMode />;
}
