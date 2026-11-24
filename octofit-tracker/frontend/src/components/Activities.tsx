import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export async function loadActivities() {
  return getJson<Record<string, Record<string, unknown>[]>>('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadData={loadActivities}
      responseKey="activities"
      emptyText="No activities yet."
      renderItem={(activity) => `${String(activity.type)} - ${String(activity.minutes)} minutes (${String(activity.points)} points)`}
    />
  );
}
