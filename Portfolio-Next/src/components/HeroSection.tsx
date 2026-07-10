export default function HeroSection() {
  return (
    <section id="hero">
      <div className="hero-inner">
        <p className="mono hero-prefix">$The Proctor</p>
        <h1 className="hero-name">Lucas Hu<span className="cursor">_</span></h1>
        <p className="hero-tagline">Mastermind</p>
        <div className="hero-tags">
          <span className="tag">Computer Science</span>
          <span className="tag">Maryland, United States</span>
          <span className="tag">John 15:5</span>
        </div>
        <div className="hero-actions">
          <a href="#achievements" className="btn-primary">View My Work</a>
          <a href="#contact" className="btn-ghost">Get in Touch</a>
        </div>
      </div>
    </section>
  )
}
