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

    const image = document.getElementById("profileImage");

    if (profile.avatar_url) {

        image.src = profile.avatar_url;

    } else {

        image.src =
            "https://placehold.co/200x200?text=" +
            encodeURIComponent(
                (profile.full_name || "C")
                    .charAt(0)
                    .toUpperCase()
            );

    }

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


    const normalizeStatus = (status) => {

        if (!status) return "";

        return status
            .toString()
            .trim()
            .toLowerCase();

    };


    const total =
        reports.length;


    const resolved =
        reports.filter(r =>
            normalizeStatus(r.status) === "resolved"
        ).length;



    document.getElementById("totalReports").innerText =
        total;


    document.getElementById("resolvedReports").innerText =
        resolved;


}

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

/* ==========================================
UPLOAD PROFILE PHOTO
========================================== */

document
    .getElementById("avatarInput")
    .addEventListener("change", uploadAvatar);

async function uploadAvatar(e) {

    const file = e.target.files[0];

    if (!file) return;

    const user = await getCurrentUser();

    if (!user) return;

    const extension =
        file.name.split(".").pop();

    const fileName =
        `${user.id}.${extension}`;

    const { error: uploadError } =
        await window.supabaseClient.storage

            .from("avatars")

            .upload(fileName, file, {

                upsert: true

            });

    if (uploadError) {

        alert(uploadError.message);

        return;

    }

    const {

        data

    } = window.supabaseClient.storage

        .from("avatars")

        .getPublicUrl(fileName);

    const avatarUrl =
        data.publicUrl +
        "?t=" +
        Date.now();

    const { error: updateError } =
        await window.supabaseClient

            .from("profiles")

            .update({

                avatar_url: avatarUrl

            })

            .eq("id", user.id);

    if (updateError) {

        alert(updateError.message);

        return;

    }

    document.getElementById("profileImage").src =
        avatarUrl;

    alert("Profile picture updated!");

}