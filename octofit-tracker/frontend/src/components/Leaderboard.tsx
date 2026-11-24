import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export async function loadLeaderboard() {
  return getJson<Record<string, Record<string, unknown>[]>>('/api/leaderboard');
}

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loadData={loadLeaderboard}
      responseKey="leaderboard"
      emptyText="No leaderboard rankings yet."
      renderItem={(entry) => `#${String(entry.rank)} ${String(entry.teamName)} - ${String(entry.totalPoints)} points`}
    />
  );
}
