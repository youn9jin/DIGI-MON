"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useIsDesignPreview() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search.includes("preview=design"),
    () => false,
  );
}
