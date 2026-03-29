import { LiveDashboard } from "./LiveDashboard";

const API_URL = process.env.API_URL || "http://localhost:3001";

export default async function Home() {
  const [overview, leaderboard, recentEvents] = await Promise.all([
    fetch(`${API_URL}/api/metrics/overview`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${API_URL}/api/metrics/leaderboard`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${API_URL}/api/events/recent?limit=30`, { cache: "no-store" }).then(r => r.json()),
  ]);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <LiveDashboard
        apiUrl={API_URL}
        initialOverview={overview}
        initialLeaderboard={leaderboard}
        initialEvents={recentEvents}
      />
    </div>
  );
}
