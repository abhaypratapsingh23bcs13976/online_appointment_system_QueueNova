const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('./db');
const WebSocket = require('ws');



const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 5000;

// Health check route
app.get('/health', (req, res) => res.json({ status: 'ok', environment: 'lambda' }));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-appointment-system-queuenova-2026';

// Security Middleware


// Rate Limiting - Prevent DDoS and brute force







// Input Sanitization - Prevent NoSQL injection


// CORS Configuration
// CORS Configuration (Only active locally to prevent conflicts with AWS API Gateway CORS)
if (require.main === module) {
  app.use(cors({ 
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }));
}

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload attacks
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Passport Google OAuth Configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Only configure Google strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const db = await readDB();
      let user = db.users.find(u => u.googleId === profile.id);
      
      if (!user) {
        user = {
          id: uuidv4(),
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          password: null,
          phone: '',
          isAdmin: false,
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        await writeDB(db);
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

// Prevent clickjacking
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// --- Middleware: Verify Token ---
const authenticateToken = (req, res, next) => {
  let token = req.cookies.token;
  
  // Also check Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().toLowerCase();
    
    const db = await readDB();
    if (db.users.find(u => u.email === sanitizedEmail)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Strong password hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = { 
      id: uuidv4(), 
      name: sanitizedName, 
      email: sanitizedEmail, 
      password: hashedPassword, 
      isAdmin: false 
    };
    db.users.push(newUser);
    await writeDB(db);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    
    const db = await readDB();
    const user = db.users.find(u => u.email === sanitizedEmail);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Generate secure token with expiry
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
    
    // Secure cookie settings
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// --- Google OAuth Routes ---
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/#login?error=oauth_failed' }), async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user.id, email: req.user.email, name: req.user.name, isAdmin: req.user.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
      
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });
      
      res.redirect(process.env.FRONTEND_URL + '/#/dashboard' || 'http://localhost:5173/#/dashboard');
    } catch (error) {
      res.redirect(process.env.FRONTEND_URL + '/#login?error=oauth_failed' || 'http://localhost:5173/#/login?error=oauth_failed');
    }
  }
);

