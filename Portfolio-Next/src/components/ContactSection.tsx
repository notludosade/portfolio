export default function ContactSection() {
  return (
    <section id="contact">
      <div className="section-inner contact-inner">
        <p className="section-label mono">// contact</p>
        <h2 className="section-title">Let&apos;s talk</h2>
        <p className="contact-sub">Personal Phone (+1) 227-277-2326</p>
        <div className="contact-links">
          <a href="mailto:hulukrs@gmail.com" className="btn-primary">Email me</a>
          <a href="https://github.com/[username]" className="btn-ghost mono">GitHub</a>
          <a href="https://linkedin.com/in/[username]" className="btn-ghost mono">LinkedIn</a>
          <a href="https://discord.gg/ZdxtabyZEv" className="btn-ghost mono">Discord Community</a>
        </div>
      </div>
    </section>
  )
}
