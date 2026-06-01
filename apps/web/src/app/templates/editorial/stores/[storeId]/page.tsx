"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import EditorialMarketStoreDetailTemplate from "@/components/templates/EditorialMarketStoreDetailTemplate";
import { getClassicStore } from "@/components/templates/classicStoreData";
import { auth } from "@/lib/firebase";

interface PreviewData {
  marketName?: string;
  address?: string;
}

export default function EditorialTemplateStoreDetailPage() {
  const params = useParams<{ storeId: string }>();
  const [previewData, setPreviewData] = useState<PreviewData>({});
  const store = getClassicStore(params.storeId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const idToken = await currentUser.getIdToken();
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const res = await fetch(`${baseUrl}/api/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        setPreviewData({
          marketName: data.marketName ?? undefined,
          address: data.address ?? undefined,
        });
      } catch {
        // The template remains usable with sample content when profile data is unavailable.
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <EditorialMarketStoreDetailTemplate
      store={store}
      {...previewData}
      previewMode
    />
  );
}
