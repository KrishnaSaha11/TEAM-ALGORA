/* ==========================================================================
   BPUT DIGITAL CAMPUS PLATFORM - SUPABASE LIVE DATABASE INTEGRATION
   Role: Complete 2-way real-time persistence layer with Supabase PostgreSQL.
   Resilience: Dual-layer persistence with local caching and cloud sync.
   ========================================================================== */

const SUPABASE_CONFIG_KEY = "BPUT_SUPABASE_CONFIG_V1";

// Pre-configured Supabase Project credentials
const DEFAULT_SUPABASE_CONFIG = {
  url: "https://keenqhjcxqdqnjipppny.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZW5xaGpjeHFkcW5qaXBwcG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjExNTIsImV4cCI6MjEwNjE5NzE1Mn0.6UQO8enZYjdIFIP825GlpS94i69Z03XsuIPfspENDVc",
  tableName: "students"
};

class SupabaseCampusService {
  constructor() {
    this.client = null;
    this.config = this.loadConfig();
    this.isLive = false;
    this.lastChecked = null;
    this.realtimeChannel = null;
    this.init();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return { ...DEFAULT_SUPABASE_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Error loading Supabase config:", e);
    }
    return { ...DEFAULT_SUPABASE_CONFIG };
  }

  saveConfig(url, anonKey, tableName = "students") {
    this.config = {
      url: (url || "").trim(),
      anonKey: (anonKey || "").trim(),
      tableName: (tableName || "students").trim()
    };
    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error("Error saving Supabase config:", e);
    }
    this.client = null;
    this.init();
  }

  getClient() {
    if (!this.client && this.config.url && this.config.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
      } catch (err) {
        console.error("Supabase client init failed:", err);
      }
    }
    return this.client;
  }

  init() {
    const client = this.getClient();
    if (client) {
      this.isLive = true;
      this.initRealtime();
      // On startup, pull live cloud data so any edits in the backend reflect on the frontend
      setTimeout(() => {
        this.pullFromCloud().then(() => {
          this.seedInitialDataIfEmpty();
        });
      }, 150);
    }
  }

  isConfigured() {
    return !!(this.config.url && this.config.anonKey && this.getClient());
  }

  /**
   * Initialize Supabase Realtime channel
   * Any change made in Supabase directly immediately triggers pullFromCloud()
   */
  initRealtime() {
    const client = this.getClient();
    if (!client) return;

    try {
      if (this.realtimeChannel) {
        client.removeChannel(this.realtimeChannel);
      }
      this.realtimeChannel = client
        .channel("campus-realtime-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public" },
          (payload) => {
            console.log("⚡ Live change received from Supabase:", payload.table, payload.eventType);
            this.pullFromCloud();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            this.isLive = true;
            console.log("🟢 Live Supabase Realtime connected.");
          }
        });
    } catch (e) {
      console.warn("Realtime channel setup note:", e);
    }
  }

  /**
   * Test connection to Supabase database
   */
  async testConnection() {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: "Supabase URL and Anon Key are not yet configured." };
    }

    try {
      const { data, error } = await client
        .from("students")
        .select("count", { count: "exact", head: true });

      if (error) {
        this.isLive = false;
        return { success: false, error: error.message };
      }

      this.isLive = true;
      this.lastChecked = new Date();
      return { success: true, count: data };
    } catch (err) {
      this.isLive = false;
      return { success: false, error: err.message || "Network error connecting to Supabase" };
    }
  }

  /**
   * Fetch all students from Supabase (or fallback to local store)
   */
  async getStudents() {
    const client = this.getClient();
    if (!client) {
      return {
        source: "local",
        data: window.campusStore ? window.campusStore.getStudents() : []
      };
    }

    try {
      const { data, error } = await client
        .from("students")
        .select("*")
        .order("id", { ascending: true });

      if (error || !data || data.length === 0) {
        return {
          source: "local",
          error: error ? error.message : null,
          data: window.campusStore ? window.campusStore.getStudents() : []
        };
      }

      this.isLive = true;
      return {
        source: "supabase",
        data: data
      };
    } catch (err) {
      this.isLive = false;
      return {
        source: "local",
        error: err.message,
        data: window.campusStore ? window.campusStore.getStudents() : []
      };
    }
  }

  /**
   * Pull latest data from all Supabase PostgreSQL tables into the app
   * Ensures any changes in the Supabase backend show up immediately in the frontend.
   */
  async pullFromCloud() {
    const client = this.getClient();
    if (!client) return { success: false, error: "Supabase client unavailable" };
    const store = window.campusStore;
    if (!store) return { success: false, error: "CampusStore not initialized" };

    let updated = false;

    try {
      // 1. Leave Applications
      const { data: leaves, error: lErr } = await client.from("leave_applications").select("*").order("applied_on", { ascending: false });
      if (!lErr && leaves && leaves.length > 0) {
        store.data.leaveApplications = leaves.map(row => ({
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          leaveType: row.leave_type || "Personal Leave",
          fromDate: row.from_date,
          toDate: row.to_date,
          totalDays: parseInt(row.total_days, 10) || 1,
          reason: row.reason || "",
          additionalDetails: row.additional_details || "",
          status: row.status || "Pending",
          appliedOn: row.applied_on ? (row.applied_on.includes("T") ? row.applied_on.split("T")[0] : row.applied_on) : "",
          reviewedBy: row.reviewed_by || null,
          reviewedOn: row.reviewed_on || null,
          adminRemarks: row.admin_remarks || ""
        }));
        updated = true;
      }

      // 2. Gate Passes
      const { data: passes, error: pErr } = await client.from("gate_passes").select("*").order("applied_on", { ascending: false });
      if (!pErr && passes && passes.length > 0) {
        store.data.gatePasses = passes.map(row => ({
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          department: row.department,
          hostelName: store.getUserById(row.student_id)?.hostelName || "N/A",
          roomNo: store.getUserById(row.student_id)?.roomNo || "N/A",
          destination: row.destination,
          reason: row.reason,
          departureDate: row.departure_date,
          departureTime: row.departure_time,
          returnDate: row.return_date,
          returnTime: row.return_time,
          emergencyContact: store.getUserById(row.student_id)?.guardianPhone || "",
          status: row.status || "Pending",
          appliedOn: row.applied_on || "",
          reviewedBy: row.reviewed_by || null,
          reviewedOn: row.reviewed_on || null,
          adminRemarks: row.admin_remarks || ""
        }));
        updated = true;
      }

      // 3. Hostel Complaints
      const { data: complaints, error: cErr } = await client.from("hostel_complaints").select("*").order("created_at", { ascending: false });
      if (!cErr && complaints && complaints.length > 0) {
        store.data.hostelComplaints = complaints.map(row => ({
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          hostelName: row.hostel_name,
          roomNo: row.room_no,
          category: row.category,
          priority: row.priority,
          description: row.description,
          status: row.status || "Pending",
          submittedOn: row.created_at ? row.created_at.replace("T", " ").substring(0, 16) : new Date().toISOString().substring(0, 10),
          assignedTo: row.assigned_to || "Estate Desk",
          adminRemarks: row.admin_remarks || ""
        }));
        updated = true;
      }

      // 4. Notices
      const { data: notices, error: nErr } = await client.from("notices").select("*").order("created_at", { ascending: false });
      if (!nErr && notices && notices.length > 0) {
        store.data.notices = notices.map(row => ({
          id: row.id,
          title: row.title,
          category: row.category || "General",
          priority: row.priority || "General",
          issuingAuthority: row.issuing_authority || "Office of the Dean",
          targetAudience: row.target_audience || "Everyone",
          summary: row.summary || "",
          fullContent: row.full_content || row.summary || "",
          date: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
        }));
        updated = true;
      }

      // 5. Fee Queries
      const { data: feeQueries, error: fqErr } = await client.from("fee_queries").select("*").order("submitted_on", { ascending: false });
      if (!fqErr && feeQueries && feeQueries.length > 0) {
        store.data.feeQueries = feeQueries.map(row => ({
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          category: row.category,
          subject: row.subject,
          description: row.description,
          status: row.status || "Open",
          submittedOn: row.submitted_on ? (row.submitted_on.includes("T") ? row.submitted_on.replace("T", " ").substring(0, 16) : row.submitted_on) : "",
          reply: row.reply || "",
          repliedBy: row.replied_by || "",
          repliedOn: row.replied_on || ""
        }));
        updated = true;
      }

      // 6. Lost & Found
      const { data: lostFound, error: lfErr } = await client.from("lost_and_found").select("*").order("date", { ascending: false });
      if (!lfErr && lostFound && lostFound.length > 0) {
        store.data.lostAndFound = lostFound.map(row => ({
          id: row.id,
          type: row.type || "Lost",
          title: row.title,
          category: row.category || "General",
          locationFound: row.location_found,
          date: row.date,
          description: row.description,
          reportedBy: row.reported_by,
          contactInfo: row.contact_info,
          status: row.status || "Available"
        }));
        updated = true;
      }

      // 7. Students
      const { data: students, error: sErr } = await client.from("students").select("*");
      if (!sErr && students && students.length > 0) {
        const studentUsers = students.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          department: row.department,
          branchCode: row.branch_code,
          semester: row.semester,
          section: row.section,
          jeeRegNo: row.jee_reg_no,
          hostelResident: row.hostel_resident,
          hostelName: row.hostel_name,
          roomNo: row.room_no,
          guardianName: row.guardian_name,
          guardianPhone: row.guardian_phone,
          role: "student"
        }));
        const nonStudents = store.data.users.filter(u => u.role !== "student");
        store.data.users = [...nonStudents, ...studentUsers];
        updated = true;
      }

      if (updated) {
        store.saveData();
        this.isLive = true;
        this.lastChecked = new Date();
      }
      return { success: true };
    } catch (err) {
      console.warn("Pull from Supabase note:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sync a leave application record to Supabase
   */
  async syncLeaveApplication(leave) {
    const client = this.getClient();
    if (!client || !leave) return;
    try {
      const row = {
        id: leave.id,
        student_id: leave.studentId,
        student_name: leave.studentName,
        leave_type: leave.leaveType,
        from_date: leave.fromDate,
        to_date: leave.toDate,
        total_days: parseInt(leave.totalDays, 10) || 1,
        reason: leave.reason,
        additional_details: leave.additionalDetails || "",
        status: leave.status || "Pending",
        applied_on: leave.appliedOn ? (leave.appliedOn.includes("T") ? leave.appliedOn : new Date(leave.appliedOn).toISOString()) : new Date().toISOString(),
        reviewed_by: leave.reviewedBy || null,
        reviewed_on: leave.reviewedOn || null,
        admin_remarks: leave.adminRemarks || ""
      };
      const { error } = await client.from("leave_applications").upsert([row], { onConflict: "id" });
      if (error) {
        console.error("Supabase leave sync error:", error);
      } else {
        console.log("✅ Leave application synced to Supabase:", leave.id);
        this.isLive = true;
      }
    } catch (e) {
      console.warn("Background Supabase leave sync note:", e);
    }
  }

  /**
   * Sync a gate pass record to Supabase
   */
  async syncGatePass(pass) {
    const client = this.getClient();
    if (!client || !pass) return;
    try {
      const row = {
        id: pass.id,
        student_id: pass.studentId,
        student_name: pass.studentName,
        department: pass.department,
        destination: pass.destination,
        reason: pass.reason,
        departure_date: pass.departureDate,
        departure_time: pass.departureTime,
        return_date: pass.returnDate,
        return_time: pass.returnTime,
        status: pass.status,
        applied_on: pass.appliedOn,
        reviewed_by: pass.reviewedBy || null,
        admin_remarks: pass.adminRemarks || ""
      };
      const { error } = await client.from("gate_passes").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase gate pass sync error:", error);
      else console.log("✅ Gate pass synced to Supabase:", pass.id);
    } catch (e) {
      console.warn("Background Supabase gate pass sync note:", e);
    }
  }

  /**
   * Sync a hostel complaint record to Supabase
   */
  async syncComplaint(complaint) {
    const client = this.getClient();
    if (!client || !complaint) return;
    try {
      const row = {
        id: complaint.id,
        student_id: complaint.studentId,
        student_name: complaint.studentName,
        hostel_name: complaint.hostelName,
        room_no: complaint.roomNo,
        category: complaint.category,
        priority: complaint.priority,
        description: complaint.description,
        status: complaint.status,
        assigned_to: complaint.assignedTo || "Estate Desk",
        admin_remarks: complaint.adminRemarks || ""
      };
      const { error } = await client.from("hostel_complaints").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase complaint sync error:", error);
      else console.log("✅ Complaint synced to Supabase:", complaint.id);
    } catch (e) {
      console.warn("Background Supabase complaint sync note:", e);
    }
  }

  /**
   * Sync a circular/notice record to Supabase
   */
  async syncNotice(notice) {
    const client = this.getClient();
    if (!client || !notice) return;
    try {
      const row = {
        id: notice.id,
        title: notice.title,
        category: notice.category,
        priority: notice.priority,
        issuing_authority: notice.issuingAuthority,
        target_audience: notice.targetAudience,
        summary: notice.summary,
        full_content: notice.fullContent || notice.summary
      };
      const { error } = await client.from("notices").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase notice sync error:", error);
      else console.log("✅ Notice synced to Supabase:", notice.id);
    } catch (e) {
      console.warn("Background Supabase notice sync note:", e);
    }
  }

  async deleteNotice(id) {
    const client = this.getClient();
    if (!client || !id) return;
    try {
      await client.from("notices").delete().eq("id", id);
      console.log("✅ Notice deleted from Supabase:", id);
    } catch (e) {
      console.warn("Error deleting notice from Supabase:", e);
    }
  }

  /**
   * Sync a fee query record to Supabase
   */
  async syncFeeQuery(query) {
    const client = this.getClient();
    if (!client || !query) return;
    try {
      const row = {
        id: query.id,
        student_id: query.studentId,
        student_name: query.studentName,
        category: query.category,
        subject: query.subject,
        description: query.description,
        status: query.status || "Open",
        submitted_on: query.submittedOn ? (query.submittedOn.includes("T") ? query.submittedOn : new Date().toISOString()) : new Date().toISOString(),
        reply: query.reply || "",
        replied_by: query.repliedBy || "",
        replied_on: query.repliedOn || ""
      };
      const { error } = await client.from("fee_queries").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase fee query sync error:", error);
      else console.log("✅ Fee query synced to Supabase:", query.id);
    } catch (e) {
      console.warn("Background Supabase fee query sync note:", e);
    }
  }

  /**
   * Sync a lost & found record to Supabase
   */
  async syncLostAndFound(item) {
    const client = this.getClient();
    if (!client || !item) return;
    try {
      const row = {
        id: item.id,
        type: item.type,
        title: item.title,
        category: item.category || "General",
        location_found: item.locationFound,
        date: item.date,
        description: item.description,
        reported_by: item.reportedBy,
        contact_info: item.contactInfo,
        status: item.status || "Available"
      };
      const { error } = await client.from("lost_and_found").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase lost and found sync error:", error);
      else console.log("✅ Lost & Found synced to Supabase:", item.id);
    } catch (e) {
      console.warn("Background Supabase lost & found sync note:", e);
    }
  }

  async deleteLostAndFound(id) {
    const client = this.getClient();
    if (!client || !id) return;
    try {
      await client.from("lost_and_found").delete().eq("id", id);
      console.log("✅ Lost & Found deleted from Supabase:", id);
    } catch (e) {
      console.warn("Error deleting lost and found from Supabase:", e);
    }
  }

  /**
   * Sync an assignment to Supabase
   */
  async syncAssignment(asn) {
    const client = this.getClient();
    if (!client || !asn) return;
    try {
      const row = {
        id: asn.id,
        subject_code: asn.subjectCode,
        subject_name: asn.subjectName,
        faculty: asn.faculty || "",
        title: asn.title,
        deadline: asn.deadline,
        description: asn.description,
        status: asn.status || "Pending"
      };
      const { error } = await client.from("assignments").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase assignment sync error:", error);
      else console.log("✅ Assignment synced to Supabase:", asn.id);
    } catch (e) {
      console.warn("Background Supabase assignment sync note:", e);
    }
  }

  async deleteAssignment(id) {
    const client = this.getClient();
    if (!client || !id) return;
    try {
      await client.from("assignments").delete().eq("id", id);
      console.log("✅ Assignment deleted from Supabase:", id);
    } catch (e) {
      console.warn("Error deleting assignment from Supabase:", e);
    }
  }

  /**
   * Sync an exam datesheet entry to Supabase
   */
  async syncExamDatesheet(entry) {
    const client = this.getClient();
    if (!client || !entry) return;
    try {
      const row = {
        id: entry.id || `EXAM-${entry.subjectCode}-${entry.date}`,
        exam_name: entry.examName || "Autumn Mid-Semester Examination 2026-2027",
        date: entry.date,
        time: entry.time,
        subject_code: entry.subjectCode,
        subject_name: entry.subjectName,
        venue: entry.venue,
        semester: entry.semester || 5,
        department: entry.department || "Computer Science & Engineering"
      };
      const { error } = await client.from("exam_datesheets").upsert([row], { onConflict: "id" });
      if (error) console.error("Supabase exam sync error:", error);
      else console.log("✅ Exam datesheet synced to Supabase:", row.id);
    } catch (e) {
      console.warn("Background Supabase exam sync note:", e);
    }
  }

  /**
   * Auto-seed initial mock data if cloud tables are currently empty
   */
  async seedInitialDataIfEmpty() {
    const client = this.getClient();
    if (!client || !window.campusStore) return;

    try {
      // Check leave_applications
      const { count: lCount } = await client.from("leave_applications").select("*", { count: "exact", head: true });
      if (lCount === 0) {
        const leaves = window.campusStore.getLeaveApplications();
        for (const l of leaves) {
          await this.syncLeaveApplication(l);
        }
      }

      // Check notices
      const { count: nCount } = await client.from("notices").select("*", { count: "exact", head: true });
      if (nCount === 0) {
        const notices = window.campusStore.getNotices();
        for (const n of notices) {
          await this.syncNotice(n);
        }
      }

      // Check fee_queries
      const { count: fCount } = await client.from("fee_queries").select("*", { count: "exact", head: true });
      if (fCount === 0) {
        const fq = window.campusStore.getFeeQueries();
        for (const q of fq) {
          await this.syncFeeQuery(q);
        }
      }

      // Check lost_and_found
      const { count: lfCount } = await client.from("lost_and_found").select("*", { count: "exact", head: true });
      if (lfCount === 0) {
        const lf = window.campusStore.getLostAndFound();
        for (const item of lf) {
          await this.syncLostAndFound(item);
        }
      }
    } catch (e) {
      console.warn("Note on initial seed check:", e);
    }
  }

  /**
   * Push local student records to Supabase
   */
  async syncLocalToCloud() {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: "Please configure Supabase Project URL and Anon Key first." };
    }

    const localStudents = window.campusStore ? window.campusStore.getStudents() : [];
    if (!localStudents.length) {
      return { success: false, error: "No local students found to sync." };
    }

    const rows = localStudents.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      department: s.department || "",
      branch_code: s.branchCode || "",
      semester: parseInt(s.semester, 10) || 5,
      section: s.section || "A",
      jee_reg_no: s.jeeRegNo || "",
      hostel_resident: !!s.hostelResident,
      hostel_name: s.hostelName || "",
      room_no: s.roomNo || "",
      guardian_name: s.guardianName || "",
      guardian_phone: s.guardianPhone || ""
    }));

    try {
      const { error } = await client
        .from("students")
        .upsert(rows, { onConflict: "id" });

      if (error) throw error;
      this.isLive = true;
      return { success: true, count: rows.length };
    } catch (err) {
      console.error("Error syncing students to Supabase:", err);
      return { success: false, error: err.message || "Failed to push records to Supabase" };
    }
  }

  /**
   * Push ALL local data into Supabase in 1 click
   */
  async syncAllToCloud() {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: "Supabase client is not available." };
    }
    const store = window.campusStore;
    if (!store) return { success: false, error: "Store not initialized." };

    let count = 0;
    try {
      const sRes = await this.syncLocalToCloud();
      if (sRes.success) count += sRes.count;

      const passes = store.getGatePasses();
      for (const p of passes) { await this.syncGatePass(p); count++; }

      const complaints = store.getComplaints();
      for (const c of complaints) { await this.syncComplaint(c); count++; }

      const notices = store.getNotices();
      for (const n of notices) { await this.syncNotice(n); count++; }

      const lf = store.getLostAndFound();
      for (const item of lf) { await this.syncLostAndFound(item); count++; }

      const leaves = store.getLeaveApplications();
      for (const l of leaves) { await this.syncLeaveApplication(l); count++; }

      const fq = store.getFeeQueries();
      for (const q of fq) { await this.syncFeeQuery(q); count++; }

      const asns = store.getAssignments();
      for (const a of asns) { await this.syncAssignment(a); count++; }

      const examData = store.getExamData();
      if (examData && examData.datesheet) {
        for (const entry of examData.datesheet) { await this.syncExamDatesheet(entry); count++; }
      }

      this.isLive = true;
      return { success: true, count };
    } catch (err) {
      console.error("Full sync error:", err);
      return { success: false, error: err.message, count };
    }
  }
}

window.SupabaseCampusDB = new SupabaseCampusService();
