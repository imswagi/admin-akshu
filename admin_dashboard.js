// ==========================================
// STATE MANAGEMENT & LOCAL DATABASE ENGINE
// ==========================================
let recruiters = [];
let hrData = []; 
let performanceData = [];
let crmData = [];
let financeData = [];
let tenureData = [];
let nextUeidCounter = 6; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verify Admin is logged in
    const activeUEID = localStorage.getItem('active_ueid') || 'AK-ADM-001';
    const activeRole = localStorage.getItem('active_role') || 'admin';
    
    if (activeRole !== 'admin') { window.location.href = 'index.html'; return; }
    
    document.getElementById('admin-name-display').innerText = `ID: ${activeUEID}`;
    document.getElementById('attendance-date').valueAsDate = new Date();

    // 2. Load data from our Local Browser Database
    fetchAllData(); 
});

// ==========================================
// BROWSER DATABASE LOGIC
// ==========================================
function fetchAllData() {
    const savedRecruiters = localStorage.getItem('db_recruiters');
    const savedHR = localStorage.getItem('db_hrData');

    if (savedRecruiters && savedHR) {
        recruiters = JSON.parse(savedRecruiters);
        hrData = JSON.parse(savedHR);
        performanceData = JSON.parse(localStorage.getItem('db_performance'));
        crmData = JSON.parse(localStorage.getItem('db_crm'));
        financeData = JSON.parse(localStorage.getItem('db_finance'));
        tenureData = JSON.parse(localStorage.getItem('db_tenure'));
        nextUeidCounter = parseInt(localStorage.getItem('db_nextId'));
    } else {
        recruiters = [
            { id: 1, ueid: 'AK-REC-001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@akshucareer.com', status: 'approved' },
            { id: 2, ueid: 'AK-REC-002', name: 'Neha Gupta', phone: '9123456789', email: 'neha@akshucareer.com', status: 'approved' },
            { id: 3, ueid: 'AK-REC-003', name: 'Vikram Desai', phone: '9988776655', email: 'vikram@akshucareer.com', status: 'approved' },
            { id: 4, ueid: 'AK-REC-004', name: 'Pooja Verma', phone: '9998887776', email: 'pooja@akshucareer.com', status: 'pending' },
            { id: 5, ueid: 'AK-REC-005', name: 'Amit Kumar', phone: '9112233445', email: 'amit@akshucareer.com', status: 'pending' }
        ];

        hrData = [
            { recruiter_id: 1, base_salary: 25000, allowed_leaves: 2, attendance: { present: 26, half_day: 0, leave: 0, holiday: 4, absent: 0 } },
            { recruiter_id: 2, base_salary: 22000, allowed_leaves: 2, attendance: { present: 24, half_day: 0, leave: 2, holiday: 4, absent: 0 } },
            { recruiter_id: 3, base_salary: 20000, allowed_leaves: 2, attendance: { present: 18, half_day: 2, leave: 5, holiday: 4, absent: 1 } }
        ];

        performanceData = [
            { recruiter_id: 1, reached: 210, pending: 45, in_process: 60, selected: 25 },
            { recruiter_id: 2, reached: 150, pending: 30, in_process: 40, selected: 12 },
            { recruiter_id: 3, reached: 80, pending: 50, in_process: 10, selected: 2 }
        ];

        // ADDED IDs TO CRM DATA FOR DROPDOWN TARGETING
        crmData = [
            { id: 1, company: 'Tech Mahindra', poc: 'Mr. Anil Singh', stage: 'Proposal Sent', expected_rev: 150000, next_date: '2026-08-05' },
            { id: 2, company: 'Infosys', poc: 'Ms. Kavita Reddy', stage: 'Negotiation', expected_rev: 220000, next_date: '2026-07-29' },
            { id: 3, company: 'TCS', poc: 'Mr. Rohan Das', stage: 'Initial Meeting', expected_rev: 80000, next_date: '2026-08-10' },
            { id: 4, company: 'Wipro', poc: 'Mrs. Sharma', stage: 'Closed Won', expected_rev: 300000, next_date: '2026-07-25' }
        ];

        financeData = [
            { date: '2026-07-10', desc: 'Candidate Placement - Tech Mahindra', type: 'Revenue', amount: 120000 },
            { date: '2026-07-15', desc: 'Office Rent & Utilities', type: 'Expense', amount: 45000 }
        ];

        tenureData = [
            { candidate: 'Aarav Gupta', company: 'Tech Mahindra', recruiter: 'Rahul Sharma', join_date: '2026-06-15' }, 
            { candidate: 'Priya Patel', company: 'Infosys', recruiter: 'Neha Gupta', join_date: '2026-07-20' }
        ];
        
        saveDataToStorage(); 
    }

    renderRecruiterTable();
    renderAttendanceTable();
    renderSalaryTable();
    populatePerformanceDropdown();
    renderPerformanceGraph();
    renderClientTable();
    renderFinancials();
    renderTenureTable();
}

