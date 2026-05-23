"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import ModernMarketTemplate, {
  type ModernMarketTemplateData,
} from "@/components/templates/ModernMarketTemplate";
import { auth } from "@/lib/firebase";

export default function ModernTemplatePreviewPage() {
  const [marketName, setMarketName] = useState("");
  const [address, setAddress] = useState("");

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
        setMarketName(data.marketName ?? "");
        setAddress(data.address ?? "");
      } catch {
        // Preview can still render with sample data if profile data is unavailable.
      }
    });

    return () => unsubscribe();
  }, []);

  const templateData: Partial<ModernMarketTemplateData> = {
    ...(marketName ? { marketName } : {}),
    ...(address ? { address } : {}),
  };

  return <ModernMarketTemplate data={templateData} previewMode />;
}
