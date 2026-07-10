// ─────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH
//  Edit here — both index.html and archive.html
//  update automatically.
//
//  Set any field to null to show "Scheduled to
//  be Updated" as a placeholder.
// ─────────────────────────────────────────────

const DATA = {

  projects: [
    {
      year: "2026",
      status: "Current Project",
      name: "Dashboard Creation with Power BI",
      description: "In this project, I am trying to collect data and put it all into a dashboard for higher-ups to view.",
      tags: ["Business", "Data"],
      links: { github: "#", live: null }
    },
    {
      year: null,
      status: null,
      name: null,
      description: null,
      tags: [],
      links: {}
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
