/**
 * Technology name -> logo slug.
 *
 * Hand written on purpose: this map is the contract between the copy in
 * src/data/portfolio.js and the marks in src/data/techLogos.js. `npm run logos`
 * reads this file, walks every technology name used in the app and regenerates
 * techLogos.js with only those marks.
 *
 * Anything not listed here falls back to the neutral hexagon in TechLogo.
 */

export const techAliases = {
  php: 'php',
  laravel: 'laravel',
  'laravel framework': 'laravel',
  livewire: 'livewire',
  composer: 'composer',
  jquery: 'jquery',
  ajax: 'javascript',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  react: 'react',
  'react.js': 'react',
  reactjs: 'react',
  'react js': 'react',
  'react bootstrap': 'reactbootstrap',
  express: 'express',
  'express.js': 'express',
  expressjs: 'express',
  'express js': 'express',
  'node.js': 'nodedotjs',
  node: 'nodedotjs',
  nodejs: 'nodedotjs',
  websocket: 'socketdotio',
  'websocket (realtime)': 'socketdotio',
  'socket.io': 'socketdotio',
  realtime: 'socketdotio',
  bootstrap: 'bootstrap',
  'tailwind css': 'tailwindcss',
  tailwind: 'tailwindcss',
  html5: 'html5',
  html: 'html5',
  'html5 & css3': 'html5',
  css3: 'css',
  css: 'css',
  vite: 'vite',
  mysql: 'mysql',
  mariadb: 'mariadb',
  sqlite: 'sqlite',
  postgresql: 'postgresql',
  mongodb: 'mongodb',
  'database management': 'mark-database',
  'database design': 'mark-database',
  csharp: 'dotnet',
  'c#': 'dotnet',
  'asp.net': 'dotnet',
  'asp.net framework': 'dotnet',
  aspnet: 'dotnet',
  'visual studio': 'mark-code',
  vscode: 'mark-code',
  'c++': 'cplusplus',
  'code::blocks': 'codeblocks',
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  apache: 'apache',
  nginx: 'nginx',
  linux: 'linux',
  ubuntu: 'ubuntu',
  debian: 'debian',
  xampp: 'xampp',
  postman: 'postman',
  swagger: 'swagger',
  'restful api': 'swagger',
  api: 'swagger',
  jwt: 'mark-shield',
  pwa: 'pwa',
  firebase: 'firebase',
  docker: 'docker',
  telerik: 'mark-report',
  'telerik reporting': 'mark-report',
  'crystal reports': 'mark-report',
  reporting: 'mark-report',
  'data migration': 'mark-migration',
  migration: 'mark-migration',
  'system analysis': 'mark-analysis',
  'parallel testing': 'mark-analysis',
  analysis: 'mark-analysis',
  'network configuration': 'mark-network',
  networking: 'mark-network',
  network: 'mark-network',
  'cyber security basics': 'mark-shield',
  'cyber security': 'mark-shield',
  security: 'mark-shield',
  'web designing': 'mark-design',
  'web design': 'mark-design',
  'user training': 'mark-unknown',
  'technical support': 'mark-unknown',
};

/**
 * Brand colour fixes.
 *
 * A few brands publish a colour that disappears on one of the two themes:
 * Express and Socket.io are near-black (invisible on the dark UI), React and
 * JavaScript are near-white (invisible on the light UI).
 *
 * Write either a hex string (used in both themes) or `{ dark, light }` to fix
 * one side only. TechLogo exposes these as `--logo-ink` / `--logo-ink-light`
 * and media.css picks the right one per theme.
 */
export const techInkOverrides = {
  express: { dark: 'E6EDF5', light: '1B2430' },
  socketdotio: { dark: 'E6EDF5', light: '1B2430' },
  nextdotjs: { dark: 'E6EDF5', light: '1B2430' },
  css: { dark: '7AA2F7', light: '4A2E8F' },
  react: { light: '0E9BC4' },
  javascript: { light: 'C08A06' },
  swagger: { light: '2E8B1F' },
  linux: { light: 'C79400' },
  confluence: '7A9CC6',
};
