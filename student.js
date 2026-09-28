/* ==========================================================================
   UNIFIED DIGITAL CAMPUS PLATFORM - STUDENT PORTAL CONTROLLER
   Powers all core student services, digital gate passes & reactive workflows
   ========================================================================== */

const StudentApp = {
  currentTab: "dashboard",
  noticeCategory: "All",
  lostFoundFilter: "All",

  init() {
    // 0. Enforce Student Role Guard
    if (window.AuthService && !window.AuthService.requireStudent()) {
      return;
    }

    // 1. Inject institutional header
    const headerSlot = document.getElementById("institutional-header-slot");
    if (headerSlot) {
      headerSlot.innerHTML = CampusUI.renderInstitutionalHeader("student");
      CampusUI.initRoleSwitcher();
    }

    // 2. Setup navigation tab listeners
    this.initTabNavigation();

    // 3. Render all modules
    this.renderAll();

    // 4. Reactive store update listener
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
    const user = window.campusStore.getCurrentUser();
    this.renderHeaderAndIdentity(user);
    this.renderActivePassWidget(user);
    this.renderPendingRequests(user);
    this.renderNotices(user);
    this.renderGatePassHistory(user);
    this.renderLeaveHistory(user);
    this.renderComplaints(user);
    this.renderFeeStatement(user);
    this.renderAssignments();
    this.renderExamCell();
    this.renderLostFound();
    this.renderContacts();
    this.renderProfileCard(user);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ==========================================
  // TAB NAVIGATION & DEEP LINKING
  // ==========================================
  initTabNavigation() {
    const buttons = document.querySelectorAll("#student-nav-tabs .nav-tab-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabKey = btn.getAttribute("data-tab");
        this.switchTab(tabKey);
      });
    });

    // Notice category filter listeners
    const catBtns = document.querySelectorAll("#notices-filter-buttons button");
    catBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        catBtns.forEach(b => b.className = "px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200");
        btn.className = "px-2.5 py-1 rounded bg-blue-900 text-white";
        this.noticeCategory = btn.getAttribute("data-cat");
        this.renderNoticesList();
      });
    });

    // Lost & found filter listeners
    const lfBtns = document.querySelectorAll(".lf-filter-btn");
    lfBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        lfBtns.forEach(b => b.className = "lf-filter-btn px-2.5 py-1 rounded bg-white border text-slate-700 hover:bg-slate-50");
        btn.className = "lf-filter-btn px-2.5 py-1 rounded bg-blue-900 text-white";
        this.lostFoundFilter = btn.getAttribute("data-lf-filter");
        this.renderLostFound();
      });
    });
  },

  switchTab(tabKey) {
    const panes = document.querySelectorAll(".student-tab-pane");
    const targetPane = document.getElementById(`tab-${tabKey}`);
    if (!targetPane) return;

    panes.forEach(p => p.classList.add("hidden"));
    targetPane.classList.remove("hidden");

    const buttons = document.querySelectorAll("#student-nav-tabs .nav-tab-btn");
    buttons.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabKey) {
        btn.className = "nav-tab-btn active px-3 py-2 rounded text-amber-300 bg-blue-900/80 flex items-center gap-1.5 transition";
      } else {
        btn.className = "nav-tab-btn px-3 py-2 rounded text-slate-300 hover:text-white hover:bg-blue-900/50 flex items-center gap-1.5 transition";
      }
    });

    this.currentTab = tabKey;
    window.location.hash = tabKey;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (window.lucide) window.lucide.createIcons();
  },

  // ==========================================
  // IDENTITY & HEADER
  // ==========================================
  renderHeaderAndIdentity(user) {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("header-student-reg", `ID: ${user.id} (${user.name})`);
    setText("dash-student-greeting", `Welcome, ${user.name}`);
    setText("dash-student-id", user.id);
    setText("dash-student-dept", user.department);
    setText("dash-student-sem", `${user.semester}th Semester`);
    setText("dash-student-sec", `Section ${user.section}`);
    setText("dash-student-hostel", user.hostelResident ? `${user.hostelName}, Room ${user.roomNo}` : "Day Scholar");
  },

  // ==========================================
  // ACTIVE GATE PASS CARD
  // ==========================================
  renderActivePassWidget(user) {
    const passes = window.campusStore.getGatePasses(user.id);
    const card = document.getElementById("dash-active-pass-card");
    if (!card) return;

    const activePass = passes[0]; // Most recent pass

    if (!activePass) {
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="ticket" class="w-4 h-4 text-blue-900"></i> Active Digital Gate Pass
          </h4>
        </div>
        <div class="text-center py-4 text-slate-500 text-xs">
          <p>No active gate passes on record.</p>
          <button onclick="StudentApp.openGatePassModal()" class="mt-2 text-xs font-semibold text-blue-900 hover:underline">Apply for Gate Pass</button>
        </div>
      `;
      return;
    }

    const isApproved = activePass.status === "Approved";

    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="ticket" class="w-4 h-4 text-blue-900"></i> Latest Gate Pass
        </h4>
        ${CampusUI.renderBadge(activePass.status)}
      </div>
      <div class="space-y-1.5 text-xs text-slate-700">
        <p><strong class="text-slate-900">Pass ID:</strong> <span class="font-mono text-blue-900">${activePass.id}</span></p>
        <p><strong class="text-slate-900">Destination:</strong> ${activePass.destination}</p>
        <p><strong class="text-slate-900">Departure:</strong> ${activePass.departureDate} at ${activePass.departureTime}</p>
        <p><strong class="text-slate-900">Return:</strong> ${activePass.returnDate} at ${activePass.returnTime}</p>
        ${activePass.adminRemarks ? `<p class="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 mt-2"><strong>Warden Note:</strong> ${activePass.adminRemarks}</p>` : ""}
      </div>
      <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
        <button onclick="StudentApp.switchTab('gatepass')" class="text-xs font-semibold text-slate-600 hover:text-blue-900">
          View All History
        </button>
        ${isApproved ? `
          <button onclick="StudentApp.openDigitalPassModal('${activePass.id}')" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded flex items-center gap-1 transition">
            <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
            <span>Show Digital Pass</span>
          </button>
        ` : `
          <span class="text-[11px] text-amber-700 font-medium">Awaiting Warden Review</span>
        `}
      </div>
    `;
  },

  // ==========================================
  // PENDING WORKFLOWS SUMMARY
  // ==========================================
  renderPendingRequests(user) {
    const passes = window.campusStore.getGatePasses(user.id).filter(p => p.status === "Pending");
    const leaves = window.campusStore.getLeaveApplications(user.id).filter(l => l.status === "Pending");
    const complaints = window.campusStore.getComplaints(user.id).filter(c => c.status !== "Resolved");
    const feeQueries = window.campusStore.getFeeQueries(user.id).filter(q => q.status === "Open");

    const totalPending = passes.length + leaves.length + complaints.length + feeQueries.length;
    
    const badge = document.getElementById("dash-pending-total-badge");
    if (badge) badge.textContent = `${totalPending} Pending`;

    const list = document.getElementById("dash-pending-list");
    if (!list) return;

    list.innerHTML = `
      <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
        <span class="text-slate-600">Pending Gate Passes</span>
        <span class="font-bold ${passes.length > 0 ? 'text-amber-700' : 'text-slate-400'}">${passes.length}</span>
      </div>
      <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
        <span class="text-slate-600">Pending Leave Applications</span>
        <span class="font-bold ${leaves.length > 0 ? 'text-amber-700' : 'text-slate-400'}">${leaves.length}</span>
      </div>
      <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
        <span class="text-slate-600">Open Hostel Complaints</span>
        <span class="font-bold ${complaints.length > 0 ? 'text-blue-700' : 'text-slate-400'}">${complaints.length}</span>
      </div>
      <div class="flex items-center justify-between py-1.5">
        <span class="text-slate-600">Unanswered Fee Queries</span>
        <span class="font-bold ${feeQueries.length > 0 ? 'text-amber-700' : 'text-slate-400'}">${feeQueries.length}</span>
      </div>
    `;
  },

  // ==========================================
  // NOTICES MODULE
  // ==========================================
  renderNotices(user) {
    // 1. Dashboard feed
    const notices = window.campusStore.getNotices();
    const feed = document.getElementById("dash-notices-feed");
    if (feed) {
      feed.innerHTML = notices.slice(0, 3).map(n => `
        <div class="pt-2 pb-1 cursor-pointer hover:bg-slate-50 rounded p-1 transition" onclick="StudentApp.openNoticeModal('${n.id}')">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${n.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}">
              ${n.category}
            </span>
            <span class="text-[10px] text-slate-400">${n.date}</span>
          </div>
          <p class="text-xs font-semibold text-slate-900 leading-snug hover:text-blue-900">${n.title}</p>
          <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${n.summary}</p>
        </div>
      `).join("");
    }

    // 2. Full notices tab
    this.renderNoticesList();
  },

  renderNoticesList() {
    const listContainer = document.getElementById("student-notices-container");
    if (!listContainer) return;

    const notices = window.campusStore.getNotices(this.noticeCategory);

    if (notices.length === 0) {
      listContainer.innerHTML = `<div class="univ-card p-8 text-center text-slate-400 text-xs">No circulars found in category: ${this.noticeCategory}</div>`;
      return;
    }

    listContainer.innerHTML = notices.map(n => `
      <div class="univ-card p-5 hover:border-blue-900 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${n.priority === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
              ${n.category}
            </span>
            <span class="text-xs text-slate-400">${n.date}</span>
            <span class="text-xs text-slate-500">• Issuing Desk: <strong>${n.issuingAuthority}</strong></span>
            <span class="text-[11px] text-slate-400 font-mono">Ref: ${n.id}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-900" onclick="StudentApp.openNoticeModal('${n.id}')">
            ${n.title}
          </h4>
          <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">${n.summary}</p>
          ${n.attachmentName ? `
            <div class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              <i data-lucide="paperclip" class="w-3.5 h-3.5"></i>
              <span>${n.attachmentName}</span>
            </div>
          ` : ""}
        </div>
        <div>
          <button onclick="StudentApp.openNoticeModal('${n.id}')" class="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition">
            Read Circular
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: listContainer });
  },

  openNoticeModal(id) {
    const notice = window.campusStore.getNoticeById(id);
    if (!notice) return;

    const modalContent = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2.5">
          <span><strong>Category:</strong> ${notice.category} (${notice.priority})</span>
          <span><strong>Date:</strong> ${notice.date}</span>
          <span><strong>Target:</strong> ${notice.targetAudience}</span>
        </div>
        <div class="text-xs text-slate-600">
          <p class="font-semibold text-slate-800">Issued by: ${notice.issuingAuthority}</p>
          <p class="text-[11px] font-mono text-slate-400">Circular Reference No: ${notice.id}</p>
        </div>
        <div class="bg-slate-50 p-4 rounded border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
          ${notice.fullContent}
        </div>
        ${notice.attachmentName ? `
          <div class="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs">
            <span class="flex items-center gap-2 font-medium text-blue-900">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              ${notice.attachmentName}
            </span>
            <button onclick="CampusUI.showToast('Downloaded official PDF: ${notice.attachmentName}', 'success')" class="px-2.5 py-1 text-xs font-semibold bg-blue-900 text-white rounded hover:bg-blue-800">
              Download Circular
            </button>
          </div>
        ` : ""}
      </div>
    `;

    CampusUI.openModal({
      title: notice.title,
      subtitle: "Official Biju Patnaik University of Technology Circular",
      contentHtml: modalContent,
      cancelText: "Close"
    });
  },

  // ==========================================
  // GATE PASS APPLICATION & DIGITAL PASS CARD
  // ==========================================
  openGatePassModal() {
    const user = window.campusStore.getCurrentUser();
    const modalHtml = `
      <form id="gatepass-form" class="space-y-4 text-xs">
        <div class="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
          <p><strong>Applicant:</strong> ${user.name} (${user.id})</p>
          <p><strong>Hostel / Room:</strong> ${user.hostelName}, Room ${user.roomNo}</p>
          <p><strong>Registered Guardian Contact:</strong> ${user.guardianPhone}</p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Destination Address / City *</label>
          <input type="text" name="destination" required placeholder="e.g. Cuttack, Odisha / Bhubaneswar Railway Station" 
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Purpose / Reason for Gate Leave *</label>
          <textarea name="reason" required rows="2.5" placeholder="Specify clearly (e.g. Visiting home for medical review / Technical contest participation)..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Departure Date *</label>
            <input type="date" name="departureDate" required value="${new Date().toISOString().split('T')[0]}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Departure Time *</label>
            <input type="time" name="departureTime" required value="17:00"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Expected Return Date *</label>
            <input type="date" name="returnDate" required value="${new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Expected Return Time *</label>
            <input type="time" name="returnTime" required value="20:00"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Emergency Accompanying Contact Number</label>
          <input type="text" name="emergencyContact" value="${user.guardianPhone}"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Hostel Out-Pass / Digital Gate Authorization",
      subtitle: "Council of Wardens • BPUT Hall of Residence",
      contentHtml: modalHtml,
      confirmText: "Submit Gate Pass",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("gatepass-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const pass = window.campusStore.createGatePass(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Gate Pass application ${pass.id} submitted successfully! Status: PENDING`, "success");
        this.renderAll();
      }
    });
  },

  renderGatePassHistory(user) {
    const passes = window.campusStore.getGatePasses(user.id);
    const tbody = document.getElementById("gatepass-history-tbody");
    if (!tbody) return;

    if (passes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No gate passes recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = passes.map(gp => `
      <tr>
        <td class="font-mono font-bold text-blue-900">${gp.id}</td>
        <td>
          <p class="font-semibold text-slate-900">${gp.destination}</p>
          <p class="text-[11px] text-slate-500">${gp.reason}</p>
        </td>
        <td class="text-xs text-slate-600">${gp.departureDate} <br><span class="text-[11px] text-slate-400">${gp.departureTime}</span></td>
        <td class="text-xs text-slate-600">${gp.returnDate} <br><span class="text-[11px] text-slate-400">${gp.returnTime}</span></td>
        <td>${CampusUI.renderBadge(gp.status)}</td>
        <td class="text-xs">
          ${gp.reviewedBy ? `<p class="font-medium text-slate-800">${gp.reviewedBy}</p>` : `<span class="text-slate-400">Pending review</span>`}
          ${gp.adminRemarks ? `<p class="text-[11px] text-slate-500">${gp.adminRemarks}</p>` : ""}
        </td>
        <td>
          ${gp.status === 'Approved' ? `
            <button onclick="StudentApp.openDigitalPassModal('${gp.id}')" class="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded flex items-center gap-1 transition">
              <i data-lucide="qr-code" class="w-3 h-3"></i> Pass Card
            </button>
          ` : `
            <span class="text-[11px] text-slate-400 italic">No pass active</span>
          `}
        </td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  openDigitalPassModal(id) {
    const pass = window.campusStore.getGatePassById(id);
    if (!pass) return;

    const passHtml = `
      <div class="digital-pass-card p-6 border-2 border-emerald-600 rounded-lg space-y-4">
        <div class="flex items-center justify-between border-b-2 border-emerald-500 pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-950 text-amber-400 rounded-full flex items-center justify-center font-bold text-sm">
              BPUT
            </div>
            <div>
              <h4 class="font-institutional font-bold text-xs text-blue-950 uppercase tracking-tight">Council of Wardens & Security Desk</h4>
              <p class="text-[11px] text-emerald-800 font-bold">DIGITAL HOSTEL EXIT PERMIT (VERIFIED)</p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-extrabold uppercase rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
            AUTHORIZED
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p class="text-slate-500">Student Name:</p>
            <p class="font-bold text-slate-900">${pass.studentName} (${pass.studentId})</p>
          </div>
          <div>
            <p class="text-slate-500">Hostel Residence:</p>
            <p class="font-bold text-slate-900">${pass.hostelName}, Rm ${pass.roomNo}</p>
          </div>
          <div>
            <p class="text-slate-500">Authorized Departure:</p>
            <p class="font-bold text-slate-900">${pass.departureDate} at ${pass.departureTime}</p>
          </div>
          <div>
            <p class="text-slate-500">Mandatory Return:</p>
            <p class="font-bold text-slate-900">${pass.returnDate} before ${pass.returnTime}</p>
          </div>
          <div class="col-span-2">
            <p class="text-slate-500">Destination:</p>
            <p class="font-medium text-slate-900">${pass.destination}</p>
          </div>
        </div>

        <!-- Verification Signature and QR Box -->
        <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-3">
            <div class="w-16 h-16 bg-slate-100 border border-slate-300 rounded p-1 flex flex-col items-center justify-center font-mono text-[9px] text-slate-600 text-center">
              <i data-lucide="qr-code" class="w-8 h-8 text-blue-900 mb-0.5"></i>
              <span>QR AUTH</span>
            </div>
            <div class="text-[11px] text-slate-600">
              <p><strong>Approved by:</strong> ${pass.reviewedBy}</p>
              <p><strong>Approved on:</strong> ${pass.reviewedOn}</p>
              <p class="text-emerald-700 font-semibold mt-0.5">Valid for Main Security Gate 1 & 2</p>
            </div>
          </div>
          <button onclick="window.print()" class="px-3 py-1.5 text-xs bg-slate-900 text-white rounded font-medium hover:bg-slate-800">
            Print Pass
          </button>
        </div>
      </div>
    `;

    CampusUI.openModal({
      title: `Digital Gate Pass #${pass.id}`,
      subtitle: "Official Security Verification Document",
      contentHtml: passHtml,
      cancelText: "Close"
    });
  },

  // ==========================================
  // LEAVE APPLICATIONS MODULE
  // ==========================================
  openLeaveModal() {
    const user = window.campusStore.getCurrentUser();
    const modalHtml = `
      <form id="leave-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Leave Classification *</label>
          <select name="leaveType" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
            <option value="Academic Duty">Academic Duty (Hackathon / Seminar / Tech Fest)</option>
            <option value="Medical Leave">Medical Leave (Doctor Appointment / Illness)</option>
            <option value="Personal Leave">Personal / Family Emergency</option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Leave From Date *</label>
            <input type="date" name="fromDate" required value="${new Date().toISOString().split('T')[0]}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Leave To Date *</label>
            <input type="date" name="toDate" required value="${new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
          <textarea name="reason" required rows="2" placeholder="Describe the reason for leave..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Additional Verification Details (e.g. Letter / Prescription ref)</label>
          <input type="text" name="additionalDetails" placeholder="Reference nomination letter or prescription number"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Submit University Leave Application",
      subtitle: "Office of Dean (Academic Affairs) • BPUT Rourkela",
      contentHtml: modalHtml,
      confirmText: "Submit Leave Application",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("leave-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const leave = window.campusStore.createLeaveApplication(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Leave application ${leave.id} submitted for review. Status: PENDING`, "success");
        this.renderAll();
      }
    });
  },

  renderLeaveHistory(user) {
    const list = window.campusStore.getLeaveApplications(user.id);
    const tbody = document.getElementById("leave-history-tbody");
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No leave applications on file.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(l => `
      <tr>
        <td class="font-mono font-bold text-blue-900">${l.id}</td>
        <td>
          <span class="font-bold text-slate-900">${l.leaveType}</span>
          <span class="text-xs text-slate-500">(${l.totalDays} Days)</span>
        </td>
        <td class="text-xs text-slate-600">${l.fromDate} to ${l.toDate}</td>
        <td class="text-xs text-slate-700">
          <p class="font-medium">${l.reason}</p>
          ${l.additionalDetails ? `<p class="text-[11px] text-slate-400">${l.additionalDetails}</p>` : ""}
        </td>
        <td>${CampusUI.renderBadge(l.status)}</td>
        <td class="text-xs">
          ${l.reviewedBy ? `<p class="font-semibold text-slate-800">${l.reviewedBy}</p>` : `<span class="text-slate-400">Pending Dean review</span>`}
          ${l.adminRemarks ? `<p class="text-[11px] text-slate-500">${l.adminRemarks}</p>` : ""}
        </td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  },

  // ==========================================
  // HOSTEL COMPLAINTS MODULE (3-STAGE: Pending -> In Progress -> Resolved)
  // ==========================================
  openComplaintModal() {
    const user = window.campusStore.getCurrentUser();
    const modalHtml = `
      <form id="complaint-form" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Hostel Block *</label>
            <input type="text" name="hostelName" required value="${user.hostelName}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Room Number *</label>
            <input type="text" name="roomNo" required value="${user.roomNo}"
                   class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Maintenance Category *</label>
            <select name="category" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Electrical">Electrical (Fan, Lights, Switchboard, MCB)</option>
              <option value="Plumbing">Plumbing (Tap Leakage, Drain, Washroom, Geyser)</option>
              <option value="Internet & Wi-Fi">Internet & Wi-Fi (Router, Access Point, Speed)</option>
              <option value="Carpentry">Carpentry (Bed, Study Table, Door Latch, Window)</option>
              <option value="Sanitation">Sanitation & Pest Control</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Urgency / Priority *</label>
            <select name="priority" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Detailed Issue Description *</label>
          <textarea name="description" required rows="3" placeholder="Describe the fault clearly so maintenance staff can bring correct parts..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Register Hostel Maintenance Complaint",
      subtitle: "Estate & Works Maintenance Desk • BPUT Halls of Residence",
      contentHtml: modalHtml,
      confirmText: "Submit Complaint",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("complaint-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const comp = window.campusStore.createComplaint(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Complaint ${comp.id} registered with Estate Desk. Status: PENDING`, "success");
        this.renderAll();
      }
    });
  },

  renderComplaints(user) {
    const list = window.campusStore.getComplaints(user.id);
    const container = document.getElementById("student-complaints-container");
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div class="univ-card p-8 text-center text-slate-400 text-xs">No hostel complaints registered.</div>`;
      return;
    }

    container.innerHTML = list.map(c => {
      // 3-stage visualizer
      const isPending = c.status === "Pending";
      const isInProgress = c.status === "In Progress";
      const isResolved = c.status === "Resolved";

      return `
        <div class="univ-card p-5 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-blue-900 text-xs">${c.id}</span>
                <span class="font-bold text-slate-900 text-sm">${c.category} Maintenance</span>
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">${c.priority} Priority</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${c.hostelName} • Room ${c.roomNo} • Logged on ${c.submittedOn}</p>
            </div>
            <div>
              ${CampusUI.renderBadge(c.status)}
            </div>
          </div>

          <p class="text-xs text-slate-700 leading-relaxed">${c.description}</p>

          <!-- 3-Stage Progress Timeline -->
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Resolution Progress:</p>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 rounded ${isPending ? 'bg-amber-100 border border-amber-300 font-bold text-amber-900' : (isInProgress || isResolved ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-400')}">
                1. Pending Logged
              </div>
              <div class="p-2 rounded ${isInProgress ? 'bg-blue-100 border border-blue-300 font-bold text-blue-900' : (isResolved ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-400')}">
                2. In Progress / Assigned
              </div>
              <div class="p-2 rounded ${isResolved ? 'bg-emerald-100 border border-emerald-300 font-bold text-emerald-900' : 'bg-slate-100 text-slate-400'}">
                3. Resolved & Verified
              </div>
            </div>
            <div class="mt-2 text-[11px] text-slate-600 flex justify-between">
              <span><strong>Assigned Desk:</strong> ${c.assignedTo || "Estate Desk"}</span>
              <span><strong>Technician Remarks:</strong> ${c.adminRemarks || "Awaiting inspection"}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  // ==========================================
  // FEES & FEE QUERIES
  // ==========================================
  openFeeQueryModal() {
    const user = window.campusStore.getCurrentUser();
    const modalHtml = `
      <form id="fee-query-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Query Subject Category *</label>
          <select name="category" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
            <option value="Mess Advance Adjustment">Mess Advance Adjustment / Rebate</option>
            <option value="Education Loan Documentation">Education Loan / Demand Estimation Letter</option>
            <option value="Payment Gateway Failure">Payment Gateway Transaction Discrepancy</option>
            <option value="Scholarship Tuition Waiver">Scholarship (Prerana / Post-Matric) Tuition Waiver</option>
            <option value="General Fee Query">General Accounts Inquiry</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Subject Header *</label>
          <input type="text" name="subject" required placeholder="Brief summary of query..."
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Detailed Query Description *</label>
          <textarea name="description" required rows="3" placeholder="Provide complete transaction details, challan references, or documentation needs..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Raise Fee Query to Accounts Section",
      subtitle: "Finance & Accounts Wing • BPUT Administrative Block",
      contentHtml: modalHtml,
      confirmText: "Submit Fee Ticket",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("fee-query-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const query = window.campusStore.createFeeQuery(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Fee Query Ticket #${query.id} logged. Status: OPEN`, "success");
        this.renderAll();
      }
    });
  },

  renderFeeStatement(user) {
    const feeData = window.campusStore.getFeeStructure(user.id);
    const tbody = document.getElementById("fee-statement-tbody");
    if (tbody && feeData) {
      tbody.innerHTML = feeData.breakdown.map(b => `
        <tr>
          <td class="font-medium text-slate-900">${b.item}</td>
          <td class="font-mono font-bold text-slate-800">₹${b.amount.toLocaleString('en-IN')}</td>
          <td>${CampusUI.renderBadge(b.status)}</td>
          <td class="text-xs font-mono text-slate-500">${b.receiptNo}</td>
        </tr>
      `).join("");
    }

    // Render queries list
    const queries = window.campusStore.getFeeQueries(user.id);
    const qList = document.getElementById("fee-queries-list");
    if (qList) {
      if (queries.length === 0) {
        qList.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">No fee queries raised.</p>`;
      } else {
        qList.innerHTML = queries.map(q => `
          <div class="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-mono font-bold text-blue-900">${q.id}</span>
              ${CampusUI.renderBadge(q.status)}
            </div>
            <p class="font-bold text-slate-900">${q.subject}</p>
            <p class="text-slate-600">${q.description}</p>
            ${q.reply ? `
              <div class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                <p><strong>Official Accounts Reply (${q.repliedBy}):</strong></p>
                <p class="mt-0.5">${q.reply}</p>
                <p class="text-[10px] text-slate-400 mt-1">${q.repliedOn}</p>
              </div>
            ` : `
              <p class="text-[11px] text-amber-700 italic">Ticket in review by Accounts Officer</p>
            `}
          </div>
        `).join("");
      }
    }
  },

  // ==========================================
  // ASSIGNMENTS MODULE
  // ==========================================
  renderAssignments() {
    const list = window.campusStore.getAssignments();
    
    // Dashboard feed
    const dashFeed = document.getElementById("dash-assignments-feed");
    if (dashFeed) {
      dashFeed.innerHTML = list.slice(0, 3).map(a => `
        <div class="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-blue-900 text-[10px]">${a.subjectCode}</span>
            <span class="text-[10px] text-rose-700 font-semibold">Due: ${a.deadline}</span>
          </div>
          <p class="font-semibold text-slate-900 line-clamp-1">${a.title}</p>
        </div>
      `).join("");
    }

    // Full assignments tab
    const fullContainer = document.getElementById("student-assignments-container");
    if (fullContainer) {
      fullContainer.innerHTML = list.map(a => `
        <div class="univ-card p-5 flex flex-col justify-between border-t-4 border-t-blue-900">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${a.subjectCode}</span>
              ${CampusUI.renderBadge(a.status)}
            </div>
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">${a.subjectName}</h4>
            <h3 class="text-sm font-bold text-slate-900 mt-1 leading-snug">${a.title}</h3>
            <p class="text-xs text-slate-600 mt-2 leading-relaxed">${a.description}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span class="text-slate-500">Faculty: <strong>${a.faculty}</strong></span>
            <span class="font-bold text-rose-700">Due: ${a.deadline}</span>
          </div>
        </div>
      `).join("");
    }
  },

  // ==========================================
  // EXAMINATION CELL MODULE
  // ==========================================
  renderExamCell() {
    const examData = window.campusStore.getExamData();
    const datesheetTbody = document.getElementById("exam-datesheet-tbody");
    if (datesheetTbody && examData) {
      datesheetTbody.innerHTML = examData.datesheet.map(ex => `
        <tr>
          <td class="font-semibold text-slate-900">${ex.date}</td>
          <td class="text-xs text-slate-600">${ex.time}</td>
          <td class="font-mono font-bold text-blue-900">${ex.subjectCode}</td>
          <td class="font-medium text-slate-800">${ex.subjectName}</td>
          <td><span class="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-xs border">${ex.venue}</span></td>
        </tr>
      `).join("");
    }

    const syllabiList = document.getElementById("exam-syllabi-list");
    if (syllabiList && examData) {
      syllabiList.innerHTML = examData.syllabi.map(s => `
        <div class="bg-slate-50 p-2.5 rounded border border-slate-200">
          <p class="font-bold text-blue-900">${s.code}: ${s.name}</p>
          <p class="text-slate-600 mt-0.5">${s.portion}</p>
        </div>
      `).join("");
    }

    const pyqsList = document.getElementById("exam-pyqs-list");
    if (pyqsList && examData) {
      pyqsList.innerHTML = examData.pyqs.map(p => `
        <div class="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <p class="font-semibold text-slate-900">${p.subject}</p>
            <p class="text-[11px] text-slate-500">${p.exam} • Year ${p.year}</p>
          </div>
          <button onclick="CampusUI.showToast('Downloaded question paper: ${p.file}', 'success')" class="text-blue-900 hover:text-blue-700 font-semibold flex items-center gap-1 text-xs">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>PDF</span>
          </button>
        </div>
      `).join("");
    }
  },

  // ==========================================
  // LOST AND FOUND MODULE
  // ==========================================
  openReportLostFoundModal() {
    const user = window.campusStore.getCurrentUser();
    const modalHtml = `
      <form id="lf-form" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Item Classification *</label>
            <select name="type" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Lost">I Lost an Item</option>
              <option value="Found">I Found an Item on Campus</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Category *</label>
            <select name="category" required class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
              <option value="Electronics">Electronics & Chargers</option>
              <option value="Academic Stationery">Academic Stationery & Calculators</option>
              <option value="ID Cards & Documents">University ID / Wallets / Cards</option>
              <option value="Keys & Locks">Keys & Locks</option>
              <option value="Clothing & Bags">Clothing, Umbrella & Bags</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Item Title / Brand *</label>
          <input type="text" name="title" required placeholder="e.g. Black Dell 65W Laptop Charger / Casio 991CW Calculator"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Campus Location Where Lost / Retrieved *</label>
          <input type="text" name="locationFound" required placeholder="e.g. Central Library 2nd Floor Reading Room / LHC-101"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Description & Identifying Marks *</label>
          <textarea name="description" required rows="2.5" placeholder="Mention serial numbers, stickers, scratches, or current custody point..."
                    class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Claim / Finder Contact Details *</label>
          <input type="text" name="contactInfo" required value="${user.phone || user.email}"
                 class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none">
        </div>
      </form>
    `;

    CampusUI.openModal({
      title: "Publish Lost & Found Campus Notice",
      subtitle: "Campus Security & Proctorial Registry Desk",
      contentHtml: modalHtml,
      confirmText: "Publish Notice",
      cancelText: "Cancel",
      onConfirm: (close) => {
        const form = document.getElementById("lf-form");
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const item = window.campusStore.reportLostFound(Object.fromEntries(formData.entries()));
        close();
        CampusUI.showToast(`Lost & Found report #${item.id} published on campus bulletin!`, "success");
        this.renderAll();
      }
    });
  },

  renderLostFound() {
    const list = window.campusStore.getLostAndFound(this.lostFoundFilter);
    const container = document.getElementById("student-lostfound-container");
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div class="col-span-full univ-card p-8 text-center text-slate-400 text-xs">No articles listed under: ${this.lostFoundFilter}</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="univ-card p-5 flex flex-col justify-between border-t-4 ${item.type === 'Found' ? 'border-t-emerald-600' : 'border-t-amber-600'}">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${item.type === 'Found' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}">
              ${item.type} Item
            </span>
            <span class="text-xs text-slate-400">${item.date}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 leading-snug">${item.title}</h4>
          <p class="text-[11px] font-semibold text-blue-900 mt-1 flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3 h-3"></i> ${item.locationFound}
          </p>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">${item.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <p><strong>Reported By:</strong> ${item.reportedBy}</p>
          <p><strong>Contact / Custody:</strong> <span class="text-blue-900 font-medium">${item.contactInfo}</span></p>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  // ==========================================
  // CAMPUS DIRECTORY
  // ==========================================
  renderContacts() {
    const contacts = window.campusStore.getContacts();
    const container = document.getElementById("student-contacts-container");
    if (!container) return;

    container.innerHTML = contacts.map(c => `
      <div class="univ-card p-5 flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mb-3">
            <i data-lucide="building" class="w-5 h-5"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">${c.department}</h4>
          <h3 class="text-sm font-bold text-slate-900 mt-1">${c.officer}</h3>
          <p class="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
            ${c.office}
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1">
          <p class="flex items-center gap-1.5 text-blue-900 font-semibold">
            <i data-lucide="phone" class="w-3.5 h-3.5"></i> ${c.phone}
          </p>
          <p class="flex items-center gap-1.5 text-slate-600">
            <i data-lucide="mail" class="w-3.5 h-3.5"></i> ${c.email}
          </p>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  // ==========================================
  // STUDENT PROFILE & ID CARD
  // ==========================================
  renderProfileCard(user) {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("card-student-name", user.name);
    setText("card-student-id", user.id);
    setText("card-student-dept", user.department);
    setText("card-student-sem", `${user.semester}th Semester (Section ${user.section})`);
    setText("card-student-hostel", user.hostelResident ? `${user.hostelName}, Room ${user.roomNo}` : "Day Scholar");
    setText("card-student-phone", user.phone);
  }
};

window.StudentApp = StudentApp;
