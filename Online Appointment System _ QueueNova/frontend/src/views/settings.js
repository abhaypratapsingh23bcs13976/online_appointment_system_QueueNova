import { apiFetch } from '../api.js';
import { showToast } from '../components/toaster.js';

export const renderSettings = async (container) => {
  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 2rem; border-radius: var(--radius); box-shadow: var(--shadow-md);">
      <h2 style="margin-bottom: 2rem; text-align: center;">Account Settings</h2>
      <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem;">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="prof-name" class="input-field" required>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="prof-email" class="input-field" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="prof-phone" class="input-field" placeholder="+91 98765 43210">
        </div>
        <button type="button" id="save-settings-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Update Details</button>
      </div>

      <h3 style="margin-bottom: 1.5rem;">Change Password</h3>
      <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem;">
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="cur-pass" class="input-field" required>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="new-pass" class="input-field" required>
        </div>
        <button type="button" id="save-pass-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Change Password</button>
      </div>

      <h3 style="margin-bottom: 1.5rem;">Medical Records</h3>
      <div style="border: 2px dashed var(--border); padding: 2rem; text-align: center; border-radius: var(--radius); cursor: pointer;" onclick="document.getElementById('file-upload').click()">
        <svg width="32" height="32" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>
        <p style="margin-top: 0.5rem; font-weight: 500;">Click to upload medical reports</p>
        <p style="font-size: 0.8rem; color: var(--text-muted)">PDF, DOCX, JPG up to 10MB</p>
        <input type="file" id="file-upload" style="display:none;" onchange="alert('Mock File Uploaded Successfully!')">
      </div>

      <h3 style="margin-bottom: 1.5rem; color: var(--danger);">Danger Zone</h3>
      <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 2rem;">
        <h4 style="color: var(--danger); margin-bottom: 0.5rem;">Delete Account</h4>
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">Once you delete your account, there is no going back. All your data, appointments, prescriptions, and medical records will be permanently deleted.</p>
        <button type="button" id="delete-account-btn" class="btn btn-danger" style="background: var(--danger); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Delete My Account Permanently</button>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div id="delete-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="max-width: 450px;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 60px; height: 60px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="30" height="30" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
          </div>
          <h3 style="color: var(--danger);">Delete Account?</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">This action cannot be undone. All your data will be permanently deleted.</p>
        </div>
        <div class="form-group">
          <label style="font-weight: 600;">Type <span style="color: var(--danger);">DELETE</span> to confirm</label>
          <input type="text" id="delete-confirm-input" class="input-field" placeholder="DELETE">
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" id="cancel-delete-btn" class="btn btn-outline" style="flex: 1; padding: 0.75rem;">Cancel</button>
          <button type="button" id="confirm-delete-btn" class="btn btn-danger" style="flex: 1; padding: 0.75rem; background: var(--danger); color: white; border: none; border-radius: 8px;" disabled>Delete Forever</button>
        </div>
      </div>
    </div>
  `;

  try {
    const { user } = await apiFetch('/auth/me');
    document.getElementById('prof-name').value = user.name;
    document.getElementById('prof-email').value = user.email;
    document.getElementById('prof-phone').value = user.phone || '';

    document.getElementById('save-settings-btn').addEventListener('click', async () => {
      const name = document.getElementById('prof-name').value;
      const email = document.getElementById('prof-email').value;
      const phone = document.getElementById('prof-phone').value;
      
      const btn = document.getElementById('save-settings-btn');
      btn.disabled = true;
      btn.textContent = 'Updating...';
      
      try {
        console.log('Sending update request with:', { name, email, phone });
        
        const data = await apiFetch('/auth/me', {
          method: 'PUT',
          body: JSON.stringify({ name, email, phone }),
        });
        
        showToast('Profile updated successfully!');
        document.getElementById('prof-name').value = data.user.name;
        document.getElementById('prof-email').value = data.user.email;
        document.getElementById('prof-phone').value = data.user.phone || '';
      } catch (err) {
        console.error('Update error:', err);
        showToast(err.message || 'Failed to update profile', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Update Details';
      }
    });

    document.getElementById('save-pass-btn').addEventListener('click', async () => {
      const currentPassword = document.getElementById('cur-pass').value;
      const newPassword = document.getElementById('new-pass').value;
      
      const btn = document.getElementById('save-pass-btn');
      btn.disabled = true;
      btn.textContent = 'Changing...';
      
      try {
        const data = await apiFetch('/auth/password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        
        showToast('Password updated securely!', 'success');
        document.getElementById('cur-pass').value = '';
        document.getElementById('new-pass').value = '';
      } catch (err) {
        console.error('Password change error:', err);
        showToast(err.message || 'Failed to change password', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Change Password';
      }
    });

    // Delete Account Functionality
    const deleteModal = document.getElementById('delete-modal');
    const deleteConfirmInput = document.getElementById('delete-confirm-input');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    deleteAccountBtn?.addEventListener('click', () => {
      deleteModal.style.display = 'flex';
      deleteConfirmInput.value = '';
      confirmDeleteBtn.disabled = true;
    });

    cancelDeleteBtn?.addEventListener('click', () => {
      deleteModal.style.display = 'none';
    });

    deleteConfirmInput?.addEventListener('input', (e) => {
      confirmDeleteBtn.disabled = e.target.value !== 'DELETE';
    });

    confirmDeleteBtn.addEventListener('click', async () => {
      if (deleteConfirmInput.value !== 'DELETE') return;
      
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Deleting...';
      
      try {
        await apiFetch('/auth/delete-account', {
          method: 'DELETE',
        });
        
        showToast('Account deleted successfully!', 'success');
        localStorage.clear();
        setTimeout(() => {
          window.location.hash = '#/home';
          window.location.reload();
        }, 2000);
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Network error: ' + err.message, 'error');
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete Forever';
      }
    });

    // Close modal on overlay click
    deleteModal?.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        deleteModal.style.display = 'none';
      }
    });

  } catch(err) {
    if(err.message === 'Access denied' || err.message === 'Invalid token') {
      window.location.hash = '#/login';
    }
  }
};
