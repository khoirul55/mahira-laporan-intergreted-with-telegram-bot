'use client'

import { useState } from 'react'
import { Filter, Search, X } from 'lucide-react'

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-clean pl-10"
          />
        </div>
        
        {(filters.dateRange || filters.division || filters.status || filters.fileType) && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {Object.keys(activeFilters).length > 0 && (
              <span className="badge-neutral">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="btn-ghost text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="badge-neutral">
              Search: "{searchQuery}"
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            let displayValue = value
            if (key === 'division_id' && divisions) {
              const division = divisions.find(d => d.id.toString() === value)
              displayValue = division?.name || value
            }
            return (
              <span key={key} className="badge-neutral">
                {key.replace('_', ' ')}: {displayValue}
              </span>
            )
          })}
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="surface p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            {filters.dateRange && (
              <div className="space-y-2">
                <label className="text-section-label block">Tanggal</label>
                <select
                  value={activeFilters.dateRange || 'all'}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value || '')}
                  className="input-clean"
                >
                  <option value="all">Semua Tanggal</option>
                  <option value="today">Hari Ini</option>
                  <option value="yesterday">Kemarin</option>
                  <option value="this_week">Minggu Ini</option>
                  <option value="last_week">Minggu Lalu</option>
                  <option value="this_month">Bulan Ini</option>
                  <option value="last_month">Bulan Lalu</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            )}

            {/* Division Filter */}
            {filters.division && divisions.length > 0 && (
              <div className="space-y-2">
                <label className="text-section-label block">Divisi</label>
                <select
                  value={activeFilters.division_id || 'all'}
                  onChange={(e) => handleFilterChange('division_id', e.target.value || '')}
                  className="input-clean"
                >
                  <option value="all">Semua Divisi</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id.toString()}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            {filters.status && (
              <div className="space-y-2">
                <label className="text-section-label block">Status</label>
                <select
                  value={activeFilters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value || '')}
                  className="input-clean"
                >
                  <option value="all">Semua Status</option>
                  <option value="submitted">Sudah Submit</option>
                  <option value="draft">Draft</option>
                  <option value="plan_only">Baru Rencana</option>
                  <option value="overdue">Terlambat</option>
                </select>
              </div>
            )}

            {/* File Type Filter */}
            {filters.fileType && (
              <div className="space-y-2">
                <label className="text-section-label block">Tipe File</label>
                <select
                  value={activeFilters.file_type || 'all'}
                  onChange={(e) => handleFilterChange('file_type', e.target.value || '')}
                  className="input-clean"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                  <option value="image">Gambar</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            )}
          </div>

          {/* Custom Date Range (if selected) */}
          {activeFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-section-label block">Dari Tanggal</label>
                <input
                  type="date"
                  value={activeFilters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || '')}
                  className="input-clean"
                />
              </div>
              <div className="space-y-2">
                <label className="text-section-label block">Sampai Tanggal</label>
                <input
                  type="date"
                  value={activeFilters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || '')}
                  className="input-clean"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
