/**
 * Portfolio content.
 * Every value below is taken from "UPDATED RESUME.pdf" (Niel F. Sibay).
 * Nothing is invented - only re-organised and re-worded for the web.
 */

export const profile = {
  name: 'Niel F. Sibay',
  firstName: 'Niel',
  initials: 'NS',
  title: 'PHP & Laravel Web Developer',
  roles: [
    'PHP & Laravel Web Developer',
    'React & Express.js Developer',
    'RESTful API Developer',
    'Frontend Developer (JS / jQuery)',
    'Software Implementer & Support',
  ],
  avatar: './profile.jpg',
  avatarAlt: 'Niel F. Sibay, PHP, Laravel and React developer',
  tagline:
    'I design and build fast, reliable and maintainable web applications with PHP, Laravel, React and Express.',
  summary:
    'Web developer with 4+ years of hands-on experience delivering Laravel/PHP web applications, RESTful APIs and business systems for real clients. I started in software implementation - system analysis, data migration, parallel testing and user training - which is why I build products that people can actually adopt. Today I work across the full stack: Laravel and Express.js backends, React, jQuery/AJAX and Tailwind or Bootstrap frontends, MySQL databases and API integrations.',
  objective:
    'To enhance my professional skills, capabilities and knowledge in an organization which recognizes the value of hard work and trusts me with responsibilities and challenges.',
  location: 'Purok Calachuchi, Olivo, Tabuelan, Cebu, Philippines',
  locationShort: 'Tabuelan, Cebu, Philippines',
  email: '19sibayniel93@gmail.com',
  mobile: '+63 930 906 9221',
  mobileHref: '+639309069221',
  availability: 'Open to new opportunities',
  resumeUrl: './Niel-Sibay-Resume.pdf',
};

export const stats = [
  { value: 4, suffix: '+', label: 'Years Building for the Web' },
  { value: 5, suffix: '', label: 'Systems Delivered' },
  { value: 18, suffix: '+', label: 'Technologies Used' },
  { value: 4, suffix: '', label: 'Professional Roles' },
];

/**
 * Skill groups taken from the resume "Skills" list.
 * `level` is a qualitative tag derived from how the resume uses each tool:
 *   core    -> used in almost every delivered project
 *   strong  -> regular production experience
 *   working -> working knowledge (listed under skills or interests)
 */
export const levelLabels = {
  core: 'Core',
  strong: 'Strong',
  working: 'Working',
};

