"use client";

type ReportData = {
  overview: { totalCo2Kg: number; treesEquivalent: number; activeEmployees: number };
  departments: { name: string; members: number; totalCo2Grams: number; totalEvents: number }[];
  trends: { weekStart: string; breakdown: Record<string, number>; total: number }[];
};

export function ExportCSV({ data }: { data: ReportData }) {
  const handleExport = () => {
    const lines: string[] = [];

    lines.push("ByteFootprint ESG Report");
    lines.push(`Generated,${new Date().toISOString().split("T")[0]}`);
    lines.push("");

    lines.push("Overview");
    lines.push(`Total CO2 Saved (kg),${data.overview.totalCo2Kg}`);
    lines.push(`Trees Equivalent,${data.overview.treesEquivalent}`);
    lines.push(`Active Employees,${data.overview.activeEmployees}`);
    lines.push("");

    lines.push("Department Breakdown");
    lines.push("Department,Members,CO2 Saved (g),Actions");
    for (const d of data.departments) {
      lines.push(`${d.name},${d.members},${d.totalCo2Grams},${d.totalEvents}`);
    }
    lines.push("");

    lines.push("Weekly Trends");
    lines.push("Week Starting,Email Deleted,Attachment Removed,Cache Cleared,Mailbox Scanned,Total (g)");
    for (const w of data.trends) {
      lines.push(
        `${w.weekStart},${w.breakdown.email_deleted ?? 0},${w.breakdown.attachment_removed ?? 0},${w.breakdown.cache_cleared ?? 0},${w.breakdown.mailbox_scanned ?? 0},${w.total}`
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bytefootprint-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
    >
      Export CSV
    </button>
  );
}