app.get('/api/auth/google/status', async (req, res) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    res.json({ enabled: true });
  } else {
    res.json({ enabled: false, message: 'Google OAuth not configured' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    
    const { name, email, phone } = req.body;
    if (email && email !== db.users[index].email) {
      if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already in use' });
      db.users[index].email = email;
    }
    if (name) db.users[index].name = name;
    if (phone !== undefined) db.users[index].phone = phone;
    
    await writeDB(db);
    
    const updatedUser = { 
      id: db.users[index].id, 
      name: db.users[index].name, 
      email: db.users[index].email, 
      phone: db.users[index].phone 
    };
    
    // Re-sign token with updated user data
    const token = jwt.sign({ 
      id: updatedUser.id, 
      name: updatedUser.name, 
      email: updatedUser.email,
      isAdmin: req.user.isAdmin 
    }, JWT_SECRET, { expiresIn: '1d' });
    
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/password', authenticateToken, async (req, res) => {
  const db = await readDB();
  const index = db.users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  const { currentPassword, newPassword } = req.body;
  const validPass = await bcrypt.compare(currentPassword, db.users[index].password);
  if (!validPass) return res.status(400).json({ error: 'Incorrect current password' });
  
  const salt = await bcrypt.genSalt(10);
  db.users[index].password = await bcrypt.hash(newPassword, salt);
  await writeDB(db);
  res.json({ message: 'Password updated successfully' });
});

app.delete('/api/auth/delete-account', async (req, res) => {
  console.log('Delete account called, cookies:', req.cookies);
  
  // Get token from cookie or header
  const token = req.cookies.token;
  if (!token) {
    console.log('No token found');
    return res.status(401).json({ error: 'Access denied - no token' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, user:', verified.id);
    
    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === verified.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    const userId = verified.id;
    
    // Delete user's data
    db.appointments = db.appointments.filter(a => a.userId !== userId);
    db.family_members = db.family_members.filter(f => f.userId !== userId);
    db.prescriptions = db.prescriptions.filter(p => p.userId !== userId);
    if (db.health_records) db.health_records = db.health_records.filter(hr => hr.userId !== userId);
    if (db.notifications) db.notifications = db.notifications.filter(n => n.userId !== userId);
    if (db.reviews) db.reviews = db.reviews.filter(r => r.userId !== userId);
    if (db.labBookings) db.labBookings = db.labBookings.filter(lb => lb.userId !== userId);
    if (db.medicineOrders) db.medicineOrders = db.medicineOrders.filter(mo => mo.userId !== userId);
    db.users.splice(userIndex, 1);
    
    await writeDB(db);
    console.log('Account deleted for user:', userId);
    
    res.clearCookie('token');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(403).json({ error: 'Invalid token' });
  }
});

// --- Admin Routes ---
app.get('/api/admin/appointments', authenticateToken, requireAdmin, async (req, res) => {
  const db = await readDB();
  let appts = [...db.appointments];
  appts = appts.map(a => {
    return {
       ...a,
       doctor: db.doctors.find(d => d.id === a.doctorId) || {},
       service: db.services.find(s => s.id === a.serviceId) || {},
       patient: db.users.find(u => u.id === a.userId) || { name: 'Unknown' }
    }
  });
  appts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(appts);
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const db = await readDB();
  // Strip passwords
  const users = db.users.map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json(users);
});

// --- Doctors & Services Routes ---
app.get('/api/doctors', async (req, res) => {
  const db = await readDB();
  res.json(db.doctors);
});

app.get('/api/services', async (req, res) => {
  const db = await readDB();
  res.json(db.services);
});

// --- Family Members Routes ---
app.get('/api/family', authenticateToken, async (req, res) => {
  const db = await readDB();
  const family = db.family_members.filter(f => f.userId === req.user.id);
  res.json(family);
});

app.post('/api/family', authenticateToken, async (req, res) => {
  const { name, relation, dateOfBirth, gender, bloodType, phone, email, allergies, medicalConditions, emergencyContact } = req.body;
  const db = await readDB();
  const newMember = { 
    id: uuidv4(), 
    userId: req.user.id, 
    name, 
    relation,
    dateOfBirth: dateOfBirth || null,
    gender: gender || null,
    bloodType: bloodType || null,
    phone: phone || null,
    email: email || null,
    allergies: allergies || '',
    medicalConditions: medicalConditions || '',
    emergencyContact: emergencyContact || '',
    createdAt: new Date().toISOString()
  };
  db.family_members.push(newMember);
  await writeDB(db);
  res.status(201).json(newMember);
});

app.delete('/api/family/:id', authenticateToken, async (req, res) => {
  const db = await readDB();
  const index = db.family_members.findIndex(f => f.id === req.params.id && f.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Family member not found' });
  }
  db.family_members.splice(index, 1);
  await writeDB(db);
  res.json({ success: true });
});

// --- Appointments Routes ---
// GET custom analytics/dashboard stats 
app.get('/api/stats', authenticateToken, async (req, res) => {
  const db = await readDB();
  let dbModified = false;
  const now = new Date();

  // Auto-mark past appointments as completed
  db.appointments.forEach(a => {
    const apptTime = new Date(a.date + 'T' + a.timeSlot.split('-')[0]);
    if (a.status === 'active' && apptTime < now) {
      a.status = 'completed';
      dbModified = true;
    }
  });
  if(dbModified) await writeDB(db);

  const userAppointments = db.appointments.filter(a => a.userId === req.user.id);
  
  let upcoming = userAppointments.filter(a => a.status === 'active');
  const past = userAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const familyCount = db.family_members.filter(f => f.userId === req.user.id).length;
  
  let allMapped = userAppointments.map(a => ({
    ...a,
    doctor: db.doctors.find(d => d.id === a.doctorId) || {},
    service: db.services.find(s => s.id === a.serviceId) || {}
  })).sort((a,b) => new Date(b.date) - new Date(a.date));
  
  res.json({
    upcomingCount: upcoming.length,
    pastCount: past.length,
    familyCount,
    appointments: allMapped
  });
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  const db = await readDB();
  let appts = db.appointments.filter(a => a.userId === req.user.id);
  appts = appts.map(a => {
    return {
       ...a,
       doctor: db.doctors.find(d => d.id === a.doctorId),
       service: db.services.find(s => s.id === a.serviceId)
    }
  });
  // Sort by closest date
  appts.sort((a,b) => new Date(a.date) - new Date(b.date));
  res.json(appts);
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { doctorId, serviceId, date, timeSlot, familyMemberId } = req.body;
  const db = await readDB();
  
  // Double Booking Validation
  const existing = db.appointments.find(a => 
    a.doctorId === doctorId && 
    a.date === date && 
    a.timeSlot === timeSlot && 
    a.status === 'active'
  );
  if (existing) {
    return res.status(409).json({ error: 'This time slot is already booked.' });
  }

  const newAppt = {
    id: uuidv4(),
    userId: req.user.id,
    familyMemberId: familyMemberId || null,
    doctorId,
    serviceId,
    date,
    timeSlot,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  db.appointments.push(newAppt);
  await writeDB(db);
  console.log(`[Notification] Appointment Booked: ${req.user.email} -> Doctor ID ${doctorId} at ${date} ${timeSlot}`);
  res.status(201).json(newAppt);
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  const db = await readDB();
  const index = db.appointments.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
  
  const { date, timeSlot } = req.body;
  // Check double booking for new slot
  if (date && timeSlot) {
    const existing = db.appointments.find(a => 
      a.doctorId === db.appointments[index].doctorId && 
      a.date === date && 
      a.timeSlot === timeSlot && 
      a.status === 'active' &&
      a.id !== req.params.id
    );
    if (existing) {
      return res.status(409).json({ error: 'New time slot is already booked.' });
    }
    db.appointments[index].date = date;
    db.appointments[index].timeSlot = timeSlot;
  }
  
  if (req.body.status) {
    db.appointments[index].status = req.body.status;
  }

  await writeDB(db);
  res.json(db.appointments[index]);
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  const db = await readDB();
  const index = db.appointments.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
  
  db.appointments[index].status = 'cancelled';
  await writeDB(db);

  // Add cancellation notification
  if (!db.notifications) db.notifications = [];
  db.notifications.push({
    id: uuidv4(),
    userId: req.user.id,
    type: 'cancellation',
    title: 'Appointment Cancelled',
    message: `Your appointment on ${db.appointments[index].date} has been cancelled.`,
    read: false,
    createdAt: new Date().toISOString()
  });
  await writeDB(db);

  res.json({ message: 'Appointment cancelled' });
});

// --- Hospitals Routes ---
app.get('/api/hospitals', async (req, res) => {
  const db = await readDB();
  res.json(db.hospitals || []);
});

app.get('/api/hospitals/:id', async (req, res) => {
  const db = await readDB();
  const hospital = (db.hospitals || []).find(h => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  const doctors = (db.doctors || []).filter(d => d.hospitalId === req.params.id);
  res.json({ ...hospital, doctors });
});

// --- Prescriptions Routes ---
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  const db = await readDB();
  let prescriptions = (db.prescriptions || []).filter(p => p.userId === req.user.id);
  prescriptions = prescriptions.map(p => ({
    ...p,
    doctor: (db.doctors || []).find(d => d.id === p.doctorId) || {}
  }));
  prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(prescriptions);
});

// --- Health Records Routes ---
app.get('/api/health-records', authenticateToken, async (req, res) => {
  const db = await readDB();
  const records = (db.health_records || []).filter(r => r.userId === req.user.id);
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(records);
});

app.post('/api/health-records', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.health_records) db.health_records = [];
  const { type, title, description, date, severity } = req.body;
  const record = { id: uuidv4(), userId: req.user.id, type, title, description, date, severity };
  db.health_records.push(record);
  await writeDB(db);
  res.status(201).json(record);
});

app.delete('/api/health-records/:id', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.health_records) return res.status(404).json({ error: 'Not found' });
  const index = db.health_records.findIndex(r => r.id === req.params.id && r.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Record not found' });
  db.health_records.splice(index, 1);
  await writeDB(db);
  res.json({ message: 'Record deleted' });
});

