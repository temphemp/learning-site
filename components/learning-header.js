const HEADER_TEMPLATE = `
  <header class="hero" aria-expanded="true">
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
 *
 * To render the compact, non-interactive variant, use:
 *
 * <learning-header title="..." subtitle="..." collapse-mode="collapsed-only"></learning-header>
 *
 * The older `permanently-collapsed` boolean attribute is still accepted as an
 * alias for backward compatibility.
 */
class LearningHeader extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'collapse-mode', 'permanently-collapsed'];
  }

  connectedCallback() {
    if (!this.hero) {
      this.render();
    }

    this.syncComponent();
  }

  disconnectedCallback() {
    this.unbindInteractions();
  }

  attributeChangedCallback() {
    if (!this.hero) return;
    this.syncComponent();
  }

  render() {
    this.innerHTML = HEADER_TEMPLATE;
    this.hero = this.querySelector('.hero');
    this.titleElement = this.querySelector('.hero-title');
    this.subtitleElement = this.querySelector('.hero-subtitle');
    this.isCollapsed = false;
    this.isTransitionLocked = false;
    this.pendingAutoSync = false;
    this.transitionFallbackTimeout = null;
  }

  get collapseMode() {
    const explicitMode = this.getAttribute('collapse-mode');
    if (explicitMode === 'collapsed-only' || explicitMode === 'collapsible') {
      return explicitMode;
    }

    if (this.hasAttribute('permanently-collapsed')) {
      return 'collapsed-only';
    }

    return 'collapsible';
  }

  get isCollapsedOnly() {
    return this.collapseMode === 'collapsed-only';
  }

  syncComponent() {
    this.updateContent();
    this.updateMode();
  }

  updateContent() {
    if (!this.hero) return;

    const title = this.getAttribute('title') || 'Learning Exercises';
    const subtitle = this.getAttribute('subtitle') || 'Pick a fun activity and start learning!';

    this.titleElement.textContent = title;
    this.subtitleElement.textContent = subtitle;
    this.updateAccessibility(title);
  }

  updateAccessibility(title) {
    if (this.isCollapsedOnly) {
      this.hero.removeAttribute('aria-label');
      this.hero.removeAttribute('role');
      this.hero.removeAttribute('tabindex');
    } else {
      this.hero.setAttribute('aria-label', `${title} header. Select to expand or collapse.`);
      this.hero.setAttribute('role', 'button');
      this.hero.setAttribute('tabindex', '0');
    }

    this.hero.setAttribute('aria-expanded', String(!this.isCollapsed));
  }

  updateMode() {
    if (!this.hero) return;

    const mode = this.collapseMode;
    this.dataset.collapseMode = mode;
    this.classList.toggle('is-collapsed-only', mode === 'collapsed-only');
    this.classList.toggle('is-collapsible', mode === 'collapsible');

    if (this.isCollapsedOnly) {
      this.unbindInteractions();
      this.setCollapsed(true);
    } else {
      this.bindInteractions();
      this.syncCollapsedFromScroll();
    }

    this.updateAccessibility(this.titleElement.textContent || 'Learning Exercises');
  }

  setCollapsed(collapsed) {
    this.isCollapsed = collapsed;
    this.classList.toggle('is-collapsed', collapsed);
    this.hero.classList.toggle('is-collapsed', collapsed);
    this.hero.setAttribute('aria-expanded', String(!collapsed));
  }

  requestCollapsedState(collapsed, source = 'auto') {
    if (collapsed === this.isCollapsed) return;

    if (this.isTransitionLocked) {
      if (source === 'auto') {
        this.pendingAutoSync = true;
      }
      return;
    }

    this.setCollapsed(collapsed);
    this.startTransitionLock();
  }

  startTransitionLock() {
    this.isTransitionLocked = true;
    this.pendingAutoSync = false;
    clearTimeout(this.transitionFallbackTimeout);

    // Keep scroll-driven updates from oscillating while the hero is animating.
    this.transitionFallbackTimeout = setTimeout(() => {
      this.finishTransitionLock();
    }, 500);
  }

  finishTransitionLock() {
    this.isTransitionLocked = false;
    clearTimeout(this.transitionFallbackTimeout);
    this.transitionFallbackTimeout = null;

    if (this.pendingAutoSync) {
      this.pendingAutoSync = false;
      this.syncCollapsedFromScroll();
    }
  }

  syncCollapsedFromScroll() {
    if (this.isCollapsedOnly) return;

    const collapseAt = 96;
    const expandAt = 32;
    const scrollPosition = this.ownerDocument.defaultView.scrollY;

    // Separate thresholds avoid flickering around the transition point.
    if (!this.isCollapsed && scrollPosition >= collapseAt) {
      this.requestCollapsedState(true, 'auto');
    } else if (this.isCollapsed && scrollPosition <= expandAt) {
      this.requestCollapsedState(false, 'auto');
    }
  }

  bindInteractions() {
    if (this.abortController || this.isCollapsedOnly) return;

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.ownerDocument.defaultView.addEventListener('scroll', () => {
      this.syncCollapsedFromScroll();
    }, { passive: true, signal });

    this.hero.addEventListener('click', () => {
      this.requestCollapsedState(!this.isCollapsed, 'manual');
    }, { signal });

    this.hero.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.requestCollapsedState(!this.isCollapsed, 'manual');
      }
    }, { signal });

    this.hero.addEventListener('transitionend', (event) => {
      if (event.target !== this.hero || event.propertyName !== 'padding') return;
      this.finishTransitionLock();
    }, { signal });
  }

  unbindInteractions() {
    this.abortController?.abort();
    this.abortController = null;
    this.isTransitionLocked = false;
    this.pendingAutoSync = false;
    clearTimeout(this.transitionFallbackTimeout);
    this.transitionFallbackTimeout = null;
  }
}

customElements.define('learning-header', LearningHeader);
