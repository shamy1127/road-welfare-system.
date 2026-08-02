"use strict";

let allReports = [];

initReports();

async function initReports() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    loadReports(user.id);

}



// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports(userId) {



    const {

        data: reports,

        error

    } = await window.supabaseClient

        .from("reports")

        .select("*")

        .eq("user_id", userId)

        .order(
            "created_at",
            {
                ascending: false
            }
        );



    if (error) {

        console.error("Report Error:", error);
        return;

    }



    allReports = reports;

    renderReports(allReports);



}



// ==========================================
// DISPLAY REPORTS
// ==========================================



function renderReports(reports) {

    const container = document.getElementById("reportContainer");

    if (!container) return;

    container.innerHTML = "";

    // No reports
    if (!reports || reports.length === 0) {

        container.innerHTML = `

        <div class="report-card">

            <h3>📋 No Reports Yet</h3>

            <p>
                You have not submitted any road issues.
            </p>

        </div>

        `;

        return;
    }

    // Display reports
    reports.forEach(report => {

        let statusClass = "";

        if (report.status === "Pending") {
            statusClass = "pending";
        }
        else if (report.status === "In Progress") {
            statusClass = "progress";
        }
        else if (report.status === "Resolved") {
            statusClass = "resolved";
        }

        container.innerHTML += `

<div class="report-card">

    ${report.image_url ? `
        <img
            class="report-image"
            src="${report.image_url}"
            alt="${report.title}">
    ` : ""}

    <div class="report-content">

        <h2>🚧 ${report.title}</h2>

        <p class="report-description">
            ${report.description}
        </p>

        <div class="report-details">

            <span>📂 <b>Category:</b> ${report.category}</span>

            <span>📍 <b>Location:</b> ${report.address || "Location unavailable"}</span>

        </div>

        <div class="report-footer">

            <span class="status-badge ${statusClass}">
                ${report.status}
            </span>

            <span class="report-date">
                📅 ${formatDate(report.created_at)}
            </span>

        </div>

        <a class="details-btn"
href="complaint.html?id=${report.id}">

    👁 View Details

</a>

    </div>

</div>

`;

    });

}





// ==========================================
// SEARCH & FILTER REPORTS
// ==========================================

function filterReports() {

    const keyword =
        document.getElementById("searchReport")?.value.toLowerCase() || "";

    const status =
        document.getElementById("statusFilter")?.value || "All";

    const filtered = allReports.filter(report => {

        const matchSearch =

            report.title.toLowerCase().includes(keyword) ||

            report.description.toLowerCase().includes(keyword) ||

            report.category.toLowerCase().includes(keyword) ||

            (report.address || "")
                .toLowerCase()
                .includes(keyword);

        const matchStatus =

            status === "All" ||

            report.status === status;

        return matchSearch && matchStatus;

    });

    renderReports(filtered);

}







window.supabaseClient

    .channel("user-reports")

    .on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table: "reports"

        },

        async () => {

            console.log("Realtime: Reports Updated");

            const user = await getCurrentUser();

            if (user) {

                loadReports(user.id);

            }

        })

    .subscribe();


