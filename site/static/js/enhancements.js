/* Mallea v005: restrained motion, independent of the synchronized players. */
(function () {
  'use strict';

  function initMalleaEnhancements() {
    if (window.malleaEnhancements) return window.malleaEnhancements;
    if (!document.body) return null;

    const header = document.querySelector('.site-header');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = new Set();
    const pending = new Set();
    const selector = '.hero-copy, .hero-figure, .section-heading, #introduction, .feature-heading, .feature-media-grid, .feature-copy-grid, #gallery > .demo-card';
    let scrollFrame = 0;
    let destroyed = false;

    const progress = header ? document.createElement('span') : null;
    if (progress) {
      progress.className = 'scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      header.append(progress);
    }

    function show(target) {
      target.classList.add('is-visible');
      pending.delete(target);
      if (observer) observer.unobserve(target);
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) show(entry.target);
      }
    }, { threshold: 0.02, rootMargin: '0px 0px -24px 0px' }) : null;

    function isVisibleInViewport(target) {
      if (target.closest('[hidden]')) return false;
      const rect = target.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    }

    function registerTargets(root = document) {
      const candidates = Array.from(root.querySelectorAll(selector));
      if (root instanceof Element && root.matches(selector)) candidates.unshift(root);
      for (const target of candidates) {
        if (targets.has(target)) continue;
        targets.add(target);
        target.classList.add('reveal');
        if (motionPreference.matches || !observer || isVisibleInViewport(target)) {
          show(target);
        } else {
          pending.add(target);
          observer.observe(target);
        }
      }
    }

    function updateHeader() {
      scrollFrame = 0;
      if (!header || destroyed) return;
      const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop);
      const scrollable = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
      const value = scrollable ? Math.min(1, scrollTop / scrollable) : 0;
      header.classList.toggle('is-scrolled', scrollTop > 16);
      const activeSection = Array.from(document.querySelectorAll('#overview, #capabilities, #worlds')).reverse().find(section => section.getBoundingClientRect().top <= header.offsetHeight + 48);
      document.querySelectorAll('.nav-link').forEach(link => {
        const active = !!activeSection && link.hash === `#${activeSection.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      progress.style.transform = `scaleX(${value.toFixed(4)})`;
    }

    function scheduleHeader() {
      if (!scrollFrame && !destroyed) scrollFrame = requestAnimationFrame(updateHeader);
    }

    function refresh() {
      if (destroyed) return;
      registerTargets();
      // Apply enhancement-only CSS after visible content and observers are ready.
      document.body.classList.toggle('motion-ready', !!observer && !motionPreference.matches);
      scheduleHeader();
    }

    function onMotionPreference() {
      if (motionPreference.matches) {
        document.body.classList.remove('motion-ready');
        for (const target of Array.from(pending)) show(target);
      } else {
        document.body.classList.toggle('motion-ready', !!observer);
      }
    }

    function onFocus(event) {
      if (!(event.target instanceof Element)) return;
      // Keyboard navigation reveals an item before its controls receive focus.
      let target = event.target.closest('.reveal');
      while (target) {
        show(target);
        target = target.parentElement && target.parentElement.closest('.reveal');
      }
    }

    function onPageShow() {
      for (const target of Array.from(pending)) if (isVisibleInViewport(target)) show(target);
      scheduleHeader();
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(scrollFrame);
      if (observer) observer.disconnect();
      targets.forEach(target => target.classList.remove('reveal', 'is-visible'));
      document.body.classList.remove('motion-ready');
      if (header) header.classList.remove('is-scrolled');
      if (progress) progress.remove();
      window.removeEventListener('scroll', scheduleHeader);
      window.removeEventListener('resize', scheduleHeader);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('mallea:ready', refresh);
      document.removeEventListener('focusin', onFocus);
      motionPreference.removeEventListener('change', onMotionPreference);
      delete window.malleaEnhancements;
    }

    window.addEventListener('scroll', scheduleHeader, { passive: true });
    window.addEventListener('resize', scheduleHeader, { passive: true });
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('mallea:ready', refresh);
    document.addEventListener('focusin', onFocus);
    motionPreference.addEventListener('change', onMotionPreference);

    window.malleaEnhancements = { refresh, destroy };
    refresh();
    return window.malleaEnhancements;
  }

  window.initMalleaEnhancements = initMalleaEnhancements;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMalleaEnhancements, { once: true });
  } else {
    initMalleaEnhancements();
  }
}());
