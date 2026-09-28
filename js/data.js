/* ==========================================================================
   BPUT DIGITAL CAMPUS PLATFORM - REALISTIC SEED DATA
   Institution: Biju Patnaik University of Technology (BPUT), Odisha
   Campus: Rourkela, Odisha - 769015
   ========================================================================== */

const INITIAL_DATA = {
  // 1. Institution Metadata
  institution: {
    name: "Biju Patnaik University of Technology",
    shortName: "BPUT",
    location: "Chhend Colony, Rourkela, Odisha - 769015",
    tagline: "State University of Technology, Govt. of Odisha | Estd. 2002",
    contactEmail: "helpdesk@bput.ac.in",
    helpline: "+91 661 2489244",
    emergencyHelpline: "1800-345-6789 (Anti-Ragging / Security 24x7)"
  },

  // 2. Mock Users
  users: [
    {
      id: "230101",
      role: "student",
      name: "Aarav Kumar",
      email: "aarav.kumar@bput.ac.in",
      phone: "+91 98765 43210",
      department: "Computer Science & Engineering",
      branchCode: "CSE",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24011234567",
      hostelResident: true,
      hostelName: "Ramanujan Hall of Residence (Block 4)",
      roomNo: "402-B",
      guardianName: "Manoj Kumar",
      guardianPhone: "+91 94370 11223",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "230102",
      role: "student",
      name: "Priya Das",
      email: "priya.das@bput.ac.in",
      phone: "+91 98765 43211",
      department: "Electronics & Communication Engineering",
      branchCode: "ECE",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24012345678",
      hostelResident: true,
      hostelName: "Kalpana Chawla Hall of Residence (LH-2)",
      roomNo: "214",
      guardianName: "Bibhuti Das",
      guardianPhone: "+91 94370 33445"
    },
    {
      id: "230103",
      role: "student",
      name: "Rahul Sahu",
      email: "rahul.sahu@bput.ac.in",
      phone: "+91 98765 43212",
      department: "Computer Science & Engineering",
      branchCode: "CSE",
      semester: 3,
      section: "B",
      enrollmentYear: 2024,
      jeeRegNo: "24013456789",
      hostelResident: false,
      hostelName: "Day Scholar (Civil Township, Rourkela)",
      roomNo: "N/A",
      guardianName: "Surendra Sahu",
      guardianPhone: "+91 94370 55667"
    },
    {
      id: "230104",
      role: "student",
      name: "Sneha Patel",
      email: "sneha.patel@bput.ac.in",
      phone: "+91 98765 43213",
      department: "Mechanical Engineering",
      branchCode: "ME",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24014567890",
      hostelResident: true,
      hostelName: "Maa Saraswati Hall of Residence (LH-1)",
      roomNo: "108",
      guardianName: "Deepak Patel",
      guardianPhone: "+91 94370 77889"
    },
    {
      id: "230105",
      role: "student",
      name: "Umesh Patra",
      email: "umesh.patra@bput.ac.in",
      phone: "+91 98765 43214",
      department: "Civil Engineering",
      branchCode: "CE",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24015678901",
      hostelResident: true,
      hostelName: "Ramanujan Hall of Residence (Block 4)",
      roomNo: "305-A",
      guardianName: "Bijay Patra",
      guardianPhone: "+91 94370 88991"
    },
    {
      id: "230106",
      role: "student",
      name: "Pratik Mahapatra",
      email: "pratik.mahapatra@bput.ac.in",
      phone: "+91 98765 43215",
      department: "Electronics & Communication Engineering",
      branchCode: "ECE",
      semester: 5,
      section: "B",
      enrollmentYear: 2023,
      jeeRegNo: "24016789012",
      hostelResident: true,
      hostelName: "Aryabhatta Hall of Residence (Block 2)",
      roomNo: "201-C",
      guardianName: "Sarat Mahapatra",
      guardianPhone: "+91 94370 99112"
    },
    {
      id: "230107",
      role: "student",
      name: "Swayam Sidh Behera",
      email: "swayam.behera@bput.ac.in",
      phone: "+91 98765 43216",
      department: "Computer Science & Engineering",
      branchCode: "CSE",
      semester: 3,
      section: "A",
      enrollmentYear: 2024,
      jeeRegNo: "24017890123",
      hostelResident: false,
      hostelName: "Day Scholar (Civil Township, Rourkela)",
      roomNo: "N/A",
      guardianName: "Niranjan Behera",
      guardianPhone: "+91 94370 11334"
    },
    {
      id: "230108",
      role: "student",
      name: "Dibyajyoti Patra",
      email: "dibyajyoti.patra@bput.ac.in",
      phone: "+91 98765 43217",
      department: "Electrical Engineering",
      branchCode: "EE",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24018901234",
      hostelResident: true,
      hostelName: "Ramanujan Hall of Residence (Block 4)",
      roomNo: "410-B",
      guardianName: "Subash Patra",
      guardianPhone: "+91 94370 22445"
    },
    {
      id: "230109",
      role: "student",
      name: "Shreeja Mukherjee",
      email: "shreeja.mukherjee@bput.ac.in",
      phone: "+91 98765 43218",
      department: "Information Technology",
      branchCode: "IT",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24019012345",
      hostelResident: true,
      hostelName: "Kalpana Chawla Hall of Residence (LH-2)",
      roomNo: "312",
      guardianName: "Tapas Mukherjee",
      guardianPhone: "+91 94370 33556"
    },
    {
      id: "230110",
      role: "student",
      name: "Palak Saha",
      email: "palak.saha@bput.ac.in",
      phone: "+91 98765 43219",
      department: "Computer Science & Engineering",
      branchCode: "CSE",
      semester: 5,
      section: "A",
      enrollmentYear: 2023,
      jeeRegNo: "24010123456",
      hostelResident: true,
      hostelName: "Maa Saraswati Hall of Residence (LH-1)",
      roomNo: "204",
      guardianName: "Rajan Saha",
      guardianPhone: "+91 94370 44667"
    },
    {
      id: "T001",
      role: "teacher",
      name: "Dr. Anil Kumar",
      designation: "Associate Professor & Head",
      department: "Computer Science & Engineering",
      email: "anil.kumar@bput.ac.in",
      phone: "+91 94371 99881",
      subjectsAssigned: [
        { code: "CS501", name: "Operating Systems", branch: "CSE", semester: 5, section: "A" },
        { code: "CS503", name: "Database Management Systems", branch: "CSE", semester: 5, section: "A" }
      ]
    },
    {
      id: "T002",
      role: "teacher",
      name: "Prof. Neha Das",
      designation: "Assistant Professor",
      department: "Electronics & Communication Engineering",
      email: "neha.das@bput.ac.in",
      phone: "+91 94372 88772",
      subjectsAssigned: [
        { code: "EC502", name: "Microprocessors & Microcontrollers", branch: "ECE", semester: 5, section: "A" }
      ]
    },
    {
      id: "ADMIN001",
      role: "admin",
      name: "Campus Administrator",
      designation: "Office of the Dean (Student Affairs & Academic Coordination)",
      email: "dean.sa@bput.ac.in",
      phone: "+91 661 2489244"
    }
  ],

  // 3. Realistic University Notices
  notices: [
    {
      id: "NOT-2026-089",
      title: "Mid-Semester Examination Schedule — Autumn Session (5th Semester)",
      category: "Examination",
      priority: "Urgent",
      date: "2026-09-28",
      issuingAuthority: "Office of Controller of Examinations",
      targetAudience: "All 5th Semester Students",
      summary: "Detailed schedule for the upcoming Mid-Semester Autumn examinations commencing from 14th October 2026. Hall tickets and seating arrangements will be published on the portal 3 days prior.",
      fullContent: "All B.Tech 5th Semester regular students of BPUT are hereby informed that the Autumn Mid-Semester Examination 2026 will be conducted physically in assigned examination halls from 14th October to 21st October 2026. Students must carry their valid University Identity Card. Discrepancies regarding subject registration must be reported to the Academic Section before 5th October 2026.",
      attachmentName: "Mid_Sem_Schedule_Autumn2026.pdf"
    },
    {
      id: "NOT-2026-088",
      title: "Notice regarding Annual Hostels Maintenance & Water Filtration Sanitations",
      category: "Hostel",
      priority: "Important",
      date: "2026-09-27",
      issuingAuthority: "Council of Wardens & Estate Office",
      targetAudience: "All Hostel Residents",
      summary: "Routine maintenance and RO purification servicing in Ramanujan, Aryabhatta, and Kalpana Chawla Halls will take place on Saturday between 09:00 AM and 01:00 PM.",
      fullContent: "The Estate & Works Department will undertake comprehensive tank cleaning and RO plant sanitization across all campus hostels on 3rd October 2026. Alternate water supplies will be diverted. Residents are requested to store essential water beforehand.",
      attachmentName: "Hostel_Maintenance_Protocol.pdf"
    },
    {
      id: "NOT-2026-087",
      title: "Central Library Extended Reading Room Hours for Mid-Term Preparation",
      category: "Academic",
      priority: "General",
      date: "2026-09-25",
      issuingAuthority: "Chief Librarian, Central Library",
      targetAudience: "All Students & Research Scholars",
      summary: "In view of upcoming mid-term assessments, the Central Library air-conditioned reading halls will remain open until 11:30 PM on all weekdays.",
      fullContent: "Students with active smart-cards can utilize digital browsing terminals and silent reading sections. Strict discipline and university decorum must be adhered to at all times.",
      attachmentName: null
    },
    {
      id: "NOT-2026-086",
      title: "Submission of Semester Tuition & Examination Dues (Without Fine)",
      category: "Fees",
      priority: "Important",
      date: "2026-09-22",
      issuingAuthority: "Finance & Accounts Section",
      targetAudience: "All Undergraduates",
      summary: "Last date for deposit of semester tuition fee, lab amenities, and hostel fees without late fee is 10th October 2026.",
      fullContent: "Students can review their fee statements in the 'Fees & Queries' tab on the portal. For challan generation queries or loan documentation clearances, please raise an online fee ticket through this portal.",
      attachmentName: "Fee_Structure_2026_27.pdf"
    },
    {
      id: "NOT-2026-085",
      title: "Inviting Nominations for Annual Technical Symposium — INVENTO 2026",
      category: "Events",
      priority: "General",
      date: "2026-09-20",
      issuingAuthority: "Student Activity Center (SAC)",
      targetAudience: "Everyone",
      summary: "Student coordinators and volunteers required for technical events, hackathon steering committee, and robotics track.",
      fullContent: "Nominations are invited from 2nd, 3rd, and 4th-year students to join the core organizing team for INVENTO 2026. Register through SAC student portal before 30th September.",
      attachmentName: null
    }
  ],

  // 4. Gate Passes
  gatePasses: [
    {
      id: "GP-2026-104",
      studentId: "230101",
      studentName: "Aarav Kumar",
      department: "CSE",
      hostelName: "Ramanujan Hall (Block 4)",
      roomNo: "402-B",
      destination: "Rourkela Railway Station / Main Market",
      reason: "Visiting hometown for family medical check-up",
      departureDate: "2026-09-30",
      departureTime: "05:00 PM",
      returnDate: "2026-10-02",
      returnTime: "08:00 PM",
      emergencyContact: "+91 94370 11223",
      status: "Pending", // Pending, Approved, Rejected
      appliedOn: "2026-09-28 14:30",
      reviewedBy: null,
      reviewedOn: null,
      adminRemarks: ""
    },
    {
      id: "GP-2026-098",
      studentId: "230101",
      studentName: "Aarav Kumar",
      department: "CSE",
      hostelName: "Ramanujan Hall (Block 4)",
      roomNo: "402-B",
      destination: "Rourkela Steel Plant Technology Center",
      reason: "Participating in Inter-College Robotics Challenge (Team BPUT)",
      departureDate: "2026-09-15",
      departureTime: "08:30 AM",
      returnDate: "2026-09-15",
      returnTime: "09:00 PM",
      emergencyContact: "+91 94370 11223",
      status: "Approved",
      appliedOn: "2026-09-14 10:15",
      reviewedBy: "Prof. P. K. Ray (Hostel Warden)",
      reviewedOn: "2026-09-14 16:20",
      adminRemarks: "Granted on official university recommendation. Return before curfew."
    },
    {
      id: "GP-2026-101",
      studentId: "230102",
      studentName: "Priya Das",
      department: "ECE",
      hostelName: "Kalpana Chawla Hall (LH-2)",
      roomNo: "214",
      destination: "Panposh, Rourkela",
      reason: "Procurement of IoT sensor modules for Major Project lab",
      departureDate: "2026-09-29",
      departureTime: "03:00 PM",
      returnDate: "2026-09-29",
      returnTime: "07:30 PM",
      emergencyContact: "+91 94370 33445",
      status: "Approved",
      appliedOn: "2026-09-28 09:00",
      reviewedBy: "Dr. S. Mohanty (Warden LH-2)",
      reviewedOn: "2026-09-28 11:45",
      adminRemarks: "Approved for project work."
    }
  ],

  // 5. Leave Applications
  leaveApplications: [
    {
      id: "LV-2026-042",
      studentId: "230101",
      studentName: "Aarav Kumar",
      leaveType: "Academic Duty",
      fromDate: "2026-10-05",
      toDate: "2026-10-07",
      totalDays: 3,
      reason: "Representing university in Smart India Hackathon zonal round",
      additionalDetails: "Official nomination letter forwarded by Head of CSE Department.",
      status: "Approved",
      appliedOn: "2026-09-24",
      reviewedBy: "Dean (Academic Affairs)",
      reviewedOn: "2026-09-25",
      adminRemarks: "Duty leave sanctioned. Official leave granted for 3 days."
    },
    {
      id: "LV-2026-048",
      studentId: "230101",
      studentName: "Aarav Kumar",
      leaveType: "Medical",
      fromDate: "2026-10-10",
      toDate: "2026-10-12",
      totalDays: 3,
      reason: "Orthopedic consultation and dental appointment",
      additionalDetails: "Medical prescription from Ispat General Hospital attached.",
      status: "Pending",
      appliedOn: "2026-09-28",
      reviewedBy: null,
      reviewedOn: null,
      adminRemarks: ""
    }
  ],

  // 6. Hostel Complaints (3-state workflow: Pending -> In Progress -> Resolved)
  hostelComplaints: [
    {
      id: "CMP-2026-302",
      studentId: "230101",
      studentName: "Aarav Kumar",
      hostelName: "Ramanujan Hall (Block 4)",
      roomNo: "402-B",
      category: "Electrical",
      priority: "High",
      description: "Ceiling fan making loud grinding noise and ceiling tube-light flickering intermittently since yesterday evening.",
      status: "Pending", // Pending -> In Progress -> Resolved
      submittedOn: "2026-09-28 11:20",
      assignedTo: "Campus Electrical Maintenance Wing",
      adminRemarks: "Complaint logged with Estate Desk."
    },
    {
      id: "CMP-2026-291",
      studentId: "230101",
      studentName: "Aarav Kumar",
      hostelName: "Ramanujan Hall (Block 4)",
      roomNo: "402-B",
      category: "Internet & Wi-Fi",
      priority: "Medium",
      description: "Floor 4 Wi-Fi Access Point (AP-BLK4-F4) is disconnecting every 5 minutes with authentication timeout errors.",
      status: "In Progress",
      submittedOn: "2026-09-26 15:40",
      assignedTo: "Computer Center Network Engineer",
      adminRemarks: "Firmware update scheduled for router switches on 29th Sept."
    },
    {
      id: "CMP-2026-270",
      studentId: "230101",
      studentName: "Aarav Kumar",
      hostelName: "Ramanujan Hall (Block 4)",
      roomNo: "402-B",
      category: "Plumbing",
      priority: "Low",
      description: "Washbasin tap on 4th floor west wing leaking continuously.",
      status: "Resolved",
      submittedOn: "2026-09-18 10:00",
      assignedTo: "Plumbing Wing",
      adminRemarks: "Washer replaced by technician Ramesh Sahoo on 19th Sept. Verified functional."
    }
  ],

  // 7. Fees & Payments with Query System
  feeStructure: {
    studentId: "230101",
    academicYear: "2026-2027",
    semester: "5th Semester",
    breakdown: [
      { item: "Tuition & Academic Fee", amount: 45000, status: "Paid", receiptNo: "BPUT-REC-2026-5819" },
      { item: "University Examination & Registration Fee", amount: 3500, status: "Paid", receiptNo: "BPUT-REC-2026-5820" },
      { item: "Computing & Internet Infrastructure", amount: 2000, status: "Paid", receiptNo: "BPUT-REC-2026-5821" },
      { item: "Central Library Development & E-Resource Access", amount: 1500, status: "Paid", receiptNo: "BPUT-REC-2026-5822" },
      { item: "Hostel Seat Rent & Utility Charges (Autumn)", amount: 14000, status: "Paid", receiptNo: "BPUT-REC-2026-6102" },
      { item: "Mess Advance & Maintenance Deposit", amount: 18000, status: "Pending", receiptNo: "Awaiting Clearance" }
    ],
    totalPaid: 66000,
    totalDue: 18000
  },

  feeQueries: [
    {
      id: "FQ-2026-019",
      studentId: "230101",
      studentName: "Aarav Kumar",
      category: "Mess Advance Adjustment",
      subject: "Query regarding mess rebate for 12 days medical leave in previous semester",
      description: "I had submitted the medical leave slip and approved mess exemption form in August. Kindly clarify if the refund of Rs. 2,400 has been credited or adjusted in current mess advance due.",
      status: "Open", // Open, Replied, Closed
      submittedOn: "2026-09-27 16:45",
      reply: "",
      repliedBy: "",
      repliedOn: ""
    },
    {
      id: "FQ-2026-012",
      studentId: "230101",
      studentName: "Aarav Kumar",
      category: "Education Loan Documentation",
      subject: "Request for verified fee demand estimation letter for SBI Scholar Loan disbursement",
      description: "Branch manager requires university signed fee certificate for 5th & 6th semester tuition fees.",
      status: "Replied",
      submittedOn: "2026-09-12 11:30",
      reply: "Dear Aarav, your verified fee demand certificate has been generated and dispatched to SBI BPUT branch desk. You can collect a physical stamped duplicate from Counter 3 (Accounts Section) between 2 PM to 4 PM.",
      repliedBy: "Accounts Officer (B. K. Mohapatra)",
      repliedOn: "2026-09-13 15:10"
    }
  ],

  // 8. Assignment Reminders
  assignments: [
    {
      id: "ASN-501",
      subjectCode: "CS501",
      subjectName: "Operating Systems",
      faculty: "Dr. Anil Kumar",
      title: "Design of Multi-Threaded Process Synchronization using Semaphores & Mutex Locks",
      deadline: "2026-10-04",
      description: "Implement the Dining Philosophers and Producer-Consumer synchronization primitives in C/POSIX threads. Submit documented source code and execution terminal traces.",
      status: "In Progress"
    },
    {
      id: "ASN-502",
      subjectCode: "CS503",
      subjectName: "Database Management Systems",
      faculty: "Prof. S. R. Jena",
      title: "Relational Schema Normalization (BCNF / 4NF) & Complex SQL Analytical Queries",
      deadline: "2026-10-08",
      description: "Solve the university course registration scenario: derive functional dependencies, prove lossless join decomposition, and formulate nested aggregation queries.",
      status: "Pending"
    },
    {
      id: "ASN-503",
      subjectCode: "CS504",
      subjectName: "Design & Analysis of Algorithms",
      faculty: "Dr. P. Senapati",
      title: "Dynamic Programming: 0/1 Knapsack & Bellman-Ford Shortest Path Benchmarking",
      deadline: "2026-09-24",
      description: "Empirical complexity benchmarking on random dense graphs.",
      status: "Submitted"
    }
  ],

  // 9. Examination Cell Data
  examinationCell: {
    examName: "Autumn Mid-Semester Examination 2026-2027",
    regulations: "BPUT B.Tech Academic Regulations 2023",
    datesheet: [
      { date: "2026-10-14", time: "10:00 AM - 12:00 PM", subjectCode: "CS501", subjectName: "Operating Systems", venue: "Lecture Hall Complex (LHC-101)" },
      { date: "2026-10-16", time: "10:00 AM - 12:00 PM", subjectCode: "CS502", subjectName: "Formal Language & Automata Theory", venue: "LHC-101" },
      { date: "2026-10-18", time: "10:00 AM - 12:00 PM", subjectCode: "CS503", subjectName: "Database Management Systems", venue: "LHC-102" },
      { date: "2026-10-20", time: "10:00 AM - 12:00 PM", subjectCode: "CS504", subjectName: "Design & Analysis of Algorithms", venue: "LHC-102" },
      { date: "2026-10-21", time: "10:00 AM - 12:00 PM", subjectCode: "HM501", subjectName: "Engineering Economics & Costing", venue: "LHC-103" }
    ],
    syllabi: [
      { code: "CS501", name: "Operating Systems", portion: "Modules 1 & 2: Process Scheduling, Threads, Deadlocks, Inter-Process Communication" },
      { code: "CS502", name: "Formal Language & Automata Theory", portion: "Modules 1 & 2: Regular Expressions, DFA, NFA, Minimization, Context-Free Grammars" },
      { code: "CS503", name: "Database Management Systems", portion: "Modules 1 & 2: ER Modeling, Relational Algebra, SQL, Normalization up to BCNF" },
      { code: "CS504", name: "Design & Analysis of Algorithms", portion: "Modules 1 & 2: Divide & Conquer, Recurrences, Greedy Strategy, Dynamic Programming" }
    ],
    pyqs: [
      { year: "2025", exam: "Autumn Mid-Sem", subject: "Operating Systems (CS501)", file: "CS501_MidSem_2025.pdf" },
      { year: "2025", exam: "Autumn Mid-Sem", subject: "Database Management Systems (CS503)", file: "CS503_MidSem_2025.pdf" },
      { year: "2024", exam: "Autumn Mid-Sem", subject: "Design & Analysis of Algorithms (CS504)", file: "CS504_MidSem_2024.pdf" }
    ]
  },

  // 10. Lost and Found Repository
  lostAndFound: [
    {
      id: "LF-2026-051",
      type: "Found",
      title: "Black HP 65W Laptop Type-C Charger",
      category: "Electronics",
      locationFound: "Central Library 2nd Floor Reading Room (Table 14)",
      date: "2026-09-27",
      description: "Original HP 65W blue-tip adapter found plugged near charging kiosk. Deposited with the front circulation desk attendant.",
      reportedBy: "Sujit Tripathy (Library Staff)",
      contactInfo: "librarydesk@bput.ac.in / Extension 210",
      status: "Available"
    },
    {
      id: "LF-2026-048",
      type: "Lost",
      title: "Navy Blue Casio fx-991CW Scientific Calculator",
      category: "Academic Stationery",
      locationFound: "Mechanical Workshop Block / Drawing Hall 2",
      date: "2026-09-26",
      description: "Casio scientific calculator with student roll number '230101' etched on backside sticker. Lost during morning engineering drawing practical.",
      reportedBy: "Aarav Kumar (CSE 5th Sem)",
      contactInfo: "+91 98765 43210 / aarav.kumar@bput.ac.in",
      status: "Claim Pending"
    },
    {
      id: "LF-2026-044",
      type: "Found",
      title: "Set of 3 Godrej Keys with Brass BPUT Keychain",
      category: "Keys & Locks",
      locationFound: "Hostel 4 Canteen Table",
      date: "2026-09-25",
      description: "Hostel room keys found on canteen wooden counter. Handed over to Ramanujan Hall Caretaker.",
      reportedBy: "Manoj Caretaker",
      contactInfo: "caretaker.h4@bput.ac.in",
      status: "Available"
    }
  ],

  // 11. Campus Contacts Directory
  contacts: [
    { department: "Office of Dean (Academic Affairs)", officer: "Prof. (Dr.) S. K. Pradhan", phone: "+91 661 2489241", email: "dean.academic@bput.ac.in", office: "Administrative Block, 1st Floor" },
    { department: "Office of Dean (Student Affairs)", officer: "Prof. (Dr.) P. K. Mallick", phone: "+91 661 2489243", email: "dean.sa@bput.ac.in", office: "Student Activity Center (SAC)" },
    { department: "Controller of Examinations (COE)", officer: "Dr. B. N. Biswal", phone: "+91 661 2489248", email: "coe@bput.ac.in", office: "Examination Cell, Ground Floor" },
    { department: "Council of Wardens / Hostel Administration", officer: "Prof. P. K. Ray (Chief Warden)", phone: "+91 661 2489252", email: "chiefwarden@bput.ac.in", office: "Hostel Administration Wing" },
    { department: "University Health Centre & Emergency Dispensary", officer: "Dr. Mamata Sahoo (Medical Officer)", phone: "+91 661 2489260", email: "healthcentre@bput.ac.in", office: "Campus Dispensary (24x7 Ambulance Available)" },
    { department: "Anti-Ragging & Security Control Room", officer: "Proctorial Committee Desk", phone: "1800-345-6789 (Toll Free)", email: "proctor@bput.ac.in", office: "Main Security Gate 1 Control Room" }
  ]
};