export const skillGroups = [
  {
    id: 'backend',
    title: 'Backend & Frameworks',
    icon: 'server',
    blurb: 'Where most of my day-to-day work happens.',
    skills: [
      { name: 'PHP', level: 'core' },
      { name: 'Laravel Framework', level: 'core' },
      { name: 'Express.js', level: 'strong' },
      { name: 'RESTful API', level: 'core' },
      { name: 'Node.js', level: 'working' },
      { name: 'C#', level: 'strong' },
      { name: 'ASP.NET Framework', level: 'strong' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend & UI',
    icon: 'layout',
    blurb: 'Responsive, user-friendly interfaces for real users.',
    skills: [
      { name: 'JavaScript', level: 'core' },
      { name: 'React.js', level: 'strong' },
      { name: 'jQuery', level: 'core' },
      { name: 'AJAX', level: 'core' },
      { name: 'Bootstrap', level: 'core' },
      { name: 'Tailwind CSS', level: 'strong' },
      { name: 'WebSocket (Realtime)', level: 'strong' },
      { name: 'HTML5 & CSS3', level: 'core' },
      { name: 'Web Designing', level: 'strong' },
    ],
  },
  {
    id: 'data',
    title: 'Database & Data',
    icon: 'database',
    blurb: 'Designing, migrating and keeping data trustworthy.',
    skills: [
      { name: 'MySQL', level: 'core' },
      { name: 'Database Management', level: 'core' },
      { name: 'Data Migration', level: 'strong' },
      { name: 'Crystal Reports', level: 'strong' },
      { name: 'Telerik Reporting', level: 'strong' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Environment',
    icon: 'tool',
    blurb: 'The environment I build and ship in.',
    skills: [
      { name: 'Git', level: 'strong' },
      { name: 'Apache', level: 'strong' },
      { name: 'Visual Studio', level: 'strong' },
      { name: 'Linux', level: 'working' },
      { name: 'Network Configuration', level: 'working' },
      { name: 'Cyber Security Basics', level: 'working' },
    ],
  },
];

export const interests = [
  'Artificial Intelligence',
  'Linux',
  'Network Configuration',
  'Cyber Security',
  'Programming',
  'Web Designing',
  'Database Management',
];

export const services = [
  {
    icon: 'code',
    title: 'Laravel & PHP Web Applications',
    text: 'Custom web applications built on pure Laravel/PHP - membership portals, dashboards and client-facing systems.',
  },
  {
    icon: 'plug',
    title: 'RESTful API Development',
    text: 'Well-structured APIs in Laravel or Express.js, consumed by web and desktop clients and secured with JWT authentication.',
  },
  {
    icon: 'rocket',
    title: 'Software Implementation',
    text: 'System analysis, data migration, dry-run/parallel testing, go-live support and user training.',
  },
  {
    icon: 'broom',
    title: 'Maintenance & Technical Support',
    text: 'Monitoring client concerns, fixing issues and keeping existing web and desktop products healthy.',
  },
  {
    icon: 'layers',
    title: 'Frontend Development',
    text: 'Responsive interfaces with React, JavaScript, jQuery, AJAX, Bootstrap and Tailwind CSS.',
  },
  {
    icon: 'chart',
    title: 'Reporting & Data',
    text: 'Reliable MySQL structures, data migration and Crystal Reports / Telerik reporting output.',
  },
];

export const experience = [
  {
    role: 'Web Developer',
    company: 'coreDev Solutions Inc',
    companyNote: 'A software service provider company.',
    period: '01/15/2023 - 04/17/2026',
    current: false,
    summary:
      'Responsible for creating and developing new software products in both web and desktop, and maintaining the existing software products in both web and desktop applications.',
    highlights: [
      'Built and maintained web and desktop software products across the full delivery cycle.',
      'Developed Laravel/PHP backends and RESTful APIs consumed by desktop clients.',
      'Kept existing client systems stable, updated and supported.',
    ],
    stack: ['Laravel', 'PHP', 'Express.js', 'React', 'JavaScript', 'jQuery', 'AJAX', 'MySQL', 'Bootstrap', 'Tailwind'],
  },
  {
    role: 'Senior Software Implementer',
    company: 'coreDev Solutions Inc',
    companyNote: 'A software service provider company.',
    period: '01/17/2022 - 01/15/2023',
    current: false,
    summary:
      'Focused on leading and assisting the team, handling complex data migration tasks, monitoring team members, client concerns and technical support.',
    highlights: [
      'Led and assisted the implementation team during live client rollouts.',
      'Owned complex data migration tasks and validated migrated records.',
      'Monitored team members, client concerns and technical support requests.',
    ],
    stack: ['Data Migration', 'System Analysis', 'Parallel Testing', 'User Training', 'Technical Support'],
  },
  {
    role: 'Junior Software Implementer',
    company: 'coreDev Solutions Inc',
    companyNote: 'A software service provider company.',
    period: '06/04/2021 - 01/17/2022',
    current: false,
    summary:
      'Focused on system analysis, data migration, dry run/parallel testing, user training and technical support.',
    highlights: [
      'Performed system analysis and documented client requirements.',
      'Executed data migration, dry-run and parallel testing before go-live.',
      'Trained end users and provided post-deployment technical support.',
    ],
    stack: ['System Analysis', 'Data Migration', 'User Training', 'Technical Support'],
  },
  {
    role: 'OJT Web Developer',
    company: 'Publicized Media Group',
    companyNote: "An IT company that customizes websites according to clients' needs.",
    period: '06/07/2019 - 03/20/2020',
    current: false,
    summary: 'Focused on building webpages and designs as an on-the-job training web developer.',
    highlights: [
      'Built webpages and layouts based on client requirements.',
      'Translated designs into responsive HTML, CSS and JavaScript.',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Web Design'],
  },
];

export const education = [
  {
    degree: 'BS in Information and Communications Technology',
    school: 'Cebu Technological University - Tuburan Campus',
    period: '2016 - 2020',
    note: 'Foundation in programming, networking, databases and web technologies.',
  },
];

export const references = [
  {
    name: 'Joseph Anthony Piat',
    role: 'Middleware Engineer',
    company: 'Manulife Business Processing Services',
    phone: '09096572325',
    email: 'josephanthonypiat122@gmail.com',
  },
];

export const techMarquee = [
  'PHP',
  'Laravel',
  'JavaScript',
  'React.js',
  'jQuery',
  'AJAX',
  'Express.js',
  'MySQL',
  'RESTful API',
  'WebSocket',
  'Bootstrap',
  'Tailwind CSS',
  'Node.js',
  'C#',
  'ASP.NET',
  'Git',
  'Apache',
  'Linux',
];

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'services', label: 'Services' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];



export const projects = [
  {
    id: 'project-1',
    number: '01',
    title: 'Online Membership Application',
    client: 'GSAC',
    status: 'Live',
    url: 'https://staging-membership.gsac-portal.com/',
    urlLabel: 'staging-membership.gsac-portal.com',
    description:
      'Co-developed an online membership application for the GSAC client, covering the membership lifecycle from registration to approval.',
    contributions: [
      'Co-developed the application end to end using pure Laravel and PHP.',
      'Built interactive forms and validation with JavaScript, jQuery and AJAX.',
      'Modeled membership data in MySQL and styled the UI with Bootstrap.',
    ],
    stack: ['Laravel', 'PHP', 'JavaScript', 'jQuery', 'AJAX', 'MySQL', 'Bootstrap'],
    accent: 'violet',
  },
  {
    id: 'project-2',
    number: '02',
    title: 'SMS Gateway Portal',
    client: 'coreDev clients',
    status: 'Live',
    url: 'https://sendit.coredev.ph/login',
    urlLabel: 'sendit.coredev.ph',
    description:
      'Co-developed and maintained the SMS gateway portal used by existing coreDev clients for their messaging subscription.',
    contributions: [
      'Maintained and extended a live portal used by paying clients.',
      'Implemented realtime updates with WebSocket alongside AJAX requests.',
      'Kept the Laravel codebase, MySQL data and Bootstrap UI healthy.',
    ],
    stack: ['Laravel', 'PHP', 'JavaScript', 'jQuery', 'AJAX', 'WebSocket', 'MySQL', 'Bootstrap'],
    accent: 'cyan',
  },
  {
    id: 'project-3',
    number: '03',
    title: 'Budget Monitoring System',
    client: 'coreDev clients',
    status: 'Desktop',
    url: '',
    urlLabel: 'Repository access is no longer available',
    description:
      'Co-developed and maintained a desktop budget monitoring application for existing coreDev clients, including reporting and export features.',
    contributions: [
      'Co-developed the desktop application in C# using Visual Studio.',
      'Built Telerik interfaces with Crystal Reports for exported and imported reports.',
      'Supported long-running client deployments and data corrections.',
    ],
    stack: ['C#', 'Visual Studio', 'Telerik', 'Crystal Reports', 'MySQL'],
    accent: 'red',
  },
  {
    id: 'project-4',
    number: '04',
    title: 'Online Queueing System',
    client: 'GSAC',
    status: 'Live',
    url: 'https://queue.gsac-portal.com/login',
    urlLabel: 'queue.gsac-portal.com',
    description:
      'Co-developed and maintained an online queueing system for existing coreDev clients, built with realtime updates so counters and displays stay in sync.',
    contributions: [
      'Built queue flows with pure Laravel, PHP and MySQL.',
      'Used WebSocket plus AJAX/jQuery for live queue status.',
      'Styled a clean, responsive UI with Bootstrap.',
    ],
    stack: ['Laravel', 'PHP', 'JavaScript', 'jQuery', 'AJAX', 'WebSocket', 'MySQL', 'Bootstrap'],
    accent: 'violet',
  },
  {
    id: 'project-5',
    number: '05',
    title: 'Integrated Accounting System (IACCS WEB)',
    client: 'coreDev Solutions Inc',
    status: 'Live',
    url: 'https://iaccs-x.coredev.ph',
    urlLabel: 'iaccs-x.coredev.ph',
    extraUrl: 'https://console-iaccs-x.coredev.ph',
    description:
      'Co-developed and created the backend API of the existing coreDev desktop accounting system, exposing IACCS data to a web client.',
    contributions: [
      'Developed the backend/API layer bridging a desktop system to the web.',
      'Built the API with Visual Studio and the ASP.NET framework.',
      'Secured the API with JWT authentication.',
    ],
    stack: ['ASP.NET', 'C#', 'RESTful API', 'JWT', 'Visual Studio', 'MySQL'],
    accent: 'cyan',
  },
];
