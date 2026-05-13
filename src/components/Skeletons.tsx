export function StatCardSkeleton() {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton w-12 h-12 rounded-2xl" />
      </div>
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-32 rounded" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