// --- Notifications Routes ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
  const db = await readDB();
  const notifs = (db.notifications || []).filter(n => n.userId === req.user.id);
  notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.notifications) return res.status(404).json({ error: 'Not found' });
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  await writeDB(db);
  res.json({ message: 'Marked as read' });
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.notifications) return res.json({ message: 'Done' });
  db.notifications.filter(n => n.userId === req.user.id).forEach(n => n.read = true);
  await writeDB(db);
  res.json({ message: 'All marked as read' });
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.notifications) return res.status(404).json({ error: 'Not found' });
  const index = db.notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.notifications.splice(index, 1);
  await writeDB(db);
  res.json({ message: 'Deleted' });
});

// --- Reviews Routes ---
app.get('/api/reviews/:doctorId', async (req, res) => {
  const db = await readDB();
  const reviews = (db.reviews || []).filter(r => r.doctorId === req.params.doctorId);
  const enriched = reviews.map(r => {
    const user = (db.users || []).find(u => u.id === r.userId);
    return { ...r, userName: user ? user.name : 'Anonymous' };
  });
  enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(enriched);
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.reviews) db.reviews = [];
  const { doctorId, rating, comment } = req.body;
  const review = { id: uuidv4(), userId: req.user.id, doctorId, rating, comment, createdAt: new Date().toISOString() };
  db.reviews.push(review);
  await writeDB(db);
  res.status(201).json(review);
});

