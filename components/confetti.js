/**
 * Confetti — shared celebratory burst effect.
 *
 * See style-guide.md §8.5 for full documentation.
 *
 * A small, dependency-free component used by every exercise page that wants
 * a confetti celebration. Currently used by:
 *   - Common Words (common-words.js) — score dialog, top score band
 *   - Fill-in-the-Blanks (components/fill-in-the-blanks/fitb.js) — round
 *     complete with a clean streak
 *
 * All styling is applied inline by this module, so no matching CSS file is
 * required — just load the script and call Confetti.launch(). This is
 * intentional: it keeps the component copy/paste-able into a different
 * project (or split into its own package later) without dragging along a
 * stylesheet dependency.
 *
 * Usage:
 *   <script src="components/confetti.js" defer></script>
 *   ...
 *   Confetti.launch(containerEl);                    // burst, default look
 *   Confetti.launch(containerEl, { originY: 0.5 });   // tweak where it starts
 *   Confetti.stop();                                  // cancel early (e.g. navigating away)
 *
 * `containerEl` becomes the positioning context for the canvas: if it's
 * currently `position: static` it's switched to `relative` so the canvas
 * (which is absolutely positioned) lines up correctly. Pass any element with
 * a defined size — a game wrapper, a <dialog>, a card.
 *
 * Only one burst can be active at a time; calling launch() while a burst is
 * already running stops the previous one first.
 */
const Confetti = (() => {
  const DEFAULTS = {
    /** @type {string[]} */
    colors: ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00CEC9', '#E17055', '#74B9FF'],
    /** How long the burst takes to fall and fade, in ms. */
    durationMs: 3000,
    /** How many pieces of confetti. */
    particleCount: 120,
    /** Fraction down the container's height the burst originates from. */
    originY: 0.72,
    /** CSS `inset` for the canvas — negative values let the burst bleed past the container's own edges. */
    inset: '-15% -10%',
    /** Stack order of the canvas relative to the container's other children. */
    zIndex: 2,
  };

  /** @type {HTMLCanvasElement | null} */
  let canvas = null;

  /** @type {number | null} */
  let animationId = null;

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    canvas?.remove();
    canvas = null;
  }

  /**
   * @param {HTMLElement} container
   * @param {Partial<typeof DEFAULTS>} [options]
   */
  function launch(container, options = {}) {
    stop();

    if (!(container instanceof HTMLElement)) {
      return;
    }

    const { colors, durationMs, particleCount, originY, inset, zIndex } = {
      ...DEFAULTS,
      ...options,
    };

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    const el = document.createElement('canvas');
    el.className = 'confetti-canvas';
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, {
      position: 'absolute',
      inset,
      zIndex: String(zIndex),
      pointerEvents: 'none',
    });

    container.prepend(el);
    canvas = el;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      el.width = Math.max(1, Math.floor(rect.width * dpr));
      el.height = Math.max(1, Math.floor(rect.height * dpr));
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      const ctx = el.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();

    const ctx = el.getContext('2d');
    if (!ctx) {
      stop();
      return;
    }

    const width = () => el.clientWidth;
    const height = () => el.clientHeight;
    const originX = width() / 2;
    const startY = height() * originY;
    const startTime = performance.now();

    /** @type {Array<{ x: number, y: number, vx: number, vy: number, size: number, color: string, rotation: number, spin: number }>} */
    const particles = Array.from({ length: particleCount }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 6 + Math.random() * 10;
      return {
        x: originX + (Math.random() - 0.5) * 40,
        y: startY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
      };
    });

    const gravity = 0.22;
    const drag = 0.992;

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const alpha = 1 - progress;

      ctx.clearRect(0, 0, width(), height());
      ctx.globalAlpha = alpha;

      for (const particle of particles) {
        particle.vx *= drag;
        particle.vy = particle.vy * drag + gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.spin;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      if (progress < 1 && canvas === el) {
        animationId = requestAnimationFrame(frame);
        return;
      }

      stop();
    };

    animationId = requestAnimationFrame(frame);
  }

  return { launch, stop };
})();
