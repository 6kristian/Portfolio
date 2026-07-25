/**
 * Native, Zero-Dependency Cookie Consent
 * Uses localStorage to persist user choice natively without heavy third-party parsing.
 */
class CookieConsent {
  constructor() {
    this.storageKey = 'kf_cookie_consent';
    this.init();
  }

  init() {
    if (localStorage.getItem(this.storageKey)) return;
    this.renderBanner();
  }

  renderBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    // Style injected directly for zero-dependency encapsulation
    banner.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; 
      background: #161b22; color: #c9d1d9; padding: 1rem; 
      display: flex; justify-content: space-between; align-items: center;
      z-index: 9999; border-top: 1px solid #30363d;
    `;
    
    banner.innerHTML = `
      <p style="margin:0; font-size: 0.9rem;">This site uses minimal cookies to enhance performance.</p>
      <button id="accept-cookies" style="background:#6CB6FF; color:#000; border:none; padding:0.5rem 1rem; border-radius:4px; cursor:pointer; font-weight:600;">Got it!</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('accept-cookies').addEventListener('click', () => {
      localStorage.setItem(this.storageKey, 'true');
      banner.remove();
    }, { once: true });
  }
}

/**
 * Robust Form Handler
 * Prevents double-submissions, sanitizes inputs, and handles UI loading states.
 */
const initContactForm = () => {
  const form = document.querySelector('form[action^="https://formspree.io"]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const btn = form.querySelector('button[type="submit"]');
    const emailInput = form.querySelector('input[type="email"]');
    
    // Basic Client-Side Sanitation
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailValue)) {
      e.preventDefault();
      alert('Please enter a valid email address.');
      return;
    }

    // Prevent multi-click spam
    btn.disabled = true;
    btn.textContent = 'Sending...';
    btn.style.opacity = '0.7';
    
    // Formspree will handle the redirect, but the UI is now locked against spam
  });
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  new CookieConsent();
  initContactForm();
});