// --- Analytics Route ---
app.get('/api/analytics', authenticateToken, async (req, res) => {
  const db = await readDB();
  const userAppts = (db.appointments || []).filter(a => a.userId === req.user.id);
  
  const total = userAppts.length;
  const completed = userAppts.filter(a => a.status === 'completed').length;
  const upcoming = userAppts.filter(a => a.status === 'active').length;
  const cancelled = userAppts.filter(a => a.status === 'cancelled').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Monthly breakdown
  const monthly = {};
  userAppts.forEach(a => {
    const month = a.date ? a.date.substring(0, 7) : 'unknown';
    if (!monthly[month]) monthly[month] = { total: 0, completed: 0, cancelled: 0 };
    monthly[month].total++;
    if (a.status === 'completed') monthly[month].completed++;
    if (a.status === 'cancelled') monthly[month].cancelled++;
  });

  // Top doctors
  const doctorVisits = {};
  userAppts.filter(a => a.status === 'completed').forEach(a => {
    const doc = (db.doctors || []).find(d => d.id === a.doctorId);
    const name = doc ? doc.name : 'Unknown';
    doctorVisits[name] = (doctorVisits[name] || 0) + 1;
  });
  const topDoctors = Object.entries(doctorVisits)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top hospitals
  const hospitalVisits = {};
  userAppts.filter(a => a.status === 'completed').forEach(a => {
    const doc = (db.doctors || []).find(d => d.id === a.doctorId);
    if (doc) {
      const hospital = (db.hospitals || []).find(h => h.id === doc.hospitalId);
      const name = hospital ? hospital.name : 'Unknown';
      hospitalVisits[name] = (hospitalVisits[name] || 0) + 1;
    }
  });
  const topHospitals = Object.entries(hospitalVisits)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Total spend
  const totalSpend = userAppts.filter(a => a.status === 'completed').reduce((sum, a) => {
    const svc = (db.services || []).find(s => s.id === a.serviceId);
    return sum + (svc ? svc.price : 0);
  }, 0);

  res.json({
    total, completed, upcoming, cancelled, completionRate,
    monthly, topDoctors, topHospitals, totalSpend,
    prescriptionCount: (db.prescriptions || []).filter(p => p.userId === req.user.id).length,
    healthRecordCount: (db.health_records || []).filter(r => r.userId === req.user.id).length
  });
});

