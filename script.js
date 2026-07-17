document.addEventListener('DOMContentLoaded', () => {
  /* Entrance animation – stagger cards on load */
  const cards = document.querySelectorAll('.exercise-card');
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

  /* Add a subtle wobble on hover for extra fun */
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = '';
    });
  });
});
