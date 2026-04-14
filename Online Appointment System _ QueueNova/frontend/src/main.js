import './style.css';
import { renderLogin, renderSignup } from './views/auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderBooking } from './views/booking.js';
import { renderMedicines } from './views/medicines.js';
import { renderLabTests } from './views/labTests.js';
import { renderAppointments } from './views/appointments.js';
import { renderAdmin } from './views/admin.js';
import { renderSettings } from './views/settings.js';
import { renderCommunity } from './views/community.js';
import { renderHome } from './views/home.js';
import { renderPrescriptions } from './views/prescriptions.js';
import { renderHealthRecords } from './views/healthRecords.js';
import { renderAnalytics } from './views/analytics.js';
import { renderHospitals } from './views/hospitals.js';
import { renderSymptomChecker } from './views/symptomChecker.js';
import { renderNotifications } from './views/notifications.js';
import { apiFetch, wsManager } from './api.js';
import { showToast } from './components/toaster.js';

// Make showToast globally available
window.showToast = showToast;

// Setup routing
const routes = {
  '#/home': renderHome,
  '#/about': async (container) => {
    await renderHome(container);
    setTimeout(() => {
      document.getElementById('about-nova')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  },
  '#/login': renderLogin,
  '#/signup': renderSignup,
  '#/dashboard': renderDashboard,
  '#/book': renderBooking,
  '#/medicines': renderMedicines,
  '#/lab-tests': renderLabTests,
  '#/admin': renderAdmin,
  '#/settings': renderSettings,
  '#/community': renderCommunity,
  '#/prescriptions': renderPrescriptions,
  '#/appointments': renderAppointments,
  '#/health-records': renderHealthRecords,
  '#/analytics': renderAnalytics,
  '#/hospitals': renderHospitals,
  '#/symptom-checker': renderSymptomChecker,
  '#/notifications': renderNotifications,
};

const router = async () => {
  const fullHash = window.location.hash || '#/home';
  const hash = fullHash.split('?')[0]; // Strip query params
  const appContainer = document.getElementById('app');
  const nav = document.getElementById('main-nav');
  
  // Smooth page transition - fade out first
  const currentContent = appContainer.innerHTML;
  if (currentContent && !currentContent.includes('spinner')) {
    appContainer.style.animation = 'pageOut 0.2s ease forwards';
    await new Promise(r => setTimeout(r, 200));
  }
  
  appContainer.innerHTML = '<div class="spinner" style="margin: 4rem auto; width: 40px; height: 40px;"></div>';
  appContainer.style.animation = 'pageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';

  // Toggle Navbar
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const pubLinks = document.getElementById('public-links');
  const authLinks = document.getElementById('auth-links');
  const userMenu = document.getElementById('user-menu');
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const themeToggle = document.getElementById('theme-toggle');

  if (hash === '#/login' || hash === '#/signup') {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
    if (token) {
      if(pubLinks) pubLinks.style.display = 'none';
      if(authLinks) authLinks.style.display = 'flex';
      if(userMenu) userMenu.style.display = 'block';
      
      // Update user profile info
      const userAvatar = document.getElementById('user-avatar');
      const userName = document.getElementById('user-name');
      const dropdownUserName = document.getElementById('dropdown-user-name');
      const dropdownUserEmail = document.getElementById('dropdown-user-email');
      if (userAvatar && userData.name) {
        userAvatar.textContent = userData.name.charAt(0).toUpperCase();
      }
      if (userName && userData.name) {
        userName.textContent = userData.name.split(' ')[0];
      }
      if (dropdownUserName && userData.name) {
        dropdownUserName.textContent = userData.name;
      }
      if (dropdownUserEmail && userData.email) {
        dropdownUserEmail.textContent = userData.email;
      }
      
      // Profile dropdown toggle
      if (profileBtn && profileDropdown) {
        profileBtn.onclick = (e) => {
          e.stopPropagation();
          profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
        };
        profileDropdown.onclick = (e) => {
          e.stopPropagation();
        };
      }
      
      // Close dropdown when clicking outside
      document.onclick = () => {
        if (profileDropdown) profileDropdown.style.display = 'none';
      };
      
      // Update notification badge
      updateNotifBadge();
    } else {
      if(pubLinks) pubLinks.style.display = 'flex';
      if(authLinks) authLinks.style.display = 'none';
      if(userMenu) userMenu.style.display = 'none';
    }
  }

  // Update active state in nav
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.remove('active');
    const elHash = el.getAttribute('href')?.split('?')[0];
    if (elHash === hash) el.classList.add('active');
  });

  const routeComponent = routes[hash];
  if (routeComponent) {
    await routeComponent(appContainer);
  } else {
    await renderHome(appContainer);
  }
};

// Notification badge updater
async function updateNotifBadge() {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const notifs = await apiFetch('/notifications');
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch(e) { /* silent fail */ }
}

// Initialize WebSocket when logged in
function initWebSocket() {
  const token = localStorage.getItem('token');
  if (token) {
    wsManager.connect();
    wsManager.on('notification', (payload) => {
      showToast(payload.title || 'New notification', 'success');
      updateNotifBadge();
    });
    wsManager.on('appointment_update', (payload) => {
      showToast('Appointment updated: ' + payload.status, 'success');
    });
  }
}

// Global Listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  router();
  initWebSocket();
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navContainer = document.getElementById('main-nav');
    if (window.scrollY > 20) {
      navContainer?.classList.add('scrolled');
    } else {
      navContainer?.classList.remove('scrolled');
    }
  });
});

// Logout Listener
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch(err) {}
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.hash = '#/home';
  // Reload to reset the UI
  setTimeout(() => window.location.reload(), 100);
});

// Theme Setup
const setTheme = (isDark) => {
  const themeIcon = document.getElementById('theme-icon');
  if(isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if(themeIcon) themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if(themeIcon) themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>';
    localStorage.setItem('theme', 'light');
  }
};

const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});
// Init Theme
if(localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')) {
  setTheme(true);
}
