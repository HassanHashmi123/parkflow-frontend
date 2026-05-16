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

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="skeleton h-4 w-32 rounded mb-3" />
        <div className="skeleton h-8 w-64 rounded mb-2" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6">
          <div className="skeleton h-4 w-40 rounded mb-4" />
          <ListItemSkeleton />
          <div className="mt-2"><ListItemSkeleton /></div>
          <div className="mt-2"><ListItemSkeleton /></div>
        </div>
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-4">
            <div className="skeleton h-3 w-20 rounded mb-2" />
            <div className="skeleton h-8 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}