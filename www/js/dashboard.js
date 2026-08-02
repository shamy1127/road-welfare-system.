// ==========================================
// ROAD WELFARE SYSTEM
// dashboard.js
// ==========================================

"use strict";

let allReports = [];

// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

async function initDashboard() {

    const user = await getCurrentUser();


    if (!user) {

        window.location.href = "login.html";
        return;

    }


    await loadProfile(user.id);

    await loadDashboardStats(user.id);

}



// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(userId) {


    const {

        data: profile,

        error

    } = await window.supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .single();



    if (error) {

        console.error("Profile Error:", error);
        return;

    }



    const username =
        document.getElementById("username");

    if (username) {

        username.innerText =
            profile.full_name;

    }

    const heroName =
        document.getElementById("usernameHero");

    if (heroName) {

        heroName.innerText =
            profile.full_name;

    }


}



// ==========================================
// LOAD DASHBOARD
// ==========================================



async function loadDashboardStats(userId) {

    const { data: reports, error } = await window.supabaseClient
        .from("reports")
        .select("status")
        .eq("user_id", userId);

    if (error) {
        console.error(error);
        return;
    }

    updateStatistics(reports);

}





// ==========================================
// USER STATISTICS
// ==========================================

function updateStatistics(reports) {

    if (!reports) return;

    const total =
        document.getElementById("totalReports");

    const pending =
        document.getElementById("pendingReports");

    const progress =
        document.getElementById("progressReports");

    const resolved =
        document.getElementById("resolvedReports");

    if (total)
        total.innerText = reports.length;

    if (pending)
        pending.innerText =
            reports.filter(r => r.status === "Pending").length;

    if (progress)
        progress.innerText =
            reports.filter(r => r.status === "In Progress").length;

    if (resolved)
        resolved.innerText =
            reports.filter(r => r.status === "Resolved").length;

}





// ==========================================
// START
// ==========================================

initDashboard();


