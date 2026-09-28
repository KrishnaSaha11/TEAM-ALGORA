/* ==========================================================================
   BPUT DIGITAL CAMPUS PLATFORM - CENTRALIZED AUTHENTICATION & SERVICE LAYER
   Architecture: Supabase Auth Ready (Client-side abstraction)
   Institution: Biju Patnaik University of Technology (BPUT), Odisha
   ========================================================================== */

const AUTH_SESSION_KEY = "BPUT_AUTH_SESSION_V1";
const AUTH_CREDENTIALS_KEY = "BPUT_AUTH_CREDENTIALS_V1";

// Default credentials — pre-seeded by BPUT Admission Cell.
// Students never self-register. Their default password = JEE Registration Number.
// On production: swap with Supabase Admin SDK bulk-import via Admission Cell CSV.
const DEFAULT_CREDENTIALS = {
  // Student Accounts — Password = JEE Registration Number (default, first-login)
  "230101": { password: "24011234567", role: "student", userId: "230101" },
  "230102": { password: "24012345678", role: "student", userId: "230102" },
  "230103": { password: "24013456789", role: "student", userId: "230103" },
  "230104": { password: "24014567890", role: "student", userId: "230104" },
  "230105": { password: "24015678901", role: "student", userId: "230105" }, // Umesh Patra — CE
  "230106": { password: "24016789012", role: "student", userId: "230106" }, // Pratik Mahapatra — ECE
  "230107": { password: "24017890123", role: "student", userId: "230107" }, // Swayam Sidh Behera — CSE
  "230108": { password: "24018901234", role: "student", userId: "230108" }, // Dibyajyoti Patra — EE
  "230109": { password: "24019012345", role: "student", userId: "230109" }, // Shreeja Mukherjee — IT
  "230110": { password: "24010123456", role: "student", userId: "230110" }, // Palak Saha — CSE
  // Admin Account
  "ADMIN001": { password: "admin123", role: "admin", userId: "ADMIN001" }
};

