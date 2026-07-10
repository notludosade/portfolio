'use client'

import { useState, useRef, type MouseEvent } from 'react'
import Link from 'next/link'
import { DATA } from '@/lib/data'

type Tab = 'projects' | 'internships' | 'awards' | 'events'

export default function AchievementsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('projects')
  const tiltedRef = useRef<HTMLDivElement | null>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = (e.target as Element).closest<HTMLDivElement>('.card')
    if (!card) {
      if (tiltedRef.current) resetCard(tiltedRef.current)
      tiltedRef.current = null
      return
    }
    const rect = card.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    card.style.transform = `perspective(640px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg) scale(1.015)`
    card.style.borderColor = 'rgba(91,156,246,0.55)'
    if (tiltedRef.current && tiltedRef.current !== card) resetCard(tiltedRef.current)
    tiltedRef.current = card
  }

  function handleMouseLeave() {
    if (tiltedRef.current) { resetCard(tiltedRef.current); tiltedRef.current = null }
  }

  function resetCard(c: HTMLDivElement) { c.style.transform = ''; c.style.borderColor = '' }

  return (
    <section id="achievements">
      <div className="section-inner">
        <div className="section-title-row">
          <div>
            <p className="section-label mono">// achievements</p>
            <h2 className="section-title">What I&apos;ve been up to</h2>
          </div>
          <Link href="/archive" className="btn-ghost mono archive-link">View Full Archive →</Link>
        </div>

        <div className="tabs" role="tablist">
          {(['projects','internships','awards','events'] as Tab[]).map(t => (
            <button
              key={t}
              className={`tab${activeTab === t ? ' active' : ''}`}
              role="tab"
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          {activeTab === 'projects' && (
            <div className="card-grid">
              {DATA.projects.map((p, i) => {
                const ph = !p.name
                return (
                  <div key={i} className={`card${ph ? ' card-placeholder' : ''}`}>
                    <div className="card-header">
                      <span className="card-icon mono">{p.status ? `{${p.status}}` : '{ TBD }'}</span>
                      <span className={`card-year${ph ? ' muted' : ''}`}>{p.year ?? '—'}</span>
                    </div>
                    <h3 className={ph ? 'muted' : ''}>{p.name ?? 'Coming soon'}</h3>
                    <p className={ph ? 'muted' : ''} style={ph ? { fontStyle: 'italic' } : {}}>
                      {p.description ?? 'Details will be added when this project is ready.'}
                    </p>
                    {p.tags.length > 0 && (
                      <div className="card-tags">
                        {p.tags.map(t => <span key={t} className="tag small">{t}</span>)}
                      </div>
                    )}
                    {(p.links.github || p.links.live) && (
                      <div className="card-links">
                        {p.links.github && <a href={p.links.github} className="link mono">→ GitHub</a>}
                        {p.links.live   && <a href={p.links.live}   className="link mono">→ Live</a>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'internships' && (
            <div className="timeline">
              {DATA.internships.map((inn, i) => {
                const ph = !inn.role
                return (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="mono">{inn.range ?? '—'}</span>
                        {inn.type && <span className="tag small">{inn.type}</span>}
                      </div>
                      <h3>{ph ? <span className="muted" style={{ fontStyle: 'italic' }}>Coming soon</span> : inn.role}</h3>
                      {inn.company && <p className="timeline-company">@ {inn.company}</p>}
                      <p className={ph ? 'muted' : ''} style={ph ? { fontStyle: 'italic' } : {}}>
                        {inn.description ?? 'Details will be added here.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="list-stack">
              {DATA.awards.map((a, i) => (
                <div key={i} className="list-item">
                  <div className="list-left"><span className="mono accent">{a.year ?? '—'}</span></div>
                  <div className="list-right">
                    <h3>{a.name ?? <span className="muted" style={{ fontStyle: 'italic' }}>Coming soon</span>}</h3>
                    {a.issuer      && <p>{a.issuer}</p>}
                    {a.description && <p className="muted">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="list-stack">
              {DATA.events.map((ev, i) => (
                <div key={i} className="list-item">
                  <div className="list-left"><span className="mono accent">{ev.year ?? '—'}</span></div>
                  <div className="list-right">
                    <h3>{ev.name ?? <span className="muted" style={{ fontStyle: 'italic' }}>Coming soon</span>}</h3>
                    {ev.role        && <p>{ev.role}</p>}
                    {ev.description && <p className="muted">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
