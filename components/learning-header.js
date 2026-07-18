const HEADER_TEMPLATE = `
  <header class="hero" tabindex="0" role="button" aria-expanded="true">
    <div class="hero-bubbles" aria-hidden="true">
      <span class="bubble bubble-1"></span>
      <span class="bubble bubble-2"></span>
      <span class="bubble bubble-3"></span>
      <span class="bubble bubble-4"></span>
      <span class="bubble bubble-5"></span>
    </div>
    <h1 class="hero-title"></h1>
    <p class="hero-subtitle"></p>
  </header>
`;

/**
 * Reusable, collapsible page header.
 *
 * Usage:
 * <learning-header title="Page title" subtitle="A friendly description"></learning-header>
 */
class LearningHeader extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }

  connectedCallback() {
    if (!this.hero) {
      this.render();
    }

    if (!this.abortController) {
      this.bindInteractions();
    }

    this.updateContent();
  }

  disconnectedCallback() {
    this.abortController?.abort();
    this.abortController = null;
  }

  attributeChangedCallback() {
    this.updateContent();
  }

  render() {
    this.innerHTML = HEADER_TEMPLATE;
    this.hero = this.querySelector('.hero');
    this.titleElement = this.querySelector('.hero-title');
    this.subtitleElement = this.querySelector('.hero-subtitle');
  }

  updateContent() {
    if (!this.hero) return;

    const title = this.getAttribute('title') || 'Learning Exercises';
    const subtitle = this.getAttribute('subtitle') || 'Pick a fun activity and start learning!';

    this.titleElement.textContent = title;
    this.subtitleElement.textContent = subtitle;
    this.hero.setAttribute('aria-label', `${title} header. Select to expand or collapse.`);
  }

  bindInteractions() {
    const collapseAt = 96;
    const expandAt = 32;
    let isCollapsed = false;
    const windowRef = this.ownerDocument.defaultView;

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const setState = (collapsed) => {
      isCollapsed = collapsed;
      this.classList.toggle('is-collapsed', collapsed);
      this.hero.classList.toggle('is-collapsed', collapsed);
      this.hero.setAttribute('aria-expanded', String(!collapsed));
    };

    const updateOnScroll = () => {
      const scrollPosition = windowRef.scrollY;

      // Separate thresholds avoid flickering around the transition point.
      if (!isCollapsed && scrollPosition >= collapseAt) {
        setState(true);
      } else if (isCollapsed && scrollPosition <= expandAt) {
        setState(false);
      }
    };

    updateOnScroll();
    windowRef.addEventListener('scroll', updateOnScroll, { passive: true, signal });
    this.hero.addEventListener('click', () => setState(!isCollapsed), { signal });
    this.hero.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setState(!isCollapsed);
      }
    }, { signal });
  }
}

customElements.define('learning-header', LearningHeader);
