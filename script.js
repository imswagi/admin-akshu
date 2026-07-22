// ==========================================
// STATE MANAGEMENT (Admin Data)
// ==========================================
let recruiters = [];
// This array acts as our mock database for Attendance and Salary Configurations
let hrData = []; 

document.addEventListener("DOMContentLoaded", () => {
    const activeUEID = localStorage.getItem('active_ueid') || 'AK-ADM-001';
    const activeRole = localStorage.getItem('active_role') || 'admin';
    
    if (activeRole !== 'admin') { window.location.href = 'index.html'; return; }
    
    document.getElementById('admin-name-display').innerText = `ID: ${activeUEID}`;
    
    // Set today's date in attendance tracker
    document.getElementById('attendance-date').valueAsDate = new Date();

    fetchRecruiters(); 
});

// ==========================================
// API & DATA FETCHING
// ==========================================
async function fetchRecruiters() {
    // --- TEMPORARY DUMMY DATA ---
    recruiters = [
        { id: 1, ueid: 'AK-REC-001', name: 'Rahul Sharma', status: 'approved' },
        { id: 2, ueid: 'AK-REC-002', name: 'Neha Gupta', status: 'approved' }
    ];

    // Auto-generate linked HR data for the mock recruiters if it doesn't exist
    recruiters.forEach(r => {
        if(!hrData.find(h => h.recruiter_id === r.id)) {
            hrData.push({
                recruiter_id: r.id,
                base_salary: 20000,
                allowed_leaves: 2,
                // Mock attendance records for the month
                attendance: { present: 20, half_day: 2, leave: 4, holiday: 2, absent: 2 } 
            });
        }
    });

    renderRecruiterTable();
    renderAttendanceTable();
    renderSalaryTable();
}

// ==========================================
// NAVIGATION (SPA Routing)
// ==========================================
function switchView(viewName) {
    // 1. Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // 2. Show selected view
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    // 3. Update Sidebar Nav styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-transparent', 'text-slate-400');
    });

    const activeBtn = document.getElementById(`nav-${viewName}`);
    activeBtn.classList.remove('bg-transparent', 'text-slate-400');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
}

