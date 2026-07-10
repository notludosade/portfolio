import type { Metadata } from 'next'
import './archive.css'

export const metadata: Metadata = {
  title: 'The Archive — Lucas Hu',
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
