"use strict";

let currentReport = null;

async function loadComplaint() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Invalid Complaint ID");
        window.location.href = "reports.html";
        return;
    }

    const { data: report, error } = await window.supabaseClient
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    currentReport = report;

    // ==========================
    // DETAILS
    // ==========================

    document.getElementById("title").innerText = report.title;
    document.getElementById("description").innerText = report.description;
    document.getElementById("category").innerText = report.category;
    document.getElementById("address").innerText = report.address || "Not Available";
    document.getElementById("latitude").innerText = report.latitude || "-";
    document.getElementById("longitude").innerText = report.longitude || "-";
    document.getElementById("date").innerText =
        new Date(report.created_at).toLocaleString();

    const status = document.getElementById("status");
    status.innerText = report.status;
    status.className = "status-badge";

    if (report.status === "Pending")
        status.classList.add("pending");

    if (report.status === "In Progress")
        status.classList.add("progress");

    if (report.status === "Resolved")
        status.classList.add("resolved");

    // ==========================
    // IMAGE
    // ==========================

    const img = document.getElementById("complaintImage");

    if (report.image_url) {
        img.src = report.image_url;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    const reviewPhotos = Array.isArray(report.after_review_image_urls)
        ? report.after_review_image_urls
        : [];
    const reviewPhotosSection = document.getElementById("reviewPhotosSection");
    const reviewPhotosGallery = document.getElementById("reviewPhotosGallery");
    reviewPhotosGallery.replaceChildren();

    reviewPhotos.forEach((url, index) => {
        const image = document.createElement("img");
        image.src = url;
        image.alt = `After-review photo ${index + 1}`;
        reviewPhotosGallery.appendChild(image);
    });

    reviewPhotosSection.hidden = reviewPhotos.length === 0;

    // ==========================
    // GOOGLE MAP
    // ==========================

    document.getElementById("mapButton").onclick = function () {

        if (!report.latitude || !report.longitude) {
            alert("Location unavailable");
            return;
        }

        window.open(
            `https://www.google.com/maps?q=${report.latitude},${report.longitude}`,
            "_blank"
        );

    };

    // ==========================
    // EDIT
    // ==========================

    document.getElementById("editButton").onclick = function () {

        window.location.href =
            `edit-report.html?id=${currentReport.id}`;

    };

    // ==========================
    // DELETE
    // ==========================

    document.getElementById("deleteButton").onclick = async function () {

        if (!confirm("Delete this complaint?"))
            return;

        const { error } = await window.supabaseClient
            .from("reports")
            .delete()
            .eq("id", currentReport.id);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Complaint Deleted");

        window.location.href = "reports.html";

    };

}
// ==========================================
// LOAD PAGE
// ==========================================

loadComplaint();

// ==========================================
// PDF DOWNLOAD
// ==========================================

const pdfButton = document.getElementById("pdfButton");

pdfButton.onclick = async function () {

    if (!currentReport) {

        alert("Complaint not loaded.");

        return;

    }

    if (window.downloadReportPdf) {
        try {
            await window.downloadReportPdf(currentReport);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert(error.message);
        }

        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    let y = 20;

    // ==========================
    // HEADER
    // ==========================

    pdf.setFillColor(22, 101, 192);

    pdf.rect(0, 0, 210, 28, "F");

    pdf.setTextColor(255, 255, 255);

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(18);

    pdf.text("ROAD WELFARE SYSTEM", 105, 12, {
        align: "center"
    });

    pdf.setFontSize(11);

    pdf.text("Official Complaint Report", 105, 20, {
        align: "center"
    });

    pdf.setTextColor(0);

    y = 40;

    // ==========================
    // REPORT ID
    // ==========================

    pdf.setFontSize(13);

    pdf.setFont("helvetica", "bold");

    pdf.text(
        "Complaint ID : " + currentReport.id,
        20,
        y
    );

    y += 12;

    // ==========================
    // IMAGE
    // ==========================

    if (currentReport.image_url) {

        try {

            const img = new Image();

            img.crossOrigin = "anonymous";

            img.src = currentReport.image_url;

            await new Promise(resolve => {

                img.onload = resolve;

            });

            pdf.addImage(

                img,

                "JPEG",

                25,

                y,

                160,

                80

            );

            y += 90;

        }

        catch (e) {

            console.log("Image skipped.");

        }

    }

    // ==========================
    // DETAILS
    // ==========================

    pdf.setFont("helvetica", "bold");

    pdf.text("Complaint Details", 20, y);

    y += 10;

    pdf.setFont("helvetica", "normal");

    const details = [

        "Title : " + currentReport.title,

        "Category : " + currentReport.category,

        "Status : " + currentReport.status,

        "Address : " + (currentReport.address || "Not Available"),

        "Latitude : " + (currentReport.latitude || "-"),

        "Longitude : " + (currentReport.longitude || "-"),

        "Submitted : " +
        new Date(currentReport.created_at).toLocaleString()

    ];

    details.forEach(item => {

        pdf.text(item, 20, y);

        y += 8;

    });

    y += 5;

    pdf.setFont("helvetica", "bold");

    pdf.text("Description", 20, y);

    y += 8;

    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize(

        currentReport.description,

        170

    );

    lines.forEach(line => {

        pdf.text(line, 20, y);

        y += 6;

    });
        // ==========================================
    // FOOTER
    // ==========================================

    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

        pdf.setPage(i);

        pdf.setDrawColor(180);

        pdf.line(15, 285, 195, 285);

        pdf.setFontSize(9);

        pdf.setTextColor(100);

        pdf.text(
            "Road Welfare System",
            20,
            292
        );

        pdf.text(
            "Generated : " +
            new Date().toLocaleDateString(),
            90,
            292
        );

        pdf.text(
            `Page ${i} of ${totalPages}`,
            190,
            292,
            { align: "right" }
        );

    }

    // ==========================================
    // OPEN PDF IN BROWSER
    // ==========================================

    const blob = pdf.output("blob");

    const pdfUrl = URL.createObjectURL(blob);

    window.open(pdfUrl, "_blank");

};