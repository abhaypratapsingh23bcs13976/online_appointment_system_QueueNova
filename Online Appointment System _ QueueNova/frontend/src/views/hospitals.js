import { apiFetch } from '../api.js';

export const renderHospitals = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const hospitals = await apiFetch('/hospitals');
    const doctors = await apiFetch('/doctors');

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">🏥 Browse Hospitals & Doctors</h1>
        <p style="color:var(--text-muted); margin-top:0.25rem;">Find the right doctor for your healthcare needs</p>
      </div>

      <div style="margin-bottom:1.5rem;">
        <input type="text" id="hospital-search" class="input-field" placeholder="🔍 Search by hospital or doctor name..." style="max-width:400px; width:100%;">
      </div>

      <div style="display:grid; grid-template-columns: 300px 1fr; gap:2rem; align-items:start;" id="hospitals-grid">
        
        <!-- Hospitals Sidebar -->
        <div style="display:flex; flex-direction:column; gap:0.75rem;" id="hospital-sidebar">
          ${hospitals.map((h, i) => `
            <div class="card hospital-card ${i === 0 ? 'selected' : ''}" data-id="${h.id}" 
                 style="cursor:pointer; padding:1rem; display:flex; gap:1rem; align-items:center; transition:all 0.2s; ${i === 0 ? 'border-color:var(--primary); box-shadow:0 0 0 2px var(--primary);' : ''}"
                 onclick="window.selectHospital('${h.id}')">
              <img src="${h.image}" style="width:56px; height:56px; border-radius:12px; object-fit:cover;" onerror="this.src='data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect fill="#e5e7eb" width="56" height="56"/><text x="28" y="32" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle">🏥</text></svg>`)}'">
              <div style="min-width:0;">
                <h4 style="color:var(--text-dark); font-size:0.9rem; margin-bottom:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.name}</h4>
                <span style="color:var(--text-muted); font-size:0.75rem;">📍 ${h.city}</span>
              </div>
              <span style="margin-left:auto; color:var(--text-muted);">›</span>
            </div>
          `).join('')}
        </div>

        <!-- Hospital Detail & Doctors -->
        <div id="hospital-detail">
          <!-- Populated by JS -->
        </div>
      </div>
    `;

    let globalHospitals = hospitals;
    let globalDoctors = doctors;
    let selectedHospitalId = hospitals.length > 0 ? hospitals[0].id : null;

    const renderHospitalDetail = (hospitalId) => {
      selectedHospitalId = hospitalId;
      const h = globalHospitals.find(x => x.id === hospitalId);
      const hDoctors = globalDoctors.filter(d => d.hospitalId === hospitalId);

      document.getElementById('hospital-detail').innerHTML = `
        <div>
          <!-- Hospital Banner -->
          <div style="position:relative; border-radius:var(--radius); overflow:hidden; margin-bottom:1.5rem;">
            <img src="${h.image}" style="width:100%; height:220px; object-fit:cover;" onerror="this.src='data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'220\' viewBox=\'0 0 400 220\'><rect fill=\'#e5e7eb\' width=\'400\' height=\'220\'/><text x=\'200\' y=\'120\' font-family=\'Arial\' font-size=\'48\' fill=\'#9ca3af\' text-anchor=\'middle\'>🏥</text></svg>`)}'">
            <div style="position:absolute; bottom:0; left:0; right:0; padding:2rem 1.5rem 1.5rem; background:linear-gradient(transparent, rgba(0,0,0,0.8));">
              <h2 style="color:white; margin:0;">${h.name}</h2>
              <p style="color:rgba(255,255,255,0.7); font-size:0.9rem; margin-top:0.25rem;">⭐ ${h.rating} — ${h.city}</p>
            </div>
          </div>

          <!-- Hospital Info Grid -->
          <div class="card" style="padding:1.5rem; margin-bottom:1.5rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
              <div><span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">📍 Address</span><p style="color:var(--text-dark); font-size:0.9rem; margin-top:0.25rem;">${h.address}</p></div>
              <div><span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">📞 Phone</span><p style="color:var(--text-dark); font-size:0.9rem; margin-top:0.25rem;">${h.phone}</p></div>
              <div><span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">✉️ Email</span><p style="color:var(--text-dark); font-size:0.9rem; margin-top:0.25rem;">${h.email}</p></div>
              <div><span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">🏛️ Departments</span><p style="color:var(--text-dark); font-size:0.9rem; margin-top:0.25rem;">${h.departments?.length || 0} specializations</p></div>
            </div>
            <div style="margin-top:1rem; display:flex; flex-wrap:wrap; gap:0.5rem;">
              ${(h.departments || []).map(dept => `
                <span style="padding:0.3rem 0.75rem; background:rgba(79,70,229,0.1); color:var(--primary); border-radius:50px; font-size:0.75rem; font-weight:600;">${dept}</span>
              `).join('')}
            </div>
          </div>

          <!-- Doctors in this hospital -->
          <h3 style="margin-bottom:1rem; color:var(--text-dark);">Available Doctors (${hDoctors.length})</h3>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${hDoctors.length === 0 
              ? '<p style="color:var(--text-muted);">No doctors registered at this hospital yet.</p>'
              : hDoctors.map(d => `
                <div class="card" style="display:flex; gap:1.5rem; align-items:center; padding:1.25rem;">
                  <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:1.25rem; flex-shrink:0;">
                    ${d.name.split(' ').pop()[0]}
                  </div>
                  <div style="flex:1; min-width:0;">
                    <h4 style="color:var(--text-dark); margin-bottom:0.25rem;">${d.name}</h4>
                    <p style="color:var(--primary); font-size:0.8rem; font-weight:600;">${d.specialty}</p>
                    <p style="color:var(--text-muted); font-size:0.8rem;">${d.qualification} • ${d.experienceYears} yrs • ⭐ ${d.rating} • ₹${d.consultationFee}</p>
                    <div style="display:flex; gap:0.35rem; margin-top:0.5rem; flex-wrap:wrap;">
                      ${(d.languages || []).map(l => `<span style="padding:0.1rem 0.5rem; background:var(--surface-hover); border-radius:4px; font-size:0.65rem; color:var(--text-muted);">${l}</span>`).join('')}
                    </div>
                  </div>
                  <a href="#/book?doctorId=${d.id}" class="btn btn-primary" style="font-size:0.8rem; padding:0.6rem 1.5rem; flex-shrink:0;">Book Now</a>
                </div>
              `).join('')}
          </div>
        </div>
      `;
    };

    window.selectHospital = (id) => {
      document.querySelectorAll('.hospital-card').forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = '';
        c.style.boxShadow = '';
      });
      const card = document.querySelector(`.hospital-card[data-id="${id}"]`);
      if (card) {
        card.classList.add('selected');
        card.style.borderColor = 'var(--primary)';
        card.style.boxShadow = '0 0 0 2px var(--primary)';
      }
      renderHospitalDetail(id);
    };

    // Render first hospital by default
    if (hospitals.length > 0) renderHospitalDetail(hospitals[0].id);

    // Search functionality
    document.getElementById('hospital-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      
      if (!term) {
        globalHospitals = hospitals;
        globalDoctors = doctors;
      } else {
        // Filter hospitals by name
        const matchedHospitals = hospitals.filter(h => 
          h.name.toLowerCase().includes(term)
        );
        
        // Find doctors matching the search term
        const matchedDoctorIds = new Set(
          doctors.filter(d => d.name.toLowerCase().includes(term)).map(d => d.hospitalId)
        );
        
        // Include hospitals that have matching doctors
        const matchedHospitalsByDoctors = hospitals.filter(h => matchedDoctorIds.has(h.id));
        
        // Combine both sets
        const allMatchedHospitals = [...new Set([...matchedHospitals, ...matchedHospitalsByDoctors])];
        
        globalHospitals = allMatchedHospitals;
      }
      
      // Re-render sidebar
      const sidebar = document.getElementById('hospital-sidebar');
      sidebar.innerHTML = globalHospitals.map((h, i) => `
        <div class="card hospital-card ${i === 0 ? 'selected' : ''}" data-id="${h.id}" 
             style="cursor:pointer; padding:1rem; display:flex; gap:1rem; align-items:center; transition:all 0.2s; ${i === 0 ? 'border-color:var(--primary); box-shadow:0 0 0 2px var(--primary);' : ''}"
             onclick="window.selectHospital('${h.id}')">
          <img src="${h.image}" style="width:56px; height:56px; border-radius:12px; object-fit:cover;" onerror="this.src='data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"56\" height=\"56\" viewBox=\"0 0 56 56\"><rect fill=\"#e5e7eb\" width=\"56\" height=\"56\"/><text x=\"28\" y=\"32\" font-family=\"Arial\" font-size=\"24\" fill=\"#9ca3af\" text-anchor=\"middle\">🏥</text></svg>`)}'">
          <div style="min-width:0;">
            <h4 style="color:var(--text-dark); font-size:0.9rem; margin-bottom:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.name}</h4>
            <span style="color:var(--text-muted); font-size:0.75rem;">📍 ${h.city}</span>
          </div>
          <span style="margin-left:auto; color:var(--text-muted);">›</span>
        </div>
      `).join('');
      
      // Show message if no results
      if (globalHospitals.length === 0) {
        sidebar.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No hospitals or doctors found.</p>';
        document.getElementById('hospital-detail').innerHTML = '';
      } else if (term || selectedHospitalId) {
        // Auto-select first match when searching or keep selection
        const firstMatch = globalHospitals.find(h => h.id === selectedHospitalId) || globalHospitals[0];
        window.selectHospital(firstMatch.id);
      }
    });

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load hospitals. Make sure the backend is running.</p>`;
  }
};
