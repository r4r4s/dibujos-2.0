import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const LOGO_SRC = '/logo.webp';
const MIN_DURATION = 2.2; // segundos mínimos para que el barrido se aprecie

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const grayRef = useRef<HTMLImageElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const gray = grayRef.current;
    if (!overlay || !logo || !gray) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let killed = false;

    // Espera a que la página termine de cargar (recursos incluidos).
    const waitLoad = () =>
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') return resolve();
        window.addEventListener('load', () => resolve(), { once: true });
      });

    // Transición de salida: zoom "entrar dentro" del logo + fundido.
    const runExit = () => {
      if (killed) return;
      if (reduce) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.5,
          onComplete: () => setDone(true),
        });
        return;
      }
      gsap
        .timeline({ onComplete: () => setDone(true) })
        .to(logo, { scale: 22, duration: 1.1, ease: 'power3.in' })
        .to(overlay, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '-=0.55');
    };

    // Barrido del color: la capa gris se recorta de izquierda a derecha.
    const state = { p: 0 };
    const applyClip = () => {
      gray.style.clipPath = `inset(0 0 0 ${state.p * 100}%)`;
    };
    applyClip();

    if (reduce) {
      state.p = 1;
      applyClip();
      waitLoad().then(runExit);
      return () => {
        killed = true;
      };
    }

    const fill = gsap.to(state, {
      p: 1,
      duration: MIN_DURATION,
      ease: 'power1.inOut',
      onUpdate: applyClip,
      onComplete: () => {
        // Solo salimos cuando el barrido acabó Y la página está lista.
        waitLoad().then(runExit);
      },
    });

    return () => {
      killed = true;
      fill.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="loader-overlay"
      role="status"
      aria-label="Cargando"
    >
      <div ref={logoRef} className="loader-logo">
        <img src={LOGO_SRC} alt="Nibiru Paint" className="loader-logo-img" />
        <img
          ref={grayRef}
          src={LOGO_SRC}
          alt=""
          aria-hidden="true"
          className="loader-logo-img loader-logo-gray"
        />
      </div>
    </div>
  );
}
