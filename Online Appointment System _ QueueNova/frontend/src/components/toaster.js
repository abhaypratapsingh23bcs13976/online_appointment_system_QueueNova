export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if(container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 3000);
};

export const showSpinner = (elementId) => {
  const el = document.getElementById(elementId);
  if(el) {
    el.dataset.original = el.innerHTML;
    el.innerHTML = '<div class="spinner"></div>';
    el.disabled = true;
  }
};

export const hideSpinner = (elementId) => {
  const el = document.getElementById(elementId);
  if(el && el.dataset.original) {
    el.innerHTML = el.dataset.original;
    el.disabled = false;
  }
};
