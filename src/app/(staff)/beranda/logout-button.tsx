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
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        Keluar
      </Button>
    </form>
  )
}
