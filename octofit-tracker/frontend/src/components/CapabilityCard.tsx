import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  loadData: () => Promise<Record<string, Record<string, unknown>[]>>;
  responseKey: string;
  emptyText: string;
  renderItem: (item: Record<string, unknown>) => ReactNode;
};

export function CapabilityCard({ title, description, loadData, responseKey, emptyText, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(false);

    loadData()
      .then((payload) => {
        if (active) setItems(payload[responseKey] ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => { active = false; };
  }, [loadData, responseKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert" className="text-danger">Unable to load {title.toLowerCase()}.</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
