/* =============================================
   EcoReport – Waste Management System
   script.js | All interactive features
   ============================================= */

// ─────────────────────────────────────────────
// 1. INITIAL SETUP & DUMMY DATA
// ─────────────────────────────────────────────

// Pre-seed dummy users if not already set
function initDummyData() {
  // Default users
  if (!getUsers().find(u => u.email === 'user@eco.com')) {
    saveUser({ name: 'Aryan Sharma', email: 'user@eco.com', phone: '9876543210', password: 'pass123', role: 'user', points: 170 });
  }
  if (!getUsers().find(u => u.email === 'admin@eco.com')) {
    saveUser({ name: 'Admin EcoReport', email: 'admin@eco.com', phone: '9999000000', password: 'admin123', role: 'admin', points: 0 });
  }

  // Pre-seed sample reports if none exist
  if (getReports().length === 0) {
    const samples = [
      { id: genId(), userEmail: 'user@eco.com', userName: 'Aryan Sharma', wasteType: 'Biodegradable', quantity: 'Medium', location: 'Aundh, Pune, Maharashtra', description: 'Heap of food waste near the park gate.', photo: '', status: 'Pending', date: '2025-07-10', points: 50 },
      { id: genId(), userEmail: 'user@eco.com', userName: 'Aryan Sharma', wasteType: 'Recyclable', quantity: 'Small', location: 'Baner Road, Pune', description: 'Plastic bottles and cardboard boxes on footpath.', photo: '', status: 'Assigned', date: '2025-07-08', points: 50 },
      { id: genId(), userEmail: 'user@eco.com', userName: 'Aryan Sharma', wasteType: 'E-Waste', quantity: 'Small', location: 'Kothrud, Pune', description: 'Old TV and broken laptop dumped on roadside.', photo: '', status: 'Picked Up', date: '2025-07-05', points: 50 },
      { id: genId(), userEmail: 'user@eco.com', userName: 'Aryan Sharma', wasteType: 'Hazardous', quantity: 'Small', location: 'Wakad, Pune', description: 'Used batteries and paint cans near school.', photo: '', status: 'Recycled', date: '2025-07-01', points: 80 },
      { id: genId(), userEmail: 'demo@eco.com', userName: 'Priya Mehta', wasteType: 'Mixed', quantity: 'Large', location: 'Shivajinagar, Pune', description: 'Large mixed waste pile near construction site.', photo: '', status: 'Pending', date: '2025-07-11', points: 50 },
    ];
    samples.forEach(r => { const reports = getReports(); reports.push(r); localStorage.setItem('ecoreport_reports', JSON.stringify(reports)); });
  }
}

// ─────────────────────────────────────────────
// 2. LOCALSTORAGE HELPERS
// ─────────────────────────────────────────────

function getUsers()   { return JSON.parse(localStorage.getItem('ecoreport_users')   || '[]'); }
function getReports() { return JSON.parse(localStorage.getItem('ecoreport_reports') || '[]'); }

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('ecoreport_users', JSON.stringify(users));
}

function updateReport(id, changes) {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx !== -1) { Object.assign(reports[idx], changes); localStorage.setItem('ecoreport_reports', JSON.stringify(reports)); }
}

function getCurrentUser() { return JSON.parse(localStorage.getItem('ecoreport_current') || 'null'); }
function setCurrentUser(u) { localStorage.setItem('ecoreport_current', JSON.stringify(u)); }
function clearCurrentUser() { localStorage.removeItem('ecoreport_current'); }

function genId() { return 'RPT-' + Math.random().toString(36).substr(2,6).toUpperCase(); }

// ─────────────────────────────────────────────
// 3. AUTH LOGIC
// ─────────────────────────────────────────────

function switchTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const isAdmin  = document.getElementById('adminLogin').checked;

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) { showToast('Invalid email or password', 'error'); return; }

  if (isAdmin && user.role !== 'admin') { showToast('This account is not an admin', 'error'); return; }

  setCurrentUser(user);

  if (user.role === 'admin') {
    showScreen('adminDashboard');
    loadAdminDashboard();
  } else {
    showScreen('userDashboard');
    loadUserDashboard(user);
  }
  showToast(`Welcome back, ${user.name.split(' ')[0]}! 🌿`);
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const pass  = document.getElementById('regPassword').value;

  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  if (getUsers().find(u => u.email === email)) { showToast('Email already registered', 'error'); return; }

  const newUser = { name, email, phone, password: pass, role: 'user', points: 0 };
  saveUser(newUser);
  setCurrentUser(newUser);

  showScreen('userDashboard');
  loadUserDashboard(newUser);
  showToast(`Account created! Welcome, ${name.split(' ')[0]}! 🌱`);
}

function logout() {
  clearCurrentUser();
  showScreen('authScreen');
  showToast('Logged out successfully');
}

// ─────────────────────────────────────────────
// 4. SCREEN MANAGEMENT
// ─────────────────────────────────────────────

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  // Show chatbot only on user dashboard
  document.getElementById('chatFab').style.display = (screenId === 'userDashboard') ? 'flex' : 'none';
}

// ─────────────────────────────────────────────
// 5. USER DASHBOARD
// ─────────────────────────────────────────────

function loadUserDashboard(user) {
  document.getElementById('userName').textContent    = user.name.split(' ')[0];
  document.getElementById('userAvatar').textContent  = user.name[0].toUpperCase();
  updatePointsDisplay(user.points || 0);
  updateDashStats(user);
  loadRecentReports(user);
}

function updatePointsDisplay(pts) {
  document.getElementById('headerPoints').textContent = pts;
  document.getElementById('userPoints').textContent   = pts;
  document.getElementById('bigPoints').textContent    = pts;

  let tier = '🌱 Seedling';
  if (pts >= 500) tier = '🌳 Eco Champion';
  else if (pts >= 300) tier = '🍃 Green Guardian';
  else if (pts >= 150) tier = '🌿 Eco Warrior';
  document.getElementById('pointsTier').textContent = tier;
}

function updateDashStats(user) {
  const reports  = getReports().filter(r => r.userEmail === user.email);
  const pending  = reports.filter(r => r.status === 'Pending').length;
  const resolved = reports.filter(r => r.status === 'Recycled').length;

  document.getElementById('totalReports').textContent   = reports.length;
  document.getElementById('pendingReports').textContent = pending;
  document.getElementById('resolvedReports').textContent= resolved;
}

function loadRecentReports(user) {
  const container = document.getElementById('recentReportsList');
  const reports   = getReports().filter(r => r.userEmail === user.email).slice(0, 4);

  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:1.2rem">No reports yet. Submit your first report!</p>';
    return;
  }

  container.innerHTML = reports.map(r => `
    <div class="report-item">
      <div class="ri-icon ${wasteColorClass(r.wasteType)}">${wasteIcon(r.wasteType)}</div>
      <div class="ri-info">
        <strong>${r.wasteType} Waste</strong>
        <small><i class="fas fa-map-marker-alt"></i> ${r.location} &nbsp;•&nbsp; ${r.date}</small>
      </div>
      <span class="status-badge ${statusClass(r.status)}">${r.status}</span>
    </div>
  `).join('');
}

// Show a dashboard section and highlight nav
function showSection(id) {
  document.querySelectorAll('#userDashboard .dash-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');

  document.querySelectorAll('#userDashboard .nav-link').forEach(l => l.classList.remove('active'));
  const map = { dashHome:'0', reportWaste:'1', myReports:'2', ecoPoints:'3', awareness:'4', contact:'5', about:'6' };
  const links = document.querySelectorAll('#userDashboard .nav-link');
  if (map[id] !== undefined && links[map[id]]) links[map[id]].classList.add('active');

  if (id === 'myReports') renderMyReports();
  if (id === 'ecoPoints') {
    const u = getCurrentUser();
    updatePointsDisplay(getUsers().find(usr => usr.email === u.email)?.points || 0);
  }

  // Close sidebar on mobile
  document.getElementById('sidebar')?.classList.remove('open');
}

