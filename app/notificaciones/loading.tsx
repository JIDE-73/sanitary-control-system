import { MainLayout } from "@/components/layout/main-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingNotificaciones() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </MainLayout>
  )
}
