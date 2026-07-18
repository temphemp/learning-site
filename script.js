document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  const collapseAt = 96;
  const expandAt = 32;
  let isHeroCollapsed = false;

  const setHeroState = (collapsed) => {
    isHeroCollapsed = collapsed;
    hero.classList.toggle('is-collapsed', collapsed);
    hero.setAttribute('aria-expanded', String(!collapsed));
  };

  const updateHeroOnScroll = () => {
    const scrollPosition = window.scrollY;

    /*
     * Separate thresholds prevent tiny scroll changes at the transition
     * point from immediately reversing the header state.
     */
    if (!isHeroCollapsed && scrollPosition >= collapseAt) {
      setHeroState(true);
    } else if (isHeroCollapsed && scrollPosition <= expandAt) {
      setHeroState(false);
    }
  };

  updateHeroOnScroll();
  window.addEventListener('scroll', updateHeroOnScroll, { passive: true });

  hero.addEventListener('click', () => {
    setHeroState(!isHeroCollapsed);
  });

  hero.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setHeroState(!isHeroCollapsed);
    }
  });

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
