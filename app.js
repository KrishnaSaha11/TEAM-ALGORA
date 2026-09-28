/* ==========================================================================
   UNIFIED DIGITAL CAMPUS PLATFORM - CORE APPLICATION ENGINE
   Global initialization, Lucide icon re-triggering & cross-portal utilities
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Ensure store exists
  if (!window.campusStore) {
    console.error("CampusStore not found. Please ensure data.js and store.js are loaded.");
  }

  // Initialize all Lucide icons on the current page
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Cross-tab real-time alert toast
  window.addEventListener("storage", (e) => {
    if (e.key === "BPUT_CAMPUS_PLATFORM_V1") {
      CampusUI.showToast("Campus records updated from another portal/session.", "info", 2500);
    }
  });

  // Global keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    // Ctrl + K for quick search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      CampusUI.openSearchModal();
    }
  });
});
