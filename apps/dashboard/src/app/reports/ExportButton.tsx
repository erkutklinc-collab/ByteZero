"use client";

export function ExportCSV() {
  return (
    <a
      href="/api/export-csv"
      className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
    >
      Export CSV
    </a>
  );
}
