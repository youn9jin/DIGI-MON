export type OperatingHours = {
  weekday: string | null;
  weekend: string | null;
};

export type TimeRangeParts = {
  openHour: string;
  openMinute: string;
  closeHour: string;
  closeMinute: string;
};

const EMPTY_TIME_RANGE: TimeRangeParts = {
  openHour: "",
  openMinute: "",
  closeHour: "",
  closeMinute: "",
};

export function parseOperatingHours(value: unknown): OperatingHours {
  if (!value) {
    return { weekday: null, weekend: null };
  }

  let parsed: unknown = value;

  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (!trimmed) return { weekday: null, weekend: null };

    try {
      parsed = JSON.parse(trimmed) as unknown;
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed) as unknown;
      }
    } catch {
      return { weekday: trimmed, weekend: null };
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return { weekday: null, weekend: null };
  }

  const hours = parsed as Record<string, unknown>;
  const weekday = typeof hours.weekday === "string" ? hours.weekday.trim() : "";
  const weekend = typeof hours.weekend === "string" ? hours.weekend.trim() : "";

  return {
    weekday: weekday || null,
    weekend: weekend || null,
  };
}

export function splitTimeRange(value: string | null | undefined): TimeRangeParts {
  if (!value) return { ...EMPTY_TIME_RANGE };

  const matches = value.match(/\d{1,2}/g);
  if (!matches || matches.length < 4) return { ...EMPTY_TIME_RANGE };

  return {
    openHour: matches[0].padStart(2, "0"),
    openMinute: matches[1].padStart(2, "0"),
    closeHour: matches[2].padStart(2, "0"),
    closeMinute: matches[3].padStart(2, "0"),
  };
}

export function joinTimeRange(parts: TimeRangeParts): string | null {
  const values = [
    parts.openHour,
    parts.openMinute,
    parts.closeHour,
    parts.closeMinute,
  ].map((part) => part.trim());

  if (values.every((part) => !part)) return null;
  if (values.some((part) => !part)) return null;

  return `${values[0].padStart(2, "0")}:${values[1].padStart(2, "0")}~${values[2].padStart(2, "0")}:${values[3].padStart(2, "0")}`;
}

export function formatOperatingHours(value: unknown): string {
  const hours = parseOperatingHours(value);
  const labels: string[] = [];

  if (hours.weekday) labels.push(`평일 ${hours.weekday}`);
  if (hours.weekend) {
    labels.push(`주말 ${hours.weekend}`);
  } else if (hours.weekday) {
    labels.push("일요일 휴무");
  }

  return labels.length > 0 ? labels.join(" / ") : "운영 시간 정보 없음";
}

export function splitMarketAddress(value: string | null | undefined): {
  roadAddress: string;
  detailAddress: string;
} {
  const address = value?.trim() ?? "";
  if (!address) return { roadAddress: "", detailAddress: "" };

  const roadAddressMatch = address.match(
    /^(.*?(?:대로|로|길)\s+\d+(?:-\d+)?)(?:\s+(.+))?$/,
  );
  if (roadAddressMatch) {
    return {
      roadAddress: roadAddressMatch[1].trim(),
      detailAddress: roadAddressMatch[2]?.trim() ?? "",
    };
  }

  const detailAddressMatch = address.match(
    /^(.*?)(?:\s+)((?:지하\s*)?\d+(?:-\d+)?(?:동|호|층)(?:\s+.*)?)$/,
  );
  if (detailAddressMatch) {
    return {
      roadAddress: detailAddressMatch[1].trim(),
      detailAddress: detailAddressMatch[2].trim(),
    };
  }

  return { roadAddress: address, detailAddress: "" };
}