// ─────────────────────────────────────────────
// 6. GPS LOCATION
// ─────────────────────────────────────────────

let currentLocation = '';

function getGPSLocation(updateFormToo = false) {
  const statusEl = document.getElementById('locationStatus');
  statusEl.className = 'loc-status loading';
  statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Detecting your location…</span>';

  if (!navigator.geolocation) {
    statusEl.className = 'loc-status error';
    statusEl.innerHTML = '<i class="fas fa-times-circle"></i> <span>Geolocation not supported</span>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(5);
      const lng = pos.coords.longitude.toFixed(5);
      currentLocation = `Lat: ${lat}, Lng: ${lng}`;

      statusEl.className = 'loc-status success';
      statusEl.innerHTML = `<i class="fas fa-check-circle"></i> <span>📍 ${currentLocation}</span>`;

      // Show a simple embed map
      showMap(lat, lng);

      if (updateFormToo) {
        document.getElementById('reportLocation').value = currentLocation;
      }
      showToast('Location detected! 📍');
    },
    (err) => {
      statusEl.className = 'loc-status error';
      statusEl.innerHTML = '<i class="fas fa-times-circle"></i> <span>Location access denied. Use manual input.</span>';
      showToast('Could not access location', 'error');
    }
  );
}

function showMap(lat, lng) {
  document.getElementById('mapPlaceholder').classList.add('hidden');
  const iframe = document.getElementById('mapIframe');
  iframe.classList.remove('hidden');
  iframe.innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}" allowfullscreen></iframe>`;
}

function setManualLocation() {
  const val = document.getElementById('manualLocation').value.trim();
  if (!val) { showToast('Enter a location first', 'error'); return; }
  currentLocation = val;
  const statusEl = document.getElementById('locationStatus');
  statusEl.className = 'loc-status success';
  statusEl.innerHTML = `<i class="fas fa-check-circle"></i> <span>📍 ${val}</span>`;
  document.getElementById('reportLocation').value = val;
  showToast('Location set manually');
}

// ─────────────────────────────────────────────
// 7. PHOTO UPLOAD & CAMERA
// ─────────────────────────────────────────────

let uploadedPhoto = '';
let cameraStream  = null;

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please upload an image file', 'error'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedPhoto = e.target.result;
    showImagePreview(uploadedPhoto);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  document.getElementById('imagePreview').src = src;
  document.getElementById('imagePreviewWrap').classList.remove('hidden');
  document.getElementById('photoArea').classList.add('hidden');
}

function removePhoto() {
  uploadedPhoto = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('imagePreviewWrap').classList.add('hidden');
  document.getElementById('photoArea').classList.remove('hidden');
  document.getElementById('photoInput').value = '';
}

async function openCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    document.getElementById('cameraStream').srcObject = cameraStream;
    document.getElementById('cameraSection').classList.remove('hidden');
    showToast('Camera opened');
  } catch(e) {
    showToast('Camera access denied', 'error');
  }
}

function capturePhoto() {
  const video  = document.getElementById('cameraStream');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  uploadedPhoto = canvas.toDataURL('image/jpeg');
  showImagePreview(uploadedPhoto);
  closeCamera();
}

function closeCamera() {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  document.getElementById('cameraSection').classList.add('hidden');
}

// ─────────────────────────────────────────────
// 8. REPORT SUBMISSION
// ─────────────────────────────────────────────

