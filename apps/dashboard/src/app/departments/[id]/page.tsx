import { ArrowLeft, Trophy, Zap, Clock, Trash2, Paperclip, HardDrive } from "lucide-react";
import { FitItems } from "../../FitItems";

const API_URL = process.env.API_URL || "http://localhost:3001";

type DepartmentDetail = {
  id: number;
  name: string;
  breakdown: { eventType: string; co2Grams: number; count: number }[];
  contributors: { rank: number; userId: number; name: string; co2Grams: number; events: number }[];
  recentEvents: { id: number; eventType: string; co2Grams: number; createdAt: string; userName: string }[];
};

const EVENT_LABELS: Record<string, string> = {
  email_deleted: "Emails Deleted",
  attachment_removed: "Attachments Removed",
  cache_cleared: "Cache Cleared",
  unsubscribe_action: "Unsubscribes",
  mailbox_scanned: "Mailbox Scans",
};

const EVENT_ICONS: Record<string, typeof Trash2> = {
  email_deleted: Trash2,
  attachment_removed: Paperclip,
  cache_cleared: HardDrive,
  unsubscribe_action: Zap,
  mailbox_scanned: Zap,
};

const EVENT_COLORS: Record<string, string> = {
  email_deleted: "text-red-400",
  attachment_removed: "text-amber-400",
  cache_cleared: "text-blue-400",
  unsubscribe_action: "text-purple-400",
  mailbox_scanned: "text-slate-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dept: DepartmentDetail = await fetch(`${API_URL}/api/metrics/departments/${id}`, {
    cache: "no-store",
  }).then((r) => r.json());

  const totalCo2 = dept.breakdown.reduce((sum, b) => sum + b.co2Grams, 0);
  const totalEvents = dept.breakdown.reduce((sum, b) => sum + b.count, 0);
  const maxContributorCo2 = dept.contributors[0]?.co2Grams || 1;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <a
          href="/departments"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-brand-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </a>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{dept.name}</h1>
        <p className="text-slate-400 mt-2">
          {dept.contributors.length} members &middot; {totalEvents} actions &middot; {(totalCo2 / 1000).toFixed(1)} kg CO2 saved
        </p>
      </header>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dept.breakdown.map((b) => {
          const Icon = EVENT_ICONS[b.eventType] ?? Zap;
          const color = EVENT_COLORS[b.eventType] ?? "text-slate-400";
          return (
            <div key={b.eventType} className="glass-panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-slate-400">{EVENT_LABELS[b.eventType] ?? b.eventType}</span>
              </div>
              <p className="text-2xl font-bold text-white">{(b.co2Grams / 1000).toFixed(1)} kg</p>
              <p className="text-xs text-slate-500 mt-1">{b.count} actions</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contributors */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-400" />
            Top Contributors
          </h2>
          <div className="space-y-3">
            {dept.contributors.map((c) => (
              <div
                key={c.userId}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  c.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : c.rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                  : c.rank === 3 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30'
                  : 'bg-white/5 text-slate-400'
                }`}>
                  {c.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.events} actions</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                      style={{ width: `${(c.co2Grams / maxContributorCo2) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-brand-300 w-20 text-right">
                    {(c.co2Grams / 1000).toFixed(1)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 flex flex-col overflow-hidden max-h-0 min-h-full">
          <h2 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Activity
          </h2>
          <FitItems gap={20} className="space-y-5 overflow-hidden flex-1 pl-1">
            {dept.recentEvents.map((event) => {
              const Icon = EVENT_ICONS[event.eventType] ?? Zap;
              const color = EVENT_COLORS[event.eventType] ?? "text-slate-400";
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 ${color} shrink-0`} />
                  <div>
                    <p className="text-sm text-slate-200">
                      <span className="font-medium">{event.userName}</span>{" "}
                      {(EVENT_LABELS[event.eventType] ?? event.eventType).toLowerCase()}
                    </p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-xs text-slate-500">{timeAgo(event.createdAt)}</span>
                      {event.co2Grams > 0 && (
                        <>
                          <span className="text-slate-700">&bull;</span>
                          <span className="text-xs font-medium text-brand-400">-{event.co2Grams}g CO2</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </FitItems>
        </div>
      </div>
    </div>
  );
}
