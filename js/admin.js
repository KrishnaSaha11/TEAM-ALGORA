/* ==========================================================================
   UNIFIED DIGITAL CAMPUS PLATFORM - ADMINISTRATIVE CONTROLLER
   Prioritizes pending action queues: Gate Passes, Leaves, 3-state Complaints,
   Fee Responses, Notice Publishing & Student Directory.
   ========================================================================== */

const AdminApp = {
  currentTab: "overview",

  init() {
    // 0. Enforce Administrative Role Guard
    if (window.AuthService && !window.AuthService.requireAdmin()) {
      return;
    }

    // 1. Header with admin active
    const headerSlot = document.getElementById("institutional-header-slot");
    if (headerSlot) {
      headerSlot.innerHTML = CampusUI.renderInstitutionalHeader("admin");
      CampusUI.initRoleSwitcher();
    }

    // 2. Setup admin tabs
    this.initTabNavigation();

    // 3. Render all desks
    this.renderAll();

    // 4. Reactive listeners
    window.addEventListener("campus_store_updated", () => {
      this.renderAll();
    });

    window.addEventListener("campus_session_changed", () => {
      this.renderAll();
    });

    // 5. Check hash for direct deep-linking
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      this.switchTab(hash);
    }
  },

  renderAll() {
    this.updatePendingCounters();
    this.renderOverviewQueues();
    this.renderGatePassTable();
    this.renderLeaveTable();
    this.renderComplaintsDesk();
    this.renderFeeQueriesDesk();
    this.renderNoticesDesk();
    this.renderStudentDirectory();
    this.renderExamsDesk();

    if (window.lucide) window.lucide.createIcons();
  },

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  initTabNavigation() {
    const buttons = document.querySelectorAll("#admin-nav-tabs .admin-tab-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabKey = btn.getAttribute("data-tab");
        this.switchTab(tabKey);
      });
    });
  },

  switchTab(tabKey) {
    const panes = document.querySelectorAll(".admin-tab-pane");
    const targetPane = document.getElementById(`admin-tab-${tabKey}`);
    if (!targetPane) return;

    panes.forEach(p => p.classList.add("hidden"));
    targetPane.classList.remove("hidden");

    const buttons = document.querySelectorAll("#admin-nav-tabs .admin-tab-btn");
    buttons.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabKey) {
        btn.className = "admin-tab-btn active px-3 py-2 rounded text-amber-300 bg-slate-800 flex items-center gap-1.5 transition";
      } else {
        btn.className = "admin-tab-btn px-3 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition";
      }
    });

    this.currentTab = tabKey;
    window.location.hash = tabKey;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.lucide) window.lucide.createIcons();
  },

  // ==========================================
  // PENDING ACTION COUNTERS & BADGES
  // ==========================================
  updatePendingCounters() {
    const store = window.campusStore;
    const passes = store.getGatePasses().filter(p => p.status === "Pending");
    const leaves = store.getLeaveApplications().filter(l => l.status === "Pending");
    const complaints = store.getComplaints().filter(c => c.status !== "Resolved");
    const feeQueries = store.getFeeQueries().filter(q => q.status === "Open");

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal("stat-pending-passes", passes.length);
    setVal("stat-pending-leaves", leaves.length);
    setVal("stat-open-complaints", complaints.length);
    setVal("stat-open-feequeries", feeQueries.length);

    setVal("tab-badge-passes", passes.length);
    setVal("tab-badge-leaves", leaves.length);
    setVal("tab-badge-complaints", complaints.length);
    setVal("tab-badge-feequeries", feeQueries.length);
  },

  // ==========================================
  // EXECUTIVE QUEUES (OVERVIEW TAB)
  // ==========================================
  renderOverviewQueues() {
    const passes = window.campusStore.getGatePasses().filter(p => p.status === "Pending");
    const passesList = document.getElementById("overview-pending-passes-list");
    if (passesList) {
      if (passes.length === 0) {
        passesList.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">No pending gate passes awaiting review.</p>`;
      } else {
        passesList.innerHTML = passes.slice(0, 4).map(p => `
          <div class="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-blue-900">${p.id}</span>
                <span class="font-bold text-slate-900">${p.studentName}</span>
                <span class="text-slate-500">(${p.department})</span>
              </div>
              <p class="text-slate-700 mt-0.5"><strong>To:</strong> ${p.destination} • ${p.departureDate}</p>
              <p class="text-[11px] text-slate-400">${p.reason}</p>
            </div>
            <div class="flex items-center space-x-1.5 shrink-0">
              <button onclick="AdminApp.approveGatePass('${p.id}')" class="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded shadow-sm">
                Approve
              </button>
              <button onclick="AdminApp.rejectGatePass('${p.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                Reject
              </button>
            </div>
          </div>
        `).join("");
      }
    }

    const complaints = window.campusStore.getComplaints().filter(c => c.status !== "Resolved");
    const compList = document.getElementById("overview-pending-complaints-list");
    if (compList) {
      if (complaints.length === 0) {
        compList.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">No open hostel maintenance reports.</p>`;
      } else {
        compList.innerHTML = complaints.slice(0, 4).map(c => `
          <div class="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-blue-900">${c.id}</span>
                <span class="font-bold text-slate-900">${c.category}</span>
                ${CampusUI.renderBadge(c.status)}
              </div>
              <p class="text-slate-700 mt-0.5">${c.hostelName}, Room ${c.roomNo}</p>
              <p class="text-[11px] text-slate-500 line-clamp-1">${c.description}</p>
            </div>
            <button onclick="AdminApp.switchTab('complaints')" class="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded shrink-0">
              Manage
            </button>
          </div>
        `).join("");
      }
    }
  },

  // ==========================================
  // GATE PASS DESK (APPROVE / REJECT)
  // ==========================================
  renderGatePassTable() {
    const passes = window.campusStore.getGatePasses();
    const tbody = document.getElementById("admin-gatepass-tbody");
    if (!tbody) return;

    if (passes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No gate pass records.</td></tr>`;
      return;
    }

    tbody.innerHTML = passes.map(p => `
      <tr>
        <td class="font-mono font-bold text-blue-900 text-xs">${p.id}</td>
        <td>
          <p class="font-bold text-slate-900">${p.studentName}</p>
          <p class="text-[11px] text-slate-500 font-mono">Roll: ${p.studentId} (${p.department})</p>
        </td>
        <td class="text-xs text-slate-700">${p.hostelName}<br><span class="text-[11px] text-slate-400">Room ${p.roomNo}</span></td>
        <td>
          <p class="font-semibold text-slate-800 text-xs">${p.destination}</p>
          <p class="text-[11px] text-slate-500">${p.reason}</p>
        </td>
        <td class="text-xs text-slate-600">${p.departureDate} ${p.departureTime}<br><span class="text-[11px] text-slate-400">to ${p.returnDate} ${p.returnTime}</span></td>
        <td>${CampusUI.renderBadge(p.status)}</td>
        <td>
          ${p.status === "Pending" ? `
            <div class="flex items-center space-x-1.5">
              <button onclick="AdminApp.approveGatePass('${p.id}')" class="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded shadow-sm">
                Approve
              </button>
              <button onclick="AdminApp.rejectGatePass('${p.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                Reject
              </button>
            </div>
          ` : `
            <span class="text-xs text-slate-500 font-medium">Decided (${p.reviewedBy || "Warden"})</span>
          `}
        </td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  approveGatePass(id) {
    const pass = window.campusStore.updateGatePassStatus(id, "Approved", "Approved by Campus Administration. Verify student ID at Security Gate.", "Dean (Student Affairs)");
    CampusUI.showToast(`Gate Pass #${pass.id} APPROVED. Digital QR pass is now active for ${pass.studentName}!`, "success");
    this.renderAll();
  },

  rejectGatePass(id) {
    const modalHtml = `
      <div class="space-y-3 text-xs">
        <p class="text-slate-600">Please provide reason for rejecting Gate Pass <strong>#${id}</strong>:</p>
        <textarea id="gatepass-reject-reason" rows="3" required placeholder="e.g. Incomplete emergency contact / Examination period restriction..."
                  class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"></textarea>
      </div>
    `;

    CampusUI.openModal({
      title: `Reject Gate Pass #${id}`,
      subtitle: "Official Grounds for Disapproval",
      contentHtml: modalHtml,
      confirmText: "Confirm Rejection",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const input = document.getElementById("gatepass-reject-reason");
        const reason = input ? input.value.trim() : "Application rejected by Proctorial Board.";
        window.campusStore.updateGatePassStatus(id, "Rejected", reason || "Request rejected.", "Campus Administration");
        close();
        CampusUI.showToast(`Gate Pass #${id} rejected. Reason logged.`, "warning");
        this.renderAll();
      }
    });
  },

  // ==========================================
  // LEAVE APPROVALS DESK
  // ==========================================
  renderLeaveTable() {
    const leaves = window.campusStore.getLeaveApplications();
    const tbody = document.getElementById("admin-leave-tbody");
    if (!tbody) return;

    if (leaves.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No leave applications on file.</td></tr>`;
      return;
    }

    tbody.innerHTML = leaves.map(l => `
      <tr>
        <td class="font-mono font-bold text-blue-900 text-xs">${l.id}</td>
        <td>
          <p class="font-bold text-slate-900 text-xs">${l.studentName}</p>
          <p class="text-[11px] text-slate-500">Roll: ${l.studentId}</p>
        </td>
        <td class="text-xs">
          <strong>${l.leaveType}</strong> (${l.totalDays} Days)<br>
          <span class="text-slate-500">${l.fromDate} to ${l.toDate}</span>
        </td>
        <td class="text-xs text-slate-700">
          <p class="font-medium">${l.reason}</p>
          ${l.additionalDetails ? `<p class="text-[11px] text-slate-400">${l.additionalDetails}</p>` : ""}
        </td>
        <td>${CampusUI.renderBadge(l.status)}</td>
        <td>
          ${l.status === "Pending" ? `
            <div class="flex items-center space-x-1.5">
              <button onclick="AdminApp.approveLeave('${l.id}')" class="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded">
                Approve
              </button>
              <button onclick="AdminApp.rejectLeave('${l.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                Reject
              </button>
            </div>
          ` : `
            <span class="text-xs text-slate-500 font-medium">Decided</span>
          `}
        </td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  approveLeave(id) {
    window.campusStore.updateLeaveStatus(id, "Approved", "Sanctioned by Academic Section. Leave record updated.", "Dean (Academic Affairs)");
    CampusUI.showToast(`Leave application #${id} sanctioned.`, "success");
    this.renderAll();
  },

  rejectLeave(id) {
    window.campusStore.updateLeaveStatus(id, "Rejected", "Incomplete verification or unverified medical documents.", "Dean (Academic Affairs)");
    CampusUI.showToast(`Leave application #${id} rejected.`, "warning");
    this.renderAll();
  },

  // ==========================================
  // HOSTEL MAINTENANCE DESK (3-STAGE: Pending -> In Progress -> Resolved)
  // ==========================================
  renderComplaintsDesk() {
    const complaints = window.campusStore.getComplaints();
    const container = document.getElementById("admin-complaints-container");
    if (!container) return;

    if (complaints.length === 0) {
      container.innerHTML = `<div class="univ-card p-8 text-center text-slate-400 text-xs">No hostel complaints on record.</div>`;
      return;
    }

    container.innerHTML = complaints.map(c => `
      <div class="univ-card p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-blue-900 text-xs">${c.id}</span>
              <span class="font-bold text-slate-900 text-sm">${c.category} Maintenance</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">${c.priority} Priority</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Reported by: <strong>${c.studentName}</strong> (${c.studentId}) • ${c.hostelName}, Room ${c.roomNo} • Logged: ${c.submittedOn}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            ${CampusUI.renderBadge(c.status)}
          </div>
        </div>

        <p class="text-xs text-slate-700 leading-relaxed">${c.description}</p>

        <!-- Status Transition & Technician Assignment Control -->
        <div class="bg-slate-50 p-3.5 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2">
            <span class="text-slate-500 font-semibold">Change Lifecycle Status:</span>
            <select onchange="AdminApp.handleComplaintStatusChange('${c.id}', this.value)" class="p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none">
              <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>1. Pending</option>
              <option value="In Progress" ${c.status === "In Progress" ? "selected" : ""}>2. In Progress</option>
              <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>3. Resolved</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-slate-500">Assigned: <strong class="text-slate-800">${c.assignedTo || "Estate Desk"}</strong></span>
            <button onclick="AdminApp.openAssignComplaintModal('${c.id}')" class="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-white border border-slate-300 rounded hover:bg-slate-100">
              Update Remarks
            </button>
          </div>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  handleComplaintStatusChange(id, newStatus) {
    const comp = window.campusStore.updateComplaintStatus(id, newStatus, `Status updated to ${newStatus} by Estate Admin.`);
    CampusUI.showToast(`Complaint #${id} updated to status: ${newStatus.toUpperCase()}`, "info");
    this.renderAll();
  },

  openAssignComplaintModal(id) {
    const comp = window.campusStore.getComplaintById(id);
    if (!comp) return;

    const modalHtml = `
      <form id="assign-complaint-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Assigned Maintenance Wing / Staff</label>
          <input type="text" name="assignedTo" required value="${comp.assignedTo || 'Campus Electrical Maintenance Wing'}"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Technician / Inspection Remarks</label>
          <textarea name="remarks" required rows="3" placeholder="e.g. Technician Ramesh Sahoo dispatched with replacement parts..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">${comp.adminRemarks || ''}</textarea>
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: `Update Maintenance Desk #${comp.id}`,
      subtitle: `${comp.category} • ${comp.hostelName}, Room ${comp.roomNo}`,
      contentHtml: modalHtml,
      confirmText: "Save Remarks",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("assign-complaint-form");
        const formData = new FormData(form);
        const assignedTo = formData.get("assignedTo");
        const remarks = formData.get("remarks");

        window.campusStore.updateComplaintStatus(id, comp.status, remarks, assignedTo);
        close();
        CampusUI.showToast(`Complaint #${id} maintenance notes updated.`, "success");
        this.renderAll();
      }
    });
  },

  // ==========================================
  // FEE QUERIES & ACCOUNTS DESK
  // ==========================================
  renderFeeQueriesDesk() {
    const queries = window.campusStore.getFeeQueries();
    const container = document.getElementById("admin-feequeries-container");
    if (!container) return;

    if (queries.length === 0) {
      container.innerHTML = `<div class="univ-card p-8 text-center text-slate-400 text-xs">No fee queries raised.</div>`;
      return;
    }

    container.innerHTML = queries.map(q => `
      <div class="univ-card p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-blue-900 text-xs">${q.id}</span>
              <span class="font-bold text-slate-900 text-sm">${q.subject}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Raised by: <strong>${q.studentName}</strong> (${q.studentId}) • Category: ${q.category} • ${q.submittedOn}
            </p>
          </div>
          <div>${CampusUI.renderBadge(q.status)}</div>
        </div>

        <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">${q.description}</p>

        ${q.reply ? `
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
            <p class="font-bold">Official Response Sent (${q.repliedBy}):</p>
            <p class="mt-0.5">${q.reply}</p>
            <p class="text-[10px] text-slate-400 mt-1">${q.repliedOn}</p>
          </div>
        ` : ""}

        <div class="pt-2 flex justify-end">
          <button onclick="AdminApp.openReplyFeeQueryModal('${q.id}')" class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-sm flex items-center gap-1.5 transition">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
            <span>${q.reply ? "Update Response" : "Post Official Reply"}</span>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  openReplyFeeQueryModal(id) {
    const query = window.campusStore.data.feeQueries.find(q => q.id === id);
    if (!query) return;

    const modalHtml = `
      <form id="fee-reply-form" class="space-y-4 text-xs">
        <div class="bg-slate-50 p-3 rounded border border-slate-200">
          <p><strong>Student:</strong> ${query.studentName} (${query.studentId})</p>
          <p><strong>Query:</strong> ${query.subject}</p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Official Accounts Reply *</label>
          <textarea name="reply" required rows="4" placeholder="Enter clear resolution, counter dispatch details, or payment verification status..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">${query.reply || ''}</textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Set Ticket Status *</label>
          <select name="status" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
            <option value="Replied" ${query.status === 'Replied' ? 'selected' : ''}>Replied (Student can review reply)</option>
            <option value="Closed" ${query.status === 'Closed' ? 'selected' : ''}>Closed (Query Fully Resolved)</option>
          </select>
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: `Respond to Fee Query #${query.id}`,
      subtitle: "Finance & Accounts Branch • BPUT",
      contentHtml: modalHtml,
      confirmText: "Send Reply",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("fee-reply-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const replyText = formData.get("reply");
        const status = formData.get("status");

        window.campusStore.replyFeeQuery(id, replyText, "Accounts Officer (B. K. Mohapatra)", status);
        close();
        CampusUI.showToast(`Reply sent for Query #${id}! Status: ${status.toUpperCase()}`, "success");
        this.renderAll();
      }
    });
  },

  // ==========================================
  // NOTICES DESK (ADD / EDIT / DELETE)
  // ==========================================
  renderNoticesDesk() {
    const notices = window.campusStore.getNotices();
    const container = document.getElementById("admin-notices-container");
    if (!container) return;

    container.innerHTML = notices.map(n => `
      <div class="univ-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${n.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}">
              ${n.category}
            </span>
            <span class="text-xs text-slate-400">${n.date}</span>
            <span class="text-xs text-slate-500">• Target: <strong>${n.targetAudience}</strong></span>
            <span class="text-[11px] text-slate-400 font-mono">ID: ${n.id}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900">${n.title}</h4>
          <p class="text-xs text-slate-600 mt-1">${n.summary}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="AdminApp.deleteNotice('${n.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition" title="Delete Notice">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  openPublishNoticeModal() {
    const modalHtml = `
      <form id="publish-notice-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Notice Headline / Title *</label>
          <input type="text" name="title" required placeholder="e.g. Schedule for Annual Technical Symposium & Workshop Registrations"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Category *</label>
            <select name="category" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Hostel">Hostel</option>
              <option value="Fees">Fees & Accounts</option>
              <option value="Events">Campus Events</option>
              <option value="General">General Notice</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Priority *</label>
            <select name="priority" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="General">General</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Target Audience *</label>
            <select name="targetAudience" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Everyone">Everyone</option>
              <option value="All 5th Semester Students">All 5th Semester Students</option>
              <option value="All Hostel Residents">All Hostel Residents</option>
              <option value="CSE Department">CSE Department Only</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Issuing Authority *</label>
          <input type="text" name="issuingAuthority" required value="Office of the Dean (Student Affairs)"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Short Summary (for ticker & cards) *</label>
          <textarea name="summary" required rows="2" placeholder="One or two sentences explaining the core circular points..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Circular Content *</label>
          <textarea name="fullContent" required rows="4" placeholder="Complete institutional announcement text..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Simulated Attachment File Name (Optional)</label>
          <input type="text" name="attachmentName" placeholder="e.g. Circular_Order_2026_09.pdf"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Publish Official University Circular",
      subtitle: "University Public Notice Board & Student Portals",
      contentHtml: modalHtml,
      confirmText: "Publish Circular",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("publish-notice-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const notice = window.campusStore.addNotice(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Notice #${notice.id} published live to all student portals!`, "success");
        this.renderAll();
      }
    });
  },

  deleteNotice(id) {
    if (confirm(`Are you sure you want to withdraw notice #${id}?`)) {
      window.campusStore.deleteNotice(id);
      CampusUI.showToast(`Notice #${id} deleted from circular repository.`, "warning");
      this.renderAll();
    }
  },

  // ==========================================
  // STUDENT DIRECTORY (HYBRID SUPABASE + LOCAL)
  // ==========================================
  async renderStudentDirectory() {
    const tbody = document.getElementById("admin-directory-tbody");
    if (!tbody) return;

    let students = window.campusStore ? window.campusStore.getStudents() : [];
    let isCloudLive = false;

    // Check Supabase if service is available
    if (window.SupabaseCampusDB && window.SupabaseCampusDB.isConfigured()) {
      try {
        const res = await window.SupabaseCampusDB.getStudents();
        if (res && res.data && res.data.length > 0) {
          students = res.data;
          isCloudLive = (res.source === "supabase");
        }
      } catch (err) {
        console.warn("Supabase fetch fallback to local:", err);
      }
    }

    // Update Header Badges
    const badgeEl = document.getElementById("supabase-db-badge");
    const countEl = document.getElementById("supabase-record-count");
    const bannerText = document.getElementById("supabase-banner-text");

    if (badgeEl) {
      if (isCloudLive) {
        badgeEl.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Supabase PostgreSQL (Live)</span>`;
      } else {
        badgeEl.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200";
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-500"></span><span>Local Seed Registry (${students.length} Students)</span>`;
      }
    }

    if (countEl) {
      countEl.textContent = `${students.length} Students ${isCloudLive ? 'Live in Cloud' : 'Active'}`;
    }

    if (bannerText && isCloudLive) {
      bannerText.textContent = `Connected directly to Supabase cloud instance. ${students.length} undergraduate records verified and synced.`;
    }

    tbody.innerHTML = students.map(s => {
      const jee = s.jeeRegNo || s.jee_reg_no || "N/A";
      const branch = s.branchCode || s.branch_code || "ENG";
      const isHostel = s.hostelResident !== undefined ? s.hostelResident : s.hostel_resident;
      const hostel = s.hostelName || s.hostel_name || "";
      const room = s.roomNo || s.room_no || "";

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="font-mono font-bold text-blue-900 text-xs">${s.id}</td>
          <td>
            <p class="font-bold text-slate-900 text-xs">${s.name}</p>
            <p class="text-[11px] text-slate-500">${s.email}</p>
          </td>
          <td>
            <span class="inline-block font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs" title="Default first-login password">
              ${jee}
            </span>
          </td>
          <td class="text-xs text-slate-800 font-medium">${s.department} <span class="text-slate-500 font-mono text-[11px]">(${branch})</span></td>
          <td class="text-xs text-slate-700">${s.semester}th Sem • Sec ${s.section || 'A'}</td>
          <td class="text-xs text-slate-700">${isHostel ? `${hostel}${room ? ', Rm ' + room : ''}` : '<span class="text-slate-500">Day Scholar</span>'}</td>
          <td>
            ${isCloudLive ? `
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <i data-lucide="cloud-check" class="w-3.5 h-3.5"></i> PostgreSQL
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <i data-lucide="hard-drive" class="w-3.5 h-3.5"></i> Local Cache
              </span>
            `}
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  async syncToSupabase() {
    if (!window.SupabaseCampusDB || !window.SupabaseCampusDB.isConfigured()) {
      CampusUI.showToast("Please enter your Supabase Project URL & Anon Key first.", "info", 3000);
      this.openSupabaseConfigModal();
      return;
    }

    const btn = document.getElementById("btn-sync-supabase");
    const btnText = document.getElementById("sync-supabase-btn-text");
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = "Syncing...";

    try {
      const res = await window.SupabaseCampusDB.syncAllToCloud();
      if (res.success) {
        CampusUI.showToast(`Success! Pushed ${res.count} records across all modules to Supabase PostgreSQL database!`, "success", 3000);
        this.renderAll();
      } else {
        CampusUI.showToast(`Sync notice: ${res.error}`, "warning", 4000);
      }
    } catch (e) {
      CampusUI.showToast("Error syncing to Supabase. Check console.", "error");
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = "Push to Supabase";
      if (window.lucide) window.lucide.createIcons();
    }
  },

  openSupabaseConfigModal() {
    const currentConfig = window.SupabaseCampusDB ? window.SupabaseCampusDB.config : { url: "", anonKey: "", tableName: "students" };

    const sqlScript = `-- BPUT Digital Campus Platform - Complete PostgreSQL Schema
-- Run this in Supabase SQL Editor (1-Click Run)

-- 1. Students Registry
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    branch_code TEXT,
    semester INT,
    section TEXT,
    jee_reg_no TEXT,
    hostel_resident BOOLEAN,
    hostel_name TEXT,
    room_no TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Digital Gate Passes & QR Clearance
CREATE TABLE IF NOT EXISTS public.gate_passes (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    department TEXT,
    destination TEXT,
    reason TEXT,
    departure_date TEXT,
    departure_time TEXT,
    return_date TEXT,
    return_time TEXT,
    status TEXT DEFAULT 'Pending',
    applied_on TEXT,
    reviewed_by TEXT,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hostel Maintenance & Ticketing
CREATE TABLE IF NOT EXISTS public.hostel_complaints (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    hostel_name TEXT,
    room_no TEXT,
    category TEXT,
    priority TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    assigned_to TEXT,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Circulars & Official Notices
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    priority TEXT,
    issuing_authority TEXT,
    target_audience TEXT,
    summary TEXT,
    full_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Leave Applications
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    leave_type TEXT,
    from_date TEXT,
    to_date TEXT,
    total_days INT,
    reason TEXT,
    additional_details TEXT,
    status TEXT DEFAULT 'Pending',
    applied_on TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by TEXT,
    reviewed_on TEXT,
    admin_remarks TEXT
);

-- 6. Fee Queries & Clearance
CREATE TABLE IF NOT EXISTS public.fee_queries (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    category TEXT,
    subject TEXT,
    description TEXT,
    status TEXT DEFAULT 'Open',
    submitted_on TIMESTAMPTZ DEFAULT NOW(),
    reply TEXT,
    replied_by TEXT,
    replied_on TEXT
);

-- 7. Lost and Found Items
CREATE TABLE IF NOT EXISTS public.lost_and_found (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    category TEXT,
    location_found TEXT,
    date TEXT,
    description TEXT,
    reported_by TEXT,
    contact_info TEXT,
    status TEXT DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Academic Course Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    subject_code TEXT,
    subject_name TEXT,
    faculty TEXT,
    title TEXT,
    deadline TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Examination Datesheets
CREATE TABLE IF NOT EXISTS public.exam_datesheets (
    id TEXT PRIMARY KEY,
    exam_name TEXT,
    date TEXT,
    time TEXT,
    subject_code TEXT,
    subject_name TEXT,
    venue TEXT,
    semester INT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Full Access for Hackathon Prototype
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_datesheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Students" ON public.students;
CREATE POLICY "Public Students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public GatePasses" ON public.gate_passes;
CREATE POLICY "Public GatePasses" ON public.gate_passes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Complaints" ON public.hostel_complaints;
CREATE POLICY "Public Complaints" ON public.hostel_complaints FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Notices" ON public.notices;
CREATE POLICY "Public Notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Leaves" ON public.leave_applications;
CREATE POLICY "Public Leaves" ON public.leave_applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public FeeQueries" ON public.fee_queries;
CREATE POLICY "Public FeeQueries" ON public.fee_queries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public LostFound" ON public.lost_and_found;
CREATE POLICY "Public LostFound" ON public.lost_and_found FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Assignments" ON public.assignments;
CREATE POLICY "Public Assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Exams" ON public.exam_datesheets;
CREATE POLICY "Public Exams" ON public.exam_datesheets FOR ALL USING (true) WITH CHECK (true);`;

    const modalHtml = `
      <div class="space-y-4 text-xs">
        <div class="bg-amber-50 border border-amber-200 rounded p-3 text-amber-900 leading-relaxed">
          <p class="font-bold flex items-center gap-1.5 text-xs text-amber-950">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i> Live Supabase Cloud Connection
          </p>
          <p class="text-[11px] text-amber-800 mt-1">
            Connect your free Supabase database to demonstrate live PostgreSQL persistence to the hackathon judges. If left empty, the platform continues using the seamless high-speed local data layer.
          </p>
        </div>

        <form id="supabase-config-form" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Supabase Project URL</label>
            <input type="url" id="cfg-supabase-url" placeholder="https://your-project-id.supabase.co" value="${currentConfig.url || ''}"
                   class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Supabase Anon Public API Key</label>
            <input type="text" id="cfg-supabase-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${currentConfig.anonKey || ''}"
                   class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none">
          </div>
        </form>

        <div class="border-t border-slate-200 pt-3 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">Supabase SQL Schema (1-Click Setup):</label>
            <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('supabase-sql-snippet').textContent); CampusUI.showToast('SQL script copied to clipboard!', 'success');"
                    class="text-[11px] font-bold text-blue-900 hover:text-blue-700 hover:underline flex items-center gap-1">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy SQL
            </button>
          </div>
          <pre id="supabase-sql-snippet" class="p-3 bg-slate-900 text-slate-200 rounded font-mono text-[10px] overflow-x-auto max-h-36">${sqlScript}</pre>
        </div>
      </div>
    `;

    CampusUI.openModal({
      title: "Supabase PostgreSQL Database Configuration",
      subtitle: "BPUT Cloud Admission Cell & Enrolled Student Registry",
      contentHtml: modalHtml,
      confirmText: "Save & Test Connection",
      cancelText: "Close",
      onConfirm: async (close) => {
        const urlInput = document.getElementById("cfg-supabase-url");
        const keyInput = document.getElementById("cfg-supabase-key");

        const url = urlInput ? urlInput.value.trim() : "";
        const anonKey = keyInput ? keyInput.value.trim() : "";

        if (window.SupabaseCampusDB) {
          window.SupabaseCampusDB.saveConfig(url, anonKey, "students");
          if (url && anonKey) {
            CampusUI.showToast("Connecting to Supabase...", "info", 1500);
            const testRes = await window.SupabaseCampusDB.testConnection();
            if (testRes.success) {
              CampusUI.showToast("Connected to Supabase PostgreSQL successfully!", "success", 2500);
            } else {
              CampusUI.showToast(`Supabase config saved. Note: ${testRes.error || testRes.message}`, "info", 3500);
            }
          } else {
            CampusUI.showToast("Supabase config cleared. Operating on local database.", "info");
          }
        }

        close();
        await AdminApp.renderStudentDirectory();
      }
    });
  },

  // ==========================================
  // EXAMINATION DESK
  // ==========================================
  renderExamsDesk() {
    const examData = window.campusStore.getExamData();
    const tbody = document.getElementById("admin-exams-tbody");
    if (!tbody || !examData) return;

    tbody.innerHTML = examData.datesheet.map(ex => `
      <tr>
        <td class="font-semibold text-slate-900 text-xs">${ex.date}</td>
        <td class="text-xs text-slate-600">${ex.time}</td>
        <td class="font-mono font-bold text-blue-900 text-xs">${ex.subjectCode}</td>
        <td class="font-medium text-slate-800 text-xs">${ex.subjectName}</td>
        <td><span class="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-xs border">${ex.venue}</span></td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  openAddExamModal() {
    const modalHtml = `
      <form id="add-exam-form" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Exam Date *</label>
            <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Time Window *</label>
            <input type="text" name="time" required value="10:00 AM - 12:00 PM"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Course Code *</label>
            <input type="text" name="subjectCode" required placeholder="e.g. CS505"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input type="text" name="subjectName" required placeholder="e.g. Computer Networks"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Allocated Venue / Hall *</label>
          <input type="text" name="venue" required value="Lecture Hall Complex (LHC-101)"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Add Examination Schedule Entry",
      subtitle: "Office of the Controller of Examinations",
      contentHtml: modalHtml,
      confirmText: "Add Exam",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("add-exam-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        window.campusStore.addDatesheetEntry(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast("Exam entry added to university datesheet!", "success");
        this.renderAll();
      }
    });
  }
};

window.AdminApp = AdminApp;
