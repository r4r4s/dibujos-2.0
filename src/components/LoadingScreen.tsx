import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const LOGO_SRC = '/logo.webp';
// Tiempo mínimo de pintado, aunque la página cargue al instante.
const MIN_DURATION_MS = 2200;

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const grayRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const gray = grayRef.current;
    const text = textRef.current;
    if (!overlay || !logo || !gray || !text) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // --- Progreso REAL de carga de la página (0..1) ---
    // Se alimenta de hitos reales del navegador; el barrido lo sigue.
    let realFraction = 0.05;
    const bump = (v: number) => {
      realFraction = Math.max(realFraction, v);
    };

    // DOM listo (la hidratación ya ocurre tras DOMContentLoaded).
    if (document.readyState !== 'loading') bump(0.35);
    else
      document.addEventListener('DOMContentLoaded', () => bump(0.35), {
        once: true,
      });

    // Fuentes listas.
    if (document.fonts) {
      if (document.fonts.status === 'loaded') bump(0.65);
      else void document.fonts.ready.then(() => bump(0.65));
    }

    // Todos los recursos (imágenes incluidas) cargados.
    if (document.readyState === 'complete') bump(1);
    else window.addEventListener('load', () => bump(1), { once: true });

    // --- Salida: zoom "entrar dentro" del logo + fundido ---
    let finished = false;
    const runExit = () => {
      if (finished) return;
      finished = true;
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
        // El logo hace el zoom completo (1,1 s).
        .to(logo, { scale: 22, duration: 1.1, ease: 'power3.in' }, 0)
        // El "Cargando" hace el mismo zoom, pero se desvanece a mitad de la
        // animación (queda invisible hacia los ~0,5 s).
        .to(text, { scale: 22, duration: 1.1, ease: 'power3.in' }, 0)
        .to(text, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to(overlay, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 0.55);
    };

    const applyClip = (p: number) => {
      gray.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
    };
    applyClip(0);

    // Movimiento reducido: sin barrido; revela y sale al cargar.
    if (reduce) {
      applyClip(1);
      if (document.readyState === 'complete') runExit();
      else window.addEventListener('load', runExit, { once: true });
      return () => {
        finished = true;
      };
    }

    // --- Bucle de pintado ---
    // mostrado = min(cargaReal suavizada, tiempo/mínimo): sigue la carga real
    // pero nunca termina antes del tiempo mínimo. Solo se suaviza la fracción
    // de carga (que llega a saltos); el tope de tiempo ya es continuo, así el
    // suelo es exactamente MIN_DURATION_MS.
    const start = performance.now();
    let smoothReal = realFraction;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;

      smoothReal += (realFraction - smoothReal) * 0.12;
      if (realFraction - smoothReal < 0.001) smoothReal = realFraction;

      const timeCap = Math.min(elapsed / MIN_DURATION_MS, 1);
      const displayed = Math.min(smoothReal, timeCap);
      applyClip(displayed);

      const ready = realFraction >= 1 && elapsed >= MIN_DURATION_MS;
      if (ready && displayed > 0.999) {
        applyClip(1);
        runExit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      finished = true;
      cancelAnimationFrame(raf);
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
      <div className="loader-inner">
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
        <p ref={textRef} className="loader-text">
          Cargando<span className="loader-dots" aria-hidden="true"></span>
        </p>
      </div>
    </div>
  );
}
