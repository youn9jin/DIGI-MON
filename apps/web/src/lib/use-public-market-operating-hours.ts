"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getMyPage } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import { formatOperatingHours, parseOperatingHours } from "@/lib/market-info";

function getDisplayOperatingHours(value: unknown): string {
  const hours = parseOperatingHours(value);
  if (!hours.weekday && !hours.weekend) {
    return "";
  }
  return formatOperatingHours(value);
}

export function usePublicMarketOperatingHours(
  marketId: string | number,
  publicOperatingHours?: unknown,
): string {
  const publicHours = getDisplayOperatingHours(publicOperatingHours);
  const [ownerHours, setOwnerHours] = useState<{
    marketId: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    if (publicHours) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const myPage = await getMyPage(currentUser);
        if (String(myPage.market?.marketId ?? "") !== String(marketId)) {
          return;
        }

        setOwnerHours({
          marketId: String(marketId),
          value: getDisplayOperatingHours(myPage.market?.operatingHours),
        });
      } catch {
        // Public visitors can still view the page without owner-only market details.
      }
    });

    return () => unsubscribe();
  }, [marketId, publicHours]);

  if (publicHours) {
    return publicHours;
  }

  return ownerHours?.marketId === String(marketId) ? ownerHours.value : "";
}
