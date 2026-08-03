// ==========================================
// ROAD WELFARE SYSTEM
// dashboard.js
// ==========================================

"use strict";

let currentUser = null;
let userProfile = null;
let dashboardReports = [];

// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await initializeDashboard();

});

async function initializeDashboard() {


    await safeDashboardLoad(async () => {


        currentUser = await getCurrentUser();


        if (!currentUser) {

            window.location.href =
                "login.html";

            return;

        }


        await loadUserProfile();

        await loadDashboardStatistics();



    });


}

// ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile() {

    const {

        data,

        error

    } = await window.supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", currentUser.id)

        .single();

    if (error) {

        console.error("Profile Error:", error);

        return;

    }

    userProfile = data;

    updateProfileUI();

}

// ==========================================
// UPDATE USER INTERFACE
// ==========================================

function updateProfileUI() {

    if (!userProfile) return;

    const navbarName = document.getElementById("username");

    const heroName = document.getElementById("usernameHero");

    const fullName =
        userProfile.full_name || "Citizen";

    const firstName =
        fullName.split(" ")[0];

    if (navbarName) {

        navbarName.innerText = firstName;

    }

    if (heroName) {

        heroName.innerText = fullName;

    }

}
// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStatistics() {

    const {

        data,

        error

    } = await window.supabaseClient

        .from("reports")

        .select("*")

        .eq("user_id", currentUser.id);

    if (error) {

        console.error("Dashboard Error:", error);

        return;

    }

    dashboardReports = data || [];

    updateStatistics();

}

// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        dashboardReports.length;

    const pending =
        dashboardReports.filter(report =>
            normalizeStatus(report.status) === "pending"
        ).length;

    const progress =
        dashboardReports.filter(report =>
            normalizeStatus(report.status) === "in progress"
        ).length;

    const resolved =
        dashboardReports.filter(report =>
            normalizeStatus(report.status) === "resolved"
        ).length;

    setText("totalReports", total);

    setText("pendingReports", pending);

    setText("progressReports", progress);

    setText("resolvedReports", resolved);

}

// ==========================================
// NORMALIZE STATUS
// ==========================================

function normalizeStatus(status) {

    if (!status) return "";

    return status
        .toString()
        .trim()
        .toLowerCase();

}

// ==========================================
// SAFE TEXT UPDATE
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.innerText = value;

    }

}
// ==========================================
// REALTIME DASHBOARD
// ==========================================

let dashboardChannel = null;

async function startRealtimeDashboard() {

    if (!currentUser) return;

    if (dashboardChannel) {

        window.supabaseClient.removeChannel(dashboardChannel);

    }

    dashboardChannel = window.supabaseClient

        .channel("dashboard-realtime")

        .on(

            "postgres_changes",

            {

                event: "*",

                schema: "public",

                table: "reports",

                filter: `user_id=eq.${currentUser.id}`

            },

            async () => {

                console.log("Dashboard updated.");

                await loadDashboardStatistics();

            }

        )

        .subscribe(status => {

            console.log("Realtime:", status);

        });

}

// ==========================================
// REFRESH DASHBOARD
// ==========================================

async function refreshDashboard() {

    await loadUserProfile();

    await loadDashboardStatistics();

}

// ==========================================
// PAGE VISIBILITY
// ==========================================

document.addEventListener("visibilitychange", async () => {

    if (

        document.visibilityState === "visible" &&

        currentUser

    ) {

        await refreshDashboard();

    }

});

// ==========================================
// PULL TO REFRESH (Future Mobile)
// ==========================================

window.refreshDashboard = refreshDashboard;

// ==========================================
// START REALTIME
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {


    await initializeDashboard();

    startRealtimeDashboard();


});
// ==========================================
// DASHBOARD LOADING SYSTEM
// ==========================================

function showDashboardLoader() {

    const loader =
        document.getElementById("dashboardLoader");

    if (loader) {

        loader.style.display = "flex";

    }

}


// ==========================================
// HIDE LOADER
// ==========================================

function hideDashboardLoader() {

    const loader =
        document.getElementById("dashboardLoader");

    if (loader) {

        loader.style.display = "none";

    }

}


// ==========================================
// DASHBOARD ERROR MESSAGE
// ==========================================

function showDashboardError(message) {

    const errorBox =
        document.getElementById("dashboardError");


    if (errorBox) {

        errorBox.innerText = message;

        errorBox.style.display = "block";

    }

    else {

        console.error(message);

    }

}


// ==========================================
// HIDE ERROR
// ==========================================

function hideDashboardError() {

    const errorBox =
        document.getElementById("dashboardError");


    if (errorBox) {

        errorBox.style.display = "none";

    }

}


// ==========================================
// SAFE DASHBOARD LOAD WRAPPER
// ==========================================

async function safeDashboardLoad(callback) {

    try {

        showDashboardLoader();

        hideDashboardError();


        await callback();


    }

    catch(error) {

        console.error(
            "Dashboard Loading Error:",
            error
        );


        showDashboardError(
            "Unable to load dashboard data. Please try again."
        );

    }

    finally {

        hideDashboardLoader();

    }

}
