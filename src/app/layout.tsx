import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Telaga Marina',
  description: 'Marina Operations Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
