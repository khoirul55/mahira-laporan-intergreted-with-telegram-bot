'use client'

import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-border text-secondary-foreground hover:bg-muted"
      >
        Keluar
      </Button>
    </form>
  )
}
