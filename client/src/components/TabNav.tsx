import React from "react";

export type TabKey =
  | "overview"
  | "stage"
  | "documents"
  | "payments"
  | "tasks"
  | "authority"
  | "tree";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "overview",   label: "Overview" },
  { key: "stage",      label: "Stage" },
  { key: "documents",  label: "Documents" },
  { key: "payments",   label: "Payments" },
  { key: "tasks",      label: "Tasks" },
  { key: "authority",  label: "Authority" },
  { key: "tree",       label: "Tree" },
];

export function TabNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="tabs-row" role="tablist" aria-label="Case tabs">
      {TABS.map(t => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`tab-chip ${active === t.key ? "is-active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}