import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderAppointments = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const [stats, services, doctors] = await Promise.all([
      apiFetch('/appointments').catch(() => []),
      apiFetch('/services').catch(() => []),
      apiFetch('/doctors').catch(() => [])
    ]);

    container.innerHTML = `
      <div style="margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">📅 My Appointments</h1>
          <p style="color:var(--text-muted); margin-top:0.25rem;">View and manage all your appointments</p>
        </div>
        <a href="#/book" class="btn btn-primary">+ New Appointment</a>
      </div>

      <!-- Filters -->
      <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
        <input type="text" id="history-search" class="input-field" placeholder="🔍 Search appointments..." style="max-width:300px; flex:1;">
        <select id="history-status" class="input-field" style="width:auto;">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Stats Summary -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:1rem; margin-bottom:2rem;">
        <div class="card" style="padding:1.25rem; text-align:center;">
          <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">${stats.filter(a => a.status === 'active').length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Active</div>
        </div>
        <div class="card" style="padding:1.25rem; text-align:center;">
          <div style="font-size:1.5rem; font-weight:800; color:var(--success);">${stats.filter(a => a.status === 'completed').length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Completed</div>
        </div>
        <div class="card" style="padding:1.25rem; text-align:center;">
          <div style="font-size:1.5rem; font-weight:800; color:var(--danger);">${stats.filter(a => a.status === 'cancelled').length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Cancelled</div>
        </div>
        <div class="card" style="padding:1.25rem; text-align:center;">
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-dark);">${stats.length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Total</div>
        </div>
      </div>

      <!-- Appointments List -->
      <div id="appointments-list"></div>
    `;

    let globalAppts = stats || [];
    let displayedAppts = 10;

    const renderAppts = (list, reset = false) => {
      if (reset) displayedAppts = 10;
      const toShow = list.slice(0, displayedAppts);
      const hasMore = list.length > displayedAppts;
      
      const apptsHTML = (!list || list.length === 0)
        ? '<div class="card" style="text-align:center; padding:3rem;"><div style="font-size:3rem; margin-bottom:1rem;">📭</div><p style="color:var(--text-muted); font-size:1rem;">No appointments found</p><a href="#/book" class="btn btn-primary" style="margin-top:1rem;">Book Your First Appointment</a></div>'
        : toShow.map(a => `
          <div class="card" style="margin-bottom:1rem; padding:1.25rem; opacity:${a.status==='cancelled'?0.6:1}; border-left:4px solid ${a.status === 'active' ? 'var(--primary)' : a.status === 'completed' ? 'var(--success)' : 'var(--danger)'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
              <div style="flex:1; min-width:200px;">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                  <h4 style="color:var(--text-dark); font-size:1rem;">${a.service?.name || 'Service'}</h4>
                  <span style="padding:0.15rem 0.5rem; border-radius:50px; font-size:0.6rem; font-weight:700; background:${a.status === 'active' ? '#d1fae5' : a.status === 'completed' ? '#dbeafe' : '#fee2e2'}; color:${a.status === 'active' ? '#065f46' : a.status === 'completed' ? '#1e40af' : '#991b1b'};">${a.status}</span>
                </div>
                <p style="color:var(--primary); font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">👨‍⚕️ ${a.doctor?.name || 'Doctor'}</p>
                <div style="display:flex; gap:1rem; font-size:0.8rem; color:var(--text-muted); flex-wrap:wrap;">
                  <span>📅 ${a.date ? new Date(a.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'N/A'}</span>
                  <span>⏰ ${a.timeSlot || 'N/A'}</span>
                  ${a.familyMemberId ? '<span>👥 Family Member</span>' : ''}
                </div>
                ${a.notes ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem; font-style:italic;">📝 ${a.notes}</p>` : ''}
              </div>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${a.status === 'active' ? `
                  <button class="btn btn-primary" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="document.getElementById('telemedicine-window').style.display='flex'">📹 Video Call</button>
                  <button class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="window.showQRCheckIn('${a.id}')">📱 QR Check-in</button>
                  <button class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="window.editAppointment('${a.id}', '${a.date}', '${a.timeSlot}')">✏️ Reschedule</button>
                  <button class="btn btn-danger" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="window.cancelAppointment('${a.id}')">✗ Cancel</button>
                ` : ''}
                ${a.status === 'completed' ? `
                  <button class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;">📋 View Details</button>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('') + (hasMore ? `
          <button class="btn btn-outline" id="load-more-appts" style="width:100%; margin-top:1rem;">Load More (${list.length - displayedAppts} more)</button>
        ` : '');
      
      document.getElementById('appointments-list').innerHTML = apptsHTML;
      
      if (hasMore) {
        document.getElementById('load-more-appts')?.addEventListener('click', () => {
          displayedAppts += 10;
          renderAppts(list);
        });
      }
    };
    
    renderAppts(globalAppts, true);

    // Filters
    const applyFilters = () => {
      const term = document.getElementById('history-search').value.toLowerCase();
      const status = document.getElementById('history-status').value;
      const filtered = globalAppts.filter(a => {
        const matchTerm = (a.doctor?.name || '').toLowerCase().includes(term) || 
                          (a.service?.name || '').toLowerCase().includes(term) ||
                          (a.date || '').includes(term);
        const matchStatus = status === 'all' ? true : a.status === status;
        return matchTerm && matchStatus;
      });
      renderAppts(filtered);
    };
    document.getElementById('history-search').addEventListener('input', applyFilters);
    document.getElementById('history-status').addEventListener('change', applyFilters);

  } catch(err) {
    console.error(err);
    container.innerHTML = `<p style="color:var(--danger); text-align:center; padding:2rem;">Failed to load appointments.</p>`;
  }
};
