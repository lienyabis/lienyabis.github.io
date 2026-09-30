import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Galaxy from './components/Galaxy.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Services from './components/Services.jsx';
import Experience from './components/Experience.jsx';
import Projects from './components/Projects.jsx';
import Education from './components/Education.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import useTheme from './hooks/useTheme.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  /**
   * One delegated pointer listener drives the "spotlight" highlight on every
   * card that opts in with the .spotlight class.
   *
   * Two things made this hot before. `event.target.closest('.spotlight')` walks
   * the ancestor chain, and `getBoundingClientRect()` forces a layout - both on
   * *every* pointermove, which fires far more often than the screen refreshes.
   * Now the lookup is keyed on the last target (so crossing a child element
   * re-resolves, but moving within one element is free), the rect is cached, and
   * the two custom-property writes are coalesced into one per frame.
   */
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return undefined;

    let lastTarget = null;
    let current = null;
    let currentRect = null;
    let latest = null;
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (!current || !currentRect || !latest) return;
      current.style.setProperty('--mx', `${latest.clientX - currentRect.left}px`);
      current.style.setProperty('--my', `${latest.clientY - currentRect.top}px`);
    };

    const onPointerMove = (event) => {
      const target = event.target;
      if (target !== lastTarget) {
        lastTarget = target;
        current = target?.closest?.('.spotlight') ?? null;
        currentRect = current ? current.getBoundingClientRect() : null;
      }

      if (!current) return;
      latest = { clientX: event.clientX, clientY: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="app">
      <div className="background-fx" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="grid-overlay" />
        <span className="noise" />
      </div>

      {/*
        The galaxy (React Bits, WebGL via ogl) replaces the old particle canvas.
        lightMode flips the shader to dark ink on white so it reads on the light
        theme; in dark mode it renders additive-looking stars with their own
        alpha over the CSS backdrop.
      */}
      <Galaxy
        density={1.1}
        glowIntensity={0.32}
        saturation={0.15}
        twinkleIntensity={0.35}
        hueShift={220}
        lightMode={theme === 'light'}
      />
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="app-main">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
