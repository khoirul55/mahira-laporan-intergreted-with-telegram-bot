'use client'

import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/search-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { searchAllReports, exportReportsToCSV, getSearchStats, getDivisions, SearchFilters } from '@/actions/search'
import { History, Download, Eye, Calendar, CheckCircle, Clock, AlertCircle, Users, Building2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'

interface Report {
  id: number
  report_date: string
  status: string
  direksi_notes: string
  created_at: string
  users: {
    full_name: string
    divisions: {
      name: string
    }
  }
}

interface SearchClientProps {
  initialReports: Report[]
  initialStats: {
    total: number
    submitted: number
    draft: number
    plan_only: number
  }
  initialDivisions: Array<{ id: number; name: string }>
}

export default function SearchClient({ 
  initialReports, 
  initialStats, 
  initialDivisions 
}: SearchClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [stats, setStats] = useState(initialStats)
  const [divisions] = useState(initialDivisions)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    await performSearch({ ...filters, search: query })
  }

  const handleFilterChange = async (newFilters: SearchFilters) => {
    setFilters(newFilters)
    await performSearch({ ...newFilters, search: searchQuery })
  }

  const performSearch = async (searchFilters: SearchFilters) => {
    setIsLoading(true)
    try {
      const [reportsResult, statsResult] = await Promise.all([
        searchAllReports(searchFilters),
        getSearchStats(searchFilters, true)
      ])

      if (reportsResult.error) {
        toast.error(reportsResult.error)
        return
      }

      if (statsResult.error) {
        toast.error(statsResult.error)
        return
      }

      setReports(reportsResult.data || [])
      setStats(statsResult.data || initialStats)
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencari')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportReportsToCSV({ ...filters, search: searchQuery }, true)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `laporan_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        toast.success('CSV berhasil diunduh')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat export')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'plan_only':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      submitted: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      plan_only: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    }
    
    const labels: Record<string, string> = {
      submitted: 'Sudah Submit',
      draft: 'Draft',
      plan_only: 'Baru Rencana',
      overdue: 'Terlambat'
    }

    return (
      <Badge className={variants[status] || 'bg-muted text-muted-foreground'}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status] || status}</span>
      </Badge>
    )
  }

  // Group reports by division for stats
  const reportsByDivision = reports.reduce((acc, report) => {
    const divisionName = report.users.divisions?.name || 'Unknown'
    if (!acc[divisionName]) {
      acc[divisionName] = []
    }
    acc[divisionName].push(report)
    return acc
  }, {} as Record<string, Report[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pantau Laporan Semua Staff</h1>
          <p className="text-muted-foreground">Monitor laporan kerja semua staff</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              semua laporan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Submit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              laporan lengkap
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              belum lengkap
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rencana Saja</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.plan_only}</div>
            <p className="text-xs text-muted-foreground">
              baru rencana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisi Aktif</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(reportsByDivision).length}</div>
            <p className="text-xs text-muted-foreground">
              divisi melapor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Division Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Ringkasan per Divisi
          </CardTitle>
          <CardDescription>
            Overview jumlah laporan per divisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportsByDivision).map(([divisionName, divisionReports]) => {
              const submitted = divisionReports.filter(r => r.status === 'submitted').length
              const total = divisionReports.length
              const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0
              
              return (
                <div key={divisionName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{divisionName}</div>
                    <div className="text-sm text-muted-foreground">
                      {submitted}/{total} laporan lengkap ({percentage}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={percentage >= 80 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive'}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <SearchBar
        placeholder="Cari laporan berdasarkan nama, rencana, atau catatan..."
        onSearch={handleSearch}
        filters={{
          dateRange: true,
          division: true,
          status: true
        }}
        divisions={divisions}
        onFilterChange={handleFilterChange}
      />

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
          <CardDescription>
            Menampilkan {reports.length} laporan
            {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(report.report_date), 'EEEE, d MMMM yyyy', { locale: id })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(report.created_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{report.users.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.users.divisions?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        {report.direksi_notes ? (
                          <div className="max-w-xs truncate text-blue-600" title={report.direksi_notes}>
                            <Eye className="w-4 h-4 inline mr-1" />
                            Ada feedback
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to detail page
                            window.location.href = `/dashboard/reports/${report.id}`
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-semibold">Tidak Ada Laporan</h3>
              <p className="text-sm mt-2">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'Tidak ada laporan yang cocok dengan filter' 
                  : 'Belum ada laporan dari staff'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
