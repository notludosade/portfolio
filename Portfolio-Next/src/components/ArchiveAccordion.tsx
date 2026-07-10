'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import { DATA } from '@/lib/data'

type Section = 'projects' | 'internships' | 'awards' | 'events'

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null
  const cls = { live: 'live', 'in progress': 'wip', paused: 'paused' }[status.toLowerCase()] ?? ''
  return <span className={`arc-entry-status ${cls}`}>{status}</span>
}

function ProjectList() {
  return (
    <div className="acc-entry-list">
      {DATA.projects.map((p, i) => (
        <div key={i} className={`arc-entry${!p.name ? ' placeholder' : ''}`}>
          <div className="arc-entry-year">{p.year ?? '—'}</div>
          <div className="arc-entry-body">
            <StatusBadge status={p.status} />
            <div className="arc-entry-title">{p.name ?? 'Coming soon'}</div>
            {p.description && <div className="arc-entry-desc">{p.description}</div>}
            {p.tags.length > 0 && (
              <div className="arc-entry-tags">
                {p.tags.map(t => <span key={t} className="arc-entry-tag">{t}</span>)}
              </div>
            )}
            {(p.links.github || p.links.live) && (
              <div className="arc-entry-links">
                {p.links.github && <a href={p.links.github} className="arc-entry-link" target="_blank" rel="noreferrer">→ GitHub</a>}
                {p.links.live   && <a href={p.links.live}   className="arc-entry-link" target="_blank" rel="noreferrer">→ Live</a>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function InternshipList() {
  return (
    <div className="acc-entry-list">
      {DATA.internships.map((item, i) => (
        <div key={i} className={`arc-entry${!item.role ? ' placeholder' : ''}`}>
          <div className="arc-entry-year">{item.range ?? '—'}</div>
          <div className="arc-entry-body">
            {item.type && <span className="arc-entry-status paused">{item.type}</span>}
            <div className="arc-entry-title">{item.role ?? 'Coming soon'}</div>
            {item.company     && <div className="arc-entry-meta">@ {item.company}</div>}
            {item.description && <div className="arc-entry-desc">{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function AwardList() {
  return (
    <div className="acc-entry-list">
      {DATA.awards.map((a, i) => (
        <div key={i} className={`arc-entry${!a.name ? ' placeholder' : ''}`}>
          <div className="arc-entry-year">{a.year ?? '—'}</div>
          <div className="arc-entry-body">
            <div className="arc-entry-title">{a.name ?? 'Coming soon'}</div>
            {a.issuer      && <div className="arc-entry-meta">{a.issuer}</div>}
            {a.description && <div className="arc-entry-desc">{a.description}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventList() {
  return (
    <div className="acc-entry-list">
      {DATA.events.map((e, i) => (
        <div key={i} className={`arc-entry${!e.name ? ' placeholder' : ''}`}>
          <div className="arc-entry-year">{e.year ?? '—'}</div>
          <div className="arc-entry-body">
            <div className="arc-entry-title">{e.name ?? 'Coming soon'}</div>
            {e.role        && <div className="arc-entry-meta">{e.role}</div>}
            {e.description && <div className="arc-entry-desc">{e.description}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

const SECTIONS: { id: Section; num: string; label: string; count: () => number; Body: () => ReactElement }[] = [
  { id:'projects',    num:'01', label:'Projects',    count: () => DATA.projects.filter(p => p.name).length,   Body: ProjectList },
  { id:'internships', num:'02', label:'Internships', count: () => DATA.internships.filter(i => i.role).length, Body: InternshipList },
  { id:'awards',      num:'03', label:'Awards',      count: () => DATA.awards.filter(a => a.name).length,     Body: AwardList },
  { id:'events',      num:'04', label:'Events',      count: () => DATA.events.filter(e => e.name).length,     Body: EventList },
]

export default function ArchiveAccordion() {
  const [open, setOpen] = useState<Section | null>(null)

  return (
    <main className="arc-main">
      {SECTIONS.map(({ id, num, label, count, Body }) => {
        const isOpen = open === id
        const n = count()
        return (
          <div key={id} className={`acc-group${isOpen ? ' open' : ''}`}>
            <button
              className="acc-header"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : id)}
            >
              <span className="acc-num mono">{num}</span>
              <span className="acc-label">{label}</span>
              <span className="acc-count mono">{n} {n === 1 ? 'entry' : 'entries'}</span>
              <span className="acc-arrow">↓</span>
            </button>
            <div className="acc-body">
              <Body />
            </div>
          </div>
        )
      })}
    </main>
  )
}
