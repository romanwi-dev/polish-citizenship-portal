import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
        <div className="flex items-center justify-center mb-8">
          <Skeleton className="h-6 w-64 bg-white/20" />
        </div>
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Skeleton className="h-16 w-full mb-4 bg-white/20" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-2 bg-white/20" />
          <Skeleton className="h-8 w-2/3 mx-auto bg-white/20" />
        </div>
        <div className="flex gap-4 justify-center mb-20">
          <Skeleton className="h-14 w-64 bg-white/20" />
          <Skeleton className="h-14 w-64 bg-white/20" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}