function submitReport(e) {
  e.preventDefault();
  const user     = getCurrentUser();
  const wasteType = document.querySelector('input[name="wasteType"]:checked');
  const quantity  = document.querySelector('input[name="quantity"]:checked');
  const location  = document.getElementById('reportLocation').value.trim();
  const desc      = document.getElementById('reportDesc').value.trim();

  if (!wasteType || !quantity || !location) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const pointsEarned = 50 + (uploadedPhoto ? 20 : 0) + (wasteType.value === 'Hazardous' ? 30 : 0);

  const report = {
    id: genId(),
    userEmail: user.email,
    userName: user.name,
    wasteType: wasteType.value,
    quantity: quantity.value,
    location,
    description: desc,
    photo: uploadedPhoto,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    points: pointsEarned,
  };

  // Save report
  const reports = getReports();
  reports.unshift(report);
  localStorage.setItem('ecoreport_reports', JSON.stringify(reports));

  // Update user points
  const users = getUsers();
  const uIdx  = users.findIndex(u => u.email === user.email);
  if (uIdx !== -1) {
    users[uIdx].points = (users[uIdx].points || 0) + pointsEarned;
    localStorage.setItem('ecoreport_users', JSON.stringify(users));
    setCurrentUser(users[uIdx]);
    updatePointsDisplay(users[uIdx].points);
  }

  // Reset form
  e.target.reset();
  removePhoto();
  uploadedPhoto = '';

  showToast(`Report submitted! +${pointsEarned} Eco Points 🌿`, 'success');
  updateDashStats(getCurrentUser());
  loadRecentReports(getCurrentUser());

  // Go to My Reports
  setTimeout(() => showSection('myReports'), 800);
}

// ─────────────────────────────────────────────
// 9. MY REPORTS
// ─────────────────────────────────────────────

let currentFilter = 'all';

