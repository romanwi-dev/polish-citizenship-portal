// Critical CSS extraction for above-the-fold content
export const criticalCSS = `
  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  * {
    margin: 0;
    padding: 0;
  }
  
  html {
    -webkit-text-size-adjust: 100%;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    tab-size: 4;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: inherit;
    line-height: inherit;
    margin: 0;
    background: white;
    color: #111827;
  }
  
  /* Critical layout styles */
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    padding-right: 1rem;
    padding-left: 1rem;
  }
  
  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
    }
  }
  
  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
  
  /* Hero section critical styles */
  .hero-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  }
  
  .hero-content {
    text-align: center;
    padding: 2rem;
    color: white;
  }
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  @media (min-width: 768px) {
    .hero-title {
      font-size: 3.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .hero-title {
      font-size: 4rem;
    }
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }
  
  /* Button critical styles */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: all 0.2s;
    cursor: pointer;
    text-decoration: none;
  }
  
  .btn-primary {
    background: white;
    color: #1e40af;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  /* Loading state */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Font loading optimization */
  .font-loading body {
    opacity: 0;
  }
  
  .font-loaded body {
    opacity: 1;
    transition: opacity 0.3s;
  }
`;

// Inject critical CSS into head
export function injectCriticalCSS() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// Remove critical CSS after main CSS loads
export function removeCriticalCSS() {
  if (typeof document !== 'undefined') {
    const criticalStyle = document.querySelector('style[data-critical]');
    if (criticalStyle) {
      // Delay removal to ensure smooth transition
      setTimeout(() => {
        criticalStyle.remove();
      }, 100);
    }
  }
}