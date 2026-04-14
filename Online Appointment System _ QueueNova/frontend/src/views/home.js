import { apiFetch } from '../api.js';

const initials = (name) => name.replace('Dr.', '').trim().split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

export const renderHome = async (container) => {
  // Fetch dynamic doctors for the bonus section
  let doctorsHTML = '<p style="color:var(--text-muted)">Loading live doctors preview...</p>';
  let doctorsArray = [];
  try {
    const doctorsRes = await apiFetch('/doctors', { silent: true });
    doctorsArray = Array.isArray(doctorsRes) ? doctorsRes : [];
    if(doctorsArray.length > 0) {
      doctorsHTML = doctorsArray.slice(0, 4).map(d => {
        const initials = d.name.replace('Dr.', '').trim().split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        // Generate a soft mesh gradient based on name
        const hue = d.name.length * 137.5 % 360;
        const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 40) % 360}, 70%, 60%))`;
        
        return `
          <div class="specialist-card-v2">
            <div class="specialist-header-gradient" style="background: ${gradient}">
              <div class="specialist-avatar-wrap">
                ${initials}
              </div>
            </div>
            <div class="specialist-body">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1rem;">
                <div>
                  <span class="specialist-tag">${d.specialty}</span>
                  <h4 style="color: var(--text-dark); margin:0; font-size:1.25rem;">${d.name}</h4>
                </div>
                <div class="live-indicator">Live Slots</div>
              </div>
              
              <div style="display:flex; gap:1.5rem; margin-bottom:1.5rem; font-size:0.85rem; color:var(--text-muted); font-weight:600;">
                <span>⭐ ${d.rating} Rating</span>
                <span>${d.experience}yrs Exp</span>
              </div>
              
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.6; opacity:0.8;">Expert specialist providing compassionate care in modern ${d.specialty.toLowerCase()} treatments and dedicated family health services.</p>
              
              <a href="#/signup" class="btn btn-primary" style="margin-top:auto; padding: 0.875rem; border-radius:14px; width:100%; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);">Book Consultation</a>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch(e) {
    doctorsHTML = '<p style="color:var(--text-muted); text-align:center; padding:2rem;">Unable to load doctors. Please refresh the page.</p>';
  }

  container.innerHTML = `
    <div style="font-family: var(--font-main); color: var(--text-dark); display: flex; flex-direction: column; gap: 5.5rem; margin-bottom: 0;">
      
      <!-- 1. HERO SECTION -->
      <section style="position: relative; border-radius: 24px; overflow: hidden; min-height: 650px; display: flex; align-items: center; justify-content: center; text-align: center; color: white; margin-top: 0.5rem; box-shadow: var(--shadow-lg);">
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80') center/cover; z-index: 1;"></div>
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.7) 100%); z-index: 2;"></div>
        <div style="position: relative; z-index: 3; padding: 2rem; max-width: 900px; width: 100%;">
          <span style="display:inline-block; padding:0.6rem 1.25rem; background:rgba(79,70,229,0.2); color:#a5b4fc; border-radius:50px; font-weight:600; font-size:0.875rem; margin-bottom:1.5rem; border:1px solid rgba(129,140,248,0.3); backdrop-filter: blur(4px);">🚀 The Future of Healthcare</span>
          <h1 style="font-size: clamp(3rem, 5vw, 4.5rem); font-weight: 800; margin-bottom: 1.5rem; line-height: 1.1; letter-spacing:-1px; color: white;">Book Appointments in Seconds — <span style="color:var(--primary);">No Waiting Lines.</span></h1>
          <p style="font-size: 1.25rem; color: #e2e8f0; margin-bottom: 3.5rem; max-width:650px; margin-left:auto; margin-right:auto; line-height: 1.6;">Manage your health & family appointments easily with QueueNova's intelligent routing engine.</p>
          
          <!-- BONUS: Live Search -->
          <div style="background:rgba(255,255,255,0.08); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.15); padding:0.6rem; border-radius:50px; display:flex; max-width:550px; margin: 0 auto 3.5rem auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
             <input type="text" id="hero-search" placeholder="🔍 Search doctors, specialties..." style="flex:1; background:transparent; border:none; color:white; padding:0.5rem 1.25rem; outline:none; font-family:var(--font-main); font-size: 1rem;">
             <button id="hero-search-btn" class="btn btn-primary" style="border-radius:50px; padding:0.75rem 2rem;">Find Doctor</button>
          </div>

          <div style="display:flex; gap:1.25rem; justify-content:center; flex-wrap:wrap;">
            <a href="#/signup" class="btn btn-primary" style="padding: 1.1rem 3.5rem; font-size: 1.1rem; font-weight: 600; border-radius: 50px; box-shadow: 0 10px 15px -3px rgba(79,70,229,0.4);">Get Started</a>
            <a href="#/about" class="btn btn-outline" style="padding: 1.1rem 3.5rem; font-size: 1.1rem; font-weight: 600; border-radius: 50px; border-color: rgba(255,255,255,0.3); color:white; background:rgba(255,255,255,0.05); backdrop-filter: blur(4px);">View Services</a>
          </div>
        </div>
      </section>

      <!-- 6. STATS SECTION -->
      <section style="display:flex; justify-content:center; gap:4rem; flex-wrap:wrap; padding: 3rem 0; border-bottom: 1px solid var(--border); background: var(--surface); border-radius: 20px; box-shadow: var(--shadow-sm);">
        <div style="text-align:center;">
           <h2 style="font-size:2.75rem; color:var(--primary); font-weight:800; margin-bottom:0.25rem;">500+</h2>
           <p style="color:var(--text-muted); font-size:1rem; font-weight:600;">Appointments Booked</p>
        </div>
        <div style="text-align:center;">
           <h2 style="font-size:2.75rem; color:var(--secondary); font-weight:800; margin-bottom:0.25rem;">100+</h2>
           <p style="color:var(--text-muted); font-size:1rem; font-weight:600;">Active Users</p>
        </div>
        <div style="text-align:center;">
           <h2 style="font-size:2.75rem; color:var(--primary); font-weight:800; margin-bottom:0.25rem;">10+</h2>
           <p style="color:var(--text-muted); font-size:1rem; font-weight:600;">Specialist Doctors</p>
        </div>
      </section>

      <!-- 4. HOW IT WORKS -->
      <section style="text-align:center; padding: 2rem 0;">
        <span style="color:var(--primary); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:1rem;">Streamlined Flow</span>
        <h2 style="color: var(--text-dark); margin-bottom: 5rem; font-size:2.75rem; letter-spacing:-1px;">How It Works</h2>
        
        <div style="display:flex; justify-content:center; gap:3rem; flex-wrap:wrap; position:relative;">
          <div style="flex:1; min-width:280px; text-align:center; position:relative;">
            <div style="width:90px; height:90px; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.25rem; font-weight:bold; margin: 0 auto 1.75rem auto; box-shadow:0 10px 25px rgba(79,70,229,0.3);">1</div>
            <h3 style="color:var(--text-dark); margin-bottom:0.75rem; font-size:1.5rem;">Sign Up / Login</h3>
            <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">Create your secure account in seconds to access our next-gen booking engine.</p>
          </div>
          <div style="flex:1; min-width:280px; text-align:center; position:relative;">
            <div style="width:90px; height:90px; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.25rem; font-weight:bold; margin: 0 auto 1.75rem auto; box-shadow:0 10px 25px rgba(79,70,229,0.3);">2</div>
            <h3 style="color:var(--text-dark); margin-bottom:0.75rem; font-size:1.5rem;">Choose Doctor</h3>
            <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">Browse live availability grids and select a specialist that fits your schedule.</p>
          </div>
          <div style="flex:1; min-width:280px; text-align:center; position:relative;">
            <div style="width:90px; height:90px; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.25rem; font-weight:bold; margin: 0 auto 1.75rem auto; box-shadow:0 10px 25px rgba(79,70,229,0.3);">3</div>
            <h3 style="color:var(--text-dark); margin-bottom:0.75rem; font-size:1.5rem;">Confirm Booking</h3>
            <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">Secure your slot immediately and receive instant digital check-in passes.</p>
          </div>
        </div>
      </section>

      <!-- 2. FEATURES SECTION (5 CARDS) -->
      <section id="about-nova" style="background: var(--surface); border-radius: 32px; padding: 5rem 3rem; border: 1px solid var(--border); box-shadow: var(--shadow-md);">
        <div style="text-align:center; margin-bottom:4rem;">
           <span style="color:var(--secondary); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:1rem;">Enterprise Capabilities</span>
           <h2 style="color: var(--text-dark); font-size:2.75rem; letter-spacing:-1px;">Seamless Healthcare Operations</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem;">
          <div style="background: var(--background); padding: 2.5rem 2rem; border-radius: 20px; border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:default;" onmouseover="this.style.transform='translateY(-8px)'; this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="font-size:3rem; margin-bottom:1.5rem;">📅</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.25rem;">Easy Booking</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.6;">Frictionless heatmap grids and 1-click booking bypasses unnecessary administrative wait times.</p>
          </div>
          <div style="background: var(--background); padding: 2.5rem 2rem; border-radius: 20px; border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:default;" onmouseover="this.style.transform='translateY(-8px)'; this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="font-size:3rem; margin-bottom:1.5rem;">👨‍👩‍👧</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.25rem;">Family Management</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.6;">Add dependents and manage health records for parents or children under a single unified account.</p>
          </div>
          <div style="background: var(--background); padding: 2.5rem 2rem; border-radius: 20px; border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:default;" onmouseover="this.style.transform='translateY(-8px)'; this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="font-size:3rem; margin-bottom:1.5rem;">🔔</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.25rem;">Smart Notifications</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.6;">Automated SMS and email reminders integrated with real-time status tracking for zero missed visits.</p>
          </div>
          <div style="background: var(--background); padding: 2.5rem 2rem; border-radius: 20px; border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:default;" onmouseover="this.style.transform='translateY(-8px)'; this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="font-size:3rem; margin-bottom:1.5rem;">❌</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.25rem;">Cancel Anytime</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.6;">Full flexibility to cancel or reschedule appointments natively within the app with no penalty.</p>
          </div>
          <div style="background: var(--background); padding: 2.5rem 2rem; border-radius: 20px; border: 2px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:default; box-shadow: 0 0 25px rgba(79,70,229,0.1);" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="font-size:3rem; margin-bottom:1.5rem;">⏱️</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.25rem;">Live Availability</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.6;">Interactive, real-time doctor availability sync ensures you always see the latest open slots.</p>
          </div>
        </div>
      </section>

      <!-- 3. SERVICES / DOCTORS SECTION (LIVE) -->
      <section id="services-view" style="padding: 2rem 0;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4rem; flex-wrap:wrap; gap:1.5rem;">
           <div>
              <span style="color:var(--primary); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:1rem;">Clinical Excellence</span>
              <h2 style="color: var(--text-dark); font-size:2.75rem; letter-spacing:-1px;">Meet Our Specialists</h2>
           </div>
           <a href="#/signup" class="btn btn-outline" style="border-radius:50px; padding:0.6rem 1.75rem;">View All Staff <span>→</span></a>
        </div>
        
        <div id="live-doctors-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 5rem;">
           ${doctorsHTML}
        </div>

        <!-- Static Services Blocks -->
        <div style="text-align:center; margin-bottom:3.5rem;">
           <h3 style="color:var(--text-dark); font-size:2.25rem; letter-spacing:-0.5px;">Most Frequent Primary Care</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2.5rem;">
          <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; border-radius:24px;">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=250" alt="General Checkup" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding: 2rem; flex:1; display:flex; flex-direction:column;">
              <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.35rem;">General Physician</h4>
              <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height:1.6;">Comprehensive health examinations, routine screenings, and holistic family care.</p>
              <a href="#/signup" class="btn btn-primary" style="margin-top:auto; padding: 0.8rem; width:100%;">Book Consultation</a>
            </div>
          </div>
          <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; border-radius:24px;">
            <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400&h=250" alt="Dentist" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding: 2rem; flex:1; display:flex; flex-direction:column;">
              <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.35rem;">Dental Care</h4>
              <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height:1.6;">Specialized oral hygiene, restorative treatments, and advanced cosmetic surgery.</p>
              <a href="#/signup" class="btn btn-primary" style="margin-top:auto; padding: 0.8rem; width:100%;">Book Consultation</a>
            </div>
          </div>
          <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; border-radius:24px;">
            <img src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=400&h=250" alt="Cardiologist" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding: 2rem; flex:1; display:flex; flex-direction:column;">
              <h4 style="color: var(--text-dark); margin-bottom: 0.75rem; font-size:1.35rem;">Cardiologist</h4>
              <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height:1.6;">Heart health diagnostics, echocardiograms, and specialized cardiovascular therapy.</p>
              <a href="#/signup" class="btn btn-primary" style="margin-top:auto; padding: 0.8rem; width:100%;">Book Consultation</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. APP PREVIEW -->
      <section style="display:flex; justify-content:center; align-items:center; gap:5rem; padding:6rem 3rem; background: var(--surface); border-radius:32px; border:1px solid var(--border); flex-wrap:wrap; box-shadow: var(--shadow-md);">
         <div style="flex:1; min-width:320px;">
            <span style="color:var(--primary); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:1rem;">Fluid Experience</span>
            <h2 style="color: var(--text-dark); margin-bottom:2rem; font-size:2.75rem; line-height:1.1; letter-spacing:-1px;">Native Response. All Devices.</h2>
            <p style="color:var(--text-muted); font-size:1.15rem; line-height:1.7; margin-bottom:2.5rem;">QueueNova adapts dynamically to your workflow, providing a high-fidelity interface whether you're on a multi-monitor desktop or a mobile handset.</p>
            <div style="display:grid; grid-template-columns: 1fr; gap:1.25rem;">
               <div style="display:flex; align-items:center; gap:1rem; color:var(--text-dark); font-weight:500;">
                 <div style="width:24px; height:24px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">✓</div> Multi-device synchronization
               </div>
               <div style="display:flex; align-items:center; gap:1rem; color:var(--text-dark); font-weight:500;">
                 <div style="width:24px; height:24px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">✓</div> GPU-accelerated smooth animations
               </div>
               <div style="display:flex; align-items:center; gap:1rem; color:var(--text-dark); font-weight:500;">
                 <div style="width:24px; height:24px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">✓</div> Accessible typography & contrast
               </div>
            </div>
         </div>
         <div style="flex:1; display:flex; justify-content:center; align-items:flex-end; gap:1rem; position:relative; min-width: 320px;">
            <!-- Dummy Laptop -->
            <div style="width:100%; max-width:440px; aspect-ratio: 16/10; background:var(--background); border-radius:16px 16px 0 0; border:8px solid var(--border); border-bottom:none; display:flex; flex-direction:column; overflow:hidden; position:relative; box-shadow: 0 30px 60px rgba(0,0,0,0.2);">
               <div style="height:14px; background:var(--surface); display:flex; gap:6px; align-items:center; padding:0 10px; border-bottom: 1px solid var(--border);"><div style="width:6px; height:6px; border-radius:50%; background:#ef4444"></div><div style="width:6px; height:6px; border-radius:50%; background:#f59e0b"></div><div style="width:6px; height:6px; border-radius:50%; background:#10b981"></div></div>
               <div style="flex:1; background: url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80') center/cover; opacity: 0.9;"></div>
            </div>
            <!-- Dummy Mobile -->
            <div style="width:160px; height:300px; background:var(--background); border-radius:28px; border:8px solid var(--border); position:absolute; bottom:-30px; right:0; overflow:hidden; box-shadow: -15px 15px 40px rgba(0,0,0,0.3); z-index: 5;">
               <div style="position:absolute; top:0; left:25%; width:50%; height:16px; background:var(--border); border-radius:0 0 12px 12px; z-index:10;"></div>
               <div style="width:100%; height:100%; background: url('https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80') center/cover; opacity: 0.9;"></div>
            </div>
         </div>
      </section>

      <!-- 5. TESTIMONIALS -->
      <section style="text-align:center; padding:3rem 0;">
        <span style="color:var(--primary); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:1rem;">Patient Voices</span>
        <h2 style="color: var(--text-dark); margin-bottom: 5rem; font-size:2.75rem; letter-spacing:-1px;">Stories of Trusted Care</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem;">
           <div style="background: var(--surface); padding: 3rem 2.5rem; border-radius: 24px; border: 1px solid var(--border); position:relative; box-shadow: var(--shadow-sm); text-align:left;">
              <div style="font-size:4rem; color:var(--primary); opacity:0.1; position:absolute; top:1rem; left:1.5rem; font-family:serif;">"</div>
              <p style="color:var(--text-dark); font-size:1.15rem; font-style:italic; line-height:1.7; margin-bottom:2rem; position:relative; z-index:2;">Saved me hours of waiting! I booked my slot while in Bengaluru traffic, and was seen exactly on time. Truly digital healthcare.</p>
              <div style="display:flex; align-items:center; gap:1rem;">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
                 <div>
                    <h5 style="color:var(--text-dark); margin:0; font-size:1.05rem;">Rohan Mehta</h5>
                    <span style="color:var(--text-muted); font-size:0.85rem;">Verified Patient, Bangalore</span>
                 </div>
              </div>
           </div>
           <div style="background: var(--surface); padding: 3rem 2.5rem; border-radius: 24px; border: 1px solid var(--border); position:relative; box-shadow: var(--shadow-sm); text-align:left;">
              <div style="font-size:4rem; color:var(--primary); opacity:0.1; position:absolute; top:1rem; left:1.5rem; font-family:serif;">"</div>
              <p style="color:var(--text-dark); font-size:1.15rem; font-style:italic; line-height:1.7; margin-bottom:2rem; position:relative; z-index:2;">Super easy to book for my parents in Delhi. The Family Management feature is a game-changer for those of us living away from home.</p>
              <div style="display:flex; align-items:center; gap:1rem;">
                 <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
                 <div>
                    <h5 style="color:var(--text-dark); margin:0; font-size:1.05rem;">Sneha Kapoor</h5>
                    <span style="color:var(--text-muted); font-size:0.85rem;">Verified Patient, Delhi</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

    </div>

    <!-- 8. FOOTER -->
    <footer style="background: var(--surface); border-top: 1px solid var(--border); padding: 5rem 2rem 3rem 2rem; margin: 4rem -5% -2rem -5%;">
       <div style="max-width:1400px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:4rem; margin-bottom:4rem;">
          <div>
             <h3 style="color:var(--text-dark); font-size:1.75rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem; font-weight:800;">
               <div style="width:32px; height:32px; background:var(--primary); border-radius:8px;"></div> QueueNova
             </h3>
             <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">Pioneering the next generation of healthcare delivery through real-time availability and smart scheduling algorithms.</p>
          </div>
          <div>
             <h4 style="color:var(--text-dark); margin-bottom:1.5rem; font-weight:700;">Navigation</h4>
             <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:1rem;">
                <li><a href="#/home" style="color:var(--text-muted); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Home Marketplace</a></li>
                <li><a href="#/about" style="color:var(--text-muted); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Our Mission</a></li>
                <li><a href="#/signup" style="color:var(--text-muted); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Patient Registration</a></li>
                <li><a href="#/login" style="color:var(--text-muted); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Medical Login</a></li>
             </ul>
          </div>
          <div>
             <h4 style="color:var(--text-dark); margin-bottom:1.5rem; font-weight:700;">Global Support</h4>
             <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:1rem; color:var(--text-muted);">
                <li style="display:flex; align-items:center; gap:0.75rem;">📞 +91 98765 43210</li>
                <li style="display:flex; align-items:center; gap:0.75rem;">✉️ care@queuenova.in</li>
                <li>📍 Plot 45, Sector 18, Gurugram, Haryana 122015</li>
             </ul>
          </div>
       </div>
       <div style="text-align:center; padding-top:3rem; border-top:1px solid var(--border); color:var(--text-muted); font-size:0.95rem; font-weight:500;">
          &copy; 2026 QueueNova Healthcare Systems. Built with accessibility in mind.
       </div>
    </footer>
  `;

  // Attach search listener
  const searchInput = document.getElementById('hero-search');
  const searchBtn = document.getElementById('hero-search-btn');
  
  const performSearch = () => {
     const term = searchInput?.value.trim().toLowerCase();
     if(!term) return;
     const matching = doctorsArray.filter(d => 
       d.name.toLowerCase().includes(term) || d.specialty.toLowerCase().includes(term)
     );
     if(matching.length > 0) {
        alert("Found " + matching.length + " matching doctors! Redirecting to login to book...");
        window.location.hash = '#/signup';
     } else {
        alert("No exact matches found for '" + term + "'. Browse our full list inside.");
     }
  };
  
  searchBtn?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') performSearch();
  });

};
