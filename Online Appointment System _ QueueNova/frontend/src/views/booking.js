import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderBooking = async (container) => {
  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = `
      <div style="text-align:center; padding:4rem 2rem; max-width:500px; margin:0 auto;">
        <div style="font-size:4rem; margin-bottom:1rem;">🔐</div>
        <h2 style="margin-bottom:1rem;">Login Required</h2>
        <p style="color:var(--text-muted); margin-bottom:2rem;">Please login or create an account to book an appointment.</p>
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
          <a href="#/login" class="btn btn-primary" style="padding:0.75rem 2rem;">Login</a>
          <a href="#/signup" class="btn btn-outline" style="padding:0.75rem 2rem;">Create Account</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const [services, doctorsResponse, family] = await Promise.all([
      apiFetch('/services'),
      apiFetch('/doctors'),
      apiFetch('/family').catch(() => [])
    ]);

    container.innerHTML = `
      <div class="booking-container">
        <!-- Modern Progress Stepper -->
        <div class="stepper">
          <div class="step active" data-step="1">
            <div class="step-circle">1</div>
            <span class="step-label">Service</span>
          </div>
          <div class="step-connector"></div>
          <div class="step" data-step="2">
            <div class="step-circle">2</div>
            <span class="step-label">Doctor</span>
          </div>
          <div class="step-connector"></div>
          <div class="step" data-step="3">
            <div class="step-circle">3</div>
            <span class="step-label">Schedule</span>
          </div>
          <div class="step-connector"></div>
          <div class="step" data-step="4">
            <div class="step-circle">4</div>
            <span class="step-label">Confirm</span>
          </div>
        </div>

        <!-- Step 1: Service Selection -->
        <div class="booking-step active" data-step="1">
          <div class="card" style="padding:2.5rem; border-radius:24px;">
            <div class="section-title">🏥 Select Service</div>
            <p style="color:var(--text-muted); margin-bottom:2rem;">Choose the type of consultation you need</p>
            
            <div style="position:relative; margin-bottom:1.5rem;">
               <input type="text" id="service-search" class="input-field" placeholder="Search services..." style="padding-left:3rem;">
               <span style="position:absolute; left:1.25rem; top:50%; transform:translateY(-50%); opacity:0.5;">🔍</span>
            </div>
            
            <div class="service-grid" id="services-grid">
              ${services.map(s => `
                <div class="premium-card service-card" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}" data-duration="${s.duration}">
                  <div class="card-content">
                    <h4 style="margin-bottom:1rem; font-size:1.1rem;">${s.name}</h4>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="badge-pill badge-time">⏱️ ${s.duration}m</span>
                      <span class="badge-pill badge-price">₹${s.price}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- AI Magic Box -->
            <div class="ai-magic-box">
              <div class="ai-inner">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <span style="font-size:1.25rem;">✨</span>
                  <span style="font-weight:700; color:var(--primary);">AI Assistant Matcher</span>
                </div>
                <input type="text" id="ai-symptom" class="input-field" placeholder="Describe how you're feeling (e.g., severe headache)...">
                <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Describe your symptoms and our AI will select the right specialist for you automatically.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Doctor Selection -->
        <div class="booking-step" data-step="2">
          <div class="card" style="padding:2.5rem; border-radius:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
              <div class="section-title">👨‍⚕️ Select Doctor</div>
              <button class="btn btn-outline" id="back-step-2" style="padding:0.5rem 1rem; border-radius:12px;">← Back</button>
            </div>
            <p style="color:var(--text-muted); margin-bottom:2rem;">Pick your preferred specialist</p>
            
            <input type="text" id="doctor-search" class="input-field" placeholder="🔍 Search doctors..." style="margin-bottom:1.5rem;">
            
            <div class="service-grid" id="doctors-grid">
              ${doctorsResponse.map(d => `
                <div class="premium-card doctor-card" data-id="${d.id}" data-specialty="${d.specialty}">
                  <div class="card-content">
                    <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;">
                      <div class="avatar" style="width:50px; height:50px; font-size:1.2rem;">${d.name.split(' ').pop()[0]}</div>
                      <div>
                        <h4 style="font-size:1rem; margin:0;">${d.name}</h4>
                        <span style="font-size:0.8rem; font-weight:700; color:var(--primary);">${d.specialty}</span>
                      </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
                      <span>⭐ ${d.rating} Rating</span>
                      <span>${d.experienceYears}y Exp</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Step 3: Schedule -->
        <div class="booking-step" data-step="3">
          <div class="card" style="padding:2.5rem; border-radius:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
              <div class="section-title">📅 Choose Schedule</div>
              <button class="btn btn-outline" id="back-step-3" style="padding:0.5rem 1rem; border-radius:12px;">← Back</button>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
              <div>
                <label style="font-weight:700; display:block; margin-bottom:0.75rem;">1. Select Date</label>
                <input type="date" id="date" class="input-field" min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div>
                <label style="font-weight:700; display:block; margin-bottom:0.75rem;">2. Patient</label>
                <select id="family" class="input-field">
                  <option value="">Myself (Default)</option>
                </select>
              </div>
            </div>
            
            <div style="margin-top:2rem;">
              <label style="font-weight:700; display:block; margin-bottom:1rem;">3. Available Slots</label>
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:0.75rem;" id="time-grid">
                <button type="button" class="btn time-slot" data-time="09:00-10:00">09:00 AM</button>
                <button type="button" class="btn time-slot" data-time="10:00-11:00">10:00 AM</button>
                <button type="button" class="btn time-slot" data-time="11:00-12:00" style="opacity:0.5; cursor:not-allowed;" disabled>11:00 AM</button>
                <button type="button" class="btn time-slot" data-time="14:00-15:00">02:00 PM</button>
                <button type="button" class="btn time-slot" data-time="15:00-16:00">03:00 PM</button>
                <button type="button" class="btn time-slot" data-time="16:00-17:00">04:00 PM</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div class="booking-step" data-step="4">
          <div class="card" style="padding:2.5rem; border-radius:24px;">
             <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
              <div class="section-title">✅ Review & Confirm</div>
              <button class="btn btn-outline" id="back-step-4" style="padding:0.5rem 1rem; border-radius:12px;">← Back</button>
            </div>
            
            <div style="background:var(--surface-hover); border:1px solid var(--border); padding:2rem; border-radius:20px; margin-bottom:2rem; display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
               <div class="summary-item">
                  <span style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Service Type</span>
                  <span id="summary-service" style="font-weight:600; font-size:1.1rem;">-</span>
               </div>
               <div class="summary-item">
                  <span style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Specialist</span>
                  <span id="summary-doctor" style="font-weight:600; font-size:1.1rem;">-</span>
               </div>
               <div class="summary-item">
                  <span style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Appointment Date</span>
                  <span id="summary-date" style="font-weight:600; font-size:1.1rem;">-</span>
               </div>
               <div class="summary-item">
                  <span style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Time Slot</span>
                  <span id="summary-time" style="font-weight:600; font-size:1.1rem;">-</span>
               </div>
               <div class="summary-item" style="grid-column: span 2; padding-top:1rem; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:700;">Total Consultation Fee</span>
                  <span id="summary-fee" style="font-size:1.5rem; font-weight:800; color:var(--primary);">₹0</span>
               </div>
            </div>
            
            <div class="form-group">
              <label style="font-weight:700;">Medical Notes (Brief)</label>
              <textarea id="notes" class="input-field" rows="3" placeholder="Share any specific symptoms or medical history..."></textarea>
            </div>
            
            <label style="display:flex; align-items:center; gap:0.75rem; padding:1rem; background:rgba(129, 140, 248, 0.05); border-radius:12px; margin: 1.5rem 0; cursor:pointer;">
              <input type="checkbox" id="terms" style="width:20px; height:20px; border-radius:6px;">
              <span style="font-size:0.85rem; color:var(--text-muted);">Confirm that all information provided is accurate and agree to terms.</span>
            </label>

            <button type="button" id="submit-booking" class="btn btn-primary" style="width:100%; padding:1.25rem; font-size:1.1rem; border-radius:16px;">Complete Secure Booking</button>
          </div>
        </div>

        <!-- Hidden inputs -->
        <input type="hidden" id="selected-service">
        <input type="hidden" id="selected-doctor">
        <input type="hidden" id="time">
      </div>
    `;

    // Add step progress styles
    const style = document.createElement('style');
    style.textContent = `
      .step-indicator { display:flex; flex-direction:column; align-items:center; gap:0.25rem; }
      .step-indicator span { width:36px; height:36px; border-radius:50%; background:var(--border); color:var(--text-muted); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; transition:all 0.3s; }
      .step-indicator p { font-size:0.7rem; color:var(--text-muted); margin:0; }
      .step-indicator.active span { background:var(--primary); color:white; }
      .step-indicator.active p { color:var(--primary); font-weight:600; }
      .step-indicator.completed span { background:var(--success); color:white; }
      .step-line { width:40px; height:2px; background:var(--border); transition:all 0.3s; }
      .step-line.active { background:var(--primary); }
      .booking-step { display:none; animation: fadeIn 0.3s ease; }
      .booking-step.active { display:block; }
      .service-card:hover, .doctor-card:hover { border-color:var(--primary) !important; transform:translateY(-2px); }
      .service-card.selected, .doctor-card.selected { border-color:var(--primary) !important; background:rgba(79,70,229,0.05); }
      .time-slot.selected { background:var(--primary) !important; color:white !important; border-color:var(--primary) !important; }
    `;
    document.head.appendChild(style);

    let globalDoctors = doctorsResponse;
    let globalServices = services;
    let selectedService = null;
    let selectedDoctor = null;

    // Step navigation
    const goToStep = (step) => {
      document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
      document.querySelector(`.booking-step[data-step="${step}"]`).classList.add('active');
      
      document.querySelectorAll('.step-indicator').forEach((ind, i) => {
        ind.classList.remove('active', 'completed');
        if (i + 1 < step) ind.classList.add('completed');
        if (i + 1 === step) ind.classList.add('active');
      });
      document.querySelectorAll('.step-line').forEach((line, i) => {
        line.classList.toggle('active', i + 1 < step);
      });

      if (step === 4) updateSummary();
    };

    // Service selection
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', function() {
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedService = {
          id: this.dataset.id,
          name: this.dataset.name,
          price: parseInt(this.dataset.price),
          duration: parseInt(this.dataset.duration)
        };
        document.getElementById('selected-service').value = this.dataset.id;
      });
    });

    // Service search
    document.getElementById('service-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = globalServices.filter(s => s.name.toLowerCase().includes(term));
      document.getElementById('services-grid').innerHTML = filtered.map(s => `
        <div class="premium-card service-card" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}" data-duration="${s.duration}">
          <div class="card-content">
            <h4 style="margin-bottom:1rem; font-size:1.1rem;">${s.name}</h4>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge-pill badge-time">⏱️ ${s.duration}m</span>
              <span class="badge-pill badge-price">₹${s.price}</span>
            </div>
          </div>
        </div>
      `).join('');
      
      document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function() {
          document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          selectedService = {
            id: this.dataset.id,
            name: this.dataset.name,
            price: parseInt(this.dataset.price),
            duration: parseInt(this.dataset.duration)
          };
          document.getElementById('selected-service').value = this.dataset.id;
        });
      });
    });

    // AI Symptom Matcher
    const symptomMap = {
      'headache': { specialty: 'General Physician', service: 'General Checkup' },
      'fever': { specialty: 'General Physician', service: 'General Checkup' },
      'heart': { specialty: 'Cardiologist', service: 'Cardiac Consultation' },
      'chest pain': { specialty: 'Cardiologist', service: 'Cardiac Consultation' },
      'child': { specialty: 'Pediatrician', service: 'Pediatric Visit' },
      'skin': { specialty: 'Dermatologist', service: 'Dermatology Checkup' },
      'acne': { specialty: 'Dermatologist', service: 'Dermatology Checkup' },
      'bone': { specialty: 'Orthopedic Surgeon', service: 'Orthopedic Consultation' },
      'nerve': { specialty: 'Neurologist', service: 'Neurology Consultation' }
    };

    document.getElementById('ai-symptom').addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      if (!val) return;
      
      for (let s in symptomMap) {
        if (val.includes(s)) {
          const match = symptomMap[s];
          const serviceCard = document.querySelector(`.premium-card[data-name*="${match.service.split(' ')[0]}"]`);
          if (serviceCard) serviceCard.click();
          
          const doctorCard = document.querySelector(`.doctor-card[data-specialty="${match.specialty}"]`);
          if (doctorCard) {
            setTimeout(() => doctorCard.click(), 100);
          }
          showToast(`AI suggested: ${match.specialty}`, 'success');
          break;
        }
      }
    });

    // Doctor selection
    document.querySelectorAll('.doctor-card').forEach(card => {
      card.addEventListener('click', function() {
        document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedDoctor = {
          id: this.dataset.id,
          specialty: this.dataset.specialty
        };
        document.getElementById('selected-doctor').value = this.dataset.id;
      });
    });

    // Doctor search
    document.getElementById('doctor-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = globalDoctors.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.specialty.toLowerCase().includes(term)
      );
      document.getElementById('doctors-grid').innerHTML = filtered.map(d => `
        <div class="premium-card doctor-card" data-id="${d.id}" data-specialty="${d.specialty}">
          <div class="card-content">
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;">
              <div class="avatar" style="width:50px; height:50px; font-size:1.2rem;">${d.name.split(' ').pop()[0]}</div>
              <div>
                <h4 style="font-size:1rem; margin:0;">${d.name}</h4>
                <span style="font-size:0.8rem; font-weight:700; color:var(--primary);">${d.specialty}</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
              <span>⭐ ${d.rating} Rating</span>
              <span>${d.experienceYears}y Exp</span>
            </div>
          </div>
        </div>
      `).join('');
      
      document.querySelectorAll('.doctor-card').forEach(card => {
        card.addEventListener('click', function() {
          document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          selectedDoctor = {
            id: this.dataset.id,
            specialty: this.dataset.specialty
          };
          document.getElementById('selected-doctor').value = this.dataset.id;
        });
      });
    });

    // Populate family
    const familySelect = document.getElementById('family');
    family.forEach(f => {
      const option = document.createElement('option');
      option.value = f.id;
      option.textContent = f.name;
      familySelect.appendChild(option);
    });

    // Handle preselected doctor from URL
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDoctorId = urlParams.get('doctorId');
    if (preselectedDoctorId) {
      const card = document.querySelector(`.doctor-card[data-id="${preselectedDoctorId}"]`);
      if (card) {
        setTimeout(() => card.click(), 500);
      }
    }

    // Time slot selection
    const timeInput = document.getElementById('time');
    document.querySelectorAll('.time-slot:not([disabled])').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        timeInput.value = this.dataset.time;
      });
    });

    // Navigation buttons
    document.getElementById('back-step-2')?.addEventListener('click', () => goToStep(1));
    document.getElementById('back-step-3')?.addEventListener('click', () => goToStep(2));
    document.getElementById('back-step-4')?.addEventListener('click', () => goToStep(3));

    // Update summary
    const updateSummary = () => {
      const doctor = globalDoctors.find(d => d.id === selectedDoctor?.id);
      document.getElementById('summary-service').textContent = selectedService?.name || '-';
      document.getElementById('summary-doctor').textContent = doctor?.name || '-';
      document.getElementById('summary-date').textContent = document.getElementById('date').value || '-';
      document.getElementById('summary-time').textContent = timeInput.value || '-';
      document.getElementById('summary-patient').textContent = familySelect.value ? family.find(f => f.id === familySelect.value)?.name : 'Myself';
      document.getElementById('summary-fee').textContent = `₹${doctor?.consultationFee || selectedService?.price || 0}`;
    };

    // Add continue buttons to advance steps
    const addContinueButtons = () => {
      // Add continue button to step 1
      const step1 = document.querySelector('.booking-step[data-step="1"] .card');
      if (step1 && !step1.querySelector('.continue-btn-1')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary continue-btn-1';
        btn.style.width = '100%';
        btn.style.marginTop = '1.5rem';
        btn.textContent = 'Continue to Doctor Selection →';
        btn.onclick = () => {
          if (!selectedService) {
            return showToast('Please select a service', 'error');
          }
          goToStep(2);
        };
        step1.appendChild(btn);
      }

      // Add continue button to step 2
      const step2 = document.querySelector('.booking-step[data-step="2"] .card');
      if (step2 && !step2.querySelector('.continue-btn-2')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary continue-btn-2';
        btn.style.width = '100%';
        btn.style.marginTop = '1.5rem';
        btn.textContent = 'Continue to Schedule →';
        btn.onclick = () => {
          if (!selectedDoctor) {
            return showToast('Please select a doctor', 'error');
          }
          goToStep(3);
        };
        step2.appendChild(btn);
      }

      // Add continue button to step 3
      const step3 = document.querySelector('.booking-step[data-step="3"] .card');
      if (step3 && !step3.querySelector('.continue-btn-3')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary continue-btn-3';
        btn.style.width = '100%';
        btn.style.marginTop = '1.5rem';
        btn.textContent = 'Continue to Confirm →';
        btn.onclick = () => {
          const date = document.getElementById('date').value;
          if (!date) {
            return showToast('Please select a date', 'error');
          }
          if (!timeInput.value) {
            return showToast('Please select a time slot', 'error');
          }
          goToStep(4);
        };
        step3.appendChild(btn);
      }
    };

    setTimeout(addContinueButtons, 100);

    // Form Submit
    document.getElementById('submit-booking').addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to book an appointment', 'error');
        setTimeout(() => window.location.hash = '#/login', 1500);
        return;
      }

      const serviceId = document.getElementById('selected-service').value;
      const doctorId = document.getElementById('selected-doctor').value;
      const date = document.getElementById('date').value;
      const timeSlot = document.getElementById('time').value;
      const familyMemberId = document.getElementById('family').value;
      const notes = document.getElementById('notes').value;

      if (!serviceId) {
        return showToast('Please select a service', 'error');
      }
      if (!doctorId) {
        return showToast('Please select a doctor', 'error');
      }
      if (!date) {
        return showToast('Please select a date', 'error');
      }
      if (!timeSlot) {
        return showToast('Please select a time slot', 'error');
      }
      if (!document.getElementById('terms').checked) {
        return showToast('Please agree to the terms and conditions', 'error');
      }

      showSpinner('submit-booking');
      try {
        await apiFetch('/appointments', {
          method: 'POST',
          body: JSON.stringify({ 
            serviceId, 
            doctorId, 
            date, 
            timeSlot, 
            familyMemberId: familyMemberId || null,
            notes 
          })
        });
        showToast('Appointment booked successfully!', 'success');
        setTimeout(() => window.location.hash = '#/dashboard', 2000);
      } catch(err) {
        showToast('Failed to book appointment', 'error');
      } finally {
        hideSpinner('submit-booking');
      }
    });

  } catch(err) {
    console.error('Booking page error:', err);
    container.innerHTML = `<p style="color:var(--danger); text-align:center; padding:2rem;">Failed to load booking page. Please refresh and try again.</p>`;
  }
};
