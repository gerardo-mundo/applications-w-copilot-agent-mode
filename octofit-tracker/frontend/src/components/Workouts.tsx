import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export async function loadWorkouts() {
  return getJson<Record<string, Record<string, unknown>[]>>('/api/workouts/suggestions/mona%40example.com');
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadData={loadWorkouts}
      responseKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(suggestion) => `${String(suggestion.title)} - ${String(suggestion.reason)}`}
    />
  );
}
