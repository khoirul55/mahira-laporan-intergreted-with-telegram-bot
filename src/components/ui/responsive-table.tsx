'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[]
  data: T[]
  renderMobileCard: (item: T, index: number) => React.ReactNode
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function ResponsiveTable<T extends { id?: number | string }>({
  columns,
  data,
  renderMobileCard,
  onRowClick,
  emptyMessage = 'Tidak ada data',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Card List */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id ?? index}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'cursor-pointer' : ''}
          >
            {renderMobileCard(item, index)}
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(c => !c.hideOnMobile).map((col) => (
                <TableHead key={col.key} className={col.className}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.id ?? index}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-secondary/50' : ''}
              >
                {columns.filter(c => !c.hideOnMobile).map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
