# Niel F. Sibay - Portfolio

A dark-mode, animated single-page portfolio built with **React + Vite**.
All content (skills, experience, projects, education, reference) is taken from
`UPDATED RESUME.pdf` in this folder.

## Highlights

- **Smoke cursor effect** - a canvas particle plume that trails the mouse pointer
  (`src/components/SmokeCursor.jsx`). Soft sprites are pre-rendered offscreen so the
  animation loop stays cheap; particles rise, expand and fade like smoke. Disabled
  automatically on touch devices and when `prefers-reduced-motion` is set.
- **Dark by default** - the whole palette lives in CSS variables in `src/styles/base.css`.
  A light theme is layered on with `[data-theme="light"]` and the toggle in the navbar
  remembers the visitor's choice in `localStorage`.
- **Reactive UI** - scroll-reveal animations, animated stat counters, typewriter role
  rotator, active-section navigation, scroll progress bar, card "spotlight" that follows
  the pointer, tilting code card, back-to-top button and a pausable tech marquee.
- **Profile photo front and centre** - `public/profile.jpg` is the hero centrepiece
  (`src/components/ProfilePhoto.jsx`, square crop with a dashed rotating ring and a
  breathing glow), repeated in the About card and as the navbar/footer avatar. It is
  preloaded and sized (`width`/`height`, `fetchpriority="high"`) so it does not shift
  layout or delay the largest paint.
- **Real brand logos everywhere** - every skill, stack chip and marquee entry is drawn
  with its own brand mark in the brand's own colour (`src/components/TechLogo.jsx`).
  Marks are vendored from [Simple Icons](https://simple-icons.org) (CC0-1.0) by
  `npm run logos`, which emits only the logos the content actually uses. Skills with no
  real brand (Telerik, Crystal Reports, data migration, system analysis, ...) get
  hand-drawn neutral marks so the rows still read consistently.
- **Sections a web/PHP/Laravel developer needs** - hero, about, skills, services,
  experience timeline, projects, education + reference, contact form and footer.
- **Accessible & responsive** - keyboard-friendly focus rings, Escape closes the mobile
  drawer, semantic landmarks, and layouts that collapse cleanly down to 360px.

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build into dist/
npm run preview # serve the production build locally
npm run logos   # regenerate src/data/techLogos.js (also runs before dev/build)
```

## Project structure

```
index.html                  Vite entry (fonts, meta tags, #root)
vite.config.js              Vite + React plugin configuration
scripts/
  gen-tech-logos.mjs        Regenerates data/techLogos.js from simple-icons
public/
  Niel-Sibay-Resume.pdf     Resume served for download
  profile.jpg               Profile photo (hero, about card, navbar/footer avatar)
src/
  main.jsx                  React entry point
  App.jsx                   Page composition + delegated spotlight listener
  data/portfolio.js         ALL content (single source of truth)
  data/techAliases.js       Technology name -> logo slug + per-theme ink fixes
  data/techLogos.js         GENERATED logo paths (do not edit by hand)
  hooks/
    useTheme.js             Dark/light theme with localStorage persistence
    useActiveSection.js     Highlights the section currently in view
    useCountUp.js           Animates numbers when they scroll into view
  components/
    SmokeCursor.jsx         Canvas smoke trail
    Navbar.jsx              Sticky glass nav, progress bar, mobile drawer
    Hero.jsx                Headline, typewriter roles, stats, marquee trigger
    ProfilePhoto.jsx        Profile photo, caption, highlight stack (hero + card)
    TechLogo.jsx            Brand mark for a technology (used in every list)
    CodeCard.jsx            Tilting "code editor" card
    Marquee.jsx             Infinite tech strip
    About.jsx               Summary, objective, quick facts, interests
    Skills.jsx              Grouped skill cards with level meters
    Services.jsx            What I do (Laravel, APIs, implementation, support...)
    Experience.jsx          Work-history timeline
    Projects.jsx            Delivered systems with live links
    Education.jsx           Degree + reference card
    Contact.jsx             Contact details and mailto-powered form
    Footer.jsx / BackToTop.jsx / Reveal.jsx / SectionHeading.jsx / Icon.jsx
  styles/
    base.css                Design tokens, reset, shared surfaces, buttons, forms
    layout.css              App shell, background FX, smoke canvas, nav, hero, footer
    sections.css            Per-section layout
    media.css               Profile photo + tech logo styling (loaded last)
legacy/                     The original static HTML/CSS/JS portfolio
```

## Editing content

Everything visitor-facing lives in `src/data/portfolio.js` - profile, stats, skills
(with `core` / `strong` / `working` levels), services, experience, projects, education,
reference, marquee items and nav links. Update that file and the whole page follows.

### Adding a new technology

1. Add the name where it belongs in `src/data/portfolio.js` (a skill, a stack chip, a
   marquee entry).
2. Map that name to a logo slug in `src/data/techAliases.js`
   (`'TypeScript': 'typescript'`), or point it at one of the hand-drawn neutral
   `mark-*` slugs if it has no real brand.
3. Run `npm run logos` (it also runs automatically before `npm run dev` / `npm run build`).

The generator prints a warning for any name it cannot resolve, and writes only the
marks in use - `simple-icons` ships 3400+ logos, the site needs fewer than 30.

### The profile photo

`public/profile.jpg` is used in four places. To swap it, replace the file (keep the
same name) or change `profile.avatar` in `src/data/portfolio.js`. The photo is a
1367x2047 portrait; it is cropped square with `object-position: center 44%`, which puts
the eyes in the upper third. For a very different framing, adjust the
`object-position` in `src/styles/media.css` (`.profile-img` and `.brand-avatar img`).

## Notes

- The contact form has no backend: it composes a pre-filled `mailto:` message so nothing
  is stored or sent through a third party. Swap `handleSubmit` in `src/components/Contact.jsx`
  for your API/Formspree endpoint if you prefer.
- Experience end date is exactly what the resume states (`04/17/2026`); adjust it in
  `src/data/portfolio.js` if the resume has since been updated.
