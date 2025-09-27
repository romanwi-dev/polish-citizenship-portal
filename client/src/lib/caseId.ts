export function normalizeCaseId(input: string | undefined | null): string {
  if (!input) return "";
  // Trim, remove leading "CASE-" or "C-" if present (order matters - longer first)
  const raw = String(input).trim().replace(/^(CASE-?|C-?)/i, "");
  // Safety: keep only allowed chars (alphanumerics + hyphen)
  return raw.replace(/[^A-Za-z0-9-]/g, "");
}

export function displayCaseId(rawId: string | undefined | null): string {
  const id = normalizeCaseId(rawId);
  return id ? `C-${id}` : "";
}