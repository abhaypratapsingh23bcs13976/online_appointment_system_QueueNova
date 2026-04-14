import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderLabTests = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const [labTests, hospitals, bookings] = await Promise.all([
      apiFetch('/lab-tests'),
      apiFetch('/hospitals').catch(() => []),
      apiFetch('/lab-tests/bookings').catch(() => [])
    ]);

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">🧪 Book Lab Tests</h1>
        <p style="color:var(--text-muted); margin-top:0.25rem;">Schedule diagnostic tests at your preferred hospital</p>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 350px; gap:2rem; align-items:start;">
        <div>
          <div style="margin-bottom:1.5rem;">
            <input type="text" id="test-search" class="input-field" placeholder="🔍 Search tests..." style="max-width:400px; width:100%;">
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;" id="tests-grid">
            ${labTests.map(t => `
              <div class="card test-card" data-id="${t.id}" style="padding:1.25rem; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                  <h4 style="color:var(--text-dark); font-size:1rem;">${t.name}</h4>
                  <input type="checkbox" class="test-checkbox" data-id="${t.id}" data-name="${t.name}" data-price="${t.price}" style="width:20px; height:20px;">
                </div>
                <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.25rem;">${t.category}</p>
                <p style="color:var(--text-muted); font-size:0.75rem; margin-bottom:0.75rem;">${t.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:1rem; font-weight:700; color:var(--primary);">₹${t.price}</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">⏱️ ${t.duration}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="card" style="padding:1.5rem; position:sticky; top:1rem;">
            <h3 style="font-size:1rem; margin-bottom:1rem;">🛒 Selected Tests (<span id="selected-count">0</span>)</h3>
            <div id="selected-tests" style="margin-bottom:1rem; max-height:200px; overflow-y:auto;">
              <p style="color:var(--text-muted); font-size:0.85rem;">No tests selected</p>
            </div>
            <div style="border-top:1px solid var(--border); padding-top:1rem; margin-bottom:1rem;">
              <div style="display:flex; justify-content:space-between; font-weight:700;">
                <span>Total</span>
                <span id="tests-total" style="color:var(--primary);">₹0</span>
              </div>
            </div>

            <div class="form-group">
              <label>Select Hospital</label>
              <select id="hospital-select" class="input-field">
                <option value="">Choose hospital</option>
                ${hospitals.map(h => `<option value="${h.id}">${h.name} - ${h.city}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Date</label>
              <input type="date" id="test-date" class="input-field" min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
              <label>Time Slot</label>
              <select id="test-time" class="input-field">
                <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
                <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                <option value="14:00-15:00">02:00 PM - 03:00 PM</option>
                <option value="15:00-16:00">03:00 PM - 04:00 PM</option>
              </select>
            </div>

            <button class="btn btn-primary" id="book-tests-btn" style="width:100%;" disabled>Book Tests</button>
          </div>

          <div class="card" style="padding:1.5rem; margin-top:1.5rem;">
            <h3 style="font-size:1rem; margin-bottom:1rem;">📋 Your Bookings</h3>
            ${bookings.length === 0 
              ? '<p style="color:var(--text-muted); font-size:0.85rem;">No lab test bookings yet</p>'
              : bookings.map(b => `
                <div style="padding:0.75rem; background:var(--surface-hover); border-radius:8px; margin-bottom:0.75rem;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <span style="font-weight:600; font-size:0.85rem;">📅 ${b.date}</span>
                    <span style="padding:0.15rem 0.5rem; border-radius:50px; font-size:0.65rem; font-weight:600;
                      background:${b.status === 'completed' ? '#d1fae5' : b.status === 'confirmed' ? '#dbeafe' : '#fef3c7'};
                      color:${b.status === 'completed' ? '#065f46' : b.status === 'confirmed' ? '#1e40af' : '#92400e'};">
                      ${b.status === 'completed' ? '✅ Completed' : b.status === 'confirmed' ? '📋 Confirmed' : '⏳ Pending'}
                    </span>
                  </div>
                  
                  <!-- Test Progress Timeline -->
                  <div style="margin:0.75rem 0; padding:0.75rem; background:var(--surface); border-radius:6px;">
                    <div style="display:flex; justify-content:space-between; position:relative; padding:0 0.25rem;">
                      <div style="position:absolute; top:10px; left:5px; right:5px; height:2px; background:var(--border);"></div>
                      <div style="position:absolute; top:10px; left:5px; height:2px; background:var(--primary); width:${b.status === 'pending' ? '0%' : b.status === 'confirmed' ? '50%' : '100%'};"></div>
                      
                      <div style="text-align:center; position:relative; z-index:1;">
                        <div style="width:20px; height:20px; border-radius:50%; background:${b.status !== 'pending' ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.25rem; color:white; font-size:0.6rem;">✓</div>
                        <span style="font-size:0.55rem; color:var(--text-muted);">Booked</span>
                      </div>
                      <div style="text-align:center; position:relative; z-index:1;">
                        <div style="width:20px; height:20px; border-radius:50%; background:${b.status === 'confirmed' || b.status === 'completed' ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.25rem; color:white; font-size:0.6rem;">✓</div>
                        <span style="font-size:0.55rem; color:var(--text-muted);">Sample<br>Collected</span>
                      </div>
                      <div style="text-align:center; position:relative; z-index:1;">
                        <div style="width:20px; height:20px; border-radius:50%; background:${b.status === 'completed' ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.25rem; color:white; font-size:0.6rem;">✓</div>
                        <span style="font-size:0.55rem; color:var(--text-muted);">Reports<br>Ready</span>
                      </div>
                    </div>
                  </div>

                  <p style="font-size:0.8rem; color:var(--text-dark); margin-bottom:0.25rem;"><strong>Tests:</strong> ${b.tests?.map(t => t.name).join(', ') || 'Tests'}</p>
                  <p style="font-size:0.75rem; color:var(--text-muted);">🏥 ${b.hospital?.name || ''} • ⏰ ${b.timeSlot}</p>
                  ${b.status === 'completed' ? '<p style="font-size:0.75rem; color:var(--primary); margin-top:0.5rem; font-weight:600;">📄 Reports available</p>' : ''}
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;

    let selectedTests = [];

    const updateSelectedUI = () => {
      document.getElementById('selected-count').textContent = selectedTests.length;
      const total = selectedTests.reduce((sum, t) => sum + t.price, 0);
      document.getElementById('tests-total').textContent = `₹${total}`;
      document.getElementById('book-tests-btn').disabled = selectedTests.length === 0;

      const selectedDiv = document.getElementById('selected-tests');
      if (selectedTests.length === 0) {
        selectedDiv.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No tests selected</p>';
      } else {
        selectedDiv.innerHTML = selectedTests.map(t => `
          <div style="display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid var(--border); font-size:0.85rem;">
            <span>${t.name}</span>
            <span style="font-weight:600;">₹${t.price}</span>
          </div>
        `).join('');
      }
    };

    document.querySelectorAll('.test-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseInt(this.dataset.price);
        
        if (this.checked) {
          selectedTests.push({ id, name, price });
        } else {
          selectedTests = selectedTests.filter(t => t.id !== id);
        }
        
        const card = this.closest('.test-card');
        if (this.checked) {
          card.style.border = '2px solid var(--primary)';
        } else {
          card.style.border = '';
        }
        
        updateSelectedUI();
      });
    });

    document.getElementById('test-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = labTests.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term)
      );
      
      document.getElementById('tests-grid').innerHTML = filtered.map(t => `
        <div class="card test-card" data-id="${t.id}" style="padding:1.25rem; cursor:pointer;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
            <h4 style="color:var(--text-dark); font-size:1rem;">${t.name}</h4>
            <input type="checkbox" class="test-checkbox" data-id="${t.id}" data-name="${t.name}" data-price="${t.price}" ${selectedTests.find(s => s.id === t.id) ? 'checked' : ''} style="width:20px; height:20px;">
          </div>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.25rem;">${t.category}</p>
          <p style="color:var(--text-muted); font-size:0.75rem; margin-bottom:0.75rem;">${t.description}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:1rem; font-weight:700; color:var(--primary);">₹${t.price}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">⏱️ ${t.duration}</span>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.test-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
          const id = this.dataset.id;
          const name = this.dataset.name;
          const price = parseInt(this.dataset.price);
          
          if (this.checked) {
            selectedTests.push({ id, name, price });
          } else {
            selectedTests = selectedTests.filter(t => t.id !== id);
          }
          
          const card = this.closest('.test-card');
          if (this.checked) {
            card.style.border = '2px solid var(--primary)';
          } else {
            card.style.border = '';
          }
          
          updateSelectedUI();
        });
      });
    });

    document.getElementById('book-tests-btn').addEventListener('click', async () => {
      const hospitalId = document.getElementById('hospital-select').value;
      const date = document.getElementById('test-date').value;
      const timeSlot = document.getElementById('test-time').value;

      if (!hospitalId || !date) {
        showToast('Please select hospital and date', 'error');
        return;
      }

      showSpinner('book-tests-btn');
      try {
        await apiFetch('/lab-tests', {
          method: 'POST',
          body: JSON.stringify({
            testIds: selectedTests.map(t => t.id),
            date,
            timeSlot,
            hospitalId
          })
        });
        showToast('Lab tests booked successfully!', 'success');
        setTimeout(() => renderLabTests(container), 1500);
      } catch(err) {
        showToast('Failed to book tests', 'error');
      } finally {
        hideSpinner('book-tests-btn');
      }
    });

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load lab tests.</p>`;
  }
};