function saveDataToStorage() {
    localStorage.setItem('db_recruiters', JSON.stringify(recruiters));
    localStorage.setItem('db_hrData', JSON.stringify(hrData));
    localStorage.setItem('db_performance', JSON.stringify(performanceData));
    localStorage.setItem('db_crm', JSON.stringify(crmData));
    localStorage.setItem('db_finance', JSON.stringify(financeData));
    localStorage.setItem('db_tenure', JSON.stringify(tenureData));
    localStorage.setItem('db_nextId', nextUeidCounter);
}

// ==========================================
// SPA ROUTING
// ==========================================
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-transparent', 'text-slate-400');
    });

    const activeBtn = document.getElementById(`nav-${viewName}`);
    activeBtn.classList.remove('bg-transparent', 'text-slate-400');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
}

// ==========================================
// MODULE 1: RECRUITER TABLE & CRUD
// ==========================================
function renderRecruiterTable() {
    const tbody = document.getElementById('recruiter-table-body');
    tbody.innerHTML = '';
    
    recruiters.forEach(rec => {
        let statusClass = rec.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200';
        
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-4 py-4 font-mono text-xs font-bold text-slate-500">${rec.ueid}</td>
                <td class="px-4 py-4">
                    <p class="font-semibold text-slate-800">${rec.name}</p>
                    <p class="text-xs text-slate-500">${rec.phone} | ${rec.email}</p>
                </td>
                <td class="px-4 py-4">
                    <select onchange="updateStatusInline(${rec.id}, this.value)" class="border text-xs font-bold rounded-full px-3 py-1.5 uppercase outline-none cursor-pointer ${statusClass}">
                        <option value="approved" ${rec.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="pending" ${rec.status === 'pending' ? 'selected' : ''}>Pending / Suspended</option>
                    </select>
                </td>
                <td class="px-4 py-4 text-right">
                    <button onclick="openEditModal(${rec.id})" class="text-amber-500 font-semibold hover:underline">Edit</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('metric-total-recruiters').innerText = recruiters.length;
    document.getElementById('metric-active-recruiters').innerText = recruiters.filter(r => r.status === 'approved').length;
    document.getElementById('metric-pending-recruiters').innerText = recruiters.filter(r => r.status === 'pending').length;
}

function submitNewRecruiter(event) {
    event.preventDefault();
    const payload = {
        id: Date.now(),
        ueid: document.getElementById('auto-ueid-display').innerText,
        name: document.getElementById('add-r-name').value,
        phone: document.getElementById('add-r-phone').value,
        email: document.getElementById('add-r-email').value,
        status: document.getElementById('add-r-status').value
    };
    
    recruiters.unshift(payload);
    
    hrData.push({
        recruiter_id: payload.id,
        base_salary: 15000,
        allowed_leaves: 1,
        attendance: { present: 0, half_day: 0, leave: 0, holiday: 0, absent: 0 }
    });

    saveDataToStorage(); 
    closeModal('addRecruiterModal');
    document.getElementById('add-recruiter-form').reset();
    fetchAllData(); 
}

function updateStatusInline(id, newStatus) {
    const recruiter = recruiters.find(r => r.id === id);
    if(recruiter) { recruiter.status = newStatus; saveDataToStorage(); fetchAllData(); }
}

function saveRecruiterEdit(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-r-id').value);
    const recruiter = recruiters.find(r => r.id === id);
    if(recruiter) {
        recruiter.name = document.getElementById('edit-r-name').value;
        recruiter.phone = document.getElementById('edit-r-phone').value;
        recruiter.email = document.getElementById('edit-r-email').value;
        recruiter.status = document.getElementById('edit-r-status').value;
        saveDataToStorage();
        fetchAllData();
        closeModal('editRecruiterModal');
    }
}

function deleteRecruiter() {
    const id = parseInt(document.getElementById('edit-r-id').value);
    if(confirm("CRITICAL WARNING: Delete this recruiter?")) {
        recruiters = recruiters.filter(r => r.id !== id);
        hrData = hrData.filter(h => h.recruiter_id !== id);
        saveDataToStorage();
        fetchAllData(); 
        closeModal('editRecruiterModal');
    }
}

// ==========================================
// MODULE 2: ATTENDANCE TRACKER
// ==========================================
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';
    const activeRecruiters = recruiters.filter(r => r.status === 'approved');

    activeRecruiters.forEach(rec => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="px-6 py-4 font-mono text-xs font-bold text-slate-500">${rec.ueid}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">${rec.name}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-4 items-center bg-white p-2 rounded border border-slate-200 inline-flex">
                        <label class="flex items-center gap-1 cursor-pointer hover:bg-emerald-50 px-2 py-1 rounded"><input type="radio" name="att_${rec.id}" value="P" checked class="text-emerald-600"> <span class="font-bold text-emerald-600">P</span></label>
                        <label class="flex items-center gap-1 cursor-pointer hover:bg-red-50 px-2 py-1 rounded"><input type="radio" name="att_${rec.id}" value="A" class="text-red-600"> <span class="font-bold text-red-600">A</span></label>
                        <label class="flex items-center gap-1 cursor-pointer hover:bg-amber-50 px-2 py-1 rounded"><input type="radio" name="att_${rec.id}" value="HD" class="text-amber-600"> <span class="font-bold text-amber-600">HD</span></label>
                        <label class="flex items-center gap-1 cursor-pointer hover:bg-purple-50 px-2 py-1 rounded"><input type="radio" name="att_${rec.id}" value="L" class="text-purple-600"> <span class="font-bold text-purple-600">L</span></label>
                        <label class="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"><input type="radio" name="att_${rec.id}" value="H" class="text-blue-600"> <span class="font-bold text-blue-600">H</span></label>
                    </div>
                </td>
            </tr>
        `;
    });
}

function saveDailyAttendance() {
    const date = document.getElementById('attendance-date').value;
    alert(`Mock: Attendance for ${date} saved!`);
}

// ==========================================
// MODULE 3: SALARY CALCULATOR
// ==========================================
function renderSalaryTable() {
    const tbody = document.getElementById('salary-table-body');
    const totalWorkingDays = parseInt(document.getElementById('salary-month').value) || 30;
    tbody.innerHTML = '';
    const activeRecruiters = recruiters.filter(r => r.status === 'approved');

    activeRecruiters.forEach(rec => {
        const data = hrData.find(h => h.recruiter_id === rec.id);
        if(!data) return;
        const att = data.attendance;

        let paidLeavesTaken = Math.min(att.leave, data.allowed_leaves);
        let unpaidLeavesTaken = Math.max(0, att.leave - data.allowed_leaves);
        
        let totalPaidDays = att.present + (att.half_day * 0.5) + att.holiday + paidLeavesTaken;
        let perDaySalary = data.base_salary / totalWorkingDays;
        let netPayable = totalPaidDays * perDaySalary;

        let formattedBase = `₹${data.base_salary.toLocaleString('en-IN')}`;
        let formattedPayable = `₹${netPayable.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="px-4 py-4"><p class="font-bold text-slate-800">${rec.name}</p><p class="text-xs text-slate-500 font-mono">${rec.ueid}</p></td>
                <td class="px-4 py-4"><p class="font-semibold text-slate-700">${formattedBase}</p><p class="text-xs text-slate-500 mt-1">Leaves Allowed: <span class="font-bold">${data.allowed_leaves}</span></p></td>
                <td class="px-4 py-4">
                    <div class="flex gap-2 flex-wrap max-w-[250px]">
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">P: ${att.present}</span>
                        <span class="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-bold">A: ${att.absent}</span>
                        <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">HD: ${att.half_day}</span>
                        <span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold">L: ${att.leave}</span>
                        <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">H: ${att.holiday}</span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <p class="font-bold text-slate-800">${totalPaidDays} Days Valid</p>
                    ${unpaidLeavesTaken > 0 ? `<p class="text-xs text-red-500 font-bold mt-1">Loss of Pay: -${unpaidLeavesTaken} Days</p>` : ''}
                </td>
                <td class="px-4 py-4 bg-emerald-50/30"><p class="text-lg font-black text-emerald-600">${formattedPayable}</p></td>
                <td class="px-4 py-4 text-right">
                    <button onclick="openSalaryConfigModal(${rec.id})" class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded transition-colors shadow-sm border border-slate-300">Config</button>
                </td>
            </tr>
        `;
    });
}

function calculateSalaries() { renderSalaryTable(); }

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
    
    saveDataToStorage(); 
    closeModal('salaryConfigModal');
    fetchAllData();
}

// ==========================================
// MODULE 4: RECRUITER PERFORMANCE GRAPH
// ==========================================
function populatePerformanceDropdown() {
    const select = document.getElementById('perf-recruiter-select');
    select.innerHTML = '<option value="all">All Recruiters (Aggregated)</option>';
    recruiters.filter(r => r.status === 'approved').forEach(r => {
        select.innerHTML += `<option value="${r.id}">${r.name} (${r.ueid})</option>`;
    });
}

function renderPerformanceGraph() {
    const selectedId = document.getElementById('perf-recruiter-select').value;
    let data;

    if (selectedId === 'all') {
        data = performanceData.reduce((acc, curr) => ({
            reached: acc.reached + curr.reached, pending: acc.pending + curr.pending,
            in_process: acc.in_process + curr.in_process, selected: acc.selected + curr.selected
        }), { reached: 0, pending: 0, in_process: 0, selected: 0 });
    } else {
        data = performanceData.find(p => p.recruiter_id == selectedId) || { reached: 0, pending: 0, in_process: 0, selected: 0 };
    }

    const max = data.reached === 0 ? 1 : data.reached; 
    const wPending = (data.pending / max) * 100;
    const wProcess = (data.in_process / max) * 100;
    const wSelected = (data.selected / max) * 100;

    const container = document.getElementById('perf-bars-container');
    container.innerHTML = `
        <div><div class="flex justify-between text-sm font-bold text-slate-700 mb-1"><span>Total Reached</span> <span class="text-blue-600">${data.reached}</span></div><div class="w-full bg-slate-100 rounded-full h-4"><div class="bg-blue-400 h-4 rounded-full" style="width: 100%"></div></div></div>
        <div><div class="flex justify-between text-sm font-bold text-slate-700 mb-1"><span>Pending</span> <span class="text-amber-600">${data.pending}</span></div><div class="w-full bg-slate-100 rounded-full h-4"><div class="bg-amber-400 h-4 rounded-full" style="width: ${wPending}%"></div></div></div>
        <div><div class="flex justify-between text-sm font-bold text-slate-700 mb-1"><span>In Process</span> <span class="text-purple-600">${data.in_process}</span></div><div class="w-full bg-slate-100 rounded-full h-4"><div class="bg-purple-500 h-4 rounded-full" style="width: ${wProcess}%"></div></div></div>
        <div><div class="flex justify-between text-sm font-bold text-slate-700 mb-1"><span>Selected</span> <span class="text-emerald-600">${data.selected}</span></div><div class="w-full bg-slate-100 rounded-full h-4"><div class="bg-emerald-500 h-4 rounded-full" style="width: ${wSelected}%"></div></div></div>
    `;
}

// ==========================================
// MODULE 5: CLIENT CRM (WITH DROPDOWNS)
// ==========================================
function renderClientTable() {
    const tbody = document.getElementById('crm-table-body');
    tbody.innerHTML = '';
    
    crmData.forEach(c => {
        // Dynamic colors for the dropdown based on stage
        let stageClass = 'text-blue-800 bg-blue-50 border-blue-200'; // Default/Initial/Proposal
        if (c.stage === 'Closed Won') stageClass = 'text-emerald-800 bg-emerald-50 border-emerald-200';
        if (c.stage === 'Negotiation') stageClass = 'text-purple-800 bg-purple-50 border-purple-200';
        if (c.stage === 'Closed Lost') stageClass = 'text-red-800 bg-red-50 border-red-200';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="px-6 py-4">
                    <p class="font-bold text-slate-800">${c.company}</p>
                    <p class="text-xs text-slate-500 mt-1">POC: <span class="font-semibold">${c.poc}</span></p>
                </td>
                <td class="px-6 py-4">
                    <select onchange="updateCrmStageInline(${c.id}, this.value)" class="border text-xs font-bold rounded-full px-3 py-1.5 outline-none cursor-pointer shadow-sm transition-colors ${stageClass}">
                        <option value="Initial Meeting" ${c.stage === 'Initial Meeting' ? 'selected' : ''}>Initial Meeting</option>
                        <option value="Proposal Sent" ${c.stage === 'Proposal Sent' ? 'selected' : ''}>Proposal Sent</option>
                        <option value="Negotiation" ${c.stage === 'Negotiation' ? 'selected' : ''}>Negotiation</option>
                        <option value="Closed Won" ${c.stage === 'Closed Won' ? 'selected' : ''}>Closed Won</option>
                        <option value="Closed Lost" ${c.stage === 'Closed Lost' ? 'selected' : ''}>Closed Lost</option>
                    </select>
                </td>
                <td class="px-6 py-4 font-black text-slate-700">₹${c.expected_rev.toLocaleString('en-IN')}</td>
                <td class="px-6 py-4 text-blue-600 text-sm font-bold">${c.next_date}</td>
            </tr>
        `;
    });
}

// Function to handle the CRM Dropdown change
function updateCrmStageInline(id, newStage) {
    const client = crmData.find(c => c.id === id);
    if(client) { 
        client.stage = newStage; 
        saveDataToStorage(); 
        renderClientTable(); // Re-render to update the colors
    }
}

// ==========================================
// MODULE 6: FINANCIAL LEDGER
// ==========================================
function renderFinancials() {
    const tbody = document.getElementById('finance-table-body');
    tbody.innerHTML = '';
    let totalRev = 0; let totalExp = 0;

    financeData.forEach(f => {
        if(f.type === 'Revenue') { totalRev += f.amount; } else { totalExp += f.amount; }
        let color = f.type === 'Revenue' ? 'text-emerald-600' : 'text-red-500';
        let bgType = f.type === 'Revenue' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
        let sign = f.type === 'Revenue' ? '+' : '-';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="px-6 py-4 text-sm text-slate-500 font-semibold">${f.date}</td>
                <td class="px-6 py-4 font-bold text-slate-700">${f.desc}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 ${bgType} rounded text-[10px] uppercase font-black">${f.type}</span></td>
                <td class="px-6 py-4 text-right font-black ${color}">${sign} ₹${f.amount.toLocaleString('en-IN')}</td>
            </tr>
        `;
    });

    let totalSalaries = hrData.reduce((sum, h) => sum + h.base_salary, 0);
    totalExp += totalSalaries;
    tbody.innerHTML += `
        <tr class="bg-red-50/50 border-b border-red-100">
            <td class="px-6 py-4 text-sm text-red-400 font-semibold">Auto-Calc</td>
            <td class="px-6 py-4 font-bold text-red-800">Monthly Recruiter Salaries Payout</td>
            <td class="px-6 py-4"><span class="px-2.5 py-1 bg-red-200 text-red-800 rounded text-[10px] uppercase font-black">Expense</span></td>
            <td class="px-6 py-4 text-right font-black text-red-500">- ₹${totalSalaries.toLocaleString('en-IN')}</td>
        </tr>
    `;

    document.getElementById('fin-revenue').innerText = `₹ ${totalRev.toLocaleString('en-IN')}`;
    document.getElementById('fin-expenses').innerText = `₹ ${totalExp.toLocaleString('en-IN')}`;
    let net = totalRev - totalExp;
    let profitEl = document.getElementById('fin-profit');
    profitEl.innerText = `₹ ${net.toLocaleString('en-IN')}`;
    profitEl.className = net >= 0 ? "text-3xl font-black mt-1 text-emerald-400" : "text-3xl font-black mt-1 text-red-400";
}

// ==========================================
// MODULE 7: CANDIDATE TENURE TRACKER
// ==========================================
function renderTenureTable() {
    const tbody = document.getElementById('tenure-table-body');
    tbody.innerHTML = '';
    const today = new Date();

    tenureData.forEach(t => {
        const joinDate = new Date(t.join_date);
        const timeDiff = today.getTime() - joinDate.getTime();
        let daysCompleted = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        let progressVal = daysCompleted;
        let statusText = "In Progress";
        let statusColor = "text-blue-600";
        let barColor = "bg-blue-500";
        
        if (daysCompleted >= 60) {
            progressVal = 60;
            statusText = "Completed (Tender Cleared)";
            statusColor = "text-emerald-600";
            barColor = "bg-emerald-500";
        } else if (daysCompleted < 0) {
            progressVal = 0;
            daysCompleted = 0;
            statusText = "Joining Pending";
            statusColor = "text-amber-500";
            barColor = "bg-slate-300";
        }

        let progressPercent = (progressVal / 60) * 100;

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="px-6 py-4">
                    <p class="font-bold text-slate-800">${t.candidate}</p>
                    <p class="text-xs text-slate-500 mt-1">Company: <span class="font-semibold text-slate-700">${t.company}</span></p>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-700">${t.recruiter}</td>
                <td class="px-6 py-4 text-sm font-mono text-slate-500">${t.join_date}</td>
                <td class="px-6 py-4 w-1/3">
                    <div class="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        <span class="${statusColor}">${daysCompleted} Days</span> <span>Target: 60 Days</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-3"><div class="${barColor} h-3 rounded-full" style="width: ${progressPercent}%"></div></div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-black uppercase tracking-wider ${statusColor}">${statusText}</span>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// UTILITIES
// ==========================================
function openModal(modalId) {
    if(modalId === 'addRecruiterModal') generateNewUEID();
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

function generateNewUEID() {
    let formattedNumber = String(nextUeidCounter).padStart(3, '0');
    document.getElementById('auto-ueid-display').innerText = `AK-REC-${formattedNumber}`;
    nextUeidCounter++;
}

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

function logout() { localStorage.clear(); window.location.href = 'index.html'; }
