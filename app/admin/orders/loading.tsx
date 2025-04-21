import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="rounded-md border">
            <div className="border-b px-4 py-3">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="p-0">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center border-b p-4">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-[150px] mb-2" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-[100px]" />
                      <Skeleton className="h-8 w-[120px] rounded-md" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

