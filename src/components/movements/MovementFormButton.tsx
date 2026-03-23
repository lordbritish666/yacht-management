'use client'

import { useFormStatus } from 'react-dom'

export function MovementSubmitButton({
  label,
  buttonClass,
}: {
  label: string
  buttonClass: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}
