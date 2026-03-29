"use client";

import { useState, useEffect } from "react";
import { Leaf, Users, Target, Trophy, Clock } from "lucide-react";
import { FitItems } from "./FitItems";

type Overview = {
  totalCo2Kg: number;
  treesEquivalent: number;
  activeEmployees: number;
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  members: number;
};

type RecentEvent = {
  id: number;
  eventType: string;
  co2Grams: number;
  createdAt: string;
  user: { name: string };
};

const EVENT_LABELS: Record<string, string> = {
  email_deleted: "deleted emails",
  attachment_removed: "removed attachments",
  cache_cleared: "cleared cache",
  unsubscribe_action: "unsubscribed from mailing list",
  mailbox_scanned: "scanned mailbox",
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

type Props = {
  apiUrl: string;
  initialOverview: Overview;
  initialLeaderboard: LeaderboardEntry[];
  initialEvents: RecentEvent[];
  interval?: number;
};

export function LiveDashboard({ apiUrl, initialOverview, initialLeaderboard, initialEvents, interval = 5000 }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const [o, l, e] = await Promise.all([
          fetch(`${apiUrl}/api/metrics/overview`).then(r => r.json()),
          fetch(`${apiUrl}/api/metrics/leaderboard`).then(r => r.json()),
          fetch(`${apiUrl}/api/events/recent?limit=30`).then(r => r.json()),
        ]);
        setOverview(o);
        setLeaderboard(l);
        setEvents(e);
      } catch {}
    }, interval);
    return () => clearInterval(poll);
  }, [apiUrl, interval]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Organization Overview</h1>
        <p className="text-slate-400 mt-2">Monitor your company's digital carbon footprint and environmental impact in real-time.</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total CO2 Saved"
          value={`${overview.totalCo2Kg} kg`}
          icon={<Target className="w-5 h-5 text-rose-400" />}
        />
        <MetricCard
          title="Trees Equivalent"
          value={`${overview.treesEquivalent}`}
          icon={<Leaf className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Active Employees"
          value={`${overview.activeEmployees}`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:grid-rows-[auto]">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-brand-400" />
              Department Leaderboard
            </h2>
          </div>

          <div className="space-y-3">
            {leaderboard.map((dept) => (
              <LeaderboardRow key={dept.name} rank={dept.rank} name={dept.name} points={dept.points} members={dept.members} />
            ))}
            {leaderboard.length === 0 && (
              <p className="text-slate-500 text-sm">No department data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 flex flex-col overflow-hidden max-h-0 min-h-full">
          <h2 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Impact
          </h2>
          <FitItems className="space-y-6 overflow-hidden flex-1 pl-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 ring-4 ring-brand-500/20 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-slate-200">
                    {event.user.name} {EVENT_LABELS[event.eventType] ?? event.eventType}
                  </h4>
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
            ))}
            {events.length === 0 && (
              <p className="text-slate-500 text-sm">No activity yet.</p>
            )}
          </FitItems>
        </div>
      </div>
    </>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass-panel-interactive p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function LeaderboardRow({ rank, name, points, members }: { rank: number; name: string; points: number; members: number }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : rank === 3 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' : 'bg-white/5 text-slate-400'}`}>
          {rank}
        </div>
        <div>
          <h4 className="font-medium text-white">{name}</h4>
          <p className="text-xs text-slate-400">{members} members participating</p>
        </div>
      </div>
      <div className="text-right">
        <span className="font-bold text-brand-300">{points.toLocaleString()}</span>
        <span className="text-xs text-brand-500/70 ml-1">pts</span>
      </div>
    </div>
  );
}
