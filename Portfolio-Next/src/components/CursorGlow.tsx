'use client'

import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    function onMove(e: MouseEvent) {
      glow!.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`
      if (window.updateStarMouseTarget) window.updateStarMouseTarget(e.clientX, e.clientY)
    }
    function onLeave() { glow!.style.opacity = '0' }
    function onEnter() { glow!.style.opacity = '1' }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return <div id="cursor-glow" ref={glowRef} />
}
