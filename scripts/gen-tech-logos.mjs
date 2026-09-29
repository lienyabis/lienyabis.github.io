/**
 * Regenerates src/data/techLogos.js.
 *
 *   npm run logos        # also runs automatically before dev / build
 *
 * It reads the name -> slug map in src/data/techAliases.js, collects every
 * technology name the site actually renders (portfolio data + literal <TechLogo
 * name="..." /> props) and writes only those marks. That keeps the shipped JS
 * small: the simple-icons package has 3400+ marks and is a devDependency only.
 *
 * simple-icons is CC0-1.0 (https://simple-icons.org). Slugs that are not real
 * brands (Telerik, Crystal Reports, "data migration", ...) are not in the
 * package, so a few neutral marks are drawn by hand below.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';

import { techAliases } from '../src/data/techAliases.js';
import { experience, projects, skillGroups, techMarquee } from '../src/data/portfolio.js';

/* Brand slugs available in simple-icons, keyed by the slug used in the aliases. */
const BRAND_SLUGS = [
  'php', 'laravel', 'livewire', 'composer', 'jquery', 'javascript', 'typescript',
  'react', 'reactbootstrap', 'express', 'nodedotjs', 'socketdotio',
  'bootstrap', 'tailwindcss', 'html5', 'css', 'vite',
  'mysql', 'mariadb', 'sqlite', 'postgresql', 'mongodb',
  'dotnet', 'cplusplus', 'codeblocks',
  'git', 'github', 'gitlab', 'apache', 'nginx', 'linux', 'ubuntu', 'debian', 'xampp',
  'postman', 'swagger', 'pwa', 'firebase', 'docker',
];

/* Hand-drawn neutral marks for skills that have no registered brand. */
const NEUTRAL_HEX = '94A3B8';
const MANUAL = [
  { slug: 'mark-shield', title: 'Security', hex: NEUTRAL_HEX, fillRule: 'evenodd', path: 'M12 1.6 3.7 5.4v6.1c0 5.1 3.5 9.9 8.3 11 4.8-1.1 8.3-5.9 8.3-11V5.4L12 1.6Zm-1.3 14.4-3.1-3.1 1.4-1.4 1.7 1.7 4.1-4.1 1.4 1.4-5.5 5.5Z' },
  { slug: 'mark-network', title: 'Network', hex: NEUTRAL_HEX, path: 'M12 1.2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 1 0 0-6.2ZM4.4 14.6a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 1 0 0-6.2ZM19.6 14.6a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 1 0 0-6.2ZM10.1 6.6 4.3 15.2l1.9 1 5.8-8.6ZM13.9 6.6l5.8 8.6-1.9 1-5.8-8.6Z' },
  { slug: 'mark-report', title: 'Reporting', hex: NEUTRAL_HEX, fillRule: 'evenodd', path: 'M5 1.5h8.3L20 8.2v14.3H5V1.5Zm3 10.2v2h9v-2H8Zm0 4v2h9v-2H8Zm0-8v2h5.2v-2H8Z' },
  { slug: 'mark-migration', title: 'Data migration', hex: NEUTRAL_HEX, path: 'M2.4 10.2h13.2V5.8l6.2 6.2-6.2 6.2v-4.4H2.4Z' },
  { slug: 'mark-analysis', title: 'Analysis', hex: NEUTRAL_HEX, path: 'M3 19.4h18v2.4H3ZM5.4 10.2h3.2v7.2H5.4ZM10.4 5.4h3.2v12h-3.2ZM15.4 13h3.2v4.4h-3.2Z' },
  { slug: 'mark-code', title: 'IDE / code', hex: NEUTRAL_HEX, path: 'M9.2 17.4 3.6 12l5.6-5.4 1.6 1.6L6.8 12l3.6 3.8ZM14.8 17.4l5.6-5.4-5.6-5.4-1.6 1.6 3.6 3.8-3.6 3.8Z' },
  { slug: 'mark-design', title: 'Design / UI', hex: NEUTRAL_HEX, fillRule: 'evenodd', path: 'M2 3.5h20A1.5 1.5 0 0 1 23.5 5v14a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 19V5A1.5 1.5 0 0 1 2 3.5ZM2 6.6h20V8.4H2ZM3.4 10.2h17.2v8.9H3.4V10.2Zm1.4 2.6h9.6v2H4.8v-2Zm0 3.6h6.2v2H4.8v-2Z' },
  { slug: 'mark-database', title: 'Database', hex: NEUTRAL_HEX, path: 'M3.4 4.8c0 1.4 3.6 2.6 8.6 2.6s8.6-1.2 8.6-2.6-3.6-2.6-8.6-2.6-8.6 1.2-8.6 2.6Zm0 0c0-1.4 3.6-2.6 8.6-2.6s8.6 1.2 8.6 2.6c0 1.4-3.6 2.6-8.6 2.6s-8.6-1.2-8.6-2.6Zm0 3.4v11c0 1.4 3.6 2.6 8.6 2.6s8.6-1.2 8.6-2.6v-11c0 1.4-3.6 2.6-8.6 2.6s-8.6-1.2-8.6-2.6Z' },
  { slug: 'mark-unknown', title: 'Technology', hex: NEUTRAL_HEX, fillRule: 'evenodd', path: 'M12 1.8 21 7.2v9.6L12 22.2 3 16.8V7.2L12 1.8Zm0 4.6-5.2 3v5.2l5.2 3 5.2-3V9.4L12 6.4Z' },
];


