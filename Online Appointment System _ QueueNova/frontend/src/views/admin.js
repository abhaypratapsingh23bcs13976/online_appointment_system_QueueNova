import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderAdmin = async (container) => {
  container.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--primary);">System Overview</h1>
      <p>Administrator Global Dashboard</p>
    </div>
    
    <div class="stats-grid" id="admin-stats-container">
      <!-- Injected -->
    </div>

    <div class="dashboard-grid">
      <div class="main-column" style="grid-column: 1 / -1; margin-top: 1rem;">
        <h2 style="margin-bottom: 1rem;">System Analytics (Volume Breakdown)</h2>
        <div class="card" style="margin-bottom: 1rem; padding: 2rem;">
            <div id="admin-chart-container" style="display:flex; flex-direction:column; gap: 1rem; border-left: 2px solid var(--border); padding-left: 1rem;">
                <div class="spinner" style="margin: auto;"></div>
            </div>
        </div>
      </div>
      <div class="main-column" style="grid-column: 1 / -1;">
        <h2 style="margin-bottom: 1rem;">Global Appointments Log</h2>
        <div id="admin-appointments-list" style="max-height: 400px; overflow-y: auto;">
           <div class="spinner" style="margin: 2rem auto;"></div>
        </div>
      </div>
      <div class="main-column" style="grid-column: 1 / -1; margin-top: 2rem;">
        <h2 style="margin-bottom: 1rem;">Registered Users</h2>
        <div id="admin-users-list">
           <div class="spinner" style="margin: 2rem auto;"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const [appointments, users] = await Promise.all([
      apiFetch('/admin/appointments'),
      apiFetch('/admin/users')
    ]);
    
    // Stats
    const activeAppts = appointments.filter(a => a.status === 'active').length;
    document.getElementById('admin-stats-container').innerHTML = `
      <div class="stat-card" style="background:#eef2ff;"><span style="font-size:0.875rem; color:var(--primary)">Total Users</span><span class="value">${users.length}</span></div>
      <div class="stat-card" style="background:#eef2ff;"><span style="font-size:0.875rem; color:var(--primary)">Active Appointments</span><span class="value">${activeAppts}</span></div>
      <div class="stat-card" style="background:#eef2ff;"><span style="font-size:0.875rem; color:var(--primary)">Total Bookings Ever</span><span class="value">${appointments.length}</span></div>
    `;

    // Chart Data Calcs
    const completedApps = appointments.filter(a => a.status === 'completed').length;
    const cancelledApps = appointments.filter(a => a.status === 'cancelled').length;
    const totalApps = appointments.length || 1; // avoid / 0
    
    document.getElementById('admin-chart-container').innerHTML = `
        <div style="display:flex; align-items:center; gap: 1rem;">
            <span style="min-width:80px; font-weight:500; font-size:0.875rem;">Active</span>
            <div style="flex:1; background:var(--background); height:1.5rem; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${(activeAppts/totalApps)*100}%; background:var(--primary); transition:width 1s;"></div>
            </div>
            <span style="font-weight:600; min-width:30px;">${activeAppts}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 1rem;">
            <span style="min-width:80px; font-weight:500; font-size:0.875rem;">Completed</span>
            <div style="flex:1; background:var(--background); height:1.5rem; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${(completedApps/totalApps)*100}%; background:var(--success); transition:width 1s;"></div>
            </div>
            <span style="font-weight:600; min-width:30px;">${completedApps}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 1rem;">
            <span style="min-width:80px; font-weight:500; font-size:0.875rem;">Cancelled</span>
            <div style="flex:1; background:var(--background); height:1.5rem; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${(cancelledApps/totalApps)*100}%; background:var(--danger); transition:width 1s;"></div>
            </div>
            <span style="font-weight:600; min-width:30px;">${cancelledApps}</span>
        </div>
    `;

    // Appointments Table
    const apptsHTML = appointments.length === 0 
      ? '<p style="color:var(--text-muted)">No appointments exist in the system.</p>'
      : `<table style="width:100%; text-align:left; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); background: var(--surface);">
              <th style="padding: 0.75rem;">Patient</th>
              <th style="padding: 0.75rem;">Doctor</th>
              <th style="padding: 0.75rem;">Service</th>
              <th style="padding: 0.75rem;">Date & Time</th>
              <th style="padding: 0.75rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map(a => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem;">${a.patient.name}</td>
                <td style="padding: 0.75rem;">${a.doctor.name}</td>
                <td style="padding: 0.75rem;">${a.service.name}</td>
                <td style="padding: 0.75rem;">${a.date} <span style="color:var(--text-muted)">${a.timeSlot}</span></td>
                <td style="padding: 0.75rem;"><span class="badge badge-${a.status === 'active' ? 'active' : 'cancelled'}">${a.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
         </table>`;
    
    document.getElementById('admin-appointments-list').innerHTML = apptsHTML;

    // Users List
    const usersHTML = `<table style="width:100%; text-align:left; border-collapse: collapse;">
        <thead>
        <tr style="border-bottom: 2px solid var(--border); background: var(--surface);">
            <th style="padding: 0.75rem;">ID</th>
            <th style="padding: 0.75rem;">Name</th>
            <th style="padding: 0.75rem;">Email</th>
            <th style="padding: 0.75rem;">Role</th>
        </tr>
        </thead>
        <tbody>
        ${users.map(u => `
            <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.75rem; font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${u.id.split('-')[0]}...</td>
            <td style="padding: 0.75rem; font-weight: 500;">${u.name}</td>
            <td style="padding: 0.75rem;">${u.email}</td>
            <td style="padding: 0.75rem;">${u.isAdmin ? '<span class="badge badge-active" style="background:var(--primary); color:white;">Admin</span>' : '<span class="badge" style="background:#e5e7eb; color:#374151">User</span>'}</td>
            </tr>
        `).join('')}
        </tbody>
    </table>`;
    document.getElementById('admin-users-list').innerHTML = usersHTML;

  } catch(err) {
    if(err.message === 'Access denied' || err.message === 'Invalid token') {
      window.location.hash = '#/login';
    } else if (err.message === 'Admin access required') {
      showToast('You must be an admin to view this page', 'error');
      window.location.hash = '#/dashboard';
    }
  }
};
