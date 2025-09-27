import { useEffect, useRef } from 'react';

export function StickyFloatingButtons() {
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple mounts
    if (mountedRef.current) return;
    mountedRef.current = true;

    console.log('🟢 FLOATING BUTTONS: Starting initialization');
    
    let scrollBtn: HTMLDivElement | null = null;
    let backBtn: HTMLDivElement | null = null;
    let scrollHandler: ((e: Event) => void) | null = null;

    function createButtons() {
      console.log('🟢 FLOATING BUTTONS: Creating buttons');
      
      // Remove any existing buttons first
      const existing = document.querySelectorAll('[data-floating-btn]');
      existing.forEach(btn => btn.remove());

      // Create scroll to top button
      scrollBtn = document.createElement('div');
      scrollBtn.setAttribute('data-floating-btn', 'scroll');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = `
        position: fixed !important;
        right: 20px !important;
        bottom: 80px !important;
        width: 56px !important;
        height: 56px !important;
        background: #2563eb !important;
        color: white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 999999 !important;
        font-size: 24px !important;
        font-weight: bold !important;
        user-select: none !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
        border: 3px solid white !important;
        opacity: 1 !important;
      `;
      
      scrollBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🟢 SCROLL BUTTON CLICKED');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      // Create go back button  
      backBtn = document.createElement('div');
      backBtn.setAttribute('data-floating-btn', 'back');
      backBtn.innerHTML = '←';
      backBtn.style.cssText = `
        position: fixed !important;
        left: 20px !important;
        bottom: 80px !important;
        width: 56px !important;
        height: 56px !important;
        background: #16a34a !important;
        color: white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 999999 !important;
        font-size: 24px !important;
        font-weight: bold !important;
        user-select: none !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
        border: 3px solid white !important;
        opacity: 1 !important;
      `;
      
      backBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🟢 BACK BUTTON CLICKED');
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      };

      // Add to DOM
      document.body.appendChild(scrollBtn);
      document.body.appendChild(backBtn);
      
      console.log('🟢 FLOATING BUTTONS: Added to DOM - should be visible now!');

      // Scroll handler for visibility
      scrollHandler = () => {
        const show = window.scrollY > 200;
        if (scrollBtn) scrollBtn.style.opacity = show ? '1' : '0.7';
        if (backBtn) backBtn.style.opacity = show ? '1' : '0.7';
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Create buttons immediately 
    createButtons();

    // NO CLEANUP - Let buttons persist
    return undefined;
  }, []);

  return null;
}