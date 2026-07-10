import ArchiveAuroraCanvas from '@/components/ArchiveAuroraCanvas'
import ArchiveAccordion    from '@/components/ArchiveAccordion'
import Link                from 'next/link'

export default function ArchivePage() {
  return (
    <>
      <ArchiveAuroraCanvas />

      <nav>
        <Link href="/" className="nav-logo mono nav-back">← Lucas Hu</Link>
        <span className="nav-title mono">// archive</span>
      </nav>

      <header className="arc-hero">
        <div className="arc-hero-inner">
          <p className="arc-eyebrow mono">// the complete record</p>
          <h1 className="arc-title">The Archive</h1>
          <p className="arc-subtitle">Every project, internship, award &amp; event — documented.</p>
          <div className="arc-scroll-cue mono">↓ scroll to explore</div>
        </div>
        <div className="arc-hero-glow" />
      </header>

      <ArchiveAccordion />
    </>
  )
}
