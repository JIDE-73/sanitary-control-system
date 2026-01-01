import { MainLayout } from "@/components/layout/main-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingConfiguracion() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    </MainLayout>
  )
}
