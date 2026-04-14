import { apiFetch } from '../api.js';
import { showToast, showSpinner, hideSpinner } from '../components/toaster.js';

export const renderMedicines = async (container) => {
  container.innerHTML = `<div class="spinner" style="margin:4rem auto; width:40px; height:40px;"></div>`;

  try {
    const [medicines, orders] = await Promise.all([
      apiFetch('/medicines'),
      apiFetch('/medicines/orders').catch(() => [])
    ]);

    container.innerHTML = `
      <div style="margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h1 style="font-size:2rem; display:flex; align-items:center; gap:0.75rem;">💊 Order Medicines</h1>
          <p style="color:var(--text-muted); margin-top:0.25rem;">Browse and order medicines for home delivery</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline active-view-btn" data-view="shop" style="padding:0.5rem 1rem;">🛒 Shop</button>
          <button class="btn btn-outline view-orders-btn" data-view="orders" style="padding:0.5rem 1rem;">📦 My Orders</button>
        </div>
      </div>

      <div id="shop-view">
        <div style="margin-bottom:1.5rem;">
          <input type="text" id="medicine-search" class="input-field" placeholder="🔍 Search medicines..." style="max-width:400px; width:100%;">
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:1rem; margin-bottom:2rem;" id="medicines-grid">
          ${medicines.map(m => `
            <div class="card" style="padding:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                <h4 style="color:var(--text-dark); font-size:1rem;">${m.name}</h4>
                <span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.65rem; background:${m.inStock ? '#d1fae5' : '#fee2e2'}; color:${m.inStock ? '#065f46' : '#991b1b'};">${m.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.5rem;">${m.category}</p>
              <p style="color:var(--text-muted); font-size:0.75rem; margin-bottom:0.75rem;">${m.manufacturer}</p>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.25rem; font-weight:700; color:var(--primary);">₹${m.price}</span>
                <button class="btn btn-primary add-to-cart-btn" data-id="${m.id}" data-name="${m.name}" data-price="${m.price}" ${!m.inStock ? 'disabled' : ''}>Add to Cart</button>
              </div>
              ${m.requiresPrescription ? '<p style="color:var(--danger); font-size:0.7rem; margin-top:0.5rem;">⚠️ Prescription required</p>' : ''}
            </div>
          `).join('')}
        </div>

        <!-- Cart Section -->
        <div class="card" style="padding:1.5rem; position:sticky; bottom:1rem; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="font-size:1rem; margin-bottom:0.25rem;">🛒 Cart (<span id="cart-count">0</span> items)</h3>
              <p style="color:var(--text-muted); font-size:0.85rem;">Total: <span id="cart-total" style="font-weight:700; color:var(--primary);">₹0</span></p>
            </div>
            <button class="btn btn-primary" id="checkout-btn" disabled>Proceed to Checkout</button>
          </div>
        </div>
      </div>

      <div id="orders-view" style="display:none;">
        <h3 style="margin-bottom:1.5rem;">📦 My Medicine Orders</h3>
        ${orders.length === 0 
          ? '<div class="card" style="padding:2rem; text-align:center;"><p style="color:var(--text-muted);">No orders yet. Start shopping!</p></div>'
          : orders.map(order => `
            <div class="card" style="padding:1.5rem; margin-bottom:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                <div>
                  <span style="font-weight:700; font-size:0.9rem;">Order #${order.id.slice(0, 8).toUpperCase()}</span>
                  <p style="color:var(--text-muted); font-size:0.75rem; margin-top:0.25rem;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span style="padding:0.25rem 0.75rem; border-radius:50px; font-size:0.75rem; font-weight:600; 
                  background:${order.status === 'confirmed' ? '#d1fae5' : order.status === 'delivered' ? '#bbf7d0' : order.status === 'shipped' ? '#dbeafe' : '#fef3c7'};
                  color:${order.status === 'confirmed' ? '#065f46' : order.status === 'delivered' ? '#166534' : order.status === 'shipped' ? '#1e40af' : '#92400e'};">
                  ${order.status === 'confirmed' ? '📋 Confirmed' : order.status === 'shipped' ? '🚚 Shipped' : order.status === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                </span>
              </div>
              
              <!-- Tracking Timeline -->
              <div style="margin:1rem 0; padding:1rem; background:var(--surface-hover); border-radius:8px;">
                <h4 style="font-size:0.85rem; margin-bottom:0.75rem;">📍 Order Tracking</h4>
                <div style="display:flex; justify-content:space-between; position:relative; padding:0 0.5rem;">
                  <div style="position:absolute; top:12px; left:10px; right:10px; height:2px; background:var(--border);"></div>
                  <div style="position:absolute; top:12px; left:10px; height:2px; background:var(--primary); width:${order.status === 'confirmed' ? '0%' : order.status === 'shipped' ? '50%' : order.status === 'delivered' ? '100%' : '0%'};"></div>
                  
                  <div style="text-align:center; position:relative; z-index:1;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${order.status ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem; color:white; font-size:0.7rem;">✓</div>
                    <span style="font-size:0.65rem; color:var(--text-muted);">Ordered</span>
                  </div>
                  <div style="text-align:center; position:relative; z-index:1;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${order.status === 'shipped' || order.status === 'delivered' ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem; color:white; font-size:0.7rem;">✓</div>
                    <span style="font-size:0.65rem; color:var(--text-muted);">Shipped</span>
                  </div>
                  <div style="text-align:center; position:relative; z-index:1;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${order.status === 'delivered' ? 'var(--primary)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem; color:white; font-size:0.7rem;">✓</div>
                    <span style="font-size:0.65rem; color:var(--text-muted);">Delivered</span>
                  </div>
                </div>
              </div>

              <div style="border-top:1px solid var(--border); padding-top:1rem;">
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">📦 Items:</p>
                ${(order.items || []).map(item => `
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; font-size:0.85rem;">
                    <span>${item.name} x ${item.qty}</span>
                    <span style="font-weight:600;">₹${item.price * item.qty}</span>
                  </div>
                `).join('')}
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border); font-weight:700;">
                <span>Total</span>
                <span style="color:var(--primary);">₹${(order.items || []).reduce((sum, item) => sum + item.price * item.qty, 0)}</span>
              </div>
              <div style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">
                📍 Delivery: ${order.address || 'Address not available'}
              </div>
            </div>
          `).join('')
        }
      </div>
    `;

    let cart = [];

    // View switching
    document.querySelectorAll('.active-view-btn, .view-orders-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.active-view-btn, .view-orders-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const view = this.dataset.view;
        document.getElementById('shop-view').style.display = view === 'shop' ? 'block' : 'none';
        document.getElementById('orders-view').style.display = view === 'orders' ? 'block' : 'none';
      });
    });

    const updateCartUI = () => {
      document.getElementById('cart-count').textContent = cart.length;
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      document.getElementById('cart-total').textContent = `₹${total}`;
      document.getElementById('checkout-btn').disabled = cart.length === 0;
    };

    const addToCart = (id, name, price) => {
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }
      updateCartUI();
      showToast(`${name} added to cart!`, 'success');
    };

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        addToCart(this.dataset.id, this.dataset.name, parseInt(this.dataset.price));
      });
    });

    document.getElementById('medicine-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = medicines.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.category.toLowerCase().includes(term)
      );
      
      document.getElementById('medicines-grid').innerHTML = filtered.map(m => `
        <div class="card" style="padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <h4 style="color:var(--text-dark); font-size:1rem;">${m.name}</h4>
            <span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.65rem; background:${m.inStock ? '#d1fae5' : '#fee2e2'}; color:${m.inStock ? '#065f46' : '#991b1b'};">${m.inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.5rem;">${m.category}</p>
          <p style="color:var(--text-muted); font-size:0.75rem; margin-bottom:0.75rem;">${m.manufacturer}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:1.25rem; font-weight:700; color:var(--primary);">₹${m.price}</span>
            <button class="btn btn-primary add-to-cart-btn" data-id="${m.id}" data-name="${m.name}" data-price="${m.price}" ${!m.inStock ? 'disabled' : ''}>Add to Cart</button>
          </div>
          ${m.requiresPrescription ? '<p style="color:var(--danger); font-size:0.7rem; margin-top:0.5rem;">⚠️ Prescription required</p>' : ''}
        </div>
      `).join('');

      document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          addToCart(this.dataset.id, this.dataset.name, parseInt(this.dataset.price));
        });
      });
    });

    document.getElementById('checkout-btn').addEventListener('click', async () => {
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      
      if (total === 0) return;

      container.innerHTML = `
        <div style="max-width:600px; margin:0 auto;">
          <div class="card" style="padding:2rem;">
            <h2 style="margin-bottom:1.5rem;">🛒 Checkout</h2>
            
            <div style="margin-bottom:1.5rem;">
              <h4 style="margin-bottom:0.75rem;">Order Summary</h4>
              <div style="background:var(--surface-hover); padding:1rem; border-radius:8px;">
                ${cart.map(item => `
                  <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid var(--border);">
                    <span>${item.name} x ${item.qty}</span>
                    <span style="font-weight:600;">₹${item.price * item.qty}</span>
                  </div>
                `).join('')}
                <div style="display:flex; justify-content:space-between; padding-top:0.75rem; font-weight:700; font-size:1.1rem;">
                  <span>Total</span>
                  <span>₹${total}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Delivery Address</label>
              <textarea id="delivery-address" class="input-field" rows="3" placeholder="Enter your delivery address" required></textarea>
            </div>

            <div class="form-group">
              <label>Payment Method</label>
              <select id="payment-method" class="input-field">
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <button class="btn btn-primary" id="place-order-btn" style="width:100%;">Place Order (₹${total})</button>
            <button class="btn btn-outline" id="back-to-medicines" style="width:100%; margin-top:0.75rem;">Continue Shopping</button>
          </div>
        </div>
      `;

      document.getElementById('back-to-medicines').addEventListener('click', () => {
        renderMedicines(container);
      });

      document.getElementById('place-order-btn').addEventListener('click', async () => {
        const address = document.getElementById('delivery-address').value;
        const paymentMethod = document.getElementById('payment-method').value;

        if (!address) {
          showToast('Please enter delivery address', 'error');
          return;
        }

        showSpinner('place-order-btn');
        try {
          await apiFetch('/medicines/order', {
            method: 'POST',
            body: JSON.stringify({ items: cart, address, paymentMethod })
          });
          showToast('Order placed successfully!', 'success');
          cart = [];
          setTimeout(() => renderMedicines(container), 1500);
        } catch(err) {
          showToast('Failed to place order', 'error');
        } finally {
          hideSpinner('place-order-btn');
        }
      });
    });

  } catch(err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load medicines.</p>`;
  }
};
