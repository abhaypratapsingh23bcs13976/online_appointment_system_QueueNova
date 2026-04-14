import { apiFetch } from '../api.js';

export const renderAnalytics = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const data = await apiFetch('/analytics');

    const barMax = Math.max(data.completed, data.upcoming, data.cancelled, 1);

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">📊 Health Analytics</h1>
        <p style="color:var(--text-muted); margin-top:0.25rem;">Insights into your healthcare journey</p>
      </div>

      <!-- Overview Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:2.5rem;">
        <div class="card" style="text-align:center; padding:1.5rem; border-top:3px solid var(--primary);">
          <div style="font-size:2.5rem; font-weight:800; color:var(--primary);">${data.total}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:0.25rem;">Total Visits</div>
        </div>
        <div class="card" style="text-align:center; padding:1.5rem; border-top:3px solid #10b981;">
          <div style="font-size:2.5rem; font-weight:800; color:#10b981;">${data.completed}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:0.25rem;">Completed</div>
        </div>
        <div class="card" style="text-align:center; padding:1.5rem; border-top:3px solid #3b82f6;">
          <div style="font-size:2.5rem; font-weight:800; color:#3b82f6;">${data.upcoming}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:0.25rem;">Upcoming</div>
        </div>
        <div class="card" style="text-align:center; padding:1.5rem; border-top:3px solid #ef4444;">
          <div style="font-size:2.5rem; font-weight:800; color:#ef4444;">${data.cancelled}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:0.25rem;">Cancelled</div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem; margin-bottom:2rem;">

        <!-- Completion Rate Ring -->
        <div class="card" style="padding:2rem; text-align:center;">
          <h3 style="margin-bottom:1.5rem; color:var(--text-dark);">Completion Rate</h3>
          <div style="position:relative; width:160px; height:160px; margin:0 auto;">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" stroke-width="12"/>
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--primary)" stroke-width="12"
                stroke-dasharray="${2 * Math.PI * 70}" 
                stroke-dashoffset="${2 * Math.PI * 70 * (1 - data.completionRate / 100)}"
                stroke-linecap="round" transform="rotate(-90 80 80)"
                style="transition: stroke-dashoffset 1s ease;"/>
            </svg>
            <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <span style="font-size:2.5rem; font-weight:800; color:var(--text-dark);">${data.completionRate}%</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">Success Rate</span>
            </div>
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="card" style="padding:2rem;">
          <h3 style="margin-bottom:1.5rem; color:var(--text-dark);">Appointment Breakdown</h3>
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.5rem;">
                <span style="color:var(--text-dark);">Completed</span><span style="font-weight:700; color:#10b981;">${data.completed}</span>
              </div>
              <div style="height:12px; background:var(--surface-hover); border-radius:6px; overflow:hidden;">
                <div style="height:100%; width:${(data.completed / barMax) * 100}%; background:linear-gradient(90deg, #10b981, #34d399); border-radius:6px; transition:width 1s ease;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.5rem;">
                <span style="color:var(--text-dark);">Upcoming</span><span style="font-weight:700; color:#3b82f6;">${data.upcoming}</span>
              </div>
              <div style="height:12px; background:var(--surface-hover); border-radius:6px; overflow:hidden;">
                <div style="height:100%; width:${(data.upcoming / barMax) * 100}%; background:linear-gradient(90deg, #3b82f6, #60a5fa); border-radius:6px; transition:width 1s ease;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.5rem;">
                <span style="color:var(--text-dark);">Cancelled</span><span style="font-weight:700; color:#ef4444;">${data.cancelled}</span>
              </div>
              <div style="height:12px; background:var(--surface-hover); border-radius:6px; overflow:hidden;">
                <div style="height:100%; width:${(data.cancelled / barMax) * 100}%; background:linear-gradient(90deg, #ef4444, #f87171); border-radius:6px; transition:width 1s ease;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:2rem; margin-bottom:2rem;">

        <!-- Total Spend -->
        <div class="card" style="padding:2rem; text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">💰</div>
          <div style="font-size:2rem; font-weight:800; color:var(--text-dark);">₹${data.totalSpend.toLocaleString('en-IN')}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Total Healthcare Spend</div>
        </div>

        <!-- Top Doctors -->
        <div class="card" style="padding:2rem;">
          <h4 style="margin-bottom:1rem; color:var(--text-dark);">🩺 Top Doctors</h4>
          ${data.topDoctors.length === 0 
            ? '<p style="color:var(--text-muted); font-size:0.875rem;">No visits yet.</p>'
            : data.topDoctors.map((d, i) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; ${i < data.topDoctors.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
                <span style="font-size:0.875rem; color:var(--text-dark);">${d.name}</span>
                <span style="background:var(--primary); color:white; padding:0.15rem 0.5rem; border-radius:50px; font-size:0.7rem; font-weight:700;">${d.count} visits</span>
              </div>
            `).join('')}
        </div>

        <!-- Top Hospitals -->
        <div class="card" style="padding:2rem;">
          <h4 style="margin-bottom:1rem; color:var(--text-dark);">🏥 Top Hospitals</h4>
          ${data.topHospitals.length === 0 
            ? '<p style="color:var(--text-muted); font-size:0.875rem;">No visits yet.</p>'
            : data.topHospitals.map((h, i) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; ${i < data.topHospitals.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
                <span style="font-size:0.875rem; color:var(--text-dark);">${h.name}</span>
                <span style="background:#7c3aed; color:white; padding:0.15rem 0.5rem; border-radius:50px; font-size:0.7rem; font-weight:700;">${h.count} visits</span>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; color:var(--text-dark);">📈 Monthly Trend</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:1rem;">
          ${Object.entries(data.monthly).sort().map(([month, stats]) => `
            <div style="text-align:center; padding:1rem; background:var(--surface-hover); border-radius:12px;">
              <div style="font-weight:700; color:var(--text-dark); margin-bottom:0.5rem;">${month}</div>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">${stats.total}</div>
              <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.25rem;">
                ${stats.completed}✓ / ${stats.cancelled}✗
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load analytics.</p>`;
  }
};
