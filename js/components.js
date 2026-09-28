/* ==========================================================================
   UNIFIED DIGITAL CAMPUS PLATFORM - REUSABLE UI COMPONENTS
   Provides toasts, modals, status badges, global search & institutional headers
   ========================================================================== */

const CampusUI = {
  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = "info", duration = 4000) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast max-w-md w-full bg-white rounded-lg shadow-lg border p-4 flex items-start space-x-3 pointer-events-auto transition-all transform duration-300`;

    let iconHtml = "";
    let borderClass = "";

    if (type === "success") {
      borderClass = "border-l-4 border-emerald-500";
      iconHtml = `<div class="text-emerald-600 bg-emerald-50 p-1.5 rounded-full"><i data-lucide="check-circle" class="w-5 h-5"></i></div>`;
    } else if (type === "error") {
      borderClass = "border-l-4 border-rose-500";
      iconHtml = `<div class="text-rose-600 bg-rose-50 p-1.5 rounded-full"><i data-lucide="alert-circle" class="w-5 h-5"></i></div>`;
    } else if (type === "warning") {
      borderClass = "border-l-4 border-amber-500";
      iconHtml = `<div class="text-amber-600 bg-amber-50 p-1.5 rounded-full"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>`;
    } else {
      borderClass = "border-l-4 border-blue-600";
      iconHtml = `<div class="text-blue-600 bg-blue-50 p-1.5 rounded-full"><i data-lucide="info" class="w-5 h-5"></i></div>`;
    }

    toast.className += ` ${borderClass}`;
    toast.innerHTML = `
      ${iconHtml}
      <div class="flex-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">${type.toUpperCase()}</p>
        <p class="text-sm font-medium text-slate-800 mt-0.5 leading-snug">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-slate-600 focus:outline-none close-toast-btn">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

    const removeToast = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector(".close-toast-btn").addEventListener("click", removeToast);
    setTimeout(removeToast, duration);
  },

  // ==========================================
  // UNIVERSAL MODAL SYSTEM
  // ==========================================
  openModal({ title, subtitle = "", contentHtml, onConfirm = null, confirmText = "Confirm", cancelText = "Close", size = "max-w-2xl" }) {
    this.closeModal();

    const backdrop = document.createElement("div");
    backdrop.id = "campus-modal-root";
    backdrop.className = "fixed inset-0 z-50 overflow-y-auto modal-backdrop flex items-center justify-center p-4 sm:p-6";

    backdrop.innerHTML = `
      <div class="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full ${size} overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 font-institutional tracking-tight">${title}</h3>
            ${subtitle ? `<p class="text-xs text-slate-500 mt-0.5 font-medium">${subtitle}</p>` : ""}
          </div>
          <button id="modal-close-icon" class="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-200 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 max-h-[75vh] overflow-y-auto text-slate-700 text-sm">
          ${contentHtml}
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button id="modal-cancel-btn" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition">
            ${cancelText}
          </button>
          ${onConfirm ? `
            <button id="modal-confirm-btn" class="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-sm transition">
              ${confirmText}
            </button>
          ` : ""}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    if (window.lucide) window.lucide.createIcons({ root: backdrop });

    const closeHandler = () => this.closeModal();
    backdrop.querySelector("#modal-close-icon").addEventListener("click", closeHandler);
    backdrop.querySelector("#modal-cancel-btn").addEventListener("click", closeHandler);

    if (onConfirm) {
      backdrop.querySelector("#modal-confirm-btn").addEventListener("click", () => {
        onConfirm(() => this.closeModal());
      });
    }

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeHandler();
    });

    const keyListener = (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        window.removeEventListener("keydown", keyListener);
      }
    };
    window.addEventListener("keydown", keyListener);
  },

  closeModal() {
    const existing = document.getElementById("campus-modal-root");
    if (existing) {
      existing.remove();
      document.body.style.overflow = "";
    }
  },

  // ==========================================
  // STATUS BADGE RENDERER
  // ==========================================
  renderBadge(status) {
    if (!status) return "";
    const s = status.toLowerCase();
    let badgeClass = "pending";
    let iconName = "clock";

    if (s === "approved" || s === "resolved" || s === "paid" || s === "submitted" || s === "available") {
      badgeClass = "approved";
      iconName = "check";
    } else if (s === "in progress" || s === "replied" || s === "important") {
      badgeClass = "in-progress";
      iconName = "loader-2";
    } else if (s === "rejected" || s === "urgent" || s === "closed") {
      badgeClass = "rejected";
      iconName = "alert-circle";
    } else if (s === "open") {
      badgeClass = "in-progress";
      iconName = "help-circle";
    }

    return `
      <span class="badge-status ${badgeClass}">
        <i data-lucide="${iconName}" class="w-3 h-3"></i>
        <span>${status}</span>
      </span>
    `;
  },

  // ==========================================
  // INSTITUTIONAL HEADER & NAVIGATION
  // ==========================================
  navigateToAdmin() {
    window.location.href = "admin-auth.html";
  },

  navigateToStudent(studentId = null) {
    window.location.href = "student-auth.html";
  },

  renderInstitutionalHeader(activeRole = "student") {
    let user = window.campusStore ? window.campusStore.getCurrentUser() : null;
    if (window.AuthService) {
      const auth = window.AuthService.getAuth();
      if (auth.isAuthenticated && auth.user) {
        user = auth.user;
      }
    }
    if (!user) {
      user = { id: activeRole === "admin" ? "ADMIN001" : "230110", name: activeRole === "admin" ? "Campus Administrator" : "Palak Saha", role: activeRole };
    }

    const logoutUrl = activeRole === "admin" ? "admin-auth.html" : "student-auth.html";

    return `
      <!-- Topmost Institutional Announcement Banner -->
      <header class="institutional-ribbon text-white text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center space-x-4">
          <span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase border border-amber-500/40">
            NAAC Accredited
          </span>
          <span class="text-slate-300 hidden md:inline">Biju Patnaik University of Technology • Rourkela, Odisha</span>
          <span class="hidden lg:inline text-slate-400">|</span>
          <span class="hidden lg:inline text-slate-300">Helpline: +91 661 2489244</span>
        </div>
        <div class="flex items-center space-x-3 text-xs">
          <span class="text-amber-300 flex items-center gap-1 font-medium">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
            24x7 Security: 1800-345-6789
          </span>
        </div>
      </header>

      <!-- Main University Brand Bar -->
      <div class="bg-white border-b border-slate-200 shadow-sm px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <a href="index.html" onclick="if(window.AuthService)window.AuthService.clearSession()" class="flex items-center space-x-3.5 group">
          <div class="w-11 h-11 bg-blue-950 text-amber-400 rounded-full flex items-center justify-center font-institutional font-bold text-xl crest-ring border-2 border-amber-400/80 shadow-md">
            BPUT
          </div>
          <div>
            <h1 class="font-institutional text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-900 transition">
              BIJU PATNAIK UNIVERSITY OF TECHNOLOGY
            </h1>
            <p class="text-xs text-slate-500 font-medium tracking-wide">
              Digital Campus Platform • <span class="text-blue-900 font-semibold uppercase">${activeRole === 'admin' ? 'Campus Administration' : 'Student Portal'}</span>
            </p>
          </div>
        </a>

        <!-- Right Side User Chip & Quick Actions -->
        <div class="flex items-center space-x-3">
          <button id="global-search-trigger-btn" class="hidden sm:flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs border border-slate-200 transition cursor-pointer">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400"></i>
            <span>Search portal...</span>
            <kbd class="bg-white px-1.5 py-0.5 rounded border text-xs text-slate-400 font-mono">Ctrl+K</kbd>
          </button>

          <div class="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1.5 pr-3 space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-inner">
              ${(user.name || "U").split(" ").map(n => n[0]).join("")}
            </div>
            <div class="text-left text-xs leading-tight">
              <p class="font-bold text-slate-900">${user.name || "User"}</p>
              <p class="text-xs text-slate-500 font-medium">${activeRole === 'admin' ? 'Admin ID' : 'Roll No'}: <span class="text-blue-900 font-bold">${user.id}</span></p>
            </div>
          </div>

          <!-- Dedicated Logout Action -->
          <button onclick="AuthService.logout('${logoutUrl}')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition shadow-sm cursor-pointer" title="Sign out of portal">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <!-- Institutional Navigation Bar -->
      <nav class="bg-slate-900 text-white px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs font-semibold gap-2 border-b border-slate-800">
        <div class="flex items-center space-x-1 sm:space-x-3 overflow-x-auto">
          <a href="index.html" onclick="if(window.AuthService)window.AuthService.clearSession()" class="px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition">
            <i data-lucide="home" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Main Portal</span>
          </a>
          <span class="px-3 py-1.5 rounded bg-blue-900 text-amber-300 font-bold border border-blue-700 shadow-sm flex items-center gap-1.5">
            <i data-lucide="${activeRole === 'admin' ? 'shield' : 'graduation-cap'}" class="w-3.5 h-3.5 text-amber-300"></i>
            <span>${activeRole === 'admin' ? 'Campus Administration Console' : 'Student Services Portal'}</span>
          </span>
        </div>

        <div class="flex items-center space-x-2 text-slate-400 text-xs">
          <span class="w-2 h-2 rounded-full ${activeRole === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
          <span>${activeRole === 'admin' ? 'Executive & Proctorial Desk' : 'Academic Session 2026–2027'}</span>
        </div>
      </nav>
    `;
  },

  // Setup Global Search Shortcut & UI Listeners
  initRoleSwitcher() {
    // Global Search Shortcut (Ctrl+K or Cmd+K)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        CampusUI.openSearchModal();
      }
    });

    const triggerBtn = document.getElementById("global-search-trigger-btn");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", () => CampusUI.openSearchModal());
    }
  },

  // ==========================================
  // GLOBAL SEARCH MODAL
  // ==========================================
  openSearchModal() {
    const store = window.campusStore;
    const notices = store.getNotices();
    const exams = store.getExamData().datesheet;
    const complaints = store.getComplaints();
    const passes = store.getGatePasses();

    const searchHtml = `
      <div class="space-y-4">
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3.5"></i>
          <input type="text" id="modal-search-input" placeholder="Type to search notices, gate passes, complaints, exams, contacts..." 
                 class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent">
        </div>
        <div id="search-results-box" class="max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100">
          <p class="text-xs text-slate-400 py-3 text-center">Start typing to quickly jump to any university notice or service...</p>
        </div>
      </div>
    `;

    this.openModal({
      title: "University Quick Search Desk",
      subtitle: "Instant discovery across all campus services, circulars & student records",
      contentHtml: searchHtml,
      cancelText: "Close"
    });

    const input = document.getElementById("modal-search-input");
    const resultsBox = document.getElementById("search-results-box");
    if (!input || !resultsBox) return;

    input.focus();

    input.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        resultsBox.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center">Start typing to quickly jump to any university notice or service...</p>`;
        return;
      }

      let matches = [];

      // Check notices
      notices.forEach(n => {
        if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
          matches.push({ type: "Notice", title: n.title, meta: `${n.category} • ${n.date}`, tag: "Notice" });
        }
      });

      // Check exams
      exams.forEach(ex => {
        if (ex.subjectName.toLowerCase().includes(q) || ex.subjectCode.toLowerCase().includes(q) || ex.venue.toLowerCase().includes(q)) {
          matches.push({ type: "Exam", title: `${ex.subjectCode}: ${ex.subjectName}`, meta: `${ex.date} at ${ex.venue}`, tag: "Examination" });
        }
      });

      // Check gate passes
      passes.forEach(gp => {
        if (gp.destination.toLowerCase().includes(q) || gp.reason.toLowerCase().includes(q)) {
          matches.push({ type: "Gate Pass", title: `Pass to: ${gp.destination}`, meta: `Status: ${gp.status} (${gp.departureDate})`, tag: "Pass" });
        }
      });

      // Check complaints
      complaints.forEach(c => {
        if (c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
          matches.push({ type: "Hostel Complaint", title: `${c.category}: ${c.description.substring(0, 45)}...`, meta: `Status: ${c.status} (${c.hostelName})`, tag: "Complaint" });
        }
      });

      if (matches.length === 0) {
        resultsBox.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No matching records found for "<span class="font-semibold">${q}</span>"</p>`;
        return;
      }

      resultsBox.innerHTML = matches.slice(0, 8).map((m, idx) => `
        <div data-search-idx="${idx}" class="search-result-item py-2.5 px-3 hover:bg-slate-50 rounded flex items-center justify-between cursor-pointer transition">
          <div>
            <span class="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-800 border border-blue-200 mr-2">${m.tag}</span>
            <span class="font-medium text-slate-900 text-xs">${m.title}</span>
            <p class="text-[11px] text-slate-500 mt-0.5 ml-1">${m.meta}</p>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
        </div>
      `).join("");

      resultsBox.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-search-idx"));
          const m = matches[idx];
          CampusUI.closeModal();
          if (m) {
            let tab = "notices";
            if (m.type === "Notice") tab = "notices";
            else if (m.type === "Exam") tab = "exams";
            else if (m.type === "Gate Pass") tab = "gatepass";
            else if (m.type === "Hostel Complaint") tab = window.AdminApp ? "complaints" : "hostel";

            if (window.StudentApp && window.StudentApp.switchTab) {
              window.StudentApp.switchTab(tab);
            } else if (window.AdminApp && window.AdminApp.switchTab) {
              window.AdminApp.switchTab(tab);
            } else {
              window.location.href = `student.html#${tab}`;
            }
          }
        });
      });

      if (window.lucide) window.lucide.createIcons({ root: resultsBox });
    });
  }
};

window.CampusUI = CampusUI;
