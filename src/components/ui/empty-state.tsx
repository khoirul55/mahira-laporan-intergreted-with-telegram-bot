import { FolderX } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ 
  icon = <FolderX className="h-10 w-10 text-muted-foreground" />, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[250px] rounded-xl border border-dashed border-border bg-card w-full">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card mb-4 border border-border">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-secondary-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
