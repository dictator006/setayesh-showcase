import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <Inbox className="size-10 text-muted-foreground" />
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
      <h3 className="font-semibold text-foreground">خطا در دریافت اطلاعات</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message ?? "لطفاً دوباره تلاش کنید."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
