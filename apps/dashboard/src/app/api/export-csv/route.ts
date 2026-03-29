const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${API_URL}/api/metrics/report/csv`);
  const csv = await res.text();
  const filename = `bytefootprint-report-${new Date().toISOString().split("T")[0]}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
