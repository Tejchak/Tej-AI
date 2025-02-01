'use client'

import { signOutAction } from "@/app/actions"

export default function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        className="text-sm text-gray-400 hover:text-white transition-colors"
        type="submit"
      >
        Sign Out
      </button>
    </form>
  )
}
