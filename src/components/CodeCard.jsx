import { useRef } from 'react';
import TechLogo from './TechLogo.jsx';

/** Badges under the code - the stack this kind of code actually ships with. */
const CARD_STACK = ['Laravel', 'PHP', 'React', 'Express.js', 'MySQL', 'jQuery'];

/**
 * Decorative "code editor" card that tilts slightly towards the pointer.
 */
export default function CodeCard() {
  const cardRef = useRef(null);

  const handleTilt = (event) => {
    const card = cardRef.current;
    if (!card || !window.matchMedia) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${
      -py * 9
    }deg) translateY(-4px)`;
  };

  const resetTilt = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <div
      className="code-card glass"
      ref={cardRef}
      onPointerMove={handleTilt}
      onPointerLeave={resetTilt}
    >
      <div className="code-card-bar">
        <span className="dot dot-red" />
        <span className="dot dot-amber" />
        <span className="dot dot-green" />
        <em className="mono">app/Http/Controllers/ProjectController.php</em>
      </div>

      <pre className="code-block mono">
        <code>
          <span className="c-key">public function</span> <span className="c-fn">store</span>
          {'(Request $request)\n{\n    '}
          <span className="c-var">$validated</span>
          {' = '}
          <span className="c-var">$request</span>
          {'->'}
          <span className="c-fn">validate</span>
          {'([\n        '}
          <span className="c-str">'title'</span>
          {' => '}
          <span className="c-str">'required|string|max:120'</span>
          {',\n        '}
          <span className="c-str">'stack'</span>
          {' => '}
          <span className="c-str">'required|array'</span>
          {',\n    ]);\n\n    '}
          <span className="c-key">return</span>
          {' '}
          <span className="c-var">Project</span>
          {'::'}
          <span className="c-fn">create</span>
          {'('}
          <span className="c-var">$validated</span>
          {');\n}'}
        </code>
      </pre>

      <div className="code-card-foot">
        {CARD_STACK.map((tech) => (
          <span className="badge" key={tech}>
            <TechLogo name={tech} size={13} />
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
