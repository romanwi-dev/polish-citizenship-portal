// Immediate theme switcher - loads instantly
document.addEventListener('DOMContentLoaded', function() {
  
  // Create theme switcher button
  const themeBtn = document.createElement('button');
  themeBtn.innerHTML = '🌙';
  themeBtn.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    width: 60px !important;
    height: 60px !important;
    border-radius: 50% !important;
    border: 3px solid #333 !important;
    background: white !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 24px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
    transition: all 0.3s ease !important;
  `;
  
  themeBtn.onclick = function() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      html.classList.remove('dark');
      themeBtn.innerHTML = '🌙';
      themeBtn.style.background = 'white';
      themeBtn.style.color = 'black';
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      themeBtn.innerHTML = '☀️';
      themeBtn.style.background = '#333';
      themeBtn.style.color = 'white';
      localStorage.setItem('theme', 'dark');
    }
  };
  
  // Add hover effects
  themeBtn.onmouseenter = function() {
    themeBtn.style.transform = 'scale(1.1)';
  };
  
  themeBtn.onmouseleave = function() {
    themeBtn.style.transform = 'scale(1)';
  };
  
  // Add to page
  document.body.appendChild(themeBtn);
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    themeBtn.innerHTML = '☀️';
    themeBtn.style.background = '#333';
    themeBtn.style.color = 'white';
  }
});