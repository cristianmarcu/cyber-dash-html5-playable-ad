import { useEffect, useRef } from 'react';
import { CyberDashGame } from './game/CyberDashGame';

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const game = new CyberDashGame(host);
    let disposed = false;

    game.init().then(() => {
      // React strict mode can unmount before Pixi finishes async init
      if (disposed) {
        game.destroy();
      }
    });

    return () => {
      disposed = true;
      game.destroy();
    };
  }, []);

  return (
    <main className="ad-shell" aria-label="Cyber Dash playable ad">
      <div ref={hostRef} className="game-host" />
    </main>
  );
}
