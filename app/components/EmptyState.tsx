export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p> : null}
    </div>
  );
}
