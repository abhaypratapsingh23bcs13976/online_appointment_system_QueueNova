# QueueNova - Online Appointment Booking System

## Overview
QueueNova is a full-stack completely portable Online Appointment Booking System. It features entirely custom UI designs with zero dependencies (using standard glassmorphic CSS principles), built on a Vanilla Javascript + DOM frontend powered by Vite, and an Express.js backend using a portable JSON data store.

### Features Built
- **User Authentication**: Secure signup/login with BCrypt hashed passwords and JWT httpOnly cookie sessions.
- **Dynamic Dashboard**: View customized statistics, upcoming appointments, and list family members.
- **Family Management**: Seamlessly add dependent family members.
- **Intelligent Booking Engine**: Allows selecting Services and Doctors, enforcing hard strict validations against Double Reservations (Throws 409 Conflict if trying to book the exact same slot).
- **Beautiful UI**: Pure CSS variables handling gradients, hover animations, soft shadows, input highlighting, and dynamic toasts!

---

## Instructions to Run Locally in VS Code

### 1. Prerequisites
Ensure you have **Node.js** installed on your system (v16.0 or higher recommended).

### 2. Running The Backend API
1. Open a new terminal in VS Code (`Terminal -> New Terminal`).
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. *(Optional if not done automatically)* Install backend dependencies:
   ```bash
   npm install
   ```
4. Start the backend Node server using `nodemon` or `node`:
   ```bash
   npm start
   ```
5. You should see `Backend server running on http://localhost:5000` logged in the terminal. **Keep this terminal running.**

### 3. Running The Frontend App
1. Open a **second** new terminal in VS Code alongside your backend terminal.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install the frontend Vite dependencies:
   ```bash
   npm install
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
5. Vite will open the local link, commonly `http://localhost:5173`. Click the link or open it in your browser.

### 4. How to Test (Sample Flow)
1. **Sign up** in the app with a fake email and password.
2. **Log in** to your new account.
3. Once in the **Dashboard**, click `+ Add Member` located near the sidebar to test the Family feature.
4. Navigate to **Book** via the top navigation bar.
5. Select a Service, click on a Doctor Card, pick a Date and Time constraint, and click `Confirm Booking`.
   - *Tip: To test double-booking validation, try to immediately book the exact same Doctor + Date + Time again. A toast will trigger preventing it!*
6. Go back to your **Dashboard** and verify the appointment appears under _Upcoming Appointments_.
7. Press `Cancel` on the appointment item to verify dynamic UI updating + database writes.
