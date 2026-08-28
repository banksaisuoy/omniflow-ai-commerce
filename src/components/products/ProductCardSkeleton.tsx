import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-4 flex-grow flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto pt-4 flex gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-12 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
