/* ==========================================================================
   UNIFIED DIGITAL CAMPUS PLATFORM - STATE MANAGEMENT & STORAGE LAYER
   Provides centralized reactive storage backed by localStorage.
   Seamlessly maps to Supabase database architecture in Phase 2.
   ========================================================================== */

const STORAGE_KEY = "BPUT_CAMPUS_PLATFORM_V1";
const SESSION_KEY = "BPUT_ACTIVE_SESSION_V1";

class CampusStore {
  constructor() {
    this.data = this.loadData();
    this.initCrossTabListener();
  }

  // Load from LocalStorage or seed with INITIAL_DATA
  loadData() {
    try {
      const storedRaw = localStorage.getItem(STORAGE_KEY);
      if (storedRaw) {
        const stored = JSON.parse(storedRaw);
        // Automatically sync missing students from INITIAL_DATA into stored users
        if (stored && Array.isArray(stored.users)) {
          let updated = false;
          INITIAL_DATA.users.forEach(initUser => {
            if (!stored.users.some(u => u.id === initUser.id)) {
              stored.users.push(initUser);
              updated = true;
            }
          });
          if (updated) {
            this.saveData(stored);
          }
        }
        return stored;
      }
    } catch (e) {
      console.warn("Error reading localStorage, loading fresh seed data:", e);
    }
    // Deep clone INITIAL_DATA
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData(fresh);
    return fresh;
  }

