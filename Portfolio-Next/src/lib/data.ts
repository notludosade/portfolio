export interface Project {
  year: string | null
  status: string | null
  name: string | null
  description: string | null
  tags: string[]
  links: { github?: string; live?: string }
}

export interface Internship {
  range: string | null
  type: string | null
  role: string | null
  company: string | null
  description: string | null
}

export interface Award {
  year: string | null
  name: string | null
  issuer: string | null
  description: string | null
}

export interface Event {
  year: string | null
  name: string | null
  role: string | null
  description: string | null
}

export interface SiteData {
  projects: Project[]
  internships: Internship[]
  awards: Award[]
  events: Event[]
}

export const DATA: SiteData = {
  projects: [
    {
      year: '2026',
      status: 'Current Project',
      name: 'Dashboard Creation with Power BI',
      description: 'In this project, I am trying to collect data and put it all into a dashboard for higher-ups to view.',
      tags: ['Business', 'Data'],
      links: { github: '#', live: undefined },
    },
    { year: null, status: null, name: null, description: null, tags: [], links: {} },
    { year: null, status: null, name: null, description: null, tags: [], links: {} },
  ],
  internships: [
    { range: null, type: null, role: null, company: null, description: null },
    { range: null, type: null, role: null, company: null, description: null },
  ],
  awards: [
    { year: null, name: null, issuer: null, description: null },
    { year: null, name: null, issuer: null, description: null },
    { year: null, name: null, issuer: null, description: null },
  ],
  events: [
    {
      year: '2025',
      name: 'Marching Band China Trip',
      role: 'Guest',
      description: "An organization in China invited us to China's vast cities...",
    },
    { year: null, name: null, role: null, description: null },
  ],
}