// ==========================================
// MODULE 1: RECRUITER TABLE (From previous step)
// ==========================================
function renderRecruiterTable() {
    const tbody = document.getElementById('recruiter-table-body');
    tbody.innerHTML = '';
    recruiters.forEach(rec => {
        let statusClass = rec.status === 'approved' ? 'status-selected' : 'status-pending';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-4 py-4 font-mono text-xs font-bold text-slate-500">${rec.ueid}</td>
                <td class="px-4 py-4 font-semibold text-slate-800">${rec.name}</td>
                <td class="px-4 py-4"><span class="status-dropdown ${statusClass} border text-xs font-bold rounded-full px-3 py-1.5 uppercase">${rec.status}</span></td>
                <td class="px-4 py-4 text-right">
                    <button onclick="openModal('editRecruiterModal')" class="text-amber-500 font-semibold hover:underline">Edit</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// MODULE 2: ATTENDANCE TRACKER
// ==========================================
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';
    
    // Only show approved recruiters in the attendance list
    const activeRecruiters = recruiters.filter(r => r.status === 'approved');

    activeRecruiters.forEach(rec => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs font-bold text-slate-500">${rec.ueid}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">${rec.name}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-4 items-center attendance-radios">
                        <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${rec.id}" value="P" checked class="text-blue-600"> <span class="font-bold text-emerald-600">P</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${rec.id}" value="A" class="text-blue-600"> <span class="font-bold text-red-600">A</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${rec.id}" value="HD" class="text-blue-600"> <span class="font-bold text-amber-600">HD</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${rec.id}" value="L" class="text-blue-600"> <span class="font-bold text-purple-600">L</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${rec.id}" value="H" class="text-blue-600"> <span class="font-bold text-blue-600">H</span></label>
                    </div>
                </td>
            </tr>
        `;
    });
}

async function saveDailyAttendance() {
    const date = document.getElementById('attendance-date').value;
    /* 🔗 PHP INTEGRATION 🔗
       Loop through radios, collect data, and POST to backend/save_attendance.php
    */
    alert(`Mock: Attendance for ${date} saved securely to database!`);
    
    // In a real app, saving attendance updates the `hrData.attendance` stats.
    calculateSalaries(); // Recalculate salaries based on new attendance
}

// ==========================================
// MODULE 3: SALARY CALCULATOR & CONFIG
// ==========================================
function openSalaryConfigModal(recruiterId) {
    const rData = hrData.find(h => h.recruiter_id === recruiterId);
    const rec = recruiters.find(r => r.id === recruiterId);
    
    document.getElementById('config-r-id').value = recruiterId;
    document.getElementById('config-r-name').innerText = `Configuring: ${rec.name} (${rec.ueid})`;
    document.getElementById('config-base-salary').value = rData.base_salary;
    document.getElementById('config-paid-leaves').value = rData.allowed_leaves;
    
    openModal('salaryConfigModal');
}

function saveSalaryConfig(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('config-r-id').value);
    const rData = hrData.find(h => h.recruiter_id === id);
    
    rData.base_salary = parseFloat(document.getElementById('config-base-salary').value);
    rData.allowed_leaves = parseInt(document.getElementById('config-paid-leaves').value);
    
    /* 🔗 PHP INTEGRATION 🔗 POST to backend/update_salary_config.php */
    
    closeModal('salaryConfigModal');
    renderSalaryTable();
}

function calculateSalaries() {
    renderSalaryTable();
    alert("Salaries recalculated based on current month's attendance.");
}

function renderSalaryTable() {
    const tbody = document.getElementById('salary-table-body');
    const totalWorkingDays = parseInt(document.getElementById('salary-month').value); // Usually 30
    tbody.innerHTML = '';

    const activeRecruiters = recruiters.filter(r => r.status === 'approved');

    activeRecruiters.forEach(rec => {
        const data = hrData.find(h => h.recruiter_id === rec.id);
        const att = data.attendance;

        // 1. Math: Calculate Payable Days
        let paidLeavesTaken = Math.min(att.leave, data.allowed_leaves);
        let unpaidLeavesTaken = Math.max(0, att.leave - data.allowed_leaves);
        
        let totalPaidDays = att.present + (att.half_day * 0.5) + att.holiday + paidLeavesTaken;

        // 2. Math: Calculate Financials
        let perDaySalary = data.base_salary / totalWorkingDays;
        let netPayable = totalPaidDays * perDaySalary;

        // Format to Indian Rupees
        let formattedBase = `₹${data.base_salary.toLocaleString('en-IN')}`;
        let formattedPayable = `₹${netPayable.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-4">
                    <p class="font-bold text-slate-800">${rec.name}</p>
                    <p class="text-xs text-slate-500 font-mono">${rec.ueid}</p>
                </td>
                <td class="px-4 py-4">
                    <p class="font-semibold text-slate-700">${formattedBase}</p>
                    <p class="text-xs text-slate-500">Allowed Leaves: ${data.allowed_leaves}</p>
                </td>
                <td class="px-4 py-4">
                    <div class="flex gap-2 flex-wrap max-w-[200px]">
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">P: ${att.present}</span>
                        <span class="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-bold">A: ${att.absent}</span>
                        <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">HD: ${att.half_day}</span>
                        <span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold">L: ${att.leave}</span>
                        <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">H: ${att.holiday}</span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <p class="font-bold text-slate-800">${totalPaidDays} Days</p>
                    ${unpaidLeavesTaken > 0 ? `<p class="text-xs text-red-500">Loss of Pay: ${unpaidLeavesTaken} Days</p>` : ''}
                </td>
                <td class="px-4 py-4">
                    <p class="text-lg font-black text-emerald-600">${formattedPayable}</p>
                </td>
                <td class="px-4 py-4 text-right">
                    <button onclick="openSalaryConfigModal(${rec.id})" class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded transition-colors">
                        Config Salary
                    </button>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// UTILITIES
// ==========================================
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }
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
