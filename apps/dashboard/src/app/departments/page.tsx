import { Building2, Users, Zap, ArrowRight } from "lucide-react";

const API_URL = process.env.API_URL || "http://localhost:3001";

type Department = {
  id: number;
  name: string;
  members: number;
  totalCo2Grams: number;
  totalEvents: number;
};

export default async function DepartmentsPage() {
  const departments: Department[] = await fetch(`${API_URL}/api/metrics/departments`, {
    cache: "no-store",
  }).then((r) => r.json());

  const maxCo2 = Math.max(...departments.map((d) => d.totalCo2Grams));

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Departments</h1>
        <p className="text-slate-400 mt-2">
          Compare environmental impact across your organization.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map((dept, i) => (
          <a
            key={dept.id}
            href={`/departments/${dept.id}`}
            className="glass-panel-interactive p-6 flex flex-col gap-4 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${
                  i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                  : i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30'
                  : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  #{i + 1}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{dept.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {dept.members} members
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-400">CO2 Saved</span>
                <span className="text-xl font-bold text-brand-300">
                  {(dept.totalCo2Grams / 1000).toFixed(1)} kg
                </span>
              </div>

              {/* Progress bar relative to top department */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                  style={{ width: `${(dept.totalCo2Grams / maxCo2) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {dept.totalEvents} actions
                </span>
                <span>
                  {(dept.totalCo2Grams / dept.members / 1000).toFixed(1)} kg/person
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
