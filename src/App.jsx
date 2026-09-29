import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import SmokeCursor from './components/SmokeCursor.jsx';
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
   */
  useEffect(() => {
    const onPointerMove = (event) => {
      const target = event.target.closest?.('.spotlight');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      target.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
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

      <SmokeCursor />
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
