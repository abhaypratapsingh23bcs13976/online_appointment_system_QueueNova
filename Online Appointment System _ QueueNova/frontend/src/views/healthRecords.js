import { apiFetch } from '../api.js';
import { showToast } from '../components/toaster.js';

export const renderHealthRecords = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const records = await apiFetch('/health-records');

    const typeConfig = {
      allergy: { icon: '🤧', color: '#f59e0b', label: 'Allergy' },
      condition: { icon: '🩺', color: '#ef4444', label: 'Condition' },
      surgery: { icon: '🏥', color: '#8b5cf6', label: 'Surgery' },
      vaccination: { icon: '💉', color: '#10b981', label: 'Vaccination' },
      medication: { icon: '💊', color: '#3b82f6', label: 'Medication' },
      lab_result: { icon: '🔬', color: '#ec4899', label: 'Lab Result' },
    };
    const severityColors = { low: '#10b981', moderate: '#f59e0b', high: '#ef4444', resolved: '#6b7280' };

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">🏥 Health Records</h1>
            <p style="color:var(--text-muted); margin-top:0.25rem;">Your complete medical history in one place</p>
          </div>
          <button class="btn btn-primary" onclick="document.getElementById('hr-modal').style.display='flex'">+ Add Record</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:1rem; margin-bottom:2rem;">
        ${Object.entries(typeConfig).map(([type, cfg]) => {
          const count = records.filter(r => r.type === type).length;
          return `<div class="card" style="text-align:center; padding:1.25rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">${cfg.icon}</div>
            <div style="font-size:1.5rem; font-weight:700; color:var(--text-dark);">${count}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">${cfg.label}</div>
          </div>`;
        }).join('')}
      </div>

      <!-- Records List -->
      <div id="hr-list" style="display:flex; flex-direction:column; gap:1rem;">
        ${records.length === 0
          ? `<div class="card" style="text-align:center; padding:4rem 2rem;">
              <div style="font-size:4rem; margin-bottom:1rem;">📂</div>
              <h3>No Health Records</h3>
              <p style="color:var(--text-muted);">Start building your medical profile by adding records.</p>
            </div>`
          : records.map(r => {
            const cfg = typeConfig[r.type] || { icon: '📄', color: '#6b7280', label: r.type };
            const sevColor = severityColors[r.severity] || '#6b7280';
            return `
              <div class="card" style="display:flex; gap:1.5rem; align-items:flex-start; padding:1.5rem;">
                <div style="width:48px; height:48px; border-radius:12px; background:${cfg.color}15; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">${cfg.icon}</div>
                <div style="flex:1; min-width:0;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
                    <div>
                      <h4 style="color:var(--text-dark); margin-bottom:0.25rem;">${r.title}</h4>
                      <p style="color:var(--text-muted); font-size:0.875rem; margin-bottom:0.5rem;">${r.description}</p>
                    </div>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                      <span style="padding:0.2rem 0.75rem; border-radius:50px; font-size:0.7rem; font-weight:700; background:${cfg.color}20; color:${cfg.color};">${cfg.label}</span>
                      <span style="padding:0.2rem 0.75rem; border-radius:50px; font-size:0.7rem; font-weight:700; background:${sevColor}20; color:${sevColor};">${r.severity || 'N/A'}</span>
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                    <span style="color:var(--text-muted); font-size:0.8rem;">📅 ${new Date(r.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                    <button class="btn btn-outline" style="font-size:0.75rem; padding:0.3rem 0.75rem; color:var(--danger); border-color:var(--danger);" onclick="window.deleteHealthRecord('${r.id}')">Delete</button>
                  </div>
                </div>
              </div>`;
          }).join('')}
      </div>

      <!-- Add Record Modal -->
      <div id="hr-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width:500px;">
          <h3 style="margin-bottom:1.5rem;">Add Health Record</h3>
          <form id="hr-form">
            <div class="form-group">
              <label>Type</label>
              <select id="hr-type" class="input-field" required>
                <option value="allergy">🤧 Allergy</option>
                <option value="condition">🩺 Condition</option>
                <option value="surgery">🏥 Surgery</option>
                <option value="vaccination">💉 Vaccination</option>
                <option value="medication">💊 Medication</option>
                <option value="lab_result">🔬 Lab Result</option>
              </select>
            </div>
            <div class="form-group">
              <label>Title</label>
              <input type="text" id="hr-title" class="input-field" required placeholder="e.g., Dust Allergy">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea id="hr-desc" class="input-field" rows="3" placeholder="Details about this record..."></textarea>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label>Date</label>
                <input type="date" id="hr-date" class="input-field" required>
              </div>
              <div class="form-group">
                <label>Severity</label>
                <select id="hr-severity" class="input-field">
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-outline" style="flex:1;" onclick="document.getElementById('hr-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary" style="flex:1;">Save Record</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Form submit
    document.getElementById('hr-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/health-records', {
          method: 'POST',
          body: JSON.stringify({
            type: document.getElementById('hr-type').value,
            title: document.getElementById('hr-title').value,
            description: document.getElementById('hr-desc').value,
            date: document.getElementById('hr-date').value,
            severity: document.getElementById('hr-severity').value
          })
        });
        showToast('Health record added!');
        document.getElementById('hr-modal').style.display = 'none';
        renderHealthRecords(container);
      } catch(e) {}
    });

    window.deleteHealthRecord = async (id) => {
      if (!confirm('Delete this record?')) return;
      try {
        await apiFetch(`/health-records/${id}`, { method: 'DELETE' });
        showToast('Record deleted.');
        renderHealthRecords(container);
      } catch(e) {}
    };

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load health records.</p>`;
  }
};
