"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import ModernMarketStoresTemplate from "@/components/templates/ModernMarketStoresTemplate";
import { auth } from "@/lib/firebase";

interface PreviewData {
  marketName?: string;
  address?: string;
}

export default function ModernTemplateStoresPage() {
  const [previewData, setPreviewData] = useState<PreviewData>({});

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

  return <ModernMarketStoresTemplate {...previewData} previewMode />;
}
