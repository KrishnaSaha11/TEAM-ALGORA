# 🎓 BPUT Digital Campus Platform

A full-featured digital campus management system built for **Biju Patnaik University of Technology (BPUT), Odisha**.

> Built for Hackathon 2026 — Team Palak Saha

---

## 🌐 Live Demo

👉 **[Open the Platform](https://krishnasaha11.github.io/bput-campus-platform/index.html)**

---

## ✨ Features

### 🏠 Main Portal
- University announcements & notices
- Lost & Found board
- Public circulars

### 👩‍🎓 Student Portal
- **Leave Applications** — apply, track, view status
- **Gate Pass Requests** — request outpass with dates
- **Hostel Complaints** — report & track maintenance issues
- **Fee Queries** — raise and track financial queries
- **Assignments** — view uploaded assignments by subject
- **Exam Datesheet** — view upcoming exam schedule
- **Lost & Found** — report lost/found items

### 🏛️ Admin / Dean Console
- Approve / Reject leave applications
- Manage gate pass requests
- Handle hostel complaints
- Reply to fee queries
- Upload assignments & exam datesheets
- Post & manage notices
- Real-time Supabase sync

---

## 🔐 Demo Credentials

### Admin Login
| Field | Value |
|-------|-------|
| Admin ID | `ADMIN001` |
| Password | `admin123` |

### Student Login
| Field | Value |
|-------|-------|
| Student ID | `230110` |
| Password | `24010123456` |
| Name | Palak Saha (CSE, Sem 5) |

> Other student IDs: `230101` to `230110` — password is their 11-digit enrollment number shown on the login page.

---

## 🗄️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Tailwind CSS, Vanilla JS |
| Icons | Lucide Icons |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSockets) |
| Hosting | GitHub Pages |

---

## 📁 Project Structure

```
bput-campus-platform/
├── index.html          # Main public portal
├── student-auth.html   # Student login page
├── student.html        # Student dashboard
├── admin-auth.html     # Admin login page
├── admin.html          # Admin console
├── css/
│   └── styles.css      # Custom styles
└── js/
    ├── supabase.js     # Supabase sync & realtime
    ├── data.js         # Seed/initial data
    ├── store.js        # Local state management
    ├── auth.js         # Authentication logic
    ├── components.js   # Shared UI components
    ├── student.js      # Student portal logic
    ├── admin.js        # Admin console logic
    └── app.js          # App initialization
```

---

## 🚀 How Data Works

1. User actions (apply leave, submit complaint, etc.) → saved to **Supabase** cloud database
2. **Realtime subscription** — any change in Supabase instantly updates all open browser tabs
3. All data persists across sessions — no data lost on page refresh

---

*Made with ❤️ for BPUT Hackathon 2026*
