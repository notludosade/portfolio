// ─────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH
//  Edit here — both index.html and archive.html
//  update automatically.
//
//  Projects: every entry with a name shows in
//  the archive automatically. To hide one, add:
//    archive: false
// ─────────────────────────────────────────────

const DATA = {

  projects: [
    {
      year: "2026",
      status: "Completed",
      name: "SAT AI",
      description: "In this project, I have created a tool where people can use this to construct a study plan for them. (Most likely more development near in the future).",
      tags: ["Education"],
      links: { github: "#", live: null }
    },
    {
      year: "2026",
      status: "Planned",
      name: "STEM+",
      description: "If you know, you know. This tool would help people learning STEM courses enhance their skills with practice problems, application-based problems, and more.",
      tags: ["Education"],
      links: {live: "https://portfolio-ocwr.vercel.app/"}
    },
    {
      year: null,
      status: null,
      name: null,
      description: null,
      tags: [],
      links: {}
    }
  ],

  internships: [
    {
      range: null,
      type: null,
      role: null,
      company: null,
      description: null
    },
    {
      range: null,
      type: null,
      role: null,
      company: null,
      description: null
    }
  ],

  awards: [
    { year: null, name: null, issuer: null, description: null },
    { year: null, name: null, issuer: null, description: null },
    { year: null, name: null, issuer: null, description: null }
  ],

  events: [
    {
      year: "2025",
      name: "Marching Band China Trip",
      role: "Guest",
      description: "An organization in China invited us to China's vast cities to attend events there as we were looked as Honored Guests."
    },
    {
      year: null,
      name: null,
      role: null,
      description: null
    }
  ]

};
