export default function AboutSection() {
  return (
    <section id="about">
      <div className="section-inner">
        <p className="section-label mono">//about_me</p>
        <h2 className="section-title">A bit about me</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              Hey — I&apos;m <strong>Lucas</strong>. I am currently 15 years old and having a generational
              addiction to the era of AI. The limits it brings could one day be endless. I love doing what
              I do right now and it drives me to be the best version of myself.
            </p>
            <p>
              The output of what I do is the thing that drives me to do more because with results showing,
              depending whether it is good or bad, determines my next course of action. The things I love to
              use with my skills are usually to create fun, formal, and casual projects that would help me
              and others if they want a piece of it also. Outside of coding, I wish to start being profitable
              in Creative Development because with my code, I also have a taste of creativity inside me.
            </p>
            <p>
              Outside of me doing anything, I usually play Minecraft with friends if they are online.
              I am wishing to train myself into being good at Minecraft and trying to become a developer
              of my own creations/mods/add-ons in Minecraft Java and Bedrock Edition.
            </p>
          </div>
          <div className="about-card">
            <div className="about-stat">
              <span className="stat-num mono">0</span>
              <span className="stat-label">Projects shipped</span>
            </div>
            <div className="divider" />
            <div className="about-stat">
              <span className="stat-num mono">0</span>
              <span className="stat-label">Internships completed</span>
            </div>
            <div className="divider" />
            <div className="about-stat">
              <span className="stat-num mono">0</span>
              <span className="stat-label">Awards &amp; recognitions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