// --- AI Symptom Checker (Mock) ---
app.post('/api/symptom-check', async (req, res) => {
  const { symptoms } = req.body;
  const symptomsLower = (symptoms || '').toLowerCase();
  const db = await readDB();
  
  const mappings = [
    { keywords: ['headache', 'migraine', 'head pain'], department: 'Neurology', specialty: 'Neurologist', severity: 'moderate', advice: 'Could indicate tension headache, migraine, or neurological condition.' },
    { keywords: ['chest pain', 'heart', 'palpitation', 'bp', 'blood pressure'], department: 'Cardiology', specialty: 'Cardiologist', severity: 'high', advice: 'Chest pain requires immediate evaluation. Please seek urgent care.' },
    { keywords: ['fever', 'cold', 'cough', 'flu', 'throat', 'sore'], department: 'General Medicine', specialty: 'General Physician', severity: 'low', advice: 'Common viral symptoms. Rest and hydration recommended. See a doctor if persists beyond 3 days.' },
    { keywords: ['skin', 'rash', 'acne', 'itch', 'allergy', 'eczema'], department: 'Dermatology', specialty: 'Dermatologist', severity: 'low', advice: 'Skin conditions can have various causes. Avoid scratching and see a specialist.' },
    { keywords: ['bone', 'joint', 'knee', 'back pain', 'fracture', 'sprain'], department: 'Orthopedics', specialty: 'Orthopedic Surgeon', severity: 'moderate', advice: 'Musculoskeletal issues. Rest the affected area. X-ray may be needed.' },
    { keywords: ['child', 'baby', 'infant', 'pediatric', 'vaccination'], department: 'Pediatrics', specialty: 'Pediatrician', severity: 'low', advice: 'For children\'s health concerns, a pediatrician is the right specialist.' },
    { keywords: ['stomach', 'digestion', 'acidity', 'gastric', 'vomit', 'diarrhea'], department: 'Gastroenterology', specialty: 'Gastroenterologist', severity: 'moderate', advice: 'GI symptoms — avoid spicy food and stay hydrated. Consult if persistent.' }
  ];

  let matched = mappings.find(m => m.keywords.some(k => symptomsLower.includes(k)));
  if (!matched) {
    matched = { department: 'General Medicine', specialty: 'General Physician', severity: 'low', advice: 'Your symptoms are general. We recommend a General Physician for initial evaluation.' };
  }

  const recommendedDoctors = (db.doctors || []).filter(d => 
    d.specialty.toLowerCase().includes(matched.specialty.toLowerCase()) || 
    d.department === matched.department
  ).map(d => ({
    ...d,
    hospital: (db.hospitals || []).find(h => h.id === d.hospitalId)
  }));

  res.json({
    department: matched.department,
    severity: matched.severity,
    advice: matched.advice,
    recommendedDoctors: recommendedDoctors.slice(0, 3)
  });
});

// --- QR Code Check-in System ---
app.post('/api/appointments/:id/checkin', authenticateToken, async (req, res) => {
  const db = await readDB();
  const appt = db.appointments.find(a => a.id === req.params.id && a.userId === req.user.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  
  const apptTime = new Date(appt.date + 'T' + appt.timeSlot.split('-')[0]);
  const now = new Date();
  const timeDiff = (apptTime - now) / (1000 * 60);
  
  if (timeDiff > 30) {
    return res.status(400).json({ error: 'Check-in allowed only 30 minutes before appointment' });
  }
  
  appt.checkInTime = now.toISOString();
  appt.status = 'checked-in';
  await writeDB(db);
  
  res.json({ message: 'Check-in successful', checkInTime: appt.checkInTime });
});

app.get('/api/appointments/:id/qr', authenticateToken, async (req, res) => {
  const db = await readDB();
  const appt = db.appointments.find(a => a.id === req.params.id && a.userId === req.user.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  
  const qrData = JSON.stringify({
    id: appt.id,
    doctorId: appt.doctorId,
    date: appt.date,
    timeSlot: appt.timeSlot,
    userId: req.user.id
  });
  
  res.json({ qrCode: Buffer.from(qrData).toString('base64') });
});

// --- Lab Tests Routes ---
app.get('/api/lab-tests', async (req, res) => {
  const db = await readDB();
  res.json(db.labTests || []);
});

app.post('/api/lab-tests', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.labBookings) db.labBookings = [];
  
  const { testIds, date, timeSlot, hospitalId } = req.body;
  const booking = {
    id: uuidv4(),
    userId: req.user.id,
    testIds,
    date,
    timeSlot,
    hospitalId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  db.labBookings.push(booking);
  await writeDB(db);
  
  res.status(201).json(booking);
});

app.get('/api/lab-tests/bookings', authenticateToken, async (req, res) => {
  const db = await readDB();
  const bookings = (db.labBookings || []).filter(b => b.userId === req.user.id);
  const enriched = bookings.map(b => {
    const tests = (db.labTests || []).filter(t => b.testIds.includes(t.id));
    const hospital = (db.hospitals || []).find(h => h.id === b.hospitalId);
    return { ...b, tests, hospital };
  });
  res.json(enriched);
});

// --- Medicine Delivery Routes ---
app.get('/api/medicines', async (req, res) => {
  const db = await readDB();
  res.json(db.medicines || []);
});

app.post('/api/medicines/order', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.medicineOrders) db.medicineOrders = [];
  
  const { items, address, paymentMethod } = req.body;
  const order = {
    id: uuidv4(),
    userId: req.user.id,
    items,
    address,
    paymentMethod,
    status: 'confirmed',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  
  db.medicineOrders.push(order);
  await writeDB(db);
  
  res.status(201).json(order);
});

