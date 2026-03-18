import type { HelperCountry, HelperType } from "@/lib/types";

export const helperCountries = ["Myanmar", "India", "Indonesia", "Other"] as const;
export const helperTypes = ["Ex-Singapore", "New", "Transfer"] as const;

function normalizeLabel(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeHelperCountryValue(
  value: string | null | undefined,
): HelperCountry | null {
  const normalized = normalizeLabel(value);

  if (normalized === "myanmar" || normalized === "my") return "Myanmar";
  if (normalized === "india") return "India";
  if (normalized === "indonesia" || normalized === "indo") return "Indonesia";
  if (normalized === "other" || normalized === "others") return "Other";

  return null;
}

export function normalizeHelperTypeValue(
  value: string | null | undefined,
): HelperType | null {
  const normalized = normalizeLabel(value);

  if (
    normalized === "ex-singapore" ||
    normalized === "ex singapore" ||
    normalized === "ex_singapore"
  ) {
    return "Ex-Singapore";
  }
  if (normalized === "new") return "New";
  if (normalized === "transfer") return "Transfer";

  return null;
}

export function resolveHelperCountry(
  country: string | null | undefined,
  type: string | null | undefined,
): HelperCountry {
  return (
    normalizeHelperCountryValue(country) ??
    normalizeHelperCountryValue(type) ??
    "Other"
  );
}

export function resolveHelperType(
  type: string | null | undefined,
  country: string | null | undefined,
): HelperType {
  return (
    normalizeHelperTypeValue(type) ??
    normalizeHelperTypeValue(country) ??
    "New"
  );
}