const AuthService = {
  /**
   * Internal credentials storage (maps to Supabase auth.users & public.profiles)
   */
  getCredentials() {
    try {
      const stored = localStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (stored) {
        return { ...DEFAULT_CREDENTIALS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Error reading auth credentials, using defaults:", e);
    }
    return { ...DEFAULT_CREDENTIALS };
  },

  saveCredential(userId, password, role) {
    try {
      const creds = this.getCredentials();
      creds[userId] = { password, role, userId };
      localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(creds));
    } catch (e) {
      console.error("Error saving auth credentials:", e);
    }
  },

  /**
   * Current authentication state
   * Returns: { isAuthenticated: boolean, role: "student" | "admin" | null, userId: string | null, user: object | null }
   */
  getAuth() {
    try {
      const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY);
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session && session.isAuthenticated && session.userId && session.role) {
          // Fetch full profile from campus store if available
          let userObj = session.user || null;
          if (window.campusStore) {
            const freshUser = window.campusStore.getUserById(session.userId);
            if (freshUser) {
              userObj = freshUser;
            }
          }
          return {
            isAuthenticated: true,
            role: session.role,
            userId: session.userId,
            user: userObj
          };
        }
      }
    } catch (e) {
      console.warn("Error reading auth session:", e);
    }

    return {
      isAuthenticated: false,
      role: null,
      userId: null,
      user: null
    };
  },

  /**
   * Save session to storage
   */
  setSession(authData) {
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authData));
      if (window.campusStore && authData.userId) {
        localStorage.setItem("BPUT_ACTIVE_SESSION_V1", authData.userId);
      }
      window.dispatchEvent(new CustomEvent("campus_auth_state_changed", { detail: authData }));
    } catch (e) {
      console.error("Error saving session:", e);
    }
  },

  /**
   * Login method
   * Can be swapped with: const { data, error } = await supabase.auth.signInWithPassword(...)
   * 
   * @param {string} identifier - Student ID, Admin ID, or Email
   * @param {string} password - User password
   * @param {string} expectedRole - "student" | "admin"
   */
  async login(identifier, password, expectedRole = null) {
    // Artificial small delay for realistic UX button state
    await new Promise(res => setTimeout(res, 450));

    const cleanId = (identifier || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanId) {
      return { success: false, error: "Please enter your ID / Registration Number." };
    }
    if (!cleanPass) {
      return { success: false, error: "Please enter your password." };
    }

    const creds = this.getCredentials();
    
    // Support matching by ID or Email
    let matchId = null;
    let userRecord = null;

    if (creds[cleanId]) {
      matchId = cleanId;
    } else if (window.campusStore) {
      const allUsers = window.campusStore.getUsers();
      const byEmail = allUsers.find(u => u.email && u.email.toLowerCase() === cleanId.toLowerCase());
      if (byEmail && creds[byEmail.id]) {
        matchId = byEmail.id;
      }
    }

    if (!matchId || !creds[matchId]) {
      return {
        success: false,
        error: expectedRole === "admin" 
          ? "Administrator record not found. Please verify your Administrator ID."
          : "Student record not found. Please verify your College Registration Number. Your default password is your JEE Registration Number."
      };
    }

    const cred = creds[matchId];

    // Check role expectation
    if (expectedRole && cred.role !== expectedRole) {
      return {
        success: false,
        error: expectedRole === "student"
          ? "This account is registered as an Administrative user. Please access the Campus Administration Portal."
          : "This account does not have Administrative privileges. Please sign in via the Student Portal."
      };
    }

    // Verify password
    if (cred.password !== cleanPass) {
      return {
        success: false,
        error: "Incorrect password. Please verify and try again."
      };
    }

    // Resolve user profile
    if (window.campusStore) {
      userRecord = window.campusStore.getUserById(matchId);
    }

    // If user object not found in store, create a basic fallback
    if (!userRecord) {
      userRecord = {
        id: matchId,
        role: cred.role,
        name: cred.role === "admin" ? "Campus Administrator" : "BPUT Student",
        email: `${matchId.toLowerCase()}@bput.ac.in`
      };
    }

    const authPayload = {
      isAuthenticated: true,
      role: cred.role,
      userId: matchId,
      user: userRecord
    };

    this.setSession(authPayload);

    return {
      success: true,
      role: cred.role,
      user: userRecord
    };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FUTURE (Supabase Admin SDK — Admission Cell Bulk Import):
  //   await supabase.auth.admin.createUser({ email, password: jeeRegNo, ... })
  // Student self-registration is intentionally disabled. BPUT Admission Cell
  // pre-seeds all enrolled students. The default password is the student's
  // JEE Registration Number.
  // ─────────────────────────────────────────────────────────────────────────

  getBranchCode(dept) {
    if (!dept) return "GEN";
    const d = dept.toLowerCase();
    if (d.includes("computer") || d.includes("cse")) return "CSE";
    if (d.includes("electronics") || d.includes("ece")) return "ECE";
    if (d.includes("electrical") || d.includes("ee")) return "EE";
    if (d.includes("mechanical") || d.includes("me")) return "ME";
    if (d.includes("civil") || d.includes("ce")) return "CE";
    if (d.includes("information") || d.includes("it")) return "IT";
    return "ENG";
  },

  /**
   * Request password recovery (prototype-friendly)
   */
  async requestPasswordReset(identifier, role = "student") {
    await new Promise(res => setTimeout(res, 400));
    return {
      success: true,
      message: "Password recovery will be connected to the university authentication service. For hackathon testing, please use the default demo password: " + (role === "admin" ? "admin123" : "student123")
    };
  },

  /**
   * Seamlessly switch to admin role (used by navigation and persona switchers)
   */
  switchToAdmin() {
    let userRecord = window.campusStore ? window.campusStore.getUserById("ADMIN001") : null;
    if (!userRecord) {
      userRecord = {
        id: "ADMIN001",
        name: "Campus Administrator",
        role: "admin",
        department: "Proctorial Board",
        email: "admin@bput.ac.in"
      };
    }
    const authPayload = {
      isAuthenticated: true,
      role: "admin",
      userId: "ADMIN001",
      user: userRecord
    };
    this.setSession(authPayload);
    if (window.campusStore) {
      window.campusStore.setCurrentUser("ADMIN001");
    }
    return authPayload;
  },

  /**
   * Seamlessly switch to student role
   */
  switchToStudent(studentId = "230101") {
    let userRecord = window.campusStore ? window.campusStore.getUserById(studentId) : null;
    if (!userRecord) {
      userRecord = {
        id: studentId,
        name: studentId === "230110" ? "Palak Saha" : "Aarav Kumar",
        role: "student",
        department: "Computer Science & Engineering",
        semester: 5,
        section: "A",
        email: `${studentId}@bput.ac.in`
      };
    }
    const authPayload = {
      isAuthenticated: true,
      role: "student",
      userId: studentId,
      user: userRecord
    };
    this.setSession(authPayload);
    if (window.campusStore) {
      window.campusStore.setCurrentUser(studentId);
    }
    return authPayload;
  },

  /**
   * Clear active session from storage
   */
  clearSession() {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem("BPUT_ACTIVE_SESSION_V1");
      window.dispatchEvent(new CustomEvent("campus_auth_state_changed", {
        detail: { isAuthenticated: false, role: null, userId: null, user: null }
      }));
    } catch (e) {
      console.error("Error clearing session:", e);
    }
  },

  /**
   * Clear session & logout
   * @param {string} redirectUrl - where to redirect after logout
   */
  logout(redirectUrl = null) {
    try {
      const currentAuth = this.getAuth();
      const role = currentAuth.role;
      this.clearSession();

      // Determine redirect URL if not specified
      if (!redirectUrl) {
        redirectUrl = role === "admin" ? "admin-auth.html" : "student-auth.html";
      }

      window.location.href = redirectUrl;
    } catch (e) {
      console.error("Error during logout:", e);
      window.location.href = "index.html";
    }
  },

  /**
   * Route Guard: Protect student pages
   * Strictly enforces authenticated student session. Never silently switches roles.
   */
  requireStudent() {
    const auth = this.getAuth();
    if (!auth.isAuthenticated || auth.role !== "student") {
      window.location.replace("student-auth.html");
      return false;
    }
    return true;
  },

  /**
   * Route Guard: Protect admin pages
   * Strictly enforces authenticated administrator session. Never silently switches roles.
   */
  requireAdmin() {
    const auth = this.getAuth();
    if (!auth.isAuthenticated || auth.role !== "admin") {
      window.location.replace("admin-auth.html");
      return false;
    }
    return true;
  }
};

window.AuthService = AuthService;
