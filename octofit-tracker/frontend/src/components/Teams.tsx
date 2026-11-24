import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export async function loadTeams() {
  return getJson<Record<string, Record<string, unknown>[]>>('/api/teams');
}

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadData={loadTeams}
      responseKey="teams"
      emptyText="No teams yet."
      renderItem={(team) => {
        const members = Array.isArray(team.members) ? team.members.join(', ') : '';
        return `${String(team.name)}${members ? ` - ${members}` : ''}`;
      }}
    />
  );
}
