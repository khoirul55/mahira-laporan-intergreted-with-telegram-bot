'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Filter, Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  filters?: {
    dateRange?: boolean
    division?: boolean
    status?: boolean
    fileType?: boolean
  }
  divisions?: Array<{ id: number; name: string }>
  onFilterChange?: (filters: Record<string, string>) => void
  className?: string
}

export function SearchBar({ 
  placeholder = "Cari...", 
  onSearch, 
  filters = {},
  divisions = [],
  onFilterChange,
  className = ""
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (value === 'all') {
      delete newFilters[key]
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
    onSearch('')
    onFilterChange?.({})
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchQuery

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {(filters.dateRange || filters.division || filters.status || filters.fileType) && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
            {Object.keys(activeFilters).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {Object.keys(activeFilters).length}
              </Badge>
            )}
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
            </Badge>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            let displayValue = value
            if (key === 'division_id' && divisions) {
              const division = divisions.find(d => d.id.toString() === value)
              displayValue = division?.name || value
            }
            return (
              <Badge key={key} variant="secondary">
                {key.replace('_', ' ')}: {displayValue}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            {filters.dateRange && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Select
                  value={activeFilters.dateRange || 'all'}
                  onValueChange={(value) => handleFilterChange('dateRange', value || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tanggal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tanggal</SelectItem>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="yesterday">Kemarin</SelectItem>
                    <SelectItem value="this_week">Minggu Ini</SelectItem>
                    <SelectItem value="last_week">Minggu Lalu</SelectItem>
                    <SelectItem value="this_month">Bulan Ini</SelectItem>
                    <SelectItem value="last_month">Bulan Lalu</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Division Filter */}
            {filters.division && divisions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Divisi</label>
                <Select
                  value={activeFilters.division_id || 'all'}
                  onValueChange={(value) => handleFilterChange('division_id', value || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Divisi</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter */}
            {filters.status && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={activeFilters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="submitted">Sudah Submit</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="plan_only">Baru Rencana</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File Type Filter */}
            {filters.fileType && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipe File</label>
                <Select
                  value={activeFilters.file_type || 'all'}
                  onValueChange={(value) => handleFilterChange('file_type', value || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="image">Gambar</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Custom Date Range (if selected) */}
          {activeFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Input
                  type="date"
                  value={activeFilters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || '')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Input
                  type="date"
                  value={activeFilters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || '')}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
