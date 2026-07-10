import AtmosphereLayers   from '@/components/AtmosphereLayers'
import CursorGlow         from '@/components/CursorGlow'
import StarCanvas         from '@/components/StarCanvas'
import Nav                from '@/components/Nav'
import HeroSection        from '@/components/HeroSection'
import AboutSection       from '@/components/AboutSection'
import AchievementsSection from '@/components/AchievementsSection'
import ContactSection     from '@/components/ContactSection'

export default function HomePage() {
  return (
    <>
      <AtmosphereLayers />
      <CursorGlow />
      <StarCanvas />
      <Nav />
      <main>
        <HeroSection />
        <AboutSection />
        <AchievementsSection />
        <ContactSection />
      </main>
      <footer>
        <span className="mono muted">Lucas Hu · built with curiosity</span>
      </footer>
    </>
  )
}
