"use strict";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Only run this script on edit-report.html
if (!window.location.pathname.includes("edit-report.html")) {
    throw new Error("edit-report.js loaded on the wrong page.");
}



async function loadEdit() {

    if (!id) {

        alert("Invalid Complaint ID");

        window.location.href = "user.html";

        return;

    }

    const { data, error } = await window.supabaseClient

        .from("reports")

        .select("*")

        .eq("id", id)

        .single();


    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    document.getElementById("title").value =
        data.title || "";

    document.getElementById("description").value =
        data.description || "";

    document.getElementById("category").value =
        data.category || "";

    document.getElementById("address").value =
        data.address || "";

}



async function updateReport() {

    console.log("Update button clicked");

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const address = document.getElementById("address").value.trim();

    if (!title || !description || !category) {

        alert("Please fill all required fields.");
        return;

    }

    console.log("Updating report:", id);

    const { data, error } = await window.supabaseClient

        .from("reports")

        .update({
            title,
            description,
            category,
            address
        })

        .eq("id", id)

        .select();

    console.log(data);
    console.log(error);

    if (error) {

        alert(error.message);
        return;

    }

    alert("Complaint Updated Successfully");

    window.location.href = `complaint.html?id=${id}`;

}



window.updateReport = updateReport;

if (id) {
    loadEdit();
}