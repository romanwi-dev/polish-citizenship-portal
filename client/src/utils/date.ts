export function formatPL(input?: string | number | Date) {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input ?? "");
  return d.toLocaleDateString("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}