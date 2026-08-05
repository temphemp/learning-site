document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.exercise-card');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Entrance animation – stagger cards on load (skipped when reduced motion is on) */
  if (!prefersReducedMotion) {
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /* Subtle wobble reset on hover — fine-pointer devices only */
  if (canHover) {
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = '';
      });
    });
  }
});
