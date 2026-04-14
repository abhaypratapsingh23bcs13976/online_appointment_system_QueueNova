import { apiFetch, wsManager } from '../api.js';
import { showToast } from '../components/toaster.js';

export const renderDashboard = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const results = await Promise.allSettled([
      apiFetch('/auth/me'),
      apiFetch('/stats'),
      apiFetch('/family'),
      apiFetch('/prescriptions', { silent: true }),
      apiFetch('/analytics', { silent: true }),
      apiFetch('/health-metrics', { silent: true }),
      apiFetch('/lab-tests/bookings', { silent: true }),
      apiFetch('/medicines/orders', { silent: true })
    ]);

    const me = results[0].status === 'fulfilled' ? results[0].value : { user: { name: 'User' } };
    const stats = results[1].status === 'fulfilled' ? results[1].value : { upcomingCount: 0, pastCount: 0, appointments: [] };
    const family = results[2].status === 'fulfilled' ? results[2].value : [];
    const prescriptions = results[3].status === 'fulfilled' ? results[3].value : [];
    const analytics = results[4].status === 'fulfilled' ? results[4].value : {};
    const healthMetrics = results[5].status === 'fulfilled' ? results[5].value : [];
    const labBookings = results[6].status === 'fulfilled' ? results[6].value : [];
    const medicineOrders = results[7].status === 'fulfilled' ? results[7].value : [];

    const loyaltyPoints = (stats.pastCount || 0) * 120 + (stats.upcomingCount || 0) * 50;
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Calculate BMI if weight/height available
    const latestWeight = healthMetrics.find(m => m.type === 'weight');
    const latestHeight = healthMetrics.find(m => m.type === 'height');
    let bmi = null;
    if (latestWeight && latestHeight) {
      const hM = latestHeight.value / 100;
      bmi = (latestWeight.value / (hM * hM)).toFixed(1);
    }

    container.innerHTML = `
      <!-- Side Menubar -->
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <div style="width:240px; flex-shrink:0; background:var(--surface); border-radius:12px; padding:1.5rem 1rem; position:sticky; top:1rem;">
          <h3 style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:1rem;">Menu</h3>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#/dashboard" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem; background:var(--primary); color:white;"><span>📊</span> Dashboard</a></li>
            <li><a href="#/book" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>📅</span> Book Visit</a></li>
            <li><a href="#/appointments" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>📆</span> My Appointments</a></li>
            <li><a href="#/medicines" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>💊</span> Medicines</a></li>
            <li><a href="#/lab-tests" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>🧪</span> Lab Tests</a></li>
            <li><a href="#/prescriptions" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>📋</span> Prescriptions</a></li>
            <li><a href="#/health-records" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>🗂️</span> Records</a></li>
            <li><a href="#/hospitals" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>🏥</span> Hospitals</a></li>
            <li><a href="#/analytics" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>📈</span> Analytics</a></li>
            <li><a href="#/symptom-checker" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>🤖</span> AI Check</a></li>
            <li><a href="#/community" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>💬</span> Community</a></li>
            <li><a href="#/notifications" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>🔔</span> Notifications</a></li>
            <li><a href="#/settings" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:8px; color:var(--text-dark); text-decoration:none; font-size:0.9rem;"><span>⚙️</span> Settings</a></li>
          </ul>
        </div>
        <div style="flex:1;">

      <!-- Welcome Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem; margin-bottom:2.5rem;">
        <div>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.25rem;">
            <span id="live-date">📅 ${today}</span>
            <span id="live-time" style="margin-left:1rem; font-weight:600; color:var(--primary);"></span>
          </p>
          <h1 style="font-size:2.25rem; font-weight:800; letter-spacing:-1px;" id="welcome-msg">Welcome back, ${me.user.name.split(' ')[0]}! 👋</h1>
          <p style="color:var(--text-muted); margin-top:0.25rem;">Here's your health overview</p>
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <a href="#/symptom-checker" class="btn btn-primary" style="font-size:0.875rem;">🤖 AI Check</a>
          <a href="#/book" class="btn btn-outline" style="font-size:0.875rem;">📅 Book Visit</a>
          <button class="btn btn-outline" style="font-size:0.875rem;" onclick="document.getElementById('health-metrics-modal').style.display='flex'">📊 Log Vitals</button>
        </div>
      </div>

      <script>
        function updateLiveTime() {
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          document.getElementById('live-date').textContent = '📅 ' + dateStr;
          document.getElementById('live-time').textContent = '⏰ ' + timeStr;
        }
        updateLiveTime();
        setInterval(updateLiveTime, 1000);
      </script>

      <!-- Stats Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:1rem; margin-bottom:2.5rem;">
        <div class="card" style="padding:1.25rem; border-top:3px solid var(--primary); text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Health Points</div>
          <div style="font-size:1.75rem; font-weight:800; color:var(--primary); margin-top:0.5rem;">⭐ ${loyaltyPoints}</div>
        </div>
        <div class="card" style="padding:1.25rem; border-top:3px solid #3b82f6; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Upcoming</div>
          <div style="font-size:1.75rem; font-weight:800; color:#3b82f6; margin-top:0.5rem;">${stats.upcomingCount}</div>
        </div>
        <div class="card" style="padding:1.25rem; border-top:3px solid #10b981; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Completed</div>
          <div style="font-size:1.75rem; font-weight:800; color:#10b981; margin-top:0.5rem;">${stats.pastCount}</div>
        </div>
        <div class="card" style="padding:1.25rem; border-top:3px solid #f59e0b; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Active Rx</div>
          <div style="font-size:1.75rem; font-weight:800; color:#f59e0b; margin-top:0.5rem;">${prescriptions.filter(p => p.status === 'active').length}</div>
        </div>
        <div class="card" style="padding:1.25rem; border-top:3px solid #8b5cf6; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Completion</div>
          <div style="font-size:1.75rem; font-weight:800; color:#8b5cf6; margin-top:0.5rem;">${analytics.completionRate || 0}%</div>
        </div>
        <div class="card" style="padding:1.25rem; border-top:3px solid #ec4899; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">BMI ${bmi || '--'}</div>
          <div style="font-size:1.75rem; font-weight:800; color:#ec4899; margin-top:0.5rem;">${bmi ? (bmi < 18.5 ? '⬇️' : bmi > 25 ? '⬆️' : '✅') : '--'}</div>
        </div>
      </div>

      <!-- Live Queue & Active Appointments Alert -->
      ${stats.upcomingCount > 0 ? `
        <div style="background:linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius:16px; padding:1.5rem; margin-bottom:2.5rem; color:white;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="color:white; margin-bottom:0.5rem;">📢 Upcoming Appointments</h3>
              <p style="opacity:0.9; font-size:0.9rem;">You have ${stats.upcomingCount} appointment${stats.upcomingCount > 1 ? 's' : ''} scheduled</p>
            </div>
            <div style="display:flex; gap:0.75rem;">
              <button class="btn" style="background:white; color:var(--primary); border:none; font-weight:600;" onclick="document.getElementById('telemedicine-window').style.display='flex'">📹 Video Call</button>
              <button class="btn" style="background:rgba(255,255,255,0.2); color:white; border:1px solid rgba(255,255,255,0.3);" onclick="window.showQRCheckIn()">📱 QR Check-in</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Main Grid -->
      <div style="display:grid; grid-template-columns: 1fr 340px; gap:2rem; align-items:start;">
        <div>
          <!-- Appointments -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
            <h2>📋 Active Appointments</h2>
            <a href="#/appointments" class="btn btn-outline" style="font-size:0.8rem; padding:0.4rem 0.8rem;">View All History →</a>
          </div>
          <div id="appointments-list">
            <div class="spinner" style="margin: 2rem auto;"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <!-- Health Vitals Mini -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h3 style="font-size:0.95rem;">❤️ Health Vitals</h3>
              <button style="font-size:0.65rem; background:none; border:1px solid var(--border); padding:0.2rem 0.5rem; border-radius:4px; cursor:pointer;" onclick="document.getElementById('health-metrics-modal').style.display='flex'">+ Add</button>
            </div>
            ${healthMetrics.length === 0 
              ? '<p style="color:var(--text-muted); font-size:0.75rem;">No vitals logged yet.</p>'
              : `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
                ${healthMetrics.slice(0, 4).map(m => `
                  <div style="background:var(--surface-hover); padding:0.5rem; border-radius:6px; text-align:center;">
                    <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">${m.type}</div>
                    <div style="font-size:0.95rem; font-weight:700; color:var(--text-dark);">${m.value} ${m.unit}</div>
                  </div>
                `).join('')}
              </div>`
            }
          </div>

          <!-- Family -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h3 style="font-size:0.95rem;">👨‍👩‍👧 Family</h3>
              <button style="font-size:0.65rem; background:none; border:1px solid var(--border); padding:0.2rem 0.5rem; border-radius:4px; cursor:pointer;" onclick="document.getElementById('family-modal').style.display='flex'">+ Add</button>
            </div>
            <ul id="family-list" style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;"></ul>
          </div>

          <!-- Recent Rx Mini -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h3 style="font-size:0.95rem;">💊 Recent Rx</h3>
              <a href="#/prescriptions" style="color:var(--primary); font-size:0.7rem; text-decoration:none; font-weight:600;">View All →</a>
            </div>
            ${prescriptions.length === 0
              ? '<p style="color:var(--text-muted); font-size:0.75rem;">No prescriptions yet.</p>'
              : prescriptions.slice(0, 2).map(rx => `
                <div style="padding:0.4rem 0; border-bottom:1px solid var(--border);">
                  <p style="color:var(--text-dark); font-size:0.8rem; font-weight:600;">${rx.diagnosis}</p>
                  <p style="color:var(--text-muted); font-size:0.65rem;">${rx.doctor?.name || 'Doctor'}</p>
                </div>
              `).join('')}
          </div>

          <!-- Total Spend -->
          <div class="card" style="padding:1.25rem; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white;">
            <h3 style="font-size:0.95rem; margin-bottom:0.5rem; color:white;">💰 Total Spend</h3>
            <div style="font-size:1.75rem; font-weight:800;">₹${(analytics.totalSpend || 0).toLocaleString('en-IN')}</div>
            <p style="font-size:0.7rem; opacity:0.8; margin-top:0.25rem;">${analytics.completed || 0} completed visits</p>
          </div>
        </div>
      </div>

      <!-- QR Check-in Modal -->
      <div id="qr-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="text-align:center;">
          <h3 style="margin-bottom:1rem;">📱 QR Check-in</h3>
          <div id="qr-display" style="margin:1.5rem auto; width:200px; height:200px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; border:2px solid var(--border);">
            <div style="font-size:4rem;">📱</div>
          </div>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">Show this QR code at the hospital reception</p>
          <button class="btn btn-primary" onclick="document.getElementById('qr-modal').style.display='none'">Close</button>
        </div>
      </div>

      <!-- Health Metrics Modal -->
      <div id="health-metrics-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
          <h3 style="margin-bottom:1.5rem;">📊 Log Health Vitals</h3>
          <form id="health-metrics-form">
            <div class="form-group">
              <label>Type</label>
              <select id="hm-type" class="input-field" required>
                <option value="weight">Weight (kg)</option>
                <option value="height">Height (cm)</option>
                <option value="bloodPressure">Blood Pressure (mmHg)</option>
                <option value="heartRate">Heart Rate (bpm)</option>
                <option value="temperature">Temperature (°F)</option>
                <option value="bloodSugar">Blood Sugar (mg/dL)</option>
                <option value="oxygen">Oxygen Level (%)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Value</label>
              <input type="number" id="hm-value" class="input-field" step="0.1" required>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="hm-date" class="input-field" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-outline" style="flex:1;" onclick="document.getElementById('health-metrics-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary" style="flex:1;">Save</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Lab Tests Modal -->
      <div id="lab-tests-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width:500px;">
          <h3 style="margin-bottom:1rem;">🧪 Book Lab Tests</h3>
          <div id="lab-tests-list" style="max-height:300px; overflow-y:auto; margin-bottom:1rem;"></div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Select tests and book your appointment</p>
          <button class="btn btn-outline" style="width:100%;" onclick="document.getElementById('lab-tests-modal').style.display='none'">Close</button>
        </div>
      </div>

      <!-- Medicine Order Modal -->
      <div id="medicine-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width:500px;">
          <h3 style="margin-bottom:1rem;">💉 Order Medicines</h3>
          <div id="medicines-list" style="max-height:300px; overflow-y:auto; margin-bottom:1rem;"></div>
          <button class="btn btn-outline" style="width:100%;" onclick="document.getElementById('medicine-modal').style.display='none'">Close</button>
        </div>
      </div>

      <!-- Family Modal -->
      <div id="family-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0;">Add Family Member</h3>
            <button type="button" onclick="document.getElementById('family-modal').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
          </div>
          <form id="add-family-form">
            <div style="background: linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.08)); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(79,70,229,0.15);">
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.75rem 0; font-weight: 500;">BASIC INFORMATION</p>
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="fm-name" class="input-field" placeholder="Enter full name" required>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label>Relationship *</label>
                  <select id="fm-relation" class="input-field" required>
                    <option value="">Select relation</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Gender</label>
                  <select id="fm-gender" class="input-field">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label>Date of Birth</label>
                  <input type="date" id="fm-dob" class="input-field">
                </div>
                <div class="form-group">
                  <label>Blood Type</label>
                  <select id="fm-blood" class="input-field">
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border);">
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.75rem 0; font-weight: 500;">CONTACT INFORMATION</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" id="fm-phone" class="input-field" placeholder="+91 XXXXX XXXXX">
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" id="fm-email" class="input-field" placeholder="email@example.com">
                </div>
              </div>
              <div class="form-group">
                <label>Emergency Contact</label>
                <input type="tel" id="fm-emergency" class="input-field" placeholder="Emergency contact number">
              </div>
            </div>
            
            <div style="background: rgba(239,68,68,0.05); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(239,68,68,0.15);">
              <p style="font-size: 0.8rem; color: #dc2626; margin: 0 0 0.75rem 0; font-weight: 500;">MEDICAL INFORMATION (Optional)</p>
              <div class="form-group">
                <label>Known Allergies</label>
                <textarea id="fm-allergies" class="input-field" rows="2" placeholder="e.g., Penicillin, Pollen, Dust"></textarea>
              </div>
              <div class="form-group">
                <label>Medical Conditions</label>
                <textarea id="fm-medical" class="input-field" rows="2" placeholder="e.g., Diabetes, Hypertension, Asthma"></textarea>
              </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" style="flex: 1; padding: 0.875rem;" onclick="document.getElementById('family-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary" style="flex: 1; padding: 0.875rem;">Save Member</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reschedule Modal -->
      <div id="reschedule-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <h3 style="margin-bottom: 1.5rem;">Reschedule Appointment</h3>
          <form id="reschedule-form">
            <input type="hidden" id="rs-id">
            <div class="form-group">
              <label>New Date</label>
              <input type="date" id="rs-date" class="input-field" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label>New Time Slot</label>
              <select id="rs-time" class="input-field" required>
                <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
                <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                <option value="13:00-14:00">01:00 PM - 02:00 PM</option>
                <option value="14:00-15:00">02:00 PM - 03:00 PM</option>
                <option value="15:00-16:00">03:00 PM - 04:00 PM</option>
              </select>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button type="button" class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('reschedule-modal').style.display='none'">Cancel</button>
              <button type="submit" id="rs-btn" class="btn btn-primary" style="flex: 1;">Update</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Render appointments - show only active
    let globalAppts = (stats.appointments || []).filter(a => a.status === 'active');
    let displayedAppts = 5;

    const renderAppts = (list, reset = false) => {
      if (reset) displayedAppts = 5;
      const toShow = list.slice(0, displayedAppts);
      const hasMore = list.length > displayedAppts;
      
      const apptsHTML = (!list || list.length === 0)
        ? '<div class="card" style="text-align:center; padding:2rem;"><div style="font-size:2.5rem; margin-bottom:0.75rem;">📭</div><p style="color:var(--text-muted);">No active appointments. <a href="#/book" style="color:var(--primary);">Book one now.</a></p></div>'
        : toShow.map(a => `
          <div class="card" style="margin-bottom:0.75rem; padding:1rem; opacity:${a.status==='cancelled'?0.6:1}; ${a.status === 'active' ? 'border-left:3px solid var(--primary);':''}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
              <div>
                <h4 style="color:var(--text-dark); margin-bottom:0.2rem; font-size:0.95rem;">${a.service?.name || 'Service'} with ${a.doctor?.name || 'Doctor'}</h4>
                <div style="display:flex; gap:0.75rem; font-size:0.75rem; color:var(--text-muted); flex-wrap:wrap;">
                  <span>📅 ${a.date ? new Date(a.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'N/A'}</span>
                  <span>⏰ ${a.timeSlot || 'N/A'}</span>
                  ${a.familyMemberId ? '<span>👥 Family</span>' : ''}
                </div>
              </div>
              <span style="padding:0.15rem 0.5rem; border-radius:50px; font-size:0.6rem; font-weight:700; background:${a.status === 'active' ? '#d1fae5' : a.status === 'completed' ? '#dbeafe' : '#fee2e2'}; color:${a.status === 'active' ? '#065f46' : a.status === 'completed' ? '#1e40af' : '#991b1b'};">${a.status}</span>
            </div>
            ${a.status === 'active' ? `
              <div style="display:flex; gap:0.4rem; margin-top:0.5rem; flex-wrap:wrap;">
                <button class="btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background:#10b981; color:white; border:none;" onclick="document.getElementById('telemedicine-window').style.display='flex'">📹 Video</button>
                <button class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.7rem; border:none;" onclick="window.showQRCheckIn('${a.id}')">📱 QR</button>
                <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.7rem;" onclick="window.editAppointment('${a.id}', '${a.date}', '${a.timeSlot}')">✏️ Edit</button>
                <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.7rem;" onclick="window.cancelAppointment('${a.id}')">✗</button>
              </div>
            ` : ''}
          </div>
        `).join('') + (hasMore ? `
          <button class="btn btn-outline" id="load-more-appts" style="width:100%; margin-top:0.5rem;">Load More (${list.length - displayedAppts} more)</button>
        ` : '');
      
      document.getElementById('appointments-list').innerHTML = apptsHTML;
      
      if (hasMore) {
        document.getElementById('load-more-appts')?.addEventListener('click', () => {
          displayedAppts += 5;
          renderAppts(list);
        });
      }
    };
    
    renderAppts(globalAppts, true);

    // Filters
    // Family
    document.getElementById('family-list').innerHTML = family.length === 0
      ? '<li style="font-size:0.75rem; color:var(--text-muted)">No members added.</li>'
      : family.map(f => `
        <li style="padding:0.6rem 0.75rem; background:var(--surface-hover); border-radius:10px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
          <div>
            <strong style="color:var(--text-dark); font-weight:600;">${f.name}</strong>
            <span style="color:var(--text-muted); font-size:0.7rem; margin-left:0.5rem;">${f.relation}</span>
            ${f.bloodType ? `<span style="background:var(--danger); color:white; padding:0.1rem 0.4rem; border-radius:4px; font-size:0.65rem; margin-left:0.5rem;">${f.bloodType}</span>` : ''}
            ${f.gender ? `<span style="color:var(--text-muted); font-size:0.7rem; margin-left:0.5rem;">${f.gender}</span>` : ''}
          </div>
          <button onclick="deleteFamilyMember('${f.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem; padding:0.25rem;" title="Remove">🗑️</button>
        </li>
      `).join('');
    
    window.deleteFamilyMember = async (id) => {
      if (!confirm('Remove this family member?')) return;
      try {
        await apiFetch('/family/' + id, { method: 'DELETE' });
        showToast('Family member removed');
        renderDashboard(container);
      } catch(e) {
        showToast('Failed to remove', 'error');
      }
    };

    // Family Form
    document.getElementById('add-family-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/family', { 
          method: 'POST', 
          body: JSON.stringify({ 
            name: document.getElementById('fm-name').value, 
            relation: document.getElementById('fm-relation').value,
            dateOfBirth: document.getElementById('fm-dob').value || null,
            gender: document.getElementById('fm-gender').value || null,
            bloodType: document.getElementById('fm-blood').value || null,
            phone: document.getElementById('fm-phone').value || null,
            email: document.getElementById('fm-email').value || null,
            emergencyContact: document.getElementById('fm-emergency').value || null,
            allergies: document.getElementById('fm-allergies').value || '',
            medicalConditions: document.getElementById('fm-medical').value || ''
          }) 
        });
        showToast('Family member added successfully!');
        document.getElementById('family-modal').style.display = 'none';
        renderDashboard(container);
      } catch(e) {
        showToast('Failed to add family member', 'error');
      }
    });

    // Health Metrics Form
    document.getElementById('health-metrics-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const typeMap = { 'bloodPressure': 'BP', 'heartRate': 'HR', 'temperature': 'Temp', 'bloodSugar': 'Sugar', 'oxygen': 'SpO2' };
      const type = document.getElementById('hm-type').value;
      const unitMap = { 'weight': 'kg', 'height': 'cm', 'bloodPressure': 'mmHg', 'heartRate': 'bpm', 'temperature': '°F', 'bloodSugar': 'mg/dL', 'oxygen': '%' };
      try {
        await apiFetch('/health-metrics', { 
          method: 'POST', 
          body: JSON.stringify({ 
            type: typeMap[type] || type, 
            value: parseFloat(document.getElementById('hm-value').value),
            unit: unitMap[type],
            date: document.getElementById('hm-date').value
          }) 
        });
        showToast('Vitals logged successfully.');
        document.getElementById('health-metrics-modal').style.display = 'none';
        renderDashboard(container);
      } catch(e) {}
    });

    // Load Lab Tests
    try {
      const labTests = await apiFetch('/lab-tests');
      document.getElementById('lab-tests-list').innerHTML = labTests.map(t => `
        <div style="padding:0.75rem; border:1px solid var(--border); border-radius:8px; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${t.category} • ${t.duration}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; color:var(--primary);">₹${t.price}</div>
          </div>
        </div>
      `).join('');
    } catch(e) {}

    // Load Medicines
    try {
      const medicines = await apiFetch('/medicines');
      document.getElementById('medicines-list').innerHTML = medicines.map(m => `
        <div style="padding:0.75rem; border:1px solid var(--border); border-radius:8px; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${m.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${m.manufacturer} • ${m.requiresPrescription ? 'Rx Required' : 'OTC'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; color:var(--primary);">₹${m.price}</div>
            <div style="font-size:0.65rem; color:${m.inStock ? '#10b981' : '#ef4444'};">${m.inStock ? '✓ In Stock' : 'Out of Stock'}</div>
          </div>
        </div>
      `).join('');
    } catch(e) {}

  } catch(err) {
    // Shared error handling in apiFetch will handle redirections
    console.error('Dashboard load error:', err);
  }

  // Global handlers
  window.cancelAppointment = async (id) => {
    if(!confirm("Cancel this appointment?")) return;
    try {
      await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
      showToast('Appointment cancelled');
      renderDashboard(container);
    } catch(err) {}
  };

  window.editAppointment = (id, curDate, curTime) => {
    document.getElementById('rs-id').value = id;
    document.getElementById('rs-date').value = curDate;
    document.getElementById('rs-time').value = curTime;
    document.getElementById('reschedule-modal').style.display = 'flex';
  };

  window.showQRCheckIn = async (apptId) => {
    if (!apptId) {
      const activeAppt = globalAppts?.find(a => a.status === 'active');
      apptId = activeAppt?.id;
    }
    if (!apptId) {
      showToast('No active appointment found');
      return;
    }
    try {
      const qrData = await apiFetch(`/appointments/${apptId}/qr`);
      document.getElementById('qr-display').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.qrCode)}" alt="QR Code" style="width:180px; height:180px;">`;
      document.getElementById('qr-modal').style.display = 'flex';
    } catch(e) {
      showToast('Could not generate QR code');
    }
  };

  document.getElementById('reschedule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rs-id').value;
    const date = document.getElementById('rs-date').value;
    const timeSlot = document.getElementById('rs-time').value;
    try {
      await apiFetch(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ date, timeSlot }) });
      showToast('Appointment rescheduled.');
      document.getElementById('reschedule-modal').style.display = 'none';
      renderDashboard(container);
    } catch(err) {}
  });
};
