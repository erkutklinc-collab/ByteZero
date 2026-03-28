import { Leaf, Users, Target, ArrowUpRight, ArrowDownRight, Trophy, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Organization Overview</h1>
        <p className="text-slate-400 mt-2">Monitor your company's digital carbon footprint and environmental impact in real-time.</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Total Carbon Footprint" 
          value="1,245 kg" 
          change="-12%" 
          trend="down"
          icon={<Target className="w-5 h-5 text-rose-400" />} 
        />
        <MetricCard 
          title="Digital Trees Equivalent" 
          value="342" 
          change="+8%" 
          trend="up"
          icon={<Leaf className="w-5 h-5 text-emerald-400" />} 
        />
        <MetricCard 
          title="Active Employees" 
          value="89" 
          change="+2%" 
          trend="up"
          icon={<Users className="w-5 h-5 text-blue-400" />} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-brand-400" />
              Department Leaderboard
            </h2>
            <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View All</button>
          </div>
          
          <div className="space-y-3">
            <LeaderboardRow rank={1} name="Engineering" points={9800} members={42} />
            <LeaderboardRow rank={2} name="Marketing" points={8500} members={15} />
            <LeaderboardRow rank={3} name="Human Resources" points={7200} members={8} />
            <LeaderboardRow rank={4} name="Sales" points={6100} members={24} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Impact
          </h2>
          <div className="space-y-6">
            <ActivityItem time="10 min ago" title="Sarah deleted 500MB of emails" impact="-2.1 kg CO2" />
            <ActivityItem time="1 hour ago" title="Engineering optimized cloud storage" impact="-45.0 kg CO2" />
            <ActivityItem time="3 hours ago" title="Marketing team cleared cache" impact="-5.4 kg CO2" />
            <ActivityItem time="5 hours ago" title="Tom joined the platform" impact="" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up'|'down', icon: React.ReactNode }) {
  return (
    <div className="glass-panel-interactive p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <div className="flex items-center mt-2 gap-1 text-sm">
          {trend === 'down' ? (
            <span className="flex items-center text-brand-400 font-medium bg-brand-400/10 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-emerald-400 font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              {change}
            </span>
          )}
          <span className="text-slate-500 ml-1">vs last month</span>
        </div>
      </div>
    </div>
  )
}

function LeaderboardRow({ rank, name, points, members }: { rank: number, name: string, points: number, members: number }) {
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
  )
}

function ActivityItem({ time, title, impact }: { time: string, title: string, impact: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 ring-4 ring-brand-500/20 shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        <div className="flex gap-2 items-center mt-1">
          <span className="text-xs text-slate-500">{time}</span>
          {impact && (
            <>
              <span className="text-slate-700">•</span>
              <span className="text-xs font-medium text-brand-400">{impact}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
