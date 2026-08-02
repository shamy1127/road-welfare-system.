// ==========================================
// ROAD WELFARE SYSTEM
// notification.js
// ==========================================

"use strict";

let toastTimer;
let notificationChannel = null;

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications() {

    const user = await getCurrentUser();

    if (!user) return;

    const {
        data: notifications,
        error
    } = await window.supabaseClient

        .from("notifications")

        .select("*")

        .eq("user_id", user.id)

        .order("created_at", {
            ascending: false
        })

        .limit(20);

    if (error) {

        console.error("Notification Error:", error);

        return;

    }

    const list = document.getElementById("notificationList");
    const count = document.getElementById("notificationCount");

    if (!list || !count) return;

    list.innerHTML = "";

    if (!notifications || notifications.length === 0) {

        list.innerHTML = `

        <div class="empty-notification">

            <h3>🎉 All Caught Up</h3>

            <p>No new notifications.</p>

        </div>

        `;

        count.style.display = "none";

        return;

    }

    const unread = notifications.filter(n => !n.is_read).length;

    count.innerText = unread;

    count.style.display = unread > 0 ? "flex" : "none";

    notifications.forEach(notification => {

        let icon = "🔔";

        if (notification.message.toLowerCase().includes("resolved"))
            icon = "✅";

        else if (notification.message.toLowerCase().includes("progress"))
            icon = "🚧";

        else if (notification.message.toLowerCase().includes("pending"))
            icon = "🟠";

        else if (notification.message.toLowerCase().includes("rejected"))
            icon = "❌";

        list.innerHTML += `

        <div class="notification-card ${notification.is_read ? "" : "unread"}">

            <p>${icon} ${notification.message}</p>

            <small>${formatDate(notification.created_at)}</small>

        </div>

        `;

    });

}

// ==========================================
// NOTIFICATION BUTTON
// ==========================================

function setupNotificationButton() {

    const button = document.getElementById("notificationBtn");

    const box = document.getElementById("notificationBox");

    if (!button || !box) return;

    button.addEventListener("click", async (e) => {

        e.stopPropagation();

        box.style.display =
            box.style.display === "block"
                ? "none"
                : "block";

        const user = await getCurrentUser();

        if (!user) return;

        await window.supabaseClient

            .from("notifications")

            .update({
                is_read: true
            })

            .eq("user_id", user.id)

            .eq("is_read", false);

        loadNotifications();

    });

}

// ==========================================
// CLICK OUTSIDE TO CLOSE
// ==========================================

document.addEventListener("click", (e) => {

    const box = document.getElementById("notificationBox");
    const button = document.getElementById("notificationBtn");

    if (!box || !button) return;

    if (
        !box.contains(e.target) &&
        !button.contains(e.target)
    ) {

        box.style.display = "none";

    }

});

// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMessage");
    const close = document.getElementById("toastClose");

    if (!toast || !msg) return;

    msg.innerHTML = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 6000);

    if (close) {

        close.onclick = () => {

            toast.classList.remove("show");

        };

    }

}

// ==========================================
// REALTIME NOTIFICATIONS
// ==========================================

async function startRealtimeNotifications() {

    const user = await getCurrentUser();

    if (!user) return;

    if (notificationChannel) {

        window.supabaseClient.removeChannel(notificationChannel);

    }

    notificationChannel = window.supabaseClient

        .channel("user-notifications")

        .on(

            "postgres_changes",

            {

                event: "INSERT",

                schema: "public",

                table: "notifications",

                filter: `user_id=eq.${user.id}`

            },

            (payload) => {

                console.log("Realtime Notification:", payload);

                loadNotifications();

                if (document.visibilityState === "visible") {

                    showToast(payload.new.message);

                }

            }

        )

        .subscribe((status) => {

            console.log("Realtime Status:", status);

        });

}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadNotifications();

    setupNotificationButton();

    startRealtimeNotifications();

});