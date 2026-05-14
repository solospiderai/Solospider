const SkeletonCard = () => (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-card animate-pulse">
        <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-5 w-48 bg-muted rounded-md" />
                <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-64 bg-muted rounded-md" />
        </div>
        <div className="h-8 w-8 bg-muted rounded-md ml-4" />
    </div>
);

export const SkeletonDashboard = () => (
    <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default SkeletonCard;
