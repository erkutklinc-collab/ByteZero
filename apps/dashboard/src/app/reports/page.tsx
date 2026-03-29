import { Leaf, Car, Smartphone, Lightbulb, TrendingUp, FileDown, Building2, BarChart3 } from "lucide-react";
import { ExportCSV } from "./ExportButton";

const API_URL = process.env.API_URL || "http://localhost:3001";

type Report = {
  overview: { totalCo2Kg: number; treesEquivalent: number; activeEmployees: number };
  equivalencies: {
    treesPlanted: number;
    kmDrivingOffset: number;
    smartphoneCharges: number;
    hoursLedBulb: number;
    litersWaterSaved: number;
  };
  projection: {
    dailyRateGrams: number;
    projectedAnnualKg: number;
    projectedAnnualTrees: number;
  };
  departments: { id: number; name: string; members: number; totalCo2Grams: number; totalEvents: number }[];
  trends: { weekStart: string; breakdown: Record<string, number>; total: number }[];
};

const EVENT_LABELS: Record<string, string> = {
  email_deleted: "Emails Deleted",
  attachment_removed: "Attachments Removed",
  cache_cleared: "Cache Cleared",
  unsubscribe_action: "Unsubscribes",
  mailbox_scanned: "Mailbox Scans",
};

const EVENT_COLORS: Record<string, string> = {
  email_deleted: "bg-red-400",
  attachment_removed: "bg-amber-400",
  cache_cleared: "bg-blue-400",
  unsubscribe_action: "bg-purple-400",
  mailbox_scanned: "bg-slate-400",
};

export default async function ReportsPage() {
  const report: Report = await fetch(`${API_URL}/api/metrics/report`, {
    cache: "no-store",
  }).then((r) => r.json());

  const maxWeekTotal = Math.max(...report.trends.map((w) => w.total), 1);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">ESG Impact Report</h1>
          <p className="text-slate-400 mt-2">
            Environmental impact summary and projections for your organization.
          </p>
        </div>
        <ExportCSV data={report} />
      </header>

      {/* ESG Summary */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl font-medium text-white mb-6">Environmental Equivalencies</h2>
        <p className="text-sm text-slate-400 mb-6">
          Your organization has saved <span className="text-brand-300 font-semibold">{report.overview.totalCo2Kg} kg</span> of CO2.
          Here's what that means:
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <EquivCard
            icon={<Leaf className="w-5 h-5 text-emerald-400" />}
            value={report.equivalencies.treesPlanted}
            label="Trees planted (annual equiv.)"
          />
          <EquivCard
            icon={<Car className="w-5 h-5 text-blue-400" />}
            value={report.equivalencies.kmDrivingOffset}
            label="km of driving offset"
          />
          <EquivCard
            icon={<Smartphone className="w-5 h-5 text-purple-400" />}
            value={report.equivalencies.smartphoneCharges}
            label="Smartphone charges"
          />
          <EquivCard
            icon={<Lightbulb className="w-5 h-5 text-amber-400" />}
            value={report.equivalencies.hoursLedBulb}
            label="Hours of LED bulb usage"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Trends */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            Weekly Trends
          </h2>
          <div className="space-y-4">
            {report.trends.map((week) => (
              <div key={week.weekStart}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">
                    Week of {new Date(week.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-sm font-semibold text-brand-300">
                    {(week.total / 1000).toFixed(1)} kg
                  </span>
                </div>
                {/* Stacked bar */}
                <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden flex">
                  {Object.entries(week.breakdown)
                    .filter(([, v]) => v > 0)
                    .map(([type, grams]) => (
                      <div
                        key={type}
                        className={`h-full ${EVENT_COLORS[type] ?? "bg-slate-400"} opacity-80 first:rounded-l-full last:rounded-r-full`}
                        style={{ width: `${(grams / maxWeekTotal) * 100}%` }}
                        title={`${EVENT_LABELS[type] ?? type}: ${(grams / 1000).toFixed(1)} kg`}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(EVENT_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_COLORS[type] ?? "bg-slate-400"} opacity-80`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projection */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            Annual Projection
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Current daily rate</p>
              <p className="text-3xl font-bold text-white">
                {(report.projection.dailyRateGrams / 1000).toFixed(2)} <span className="text-lg text-slate-400">kg/day</span>
              </p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-sm text-slate-400 mb-1">Projected annual savings</p>
              <p className="text-3xl font-bold text-brand-300">
                {report.projection.projectedAnnualKg} <span className="text-lg text-brand-500">kg</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Projected trees equivalent</p>
              <p className="text-2xl font-bold text-emerald-400">
                {report.projection.projectedAnnualTrees} <span className="text-base text-emerald-600">trees</span>
              </p>
            </div>
            <div className="h-px bg-white/10" />
            <p className="text-xs text-slate-500">
              Based on {report.overview.activeEmployees} active employees over the current tracking period. Projections assume consistent participation rates.
            </p>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-400" />
          Department Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-sm font-medium text-slate-400">Department</th>
                <th className="pb-3 text-sm font-medium text-slate-400 text-right">Members</th>
                <th className="pb-3 text-sm font-medium text-slate-400 text-right">Actions</th>
                <th className="pb-3 text-sm font-medium text-slate-400 text-right">CO2 Saved</th>
                <th className="pb-3 text-sm font-medium text-slate-400 text-right">Per Person</th>
              </tr>
            </thead>
            <tbody>
              {report.departments.map((dept) => (
                <tr key={dept.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-sm font-medium text-white">{dept.name}</td>
                  <td className="py-3 text-sm text-slate-300 text-right">{dept.members}</td>
                  <td className="py-3 text-sm text-slate-300 text-right">{dept.totalEvents}</td>
                  <td className="py-3 text-sm font-semibold text-brand-300 text-right">
                    {(dept.totalCo2Grams / 1000).toFixed(1)} kg
                  </td>
                  <td className="py-3 text-sm text-slate-300 text-right">
                    {(dept.totalCo2Grams / dept.members / 1000).toFixed(1)} kg
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="pt-3 text-sm font-semibold text-white">Total</td>
                <td className="pt-3 text-sm font-semibold text-white text-right">
                  {report.departments.reduce((s, d) => s + d.members, 0)}
                </td>
                <td className="pt-3 text-sm font-semibold text-white text-right">
                  {report.departments.reduce((s, d) => s + d.totalEvents, 0)}
                </td>
                <td className="pt-3 text-sm font-semibold text-brand-300 text-right">
                  {(report.departments.reduce((s, d) => s + d.totalCo2Grams, 0) / 1000).toFixed(1)} kg
                </td>
                <td className="pt-3 text-sm text-slate-400 text-right">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function EquivCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