/* ---- collect every technology name the site renders --------------------- */

const names = new Set([
  ...skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
  ...techMarquee,
  ...experience.flatMap((job) => job.stack),
  ...projects.flatMap((project) => project.stack),
]);

/* Literal <TechLogo name="..." /> props in the components. */
const componentsDir = fileURLToPath(new URL('../src/components/', import.meta.url));
for (const file of readdirSync(componentsDir).filter((name) => name.endsWith('.jsx'))) {
  const source = readFileSync(`${componentsDir}${file}`, 'utf8');
  for (const match of source.matchAll(/<TechLogo[^>]*\sname="([^"]+)"/g)) {
    names.add(match[1]);
  }
}

/* ---- resolve names -> slugs -> marks ------------------------------------ */

const unresolved = [];
const wanted = new Set(['mark-unknown']);

for (const name of names) {
  const slug = techAliases[name.trim().toLowerCase()];
  if (!slug) unresolved.push(name);
  else wanted.add(slug);
}

const entries = [];
const unknownSlugs = [];

for (const slug of wanted) {
  const manual = MANUAL.find((mark) => mark.slug === slug);
  if (manual) {
    entries.push(manual);
    continue;
  }

  const icon = si[`si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`];
  if (icon?.path) {
    entries.push({ slug, title: icon.title, hex: icon.hex, path: icon.path });
  } else if (!BRAND_SLUGS.includes(slug)) {
    unknownSlugs.push(slug);
  }
}

entries.sort((a, b) => a.slug.localeCompare(b.slug));

const serialise = ({ slug, title, hex, path, fillRule }) =>
  `  ${JSON.stringify(slug)}: {\n` +
  `    title: ${JSON.stringify(title)},\n` +
  `    hex: ${JSON.stringify(hex)},\n` +
  `${fillRule ? `    fillRule: ${JSON.stringify(fillRule)},\n` : ''}` +
  `    path: ${JSON.stringify(path)},\n` +
  `  },`;

const out = `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`npm run logos\` (also runs automatically before dev and build).
 *
 * Brand marks come from simple-icons (https://simple-icons.org, CC0-1.0);
 * the \`mark-*\` entries are neutral marks drawn for skills that have no brand.
 * The name -> slug mapping lives in ./techAliases.js.
 */

export const techLogos = {
${entries.map(serialise).join('\n')}
};
`;

writeFileSync(new URL('../src/data/techLogos.js', import.meta.url), out, 'utf8');

const brandCount = entries.filter((entry) => !entry.slug.startsWith('mark-')).length;
console.log(
  `logos: ${brandCount} brand + ${entries.length - brandCount} neutral ` +
    `covering ${names.size} technology names`,
);
if (unresolved.length) console.warn('no alias (neutral mark used):', unresolved.join(', '));
if (unknownSlugs.length) console.warn('slug has no mark (neutral used):', unknownSlugs.join(', '));