function renderMyReports(filter) {
  if (filter) currentFilter = filter;
  const user    = getCurrentUser();
  let reports   = getReports().filter(r => r.userEmail === user.email);
  if (currentFilter !== 'all') reports = reports.filter(r => r.status.toLowerCase() === currentFilter.toLowerCase());

  const container = document.getElementById('allReportsList');
  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;grid-column:1/-1">No reports found in this category.</p>';
    return;
  }

  container.innerHTML = reports.map(r => `
    <div class="report-card">
      <div class="rc-img">
        ${r.photo ? `<img src="${r.photo}" alt="Waste Photo"/>` : `<span class="no-img">${wasteIcon(r.wasteType)}</span>`}
      </div>
      <div class="rc-body">
        <div class="rc-header">
          <span class="rc-type">${r.wasteType} Waste</span>
          <span class="status-badge ${statusClass(r.status)}">${r.status}</span>
        </div>
        <div class="rc-meta">
          <span><i class="fas fa-weight-hanging"></i> ${r.quantity}</span>
          <span><i class="fas fa-calendar"></i> ${r.date}</span>
        </div>
        <div class="rc-meta"><i class="fas fa-map-marker-alt"></i> ${r.location}</div>
        <div class="status-timeline">
          ${['Pending','Assigned','Picked Up','Recycled'].map(s => `
            <div class="timeline-step ${isStepDone(r.status, s) ? 'done' : ''}">
              <div class="ts-dot"></div>
              <span class="ts-label">${s}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function filterReports(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMyReports(filter);
}

// Check if a status step is 'done' for timeline
function isStepDone(currentStatus, step) {
  const order = ['Pending', 'Assigned', 'Picked Up', 'Recycled'];
  return order.indexOf(currentStatus) >= order.indexOf(step);
}

// ─────────────────────────────────────────────
// 10. ADMIN DASHBOARD
// ─────────────────────────────────────────────

function loadAdminDashboard() {
  const reports = getReports();
  document.getElementById('adTotalReports').textContent = reports.length;
  document.getElementById('adPending').textContent   = reports.filter(r => r.status === 'Pending').length;
  document.getElementById('adAssigned').textContent  = reports.filter(r => r.status === 'Assigned').length;
  document.getElementById('adResolved').textContent  = reports.filter(r => r.status === 'Recycled').length;
}

function showAdminSection(id) {
  document.querySelectorAll('#adminDashboard .dash-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelectorAll('#adminDashboard .nav-link').forEach(l => l.classList.remove('active'));

  if (id === 'adminReports') renderAdminReports();
  if (id === 'adminUsers')   renderAdminUsers();
  if (id === 'adminHome')    loadAdminDashboard();

  document.querySelector('#adminDashboard .sidebar')?.classList.remove('open');
}

function renderAdminReports() {
  const reports = getReports();
  const container = document.getElementById('adminReportsList');

  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem">No reports yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Photo</th>
          <th>User</th>
          <th>Type</th>
          <th>Qty</th>
          <th>Location</th>
          <th>Date</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(r => `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>
              ${r.photo
                ? `<img class="thumb" src="${r.photo}" alt=""/>`
                : `<div class="no-thumb">${wasteIcon(r.wasteType)}</div>`}
            </td>
            <td>${r.userName}<br/><small style="color:var(--text-light)">${r.userEmail}</small></td>
            <td><span class="status-badge ${wasteTypeClass(r.wasteType)}">${r.wasteType}</span></td>
            <td>${r.quantity}</td>
            <td style="max-width:160px;white-space:normal;font-size:0.8rem">${r.location}</td>
            <td>${r.date}</td>
            <td>
              <select class="status-select" onchange="changeStatus('${r.id}', this.value)">
                ${['Pending','Assigned','Picked Up','Recycled'].map(s =>
                  `<option value="${s}" ${r.status===s?'selected':''}>${s}</option>`
                ).join('')}
              </select>
            </td>
            <td><button class="view-btn" onclick="viewReportModal('${r.id}')">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function changeStatus(id, newStatus) {
  updateReport(id, { status: newStatus });
  loadAdminDashboard();
  showToast(`Status updated to: ${newStatus}`);
}

function viewReportModal(id) {
  const r = getReports().find(rep => rep.id === id);
  if (!r) return;

  document.getElementById('modalContent').innerHTML = `
    <h3 style="font-family:'Syne',sans-serif;font-size:1.1rem;margin-bottom:1rem">Report Details – ${r.id}</h3>
    ${r.photo ? `<img class="modal-report-img" src="${r.photo}" alt="Photo"/>` : '<div style="height:80px;background:var(--bg2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:1rem">' + wasteIcon(r.wasteType) + '</div>'}
    <div class="modal-detail-row"><i class="fas fa-user"></i><div><strong>${r.userName}</strong><br/><small>${r.userEmail}</small></div></div>
    <div class="modal-detail-row"><i class="fas fa-recycle"></i><span><strong>Type:</strong> ${r.wasteType} | <strong>Qty:</strong> ${r.quantity}</span></div>
    <div class="modal-detail-row"><i class="fas fa-map-marker-alt"></i><span>${r.location}</span></div>
    <div class="modal-detail-row"><i class="fas fa-calendar"></i><span>${r.date}</span></div>
    <div class="modal-detail-row"><i class="fas fa-info-circle"></i><span>${r.description || 'No description'}</span></div>
    <div class="modal-detail-row"><i class="fas fa-circle-dot"></i><span class="status-badge ${statusClass(r.status)}">${r.status}</span></div>
  `;
  openModal();
}

function renderAdminUsers() {
  const users = getUsers().filter(u => u.role !== 'admin');
  const container = document.getElementById('adminUsersList');

  if (users.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem">No users yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Eco Points</th><th>Reports</th></tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td>${u.phone || '—'}</td>
            <td><span style="color:var(--earth);font-weight:700">⭐ ${u.points || 0}</span></td>
            <td>${getReports().filter(r => r.userEmail === u.email).length}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function exportReports() {
  const reports = getReports();
  const csv = [
    ['ID','User','Email','Type','Quantity','Location','Date','Status','Points'],
    ...reports.map(r => [r.id, r.userName, r.userEmail, r.wasteType, r.quantity, `"${r.location}"`, r.date, r.status, r.points])
  ].map(row => row.join(',')).join('\n');

  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'ecoreport_data.csv';
  a.click();
  showToast('Data exported as CSV!');
}

// ─────────────────────────────────────────────
// 11. EMERGENCY ALERT
// ─────────────────────────────────────────────

function toggleEmergency() {
  document.getElementById('modalContent').innerHTML = `
    <div style="text-align:center">
      <div style="font-size:3rem;margin-bottom:0.8rem">🚨</div>
      <h3 style="font-family:'Syne',sans-serif;color:var(--red);margin-bottom:0.6rem">Emergency Hazardous Alert</h3>
      <p style="color:var(--text-mid);font-size:0.9rem;margin-bottom:1.2rem">Send an urgent alert to our response team for immediate hazardous waste collection.</p>
      <p style="font-size:0.85rem;background:var(--red-soft);color:var(--red);padding:0.8rem;border-radius:10px;margin-bottom:1.2rem">
        ⚠️ Use only for genuinely dangerous waste: chemicals, medical waste, industrial hazards.
      </p>
      <button class="btn-primary" onclick="sendEmergencyAlert()" style="background:var(--red);box-shadow:0 3px 12px rgba(239,68,68,0.4)"><i class="fas fa-phone-alt"></i> Send Emergency Alert</button>
    </div>
  `;
  openModal();
}

function sendEmergencyAlert() {
  closeModal();
  showToast('🚨 Emergency alert sent! Team notified within 30 min.', 'success');
}

// ─────────────────────────────────────────────
// 12. CHATBOT
// ─────────────────────────────────────────────

const botResponses = {
  'how to report waste': '📋 To report waste:\n1. Go to "Report Waste" in the menu.\n2. Select waste type & quantity.\n3. Set your location (GPS or manual).\n4. Upload a photo.\n5. Click Submit Report!\nYou earn Eco Points for every report. 🌿',
  'report waste': '📋 Go to "Report Waste" in the sidebar, fill in the form with waste type, quantity, location and photo, then submit!',
  'biodegradable': '🌿 Biodegradable waste includes food scraps, fruit & vegetable peels, dry leaves, garden waste, and paper. It decomposes naturally and can be composted to make fertilizer.',
  'recyclable': '♻️ Recyclable waste includes plastic bottles, glass jars, metal cans, newspapers, and cardboard. These materials can be reprocessed into new products.',
  'hazardous': '☠️ Hazardous waste includes batteries, paint, chemicals, pesticides, and medical waste. These require special disposal. Never dump them in regular bins!',
  'e-waste': '💻 E-Waste includes old phones, laptops, TVs, wires, and batteries. They contain toxic materials and must be returned to authorized collection centers.',
  'collected': '🚛 Collection typically happens within 24–48 hours of your report being assigned. Track status in "My Reports". Urgent/hazardous reports are prioritized.',
  'when will': '🚛 Reports are usually collected within 24–48 hours of being assigned. Track your report status under "My Reports" in the menu.',
  'eco points': '⭐ Eco Points guide:\n• Submit a report → +50 pts\n• Add a photo → +20 pts\n• Hazardous alert → +30 pts\n• Report verified → +50 pts\n• Refer a friend → +25 pts\nRedeem points for rewards in the Eco Points section!',
  'points': '⭐ You earn Eco Points for every report you submit. Go to "Eco Points" to check your balance and redeem rewards like tree planting, event passes, and vouchers!',
  'separate': '🗑️ Waste separation guide:\n🌿 Green bin: Biodegradable (food, garden waste)\n♻️ Blue bin: Recyclable (plastic, paper, metal)\n🔴 Red bin: Hazardous (chemicals, batteries)\n🟡 Yellow bin: Medical/E-waste',
  'segregate': '🗑️ Segregate waste into:\n• Green bin: Biodegradable\n• Blue bin: Recyclable\n• Red bin: Hazardous\n• Yellow: E-waste\nThis makes collection and processing much more efficient!',
  'hello': '👋 Hello! I\'m EcoBot, your waste management assistant. How can I help you today?',
  'hi': '👋 Hi there! I\'m EcoBot. Ask me about waste reporting, segregation, or eco points!',
  'help': '🤖 I can help you with:\n• How to report waste\n• Waste types & segregation\n• Eco Points & rewards\n• Collection timelines\nJust type your question!',
  'contact': '📞 You can reach our support at:\n• Email: support@ecoreport.in\n• Helpline: 1800-ECO-HELP\n• Working Hours: Mon–Sat, 8AM–6PM',
  'thank': '🌱 You\'re welcome! Remember, every report makes our planet a little cleaner. Keep up the great work! 💚',
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(botResponses)) {
    if (lower.includes(key)) return reply;
  }
  return '🤔 I\'m not sure about that. Try asking:\n• How to report waste?\n• What is biodegradable waste?\n• How to earn eco-points?\n• When will waste be collected?';
}

function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('open');
}

function sendChatMsg() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;

  appendMsg(msg, 'user');
  input.value = '';

  // Typing delay for natural feel
  setTimeout(() => {
    appendMsg(getBotReply(msg), 'bot');
  }, 500);
}

function askBot(question) {
  appendMsg(question, 'user');
  setTimeout(() => appendMsg(getBotReply(question), 'bot'), 500);
}

function appendMsg(text, sender) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br/>')}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ─────────────────────────────────────────────
// 13. CONTACT FORM
// ─────────────────────────────────────────────

function submitContact(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll reply within 24 hours. 📧', 'success');
  e.target.reset();
}

// ─────────────────────────────────────────────
// 14. MODAL
// ─────────────────────────────────────────────

function openModal()  { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

// ─────────────────────────────────────────────
// 15. TOAST NOTIFICATION
// ─────────────────────────────────────────────

let toastTimeout;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(toastTimeout);
  toastTimeout  = setTimeout(() => t.classList.remove('show'), 3500);
}

// ─────────────────────────────────────────────
// 16. SIDEBAR TOGGLE (Mobile)
// ─────────────────────────────────────────────

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ─────────────────────────────────────────────
// 17. HELPER FUNCTIONS
// ─────────────────────────────────────────────

function wasteIcon(type) {
  const icons = { 'Biodegradable': '🌿', 'Recyclable': '♻️', 'Hazardous': '☠️', 'E-Waste': '💻', 'Mixed': '🗑️' };
  return icons[type] || '🗑️';
}

function wasteColorClass(type) {
  const classes = { 'Biodegradable': 'style="background:#d1fae5;color:#059669"', 'Recyclable': 'style="background:#dbeafe;color:#2563eb"', 'Hazardous': 'style="background:#fff7ed;color:#c2410c"', 'E-Waste': 'style="background:#f5f3ff;color:#7c3aed"', 'Mixed': 'style="background:#f3f4f6;color:#374151"' };
  return classes[type] || '';
}

function wasteTypeClass(type) {
  const c = { 'Biodegradable':'s-recycled', 'Recyclable':'s-assigned', 'Hazardous':'s-pending', 'E-Waste':'style="background:#f5f3ff;color:#7c3aed"', 'Mixed':'style="background:#f3f4f6;color:#374151"' };
  return c[type] || '';
}

function statusClass(status) {
  const map = { 'Pending': 's-pending', 'Assigned': 's-assigned', 'Picked Up': 's-pickedup', 'Recycled': 's-recycled' };
  return map[status] || '';
}

// ─────────────────────────────────────────────
// 18. APP INIT
// ─────────────────────────────────────────────

function init() {
  initDummyData();

  // Pre-fill report location if currentLocation is set
  const locInput = document.getElementById('reportLocation');
  if (locInput && currentLocation) locInput.value = currentLocation;

  // Check if user is already logged in (e.g., page refresh)
  const saved = getCurrentUser();
  if (saved) {
    if (saved.role === 'admin') {
      showScreen('adminDashboard');
      loadAdminDashboard();
    } else {
      showScreen('userDashboard');
      loadUserDashboard(saved);
    }
  }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);

// ─────────────────────────────────────────────
// 19. DRAG & DROP PHOTO
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const photoArea = document.getElementById('photoArea');
  if (!photoArea) return;

  photoArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoArea.style.borderColor = 'var(--green-main)';
    photoArea.style.background  = 'var(--green-soft)';
  });
  photoArea.addEventListener('dragleave', () => {
    photoArea.style.borderColor = '';
    photoArea.style.background  = '';
  });
  photoArea.addEventListener('drop', (e) => {
    e.preventDefault();
    photoArea.style.borderColor = '';
    photoArea.style.background  = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadedPhoto = ev.target.result;
        showImagePreview(uploadedPhoto);
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Please drop an image file', 'error');
    }
  });
});
