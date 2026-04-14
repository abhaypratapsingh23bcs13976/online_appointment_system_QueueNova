import { apiFetch } from '../api.js';

export const renderPrescriptions = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;
  
  try {
    const prescriptions = await apiFetch('/prescriptions');
    
    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">💊 My Prescriptions</h1>
            <p style="color:var(--text-muted); margin-top:0.25rem;">View and manage your medical prescriptions</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="rx-filter-btn active" data-filter="all" style="padding:0.5rem 1.25rem; border-radius:50px; border:1px solid var(--border); background:var(--primary); color:white; cursor:pointer; font-weight:600; font-size:0.8rem;">All</button>
            <button class="rx-filter-btn" data-filter="active" style="padding:0.5rem 1.25rem; border-radius:50px; border:1px solid var(--border); background:var(--surface); color:var(--text-dark); cursor:pointer; font-weight:600; font-size:0.8rem;">Active</button>
            <button class="rx-filter-btn" data-filter="expired" style="padding:0.5rem 1.25rem; border-radius:50px; border:1px solid var(--border); background:var(--surface); color:var(--text-dark); cursor:pointer; font-weight:600; font-size:0.8rem;">Expired</button>
          </div>
        </div>
      </div>

      <div id="rx-list" style="display:flex; flex-direction:column; gap:1.5rem;">
        ${prescriptions.length === 0 
          ? `<div class="card" style="text-align:center; padding:4rem 2rem;">
              <div style="font-size:4rem; margin-bottom:1rem;">📋</div>
              <h3 style="color:var(--text-dark); margin-bottom:0.5rem;">No Prescriptions Yet</h3>
              <p style="color:var(--text-muted);">Prescriptions from your completed appointments will appear here.</p>
            </div>`
          : prescriptions.map(rx => `
            <div class="card rx-card" data-status="${rx.status}" style="padding:0; overflow:hidden; border-left: 4px solid ${rx.status === 'active' ? 'var(--success)' : 'var(--text-muted)'};">
              <div style="padding:2rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
                  <div>
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
                      <h3 style="color:var(--text-dark); margin:0;">${rx.diagnosis}</h3>
                      <span style="padding:0.2rem 0.75rem; border-radius:50px; font-size:0.7rem; font-weight:700; background:${rx.status === 'active' ? '#d1fae5' : '#f3f4f6'}; color:${rx.status === 'active' ? '#065f46' : '#6b7280'}; text-transform:uppercase;">${rx.status}</span>
                    </div>
                    <p style="color:var(--text-muted); font-size:0.875rem;">
                      🩺 ${rx.doctor?.name || 'Doctor'} &nbsp;•&nbsp; 📅 ${new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button class="btn btn-outline" style="font-size:0.8rem; padding:0.5rem 1rem;" onclick="alert('Prescription downloaded as PDF (mock)')">📥 Download</button>
                </div>

                <div style="background:var(--surface-hover); border-radius:12px; padding:1.25rem; margin-bottom:1rem;">
                  <h4 style="color:var(--text-dark); margin-bottom:1rem; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">Medications</h4>
                  <div style="display:grid; gap:0.75rem;">
                    ${rx.medications.map((med, i) => `
                      <div style="display:grid; grid-template-columns: 2fr 1fr 1.5fr 1fr; gap:1rem; padding:0.75rem 1rem; background:var(--surface); border-radius:8px; border:1px solid var(--border); font-size:0.875rem; align-items:center;">
                        <div><strong style="color:var(--text-dark);">${med.name}</strong></div>
                        <div style="color:var(--text-muted);">${med.dosage}</div>
                        <div style="color:var(--text-muted);">${med.frequency}</div>
                        <div style="color:var(--primary); font-weight:600;">${med.duration}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                ${rx.notes ? `<div style="color:var(--text-muted); font-size:0.875rem; padding:0.75rem 1rem; background:rgba(79,70,229,0.05); border-radius:8px; border-left:3px solid var(--primary);">
                  <strong>Doctor's Notes:</strong> ${rx.notes}
                </div>` : ''}
              </div>
            </div>
          `).join('')}
      </div>
    `;

    // Filter logic
    document.querySelectorAll('.rx-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rx-filter-btn').forEach(b => {
          b.style.background = 'var(--surface)';
          b.style.color = 'var(--text-dark)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        document.querySelectorAll('.rx-card').forEach(card => {
          if (filter === 'all') { card.style.display = 'block'; }
          else { card.style.display = card.dataset.status === filter ? 'block' : 'none'; }
        });
      });
    });

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load prescriptions. Please login first.</p>`;
  }
};
