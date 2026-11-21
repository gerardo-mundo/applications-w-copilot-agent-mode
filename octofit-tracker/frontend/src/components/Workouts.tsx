import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona%40example.com"
      responseKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(suggestion) => `${String(suggestion.title)} - ${String(suggestion.reason)}`}
    />
  );
}