app.get('/api/medicines/orders', authenticateToken, async (req, res) => {
  const db = await readDB();
  const orders = (db.medicineOrders || []).filter(o => o.userId === req.user.id);
  res.json(orders);
});

// --- Health Metrics Routes ---
app.get('/api/health-metrics', authenticateToken, async (req, res) => {
  const db = await readDB();
  const metrics = (db.healthMetrics || []).filter(m => m.userId === req.user.id);
  metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(metrics);
});

app.post('/api/health-metrics', authenticateToken, async (req, res) => {
  const db = await readDB();
  if (!db.healthMetrics) db.healthMetrics = [];
  
  const { type, value, unit, date } = req.body;
  const metric = {
    id: uuidv4(),
    userId: req.user.id,
    type,
    value,
    unit,
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  db.healthMetrics.push(metric);
  await writeDB(db);
  
  res.status(201).json(metric);
});

app.get('/api/health-metrics/:type', authenticateToken, async (req, res) => {
  const db = await readDB();
  const metrics = (db.healthMetrics || []).filter(m => 
    m.userId === req.user.id && m.type === req.params.type
  );
  metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(metrics);
});

// --- Live Queue Position ---
app.get('/api/appointments/:id/queue', authenticateToken, async (req, res) => {
  const db = await readDB();
  const appt = db.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  
  const doctorAppts = db.appointments.filter(a => 
    a.doctorId === appt.doctorId && 
    a.date === appt.date && 
    a.status !== 'cancelled'
  ).sort((a, b) => {
    const aTime = a.timeSlot.split('-')[0];
    const bTime = b.timeSlot.split('-')[0];
    return aTime.localeCompare(bTime);
  });
  
  const position = doctorAppts.findIndex(a => a.id === appt.id) + 1;
  const currentServing = doctorAppts.findIndex(a => a.status === 'checked-in' || a.status === 'completed') + 1;
  
  res.json({ position, totalAhead: position - currentServing, currentServing });
});

// --- WebSocket Server ---
// --- Server Setup (Local Only) ---
if (require.main === module) {
  const server = require('http').createServer(app);
  
  // WebSocket Server logic (only for local)
  const wss = new WebSocket.Server({ server, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const token = req.url?.split('token=')[1];
    if (!token) {
      ws.close();
      return;
    }
    
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      ws.userId = verified.id;
      console.log(`WebSocket connected: User ${verified.email}`);
    } catch (err) {
      ws.close();
      return;
    }
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (e) {
        console.error('WS message error:', e);
      }
    });
    
    ws.on('close', () => {
      console.log(`WebSocket disconnected: User ${ws.userId}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

function handleWebSocketMessage(ws, data) {
  const { type, payload } = data;
  
  switch (type) {
    case 'subscribe':
      if (payload.appointmentId) {
        ws.appointmentRoom = payload.appointmentId;
      }
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
  }
}

function broadcastToUser(userId, type, payload) {
  // Safe check for wss: it is only defined in local mode (require.main === module)
  if (typeof wss !== 'undefined' && wss && wss.clients) {
    wss.clients.forEach(client => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }
}


// --- Exports ---
const serverless = require('serverless-http');
module.exports = app; // Export app for index.js
module.exports.handler = serverless(app); // Also export handler for direct use
