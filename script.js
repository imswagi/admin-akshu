// ==========================================
// STATE MANAGEMENT (For Admin Module)
// ==========================================
let recruiters = [];
let nextUeidCounter = 3; // To auto-generate UEIDs (e.g., AK-REC-003)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verify Admin is logged in
    const activeUEID = localStorage.getItem('active_ueid') || 'AK-ADM-001';
    const activeRole = localStorage.getItem('active_role') || 'admin';
    
    // Security check: Kick out non-admins
    if (activeRole !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('admin-name-display').innerText = `ID: ${activeUEID}`;
    fetchRecruiters(); 
});

// ==========================================
// API INTEGRATION FUNCTIONS (PHP + SQL)
// ==========================================

// 1. Fetch Recruiters (READ)
async function fetchRecruiters() {
    /* 🔗 PHP INTEGRATION 🔗
    try {
        const response = await fetch('backend/get_recruiters.php');
        recruiters = await response.json();
        renderTable();
    } catch (error) { console.error("DB Error:", error); }
    */

    // --- TEMPORARY DUMMY DATA ---
    recruiters = [
        { id: 1, ueid: 'AK-REC-001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@akshucareer.com', status: 'approved' },
        { id: 2, ueid: 'AK-REC-002', name: 'Neha Gupta', phone: '9123456789', email: 'neha@akshucareer.com', status: 'pending' }
    ];
    renderTable();
}

// 2. Add New Recruiter (CREATE)
async function submitNewRecruiter(event) {
    event.preventDefault();

    const payload = {
        ueid: document.getElementById('auto-ueid-display').innerText,
        name: document.getElementById('add-r-name').value,
        phone: document.getElementById('add-r-phone').value,
        email: document.getElementById('add-r-email').value,
        password: document.getElementById('add-r-password').value,
        role: 'recruiter', // Hardcoded safely
        status: document.getElementById('add-r-status').value
    };

    /* 🔗 PHP INTEGRATION 🔗
    const response = await fetch('backend/add_recruiter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (response.ok) { fetchRecruiters(); }
    */

    // Dummy UI Simulation
    payload.id = Date.now(); // fake unique ID
    recruiters.unshift(payload);
    
    closeModal('addRecruiterModal');
    document.getElementById('add-recruiter-form').reset();
    renderTable();
}

// 3. Update Inline Status (UPDATE - Approve/Suspend)
async function updateStatusInline(id, newStatus) {
    /* 🔗 PHP INTEGRATION 🔗
    await fetch('backend/update_user_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus })
    });
    */
    const recruiter = recruiters.find(r => r.id === id);
    if(recruiter) { recruiter.status = newStatus; renderTable(); }
}

// 4. Save Recruiter Edit (UPDATE)
async function saveRecruiterEdit(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-r-id').value);

    const payload = {
        id: id,
        name: document.getElementById('edit-r-name').value,
        phone: document.getElementById('edit-r-phone').value,
        email: document.getElementById('edit-r-email').value,
        status: document.getElementById('edit-r-status').value
    };

    /* 🔗 PHP INTEGRATION 🔗
    await fetch('backend/update_recruiter.php', { ... });
    fetchRecruiters();
    */

    const recruiter = recruiters.find(r => r.id === id);
    if(recruiter) {
        Object.assign(recruiter, payload);
        renderTable();
        closeModal('editRecruiterModal');
    }
}

// 5. Delete Recruiter (DELETE)
async function deleteRecruiter() {
    const id = parseInt(document.getElementById('edit-r-id').value);
    if(confirm("CRITICAL WARNING: Are you sure you want to completely delete this recruiter account?")) {
        /* 🔗 PHP INTEGRATION 🔗
        await fetch('backend/delete_user.php', { ... });
        fetchRecruiters();
        */
        recruiters = recruiters.filter(r => r.id !== id);
        renderTable(); 
        closeModal('editRecruiterModal');
    }
}

// ==========================================
// DOM RENDERING & MODALS
// ==========================================
function renderTable() {
    const tbody = document.getElementById('recruiter-table-body');
    tbody.innerHTML = '';

    recruiters.forEach(rec => {
        // Status Styling
        let statusClass = 'status-pending'; // Yellow
        if (rec.status === 'approved') statusClass = 'status-selected'; // Green

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-4 py-4 font-mono text-xs font-bold text-slate-500">${rec.ueid}</td>
                <td class="px-4 py-4">
                    <p class="font-semibold text-slate-800">${rec.name}</p>
                </td>
                <td class="px-4 py-4">
                    <p class="text-xs text-slate-500">${rec.phone}</p>
                    <p class="text-xs text-slate-500 mt-0.5">${rec.email}</p>
                </td>
                <td class="px-4 py-4">
                    <select onchange="updateStatusInline(${rec.id}, this.value)" class="status-dropdown ${statusClass} border text-xs font-bold rounded-full px-3 py-1.5 cursor-pointer outline-none transition-all">
                        <option value="approved" ${rec.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="pending" ${rec.status === 'pending' ? 'selected' : ''}>Pending (Suspended)</option>
                    </select>
                </td>
                <td class="px-4 py-4 text-right">
                    <!-- REMOVED: opacity-0 group-hover:opacity-100 so it shows always -->
                    <button onclick="openEditModal(${rec.id})" class="p-2 text-amber-500 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors" title="Edit/Delete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    updateMetrics();
}

function updateMetrics() {
    document.getElementById('metric-total-recruiters').innerText = recruiters.length;
    document.getElementById('metric-active-recruiters').innerText = recruiters.filter(r => r.status === 'approved').length;
    document.getElementById('metric-pending-recruiters').innerText = recruiters.filter(r => r.status === 'pending').length;
}

// ==========================================
// UTILITIES
// ==========================================
function openModal(modalId) {
    if(modalId === 'addRecruiterModal') generateNewUEID(); // Auto-generate when opening
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

function openEditModal(id) {
    const rec = recruiters.find(r => r.id === id);
    if(!rec) return;

    document.getElementById('edit-r-id').value = rec.id;
    document.getElementById('edit-r-name').value = rec.name;
    document.getElementById('edit-r-phone').value = rec.phone;
    document.getElementById('edit-r-email').value = rec.email;
    document.getElementById('edit-r-status').value = rec.status;

    openModal('editRecruiterModal');
}

// Generate an auto-incrementing UEID for UX
function generateNewUEID() {
    // In production, your PHP backend should query the DB for the highest ID and send it back.
    // For MVP frontend, we simulate it:
    let formattedNumber = String(nextUeidCounter).padStart(3, '0');
    document.getElementById('auto-ueid-display').innerText = `AK-REC-${formattedNumber}`;
    nextUeidCounter++;
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('sidebar-expanded')) {
        sidebar.classList.remove('sidebar-expanded');
        sidebar.classList.add('sidebar-collapsed');
    } else {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.classList.add('sidebar-expanded');
    }
}