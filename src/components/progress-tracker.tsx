type ProgressTrackerProps = {
  items: Array<{
    completed: boolean;
    id: string;
  }>;
};

export function ProgressTracker({ items }: ProgressTrackerProps) {
  return (
    <div className="progress-tracker">
      {items.map((item) => (
        <span
          className={`progress-dot${item.completed ? " progress-dot-complete" : ""}`}
          key={item.id}
        />
      ))}
    </div>
  );
}
