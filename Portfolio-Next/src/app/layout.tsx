import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lucas Hu — Portfolio',
  description: 'Portfolio of Lucas Hu — Computer Science, Maryland.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
