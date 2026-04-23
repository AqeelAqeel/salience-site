export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  expertise: string[];
  bio: string;
  image?: string;
  email?: string;
  phone?: string;
  calendly?: string;
  linkedin?: string;
  github?: string;
  x?: string;
  website?: { label: string; url: string };
}

export const teamMembers: TeamMember[] = [
  {
    slug: 'aqeel',
    name: 'Aqeel Ali',
    role: 'Founding Partner',
    tagline: 'Architect of AI systems that ship.',
    expertise: ['AI Systems Architecture', 'Enterprise Automation', 'Strategic Advisory'],
    bio: 'Architect of large-scale AI automation systems deployed across insurance, healthcare, financial services, and professional practices. Deep technical background in machine learning infrastructure with hands-on experience building and shipping AI products used by thousands. Connects cutting-edge research to real business outcomes.',
    image: '/assets/team/aqeel-ali.jpeg',
    email: 'aqeel@salience.ventures',
    phone: '+14087180712',
    calendly: 'https://calendly.com/aqeel-9vc/30min-consult',
    linkedin: 'https://www.linkedin.com/in/aliaqeel/',
  },
  {
    slug: 'jackson',
    name: 'Jackson Harris',
    role: 'Managing Partner',
    tagline: 'Engineering leader. CTO through a Niantic acquisition.',
    expertise: ['Engineering Leadership', 'Platform Infrastructure', 'M&A Technical Strategy'],
    bio: 'Battle-tested engineering leader who has architected and scaled core operating infrastructure at multi-billion dollar companies. Former CTO through an acquisition by Niantic, Inc. — bringing firsthand experience navigating technical due diligence, integration, and post-acquisition engineering alignment. Drove engineering performance metrics and operational excellence across high-growth organizations, building the kind of resilient, scalable systems that acquirers pay a premium for. Turns complex technical debt into clean, compounding infrastructure.',
    image: '/assets/team/jackson-harris.jpeg',
    email: 'jackson@salience.ventures',
    calendly: 'https://calendly.com/jackson-salience/30min',
    linkedin: 'https://linkedin.com/in/jacksonharris3',
    github: 'https://github.com/jackson-harris-iii',
    x: 'https://x.com/jacksonthedev',
    website: { label: 'selfrow.com', url: 'https://selfrow.com' },
  },
  {
    slug: 'danara',
    name: 'Danara Buvaeva',
    role: 'Partner',
    tagline: 'Ecommerce & supply chain operator.',
    expertise: ['Ecommerce Operations', 'Supply Chain Optimization', 'Logistics AI'],
    bio: 'Ecommerce and supply chain expert with deep domain knowledge in inventory optimization, demand forecasting, and fulfillment automation. Has driven operational transformations for brands scaling from seven to nine figures, applying AI at every link in the chain from procurement to last-mile delivery.',
    image: '/assets/team/danara-buvaeva.png',
    linkedin: 'https://www.linkedin.com/in/danarab/',
  },
  {
    slug: 'george',
    name: 'George Mazur',
    role: 'Partner',
    tagline: 'Full-cycle B2B SaaS commercial lead.',
    expertise: ['B2B SaaS Sales', 'Go-to-Market Strategy', 'Revenue Operations'],
    bio: 'Full-cycle commercial AE with deep experience across B2B SaaS, MarTech, HCM, and fintech. Runs quantified discovery tied to conversion and pipeline levers — visitor-to-lead, MQL-to-SQL, speed-to-lead, attribution. Expert at multi-threading complex deals across Marketing, RevOps, Sales leadership, and Finance. Brings MEDDIC discipline and GTM strategy to every engagement.',
    image: '/assets/team/george-mazur.jpeg',
    linkedin: 'https://www.linkedin.com/in/george-m-b69586159/',
  },
];

export function getTeamMember(slug: string): TeamMember | undefined {
  return teamMembers.find((m) => m.slug === slug);
}
