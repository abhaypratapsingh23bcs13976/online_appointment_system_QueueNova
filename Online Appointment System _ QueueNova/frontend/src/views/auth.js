import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderLogin = (container) => {
  // If already logged in, redirect to dashboard
  if (localStorage.getItem('token')) {
    window.location.hash = '#/dashboard';
    return;
  }
  
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-bg-image"></div>
      <div class="auth-bg-overlay"></div>
      
      <div class="auth-glass-card">
        <div class="auth-header">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
            <div style="width:40px; height:40px; background:var(--primary); border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 20px rgba(129, 140, 248, 0.4);">
               <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/></svg>
            </div>
            <span style="font-weight:800; font-size:1.5rem; color:white; letter-spacing:-1px;">QueueNova</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Access your personalized healthcare dashboard</p>
        </div>

        <button id="google-login-btn" class="btn btn-outline" style="width:100%; display:flex; gap:0.75rem; color:white; border-color:rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); margin-bottom:2rem;">
          <img src="https://www.google.com/favicon.ico" style="width:18px; height:18px;"> Continue with Google
        </button>

        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:2rem; color:rgba(255,255,255,0.25);">
          <div style="flex:1; height:1px; background:currentColor;"></div>
          <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Or login with email</span>
          <div style="flex:1; height:1px; background:currentColor;"></div>
        </div>

        <form id="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" class="input-field" required placeholder="name@company.com">
          </div>
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label for="password">Password</label>
              <a href="#" style="font-size:0.75rem; color:var(--primary); text-decoration:none;">Forgot?</a>
            </div>
            <input type="password" id="password" class="input-field" required placeholder="••••••••">
          </div>
          <button type="submit" id="login-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Sign In to Portal</button>
          <p style="text-align: center; margin-top: 2rem; font-size: 0.875rem;">
            Don't have an account? <a href="#/signup" style="color: var(--primary); font-weight: 600;">Create one now</a>
          </p>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showSpinner('login-btn');
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      // Store user data for profile display
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      showToast('Login successful!');
      window.location.hash = '#/dashboard';
    } catch(err) {
      // toast is handled in apiFetch
    } finally {
      hideSpinner('login-btn');
    }
  });

  // Google Login Handler
  document.getElementById('google-login-btn')?.addEventListener('click', async () => {
    try {
      const statusRes = await apiFetch('/auth/google/status', { silent: true });
      if (!statusRes.enabled) {
        showToast('Google OAuth is not configured. Please set up Google Cloud OAuth credentials.', 'error');
        return;
      }
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google';
    } catch(err) {
      // If endpoint doesn't exist, try direct redirect
      window.location.href = '/api/auth/google';
    }
  });
};

export const renderSignup = (container) => {
  // If already logged in, redirect to dashboard
  if (localStorage.getItem('token')) {
    window.location.hash = '#/dashboard';
    return;
  }
  
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-bg-image"></div>
      <div class="auth-bg-overlay"></div>

      <div class="auth-glass-card" style="max-width: 500px; padding: 3rem;">
        <div class="auth-header">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
            <div style="width:40px; height:40px; background:var(--primary); border-radius:10px; display:flex; align-items:center; justify-content:center;">
               <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/></svg>
            </div>
            <span style="font-weight:800; font-size:1.5rem; color:white; letter-spacing:-1px;">QueueNova</span>
          </div>
          <h1>Create Account</h1>
          <p>Join thousands of users managing health smarter</p>
        </div>

        <form id="signup-form">
          <div class="form-group">
            <label for="name">Full Professional Name</label>
            <input type="text" id="name" class="input-field" required placeholder="Dr. John Doe">
          </div>
          <div class="form-group">
            <label for="email">Work Email</label>
            <input type="email" id="email" class="input-field" required placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="input-field" required placeholder="At least 8 characters">
          </div>
          
          <div style="display:flex; gap:0.75rem; margin: 1.5rem 0; align-items:flex-start;">
             <input type="checkbox" required id="terms" style="margin-top:4px;">
             <label for="terms" style="font-size:0.75rem; color:rgba(255,255,255,0.5); font-weight:400;">By signing up, you agree to the <a href="#" style="color:white; text-decoration:underline;">Terms of Service</a> and <a href="#" style="color:white; text-decoration:underline;">Privacy Policy</a>.</label>
          </div>

          <button type="submit" id="signup-btn" class="btn btn-primary" style="width: 100%;">Create Your Account</button>
          <p style="text-align: center; margin-top: 2rem; font-size: 0.875rem;">
            Already have an account? <a href="#/login" style="color: var(--primary); font-weight: 600;">Sign in here</a>
          </p>
        </form>
      </div>
    </div>
  `;

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showSpinner('signup-btn');
    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      // Auto-login after signup
      const loginRes = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (loginRes.user) {
        localStorage.setItem('user', JSON.stringify(loginRes.user));
      }
      if (loginRes.token) {
        localStorage.setItem('token', loginRes.token);
      }
      
      showToast('Account created and logged in!');
      window.location.hash = '#/dashboard';
    } catch(err) {
      // toast is handled
    } finally {
      hideSpinner('signup-btn');
    }
  });
};
