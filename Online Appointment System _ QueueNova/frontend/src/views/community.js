import { apiFetch } from '../api.js';

export const renderCommunity = async (container) => {
  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
        <div>
          <h2 style="color: var(--primary); font-size: 2rem;">Health Community Forum</h2>
          <p>Get answers from Verified Doctors.</p>
        </div>
        <button class="btn btn-primary" onclick="alert('Mock: Submit Question Overlay...')">Ask a Question</button>
      </div>

      <div style="display:flex; flex-direction:column; gap: 1.5rem;">
        <div class="card" style="padding: 1.5rem;">
          <h4 style="margin-bottom: 0.5rem; color: var(--text-dark);">What are the early signs of dehydration in toddlers?</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">Asked by Anonymous • 2 hours ago</p>
          <div style="background:var(--surface); border-left: 4px solid var(--primary); padding: 1rem; border-radius: 4px;">
            <div style="display:flex; align-items:center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="background: var(--success); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">VERIFIED DOCTOR</span>
              <span style="font-weight: 500; font-size: 0.9rem;">Dr. Emily Taylor (Pediatrician)</span>
            </div>
            <p style="font-size: 0.95rem;">Look out for zero tears when crying, dry mouth, sunken eyes, and lack of wet diapers for more than 3 hours. If you notice these, seek immediate hydration support.</p>
          </div>
        </div>

        <div class="card" style="padding: 1.5rem;">
          <h4 style="margin-bottom: 0.5rem; color: var(--text-dark);">Are heart palpitations after caffeine normal?</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">Asked by John D. • 5 hours ago</p>
          <div style="background:var(--surface); border-left: 4px solid var(--primary); padding: 1rem; border-radius: 4px;">
            <div style="display:flex; align-items:center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="background: var(--success); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">VERIFIED DOCTOR</span>
              <span style="font-weight: 500; font-size: 0.9rem;">Dr. Michael Chen (Cardiologist)</span>
            </div>
            <p style="font-size: 0.95rem;">Mild palpitations can occur after high caffeine intake due to central nervous system stimulation. However, if they last longer than a few minutes or accompanied by dizziness, please schedule an appointment.</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
