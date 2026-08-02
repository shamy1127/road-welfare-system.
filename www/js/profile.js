"use strict";

initProfile();

async function initProfile() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await loadProfile(user.id);

    await loadStatistics(user.id);

}

/* ==========================================
LOAD PROFILE
========================================== */

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

        console.error(error);

        return;

    }

    document.getElementById("profileName").innerText =
        profile.full_name || "Citizen";

    document.getElementById("profileEmail").innerText =
        profile.email || "";

    document.getElementById("infoName").innerText =
        profile.full_name || "-";

    document.getElementById("infoEmail").innerText =
        profile.email || "-";

    document.getElementById("infoId").innerText =
        profile.id;

    if (profile.created_at) {

        document.getElementById("infoJoined").innerText =
            formatDate(profile.created_at);

    }
    else {

        document.getElementById("infoJoined").innerText =
            "-";

    }

    document.getElementById("avatarLetter").innerText =
        (profile.full_name || "C")
        .charAt(0)
        .toUpperCase();

}

/* ==========================================
LOAD STATISTICS
========================================== */

async function loadStatistics(userId) {

    const {

        data: reports,

        error

    } = await window.supabaseClient

        .from("reports")

        .select("status")

        .eq("user_id", userId);

    if (error) {

        console.error(error);

        return;

    }

    document.getElementById("totalReports").innerText =
        reports.length;

    document.getElementById("pendingReports").innerText =
        reports.filter(r => r.status === "Pending").length;

    document.getElementById("progressReports").innerText =
        reports.filter(r => r.status === "In Progress").length;

    document.getElementById("resolvedReports").innerText =
        reports.filter(r => r.status === "Resolved").length;

}

/* ==========================================
EDIT PROFILE
========================================== */

document
.getElementById("editProfileBtn")
.addEventListener("click", async () => {

    const currentName =
        document.getElementById("infoName").innerText;

    const newName = prompt(
        "Enter your new name:",
        currentName
    );

    if (!newName) return;

    const user =
        await getCurrentUser();

    const { error } =
        await window.supabaseClient

        .from("profiles")

        .update({

            full_name: newName

        })

        .eq("id", user.id);

    if (error) {

        alert("Unable to update profile.");

        return;

    }

    alert("Profile updated successfully.");

    loadProfile(user.id);

});

/* ==========================================
CHANGE PASSWORD
========================================== */

document
.getElementById("changePasswordBtn")
.addEventListener("click", async () => {

    const password =
        prompt("Enter new password");

    if (!password) return;

    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");

        return;

    }

    const { error } =
        await window.supabaseClient.auth.updateUser({

            password: password

        });

    if (error) {

        alert(error.message);

        return;

    }

    alert("Password updated successfully.");

});

/* ==========================================
REALTIME PROFILE UPDATE
========================================== */

window.supabaseClient

.channel("profile-updates")

.on(

    "postgres_changes",

    {

        event: "*",

        schema: "public",

        table: "profiles"

    },

    async () => {

        const user =
            await getCurrentUser();

        if (user) {

            loadProfile(user.id);

        }

    }

)

.subscribe();