  saveData(dataToSave = null) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
    } catch (e) {
      console.error("Error saving data to localStorage:", e);
    }
  }

  resetToDefault() {
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData(fresh);
    this.notifyListeners();
    return fresh;
  }

  notifyListeners() {
    window.dispatchEvent(new CustomEvent("campus_store_updated", { detail: { timestamp: Date.now() } }));
  }

  initCrossTabListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          this.data = JSON.parse(e.newValue);
          this.notifyListeners();
        } catch (err) {
          console.error("Cross-tab sync error:", err);
        }
      }
    });
  }

  // ==========================================
  // AUTH & SESSION CONTROLS
  // ==========================================
  getCurrentUser() {
    if (window.AuthService) {
      const auth = window.AuthService.getAuth();
      if (auth.isAuthenticated && auth.userId) {
        const authUser = this.getUserById(auth.userId);
        if (authUser) return authUser;
      }
    }
    const sessionUserId = localStorage.getItem(SESSION_KEY) || "230101"; // Default to Aarav Kumar
    return this.getUserById(sessionUserId) || this.data.users[0];
  }

  setCurrentUser(userId) {
    const user = this.getUserById(userId);
    if (user) {
      localStorage.setItem(SESSION_KEY, userId);
      window.dispatchEvent(new CustomEvent("campus_session_changed", { detail: { user } }));
      return user;
    }
    return null;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id) || null;
  }

  getUsers(role = null) {
    if (!role) return this.data.users;
    return this.data.users.filter(u => u.role === role);
  }

  getStudents() {
    return this.getUsers("student");
  }

  getTeachers() {
    return this.getUsers("teacher");
  }

  // ==========================================
  // NOTICES MODULE
  // ==========================================
  getNotices(category = "All", search = "") {
    let list = [...this.data.notices];
    if (category && category !== "All") {
      list = list.filter(n => n.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.summary.toLowerCase().includes(q) ||
        n.issuingAuthority.toLowerCase().includes(q)
      );
    }
    // Sort newest first
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getNoticeById(id) {
    return this.data.notices.find(n => n.id === id) || null;
  }

  addNotice(notice) {
    const newNotice = {
      id: `NOT-2026-${String(this.data.notices.length + 90).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      priority: notice.priority || "General",
      issuingAuthority: notice.issuingAuthority || "Office of the Dean",
      targetAudience: notice.targetAudience || "Everyone",
      summary: notice.summary || "",
      fullContent: notice.fullContent || notice.summary || "",
      attachmentName: notice.attachmentName || null,
      ...notice
    };
    this.data.notices.unshift(newNotice);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncNotice(newNotice);
    return newNotice;
  }

  deleteNotice(id) {
    this.data.notices = this.data.notices.filter(n => n.id !== id);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.deleteNotice(id);
    return true;
  }

  // ==========================================
  // GATE PASS MODULE
  // ==========================================
  getGatePasses(studentId = null) {
    let list = [...this.data.gatePasses];
    if (studentId) {
      list = list.filter(gp => gp.studentId === studentId);
    }
    return list.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  }

  getGatePassById(id) {
    return this.data.gatePasses.find(gp => gp.id === id) || null;
  }

  createGatePass(formData) {
    const currentUser = this.getCurrentUser();
    const newPass = {
      id: `GP-2026-${String(this.data.gatePasses.length + 105).padStart(3, "0")}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      department: currentUser.branchCode || currentUser.department,
      hostelName: currentUser.hostelName || "N/A",
      roomNo: currentUser.roomNo || "N/A",
      destination: formData.destination,
      reason: formData.reason,
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
      emergencyContact: formData.emergencyContact || currentUser.guardianPhone,
      status: "Pending",
      appliedOn: new Date().toISOString().replace("T", " ").substring(0, 16),
      reviewedBy: null,
      reviewedOn: null,
      adminRemarks: ""
    };
    this.data.gatePasses.unshift(newPass);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncGatePass(newPass);
    return newPass;
  }

  updateGatePassStatus(id, status, remarks = "", reviewerName = "Campus Administrator") {
    const pass = this.getGatePassById(id);
    if (!pass) return null;
    pass.status = status;
    pass.adminRemarks = remarks;
    pass.reviewedBy = reviewerName;
    pass.reviewedOn = new Date().toISOString().replace("T", " ").substring(0, 16);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncGatePass(pass);
    return pass;
  }

  // ==========================================
  // LEAVE APPLICATIONS MODULE
  // ==========================================
  getLeaveApplications(studentId = null) {
    let list = [...this.data.leaveApplications];
    if (studentId) {
      list = list.filter(l => l.studentId === studentId);
    }
    return list.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  }

  createLeaveApplication(formData) {
    const user = this.getCurrentUser();
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      id: `LV-2026-${String(this.data.leaveApplications.length + 50).padStart(3, "0")}`,
      studentId: user.id,
      studentName: user.name,
      leaveType: formData.leaveType || "Personal Leave",
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      totalDays: isNaN(diffDays) ? 1 : diffDays,
      reason: formData.reason,
      additionalDetails: formData.additionalDetails || "",
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
      reviewedBy: null,
      reviewedOn: null,
      adminRemarks: ""
    };
    this.data.leaveApplications.unshift(newLeave);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncLeaveApplication(newLeave);
    return newLeave;
  }

  updateLeaveStatus(id, status, remarks = "", reviewerName = "Office of Dean (Academic Affairs)") {
    const item = this.data.leaveApplications.find(l => l.id === id);
    if (!item) return null;
    item.status = status;
    item.adminRemarks = remarks;
    item.reviewedBy = reviewerName;
    item.reviewedOn = new Date().toISOString().split("T")[0];
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncLeaveApplication(item);
    return item;
  }

  // ==========================================
  // HOSTEL COMPLAINTS MODULE (3-STATE: Pending -> In Progress -> Resolved)
  // ==========================================
  getComplaints(studentId = null) {
    let list = [...this.data.hostelComplaints];
    if (studentId) {
      list = list.filter(c => c.studentId === studentId);
    }
    return list.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
  }

  getComplaintById(id) {
    return this.data.hostelComplaints.find(c => c.id === id) || null;
  }

  createComplaint(formData) {
    const user = this.getCurrentUser();
    const newComplaint = {
      id: `CMP-2026-${String(this.data.hostelComplaints.length + 305).padStart(3, "0")}`,
      studentId: user.id,
      studentName: user.name,
      hostelName: formData.hostelName || user.hostelName || "General Hostel",
      roomNo: formData.roomNo || user.roomNo || "Room",
      category: formData.category || "Electrical",
      priority: formData.priority || "Medium",
      description: formData.description,
      status: "Pending",
      submittedOn: new Date().toISOString().replace("T", " ").substring(0, 16),
      assignedTo: "Estate Maintenance Desk",
      adminRemarks: "Complaint registered."
    };
    this.data.hostelComplaints.unshift(newComplaint);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncComplaint(newComplaint);
    return newComplaint;
  }

  updateComplaintStatus(id, status, remarks = "", assignedTo = null) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;
    complaint.status = status; // "Pending" | "In Progress" | "Resolved"
    if (remarks) complaint.adminRemarks = remarks;
    if (assignedTo) complaint.assignedTo = assignedTo;
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncComplaint(complaint);
    return complaint;
  }

  // ==========================================
  // FEES & FEE QUERIES MODULE
  // ==========================================
  getFeeStructure(studentId = "230101") {
    return this.data.feeStructure;
  }

  getFeeQueries(studentId = null) {
    let list = [...this.data.feeQueries];
    if (studentId) {
      list = list.filter(q => q.studentId === studentId);
    }
    return list.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
  }

  createFeeQuery(formData) {
    const user = this.getCurrentUser();
    const newQuery = {
      id: `FQ-2026-${String(this.data.feeQueries.length + 20).padStart(3, "0")}`,
      studentId: user.id,
      studentName: user.name,
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      status: "Open", // Open, Replied, Closed
      submittedOn: new Date().toISOString().replace("T", " ").substring(0, 16),
      reply: "",
      repliedBy: "",
      repliedOn: ""
    };
    this.data.feeQueries.unshift(newQuery);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncFeeQuery(newQuery);
    return newQuery;
  }

  replyFeeQuery(id, replyText, repliedBy = "Accounts Section Officer", status = "Replied") {
    const query = this.data.feeQueries.find(q => q.id === id);
    if (!query) return null;
    query.reply = replyText;
    query.repliedBy = repliedBy;
    query.repliedOn = new Date().toISOString().replace("T", " ").substring(0, 16);
    query.status = status;
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncFeeQuery(query);
    return query;
  }

  // ==========================================
  // ASSIGNMENTS MODULE
  // ==========================================
  getAssignments() {
    return [...this.data.assignments];
  }

  addAssignment(formData) {
    const newAsn = {
      id: `ASN-${String(this.data.assignments.length + 505)}`,
      subjectCode: formData.subjectCode,
      subjectName: formData.subjectName,
      faculty: formData.faculty || "Faculty",
      title: formData.title,
      deadline: formData.deadline,
      description: formData.description,
      status: "Pending"
    };
    this.data.assignments.unshift(newAsn);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncAssignment(newAsn);
    return newAsn;
  }

  deleteAssignment(id) {
    this.data.assignments = this.data.assignments.filter(a => a.id !== id);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.deleteAssignment(id);
    return true;
  }

  // ==========================================
  // EXAMINATION CELL MODULE
  // ==========================================
  getExamData() {
    return this.data.examinationCell;
  }

  addDatesheetEntry(entry) {
    this.data.examinationCell.datesheet.push(entry);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncExamDatesheet(entry);
    return entry;
  }

  // ==========================================
  // LOST AND FOUND MODULE
  // ==========================================
  getLostAndFound(filterType = "All") {
    let list = [...this.data.lostAndFound];
    if (filterType && filterType !== "All") {
      list = list.filter(item => item.type.toLowerCase() === filterType.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  reportLostFound(formData) {
    const user = this.getCurrentUser();
    const newItem = {
      id: `LF-2026-${String(this.data.lostAndFound.length + 55).padStart(3, "0")}`,
      type: formData.type || "Lost",
      title: formData.title,
      category: formData.category || "General",
      locationFound: formData.locationFound,
      date: formData.date || new Date().toISOString().split("T")[0],
      description: formData.description,
      reportedBy: `${user.name} (${user.department || user.role})`,
      contactInfo: formData.contactInfo || user.phone || user.email,
      status: "Available"
    };
    this.data.lostAndFound.unshift(newItem);
    this.saveData();
    if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncLostAndFound(newItem);
    return newItem;
  }

  updateLostFoundStatus(id, status) {
    const item = this.data.lostAndFound.find(i => i.id === id);
    if (item) {
      item.status = status;
      this.saveData();
      if (window.SupabaseCampusDB) window.SupabaseCampusDB.syncLostAndFound(item);
    }
    return item;
  }

  // ==========================================
  // CAMPUS CONTACTS DIRECTORY
  // ==========================================
  getContacts() {
    return this.data.contacts;
  }
}

// Global Singleton Instance
window.campusStore = new CampusStore();
