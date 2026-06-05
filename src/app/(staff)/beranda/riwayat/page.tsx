import { Suspense } from 'react'
import { searchReports, getSearchStats } from '@/actions/search'
import SearchClient from './search-client'

async function RiwayatContent() {
  const { data: reports, error } = await searchReports({})
  const { data: stats } = await getSearchStats({})

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">Error Memuat Data</h3>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  return (
    <SearchClient 
      initialReports={reports || []}
      initialStats={stats || { total: 0, submitted: 0, draft: 0, plan_only: 0 }}
    />
  )
}

export default function RiwayatPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      }>
        <RiwayatContent />
      </Suspense>
    </div>
  )
}
