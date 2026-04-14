import { apiFetch } from '../api.js';
import { showToast } from '../components/toaster.js';

export const renderNotifications = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const notifs = await apiFetch('/notifications');
    const unreadCount = notifs.filter(n => !n.read).length;

    const typeConfig = {
      reminder: { icon: '⏰', color: '#3b82f6' },
      prescription: { icon: '💊', color: '#10b981' },
      cancellation: { icon: '❌', color: '#ef4444' },
      system: { icon: '🔔', color: '#8b5cf6' },
      booking: { icon: '📅', color: '#f59e0b' }
    };

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">
              🔔 Notifications
              ${unreadCount > 0 ? `<span style="background:var(--danger); color:white; padding:0.15rem 0.6rem; border-radius:50px; font-size:0.8rem; font-weight:700;">${unreadCount} new</span>` : ''}
            </h1>
            <p style="color:var(--text-muted); margin-top:0.25rem;">Stay updated with your appointments and health alerts</p>
          </div>
          ${unreadCount > 0 ? `
            <button class="btn btn-outline" id="mark-all-read" style="font-size:0.8rem;">✓ Mark All Read</button>
          ` : ''}
        </div>
      </div>

      <div id="notif-list" style="display:flex; flex-direction:column; gap:0.75rem;">
        ${notifs.length === 0
          ? `<div class="card" style="text-align:center; padding:4rem 2rem;">
              <div style="font-size:4rem; margin-bottom:1rem;">🔕</div>
              <h3>All Caught Up!</h3>
              <p style="color:var(--text-muted);">No notifications to show.</p>
            </div>`
          : notifs.map(n => {
            const cfg = typeConfig[n.type] || { icon: '🔔', color: '#6b7280' };
            return `
              <div class="card notif-item" style="display:flex; gap:1.25rem; align-items:flex-start; padding:1.25rem; ${!n.read ? 'border-left:3px solid var(--primary); background:rgba(79,70,229,0.03);' : 'opacity:0.7;'} transition:all 0.3s;">
                <div style="width:44px; height:44px; border-radius:12px; background:${cfg.color}15; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0;">${cfg.icon}</div>
                <div style="flex:1; min-width:0;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
                    <h4 style="color:var(--text-dark); font-size:0.95rem; margin-bottom:0.25rem;">${n.title}</h4>
                    <span style="color:var(--text-muted); font-size:0.7rem; white-space:nowrap;">${timeAgo(n.createdAt)}</span>
                  </div>
                  <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.5;">${n.message}</p>
                  <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
                    ${!n.read ? `<button class="btn btn-outline" style="font-size:0.7rem; padding:0.25rem 0.75rem;" onclick="window.markRead('${n.id}')">Mark Read</button>` : ''}
                    <button class="btn btn-outline" style="font-size:0.7rem; padding:0.25rem 0.75rem; color:var(--danger); border-color:var(--danger);" onclick="window.deleteNotif('${n.id}')">Dismiss</button>
                  </div>
                </div>
              </div>`;
          }).join('')}
      </div>
    `;

    // Mark all read
    document.getElementById('mark-all-read')?.addEventListener('click', async () => {
      try {
        await apiFetch('/notifications/read-all', { method: 'PUT' });
        showToast('All notifications marked as read.');
        renderNotifications(container);
      } catch(e) {}
    });

    window.markRead = async (id) => {
      try {
        await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        renderNotifications(container);
      } catch(e) {}
    };

    window.deleteNotif = async (id) => {
      try {
        await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
        showToast('Notification dismissed.');
        renderNotifications(container);
      } catch(e) {}
    };

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load notifications.</p>`;
  }
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
