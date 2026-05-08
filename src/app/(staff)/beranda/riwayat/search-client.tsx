'use client'

import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/search-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { searchReports, exportReportsToCSV, getSearchStats, SearchFilters } from '@/actions/search'
import { History, Download, Eye, Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'

interface Report {
  id: number
  report_date: string
  status: string
  plan_notes: string
  notes: string
  direksi_notes: string
  created_at: string
}

interface SearchClientProps {
  initialReports: Report[]
  initialStats: {
    total: number
    submitted: number
    draft: number
    plan_only: number
  }
}

export default function SearchClient({ initialReports, initialStats }: SearchClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [stats, setStats] = useState(initialStats)
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
        searchReports(searchFilters),
        getSearchStats(searchFilters)
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
      const result = await exportReportsToCSV({ ...filters, search: searchQuery })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
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
        return <Clock className="w-4 h-4 text-gray-600" />
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
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status] || status}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Laporan</h1>
          <p className="text-gray-600">Lihat semua laporan kerja Anda</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      {/* Search and Filter */}
      <SearchBar
        placeholder="Cari laporan berdasarkan rencana atau catatan..."
        onSearch={handleSearch}
        filters={{
          dateRange: true,
          status: true
        }}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Rencana Kerja</TableHead>
                    <TableHead>Catatan Sore</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(report.report_date), 'EEEE, d MMMM yyyy', { locale: id })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(report.created_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={report.plan_notes}>
                          {report.plan_notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={report.notes}>
                          {report.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.direksi_notes ? (
                          <div className="max-w-xs truncate text-blue-600" title={report.direksi_notes}>
                            <Eye className="w-4 h-4 inline mr-1" />
                            Ada feedback
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to detail page
                            window.location.href = `/beranda/laporan/detail/${report.id}`
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
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-semibold">Tidak Ada Laporan</h3>
              <p className="text-sm mt-2">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'Tidak ada laporan yang cocok dengan filter' 
                  : 'Mulai buat laporan pertama Anda'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
