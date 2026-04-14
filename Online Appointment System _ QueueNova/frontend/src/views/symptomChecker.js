import { apiFetch } from '../api.js';
import { showToast } from '../components/toaster.js';

export const renderSymptomChecker = async (container) => {
  container.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:3rem;">
        <div style="width:80px; height:80px; background:linear-gradient(135deg, var(--primary), var(--secondary)); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; box-shadow:0 10px 25px rgba(79,70,229,0.3);">
          <span style="font-size:2.5rem;">🤖</span>
        </div>
        <h1 style="font-size:2.5rem; font-weight:800; letter-spacing:-1px;">AI Symptom Checker</h1>
        <p style="color:var(--text-muted); margin-top:0.5rem; font-size:1.1rem;">Describe your symptoms and get instant doctor recommendations</p>
      </div>

      <div class="card" style="padding:2.5rem; margin-bottom:2rem;">
        <form id="symptom-form">
          <div class="form-group">
            <label style="font-size:1rem; font-weight:600;">What symptoms are you experiencing?</label>
            <textarea id="symptom-input" class="input-field" rows="4" required 
                      placeholder="e.g., I've been having frequent headaches, dizziness, and neck pain for the past 3 days..."
                      style="resize:vertical; font-size:1rem; line-height:1.6;"></textarea>
          </div>
          
          <div style="margin-bottom:1.5rem;">
            <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.75rem;">Quick symptoms:</p>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;" id="quick-symptoms">
              ${['Fever', 'Headache', 'Chest Pain', 'Skin Rash', 'Joint Pain', 'Stomach Ache', 'Cough & Cold', 'Back Pain'].map(s => `
                <button type="button" class="quick-symptom-btn" style="padding:0.4rem 1rem; border-radius:50px; border:1px solid var(--border); background:var(--surface); color:var(--text-dark); cursor:pointer; font-size:0.8rem; transition:all 0.2s;"
                  onclick="document.getElementById('symptom-input').value += (document.getElementById('symptom-input').value ? ', ' : '') + '${s.toLowerCase()}'; this.style.background='var(--primary)'; this.style.color='white'; this.style.borderColor='var(--primary)';">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <button type="submit" id="check-btn" class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;">
            🧠 Analyze Symptoms
          </button>
        </form>
      </div>

      <div id="symptom-results" style="display:none;"></div>

      <div style="text-align:center; padding:1.5rem; background:rgba(239,68,68,0.05); border-radius:12px; border:1px solid rgba(239,68,68,0.2);">
        <p style="color:var(--text-muted); font-size:0.8rem;">
          ⚠️ <strong>Disclaimer:</strong> This is an AI-assisted tool for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </p>
      </div>
    </div>
  `;

  document.getElementById('symptom-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const symptoms = document.getElementById('symptom-input').value;
    const btn = document.getElementById('check-btn');
    const resultsDiv = document.getElementById('symptom-results');

    btn.innerHTML = '<div class="spinner" style="width:24px; height:24px; margin:0 auto;"></div>';
    btn.disabled = true;

    // Simulate "AI thinking" delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      const result = await apiFetch('/symptom-check', {
        method: 'POST',
        body: JSON.stringify({ symptoms })
      });

      const severityConfig = {
        low: { color: '#10b981', bg: '#d1fae5', icon: '🟢', label: 'Low Severity' },
        moderate: { color: '#f59e0b', bg: '#fef3c7', icon: '🟡', label: 'Moderate Severity' },
        high: { color: '#ef4444', bg: '#fee2e2', icon: '🔴', label: 'High Severity — Seek Immediate Care' }
      };
      const sev = severityConfig[result.severity] || severityConfig.low;

      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div class="card" style="padding:0; overflow:hidden; margin-bottom:2rem; animation: slideUp 0.5s ease;">
          
          <!-- Severity Header -->
          <div style="padding:1.5rem 2rem; background:${sev.bg}; border-bottom:1px solid ${sev.color}30;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.5rem;">${sev.icon}</span>
              <div>
                <h3 style="color:${sev.color}; margin:0;">${sev.label}</h3>
                <p style="color:${sev.color}; opacity:0.8; font-size:0.875rem; margin-top:0.15rem;">Department: <strong>${result.department}</strong></p>
              </div>
            </div>
          </div>

          <!-- Advice -->
          <div style="padding:2rem;">
            <h4 style="color:var(--text-dark); margin-bottom:0.75rem;">📋 AI Assessment</h4>
            <p style="color:var(--text-muted); line-height:1.7; font-size:1rem; margin-bottom:2rem; padding:1rem; background:var(--surface-hover); border-radius:12px; border-left:4px solid var(--primary);">${result.advice}</p>

            <!-- Recommended Doctors -->
            <h4 style="color:var(--text-dark); margin-bottom:1rem;">🩺 Recommended Specialists</h4>
            ${result.recommendedDoctors.length === 0
              ? '<p style="color:var(--text-muted);">No matching specialists found. Visit a General Practice.</p>'
              : `<div style="display:flex; flex-direction:column; gap:1rem;">
                  ${result.recommendedDoctors.map(d => `
                    <div style="display:flex; gap:1.25rem; align-items:center; padding:1.25rem; background:var(--surface-hover); border-radius:12px; border:1px solid var(--border);">
                      <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; flex-shrink:0;">
                        ${d.name.split(' ').pop()[0]}
                      </div>
                      <div style="flex:1;">
                        <h4 style="color:var(--text-dark); margin-bottom:0.15rem;">${d.name}</h4>
                        <p style="color:var(--text-muted); font-size:0.8rem;">${d.specialty} • ${d.qualification} • ⭐ ${d.rating}</p>
                        ${d.hospital ? `<p style="color:var(--text-muted); font-size:0.75rem;">🏥 ${d.hospital.name}, ${d.hospital.city}</p>` : ''}
                      </div>
                      <a href="#/book" class="btn btn-primary" style="font-size:0.8rem; padding:0.5rem 1.25rem;">Book Now</a>
                    </div>
                  `).join('')}
                </div>`
            }
          </div>
        </div>
      `;

      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch(err) {
      showToast('Failed to analyze symptoms.', 'error');
    } finally {
      btn.innerHTML = '🧠 Analyze Symptoms';
      btn.disabled = false;
    }
  });
};
