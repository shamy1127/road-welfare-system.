"use strict";


let complaintId = null;

let complaintData = null;





// ==========================================
// LOAD COMPLAINT
// ==========================================


async function loadComplaint(){


    const params =
    new URLSearchParams(
        window.location.search
    );



    complaintId =
    params.get("id");



    if(!complaintId){


        alert("Invalid Complaint ID");


        window.location.href =
        "admin.html";


        return;

    }





    const {

        data: report,

        error

    } = await window.supabaseClient



    .from("reports")



    .select(`

        *,

        profiles(

            full_name,

            email,

            phone

        )

    `)



    .eq(

        "id",

        complaintId

    )



    .single();







    if(error){


        console.error(error);


        alert(
            "Unable to load complaint"
        );


        return;

    }





    complaintData = report;



    displayComplaint(report);



}











// ==========================================
// DISPLAY COMPLAINT
// ==========================================


function displayComplaint(report){





    const image =
    document.getElementById(
        "complaintImage"
    );




    if(report.image_url){

        document.getElementById("beforePhotoHeading").style.display = "block";

        image.src =
        report.image_url;


        image.style.display =
        "block";


    }
    else {
        document.getElementById("beforePhotoHeading").style.display = "none";
        image.style.display = "none";
    }







    document.getElementById(
        "complaintTitle"
    ).innerText =

    "🚧 " + 
    report.title;







    document.getElementById(
        "complaintDescription"
    ).innerText =

    report.description ||
    "No description provided";








    document.getElementById(
        "userName"
    ).innerText =

    report.profiles?.full_name ||
    "Unknown";







    document.getElementById(
        "userEmail"
    ).innerText =

    report.profiles?.email ||
    "Not Available";







    document.getElementById(
        "userPhone"
    ).innerText =

    report.profiles?.phone ||
    "Not Available";








    document.getElementById(
        "category"
    ).innerText =

    report.category ||
    "Other";








    document.getElementById(
        "status"
    ).innerText =

    report.status;








    document.getElementById(
        "address"
    ).innerText =

    report.address ||
    "Not Available";







    document.getElementById(
        "date"
    ).innerText =

    new Date(
        report.created_at
    )
    .toLocaleString();








    document.getElementById(
        "latitude"
    ).innerText =

    report.latitude ||
    "-";







    document.getElementById(
        "longitude"
    ).innerText =

    report.longitude ||
    "-";








    document.getElementById(
        "statusUpdate"
    ).value =

    report.status;

    displayReviewPhotos(
        report.after_review_image_urls || []
    );


}

function displayReviewPhotos(urls) {

    const gallery = document.getElementById("adminReviewPhotos");

    if (!gallery) return;

    gallery.replaceChildren();

    urls.forEach((url, index) => {
        const image = document.createElement("img");
        image.src = url;
        image.alt = `After-review photo ${index + 1}`;
        gallery.appendChild(image);
    });

}


document
.getElementById("reviewPhotoForm")
?.addEventListener("submit", async event => {

    event.preventDefault();

    const input = document.getElementById("reviewPhotos");
    const button = document.getElementById("uploadReviewPhotosButton");
    const message = document.getElementById("reviewPhotoMessage");
    const files = Array.from(input.files || []);

    if (!files.length || !complaintData) return;

    if (files.some(file => !file.type.startsWith("image/"))) {
        message.textContent = "Please select image files only.";
        return;
    }

    button.disabled = true;
    message.textContent = "Uploading review photos...";

    const uploadedPaths = [];
    let reviewPhotoUrls;

    try {
        const uploadedUrls = [];

        for (const [index, file] of files.entries()) {
            const safeFileName = file.name.replace(/[^\w.-]/g, "_");
            const filePath = `${complaintId}/review/${Date.now()}_${index}_${safeFileName}`;
            const { error: uploadError } = await window.supabaseClient.storage
                .from("road-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            uploadedPaths.push(filePath);

            const { data } = window.supabaseClient.storage
                .from("road-images")
                .getPublicUrl(filePath);

            uploadedUrls.push(data.publicUrl);
        }

        reviewPhotoUrls = [
            ...(complaintData.after_review_image_urls || []),
            ...uploadedUrls
        ];

        const { error } = await window.supabaseClient
            .from("reports")
            .update({ after_review_image_urls: reviewPhotoUrls })
            .eq("id", complaintId);

        if (error) throw error;
    } catch (error) {
        console.error("Review photo upload failed:", error);
        button.disabled = false;
        let cleanupError = null;

        if (uploadedPaths.length) {
            try {
                const { error: removeError } = await window.supabaseClient.storage
                    .from("road-images")
                    .remove(uploadedPaths);
                cleanupError = removeError;
            } catch (removeError) {
                cleanupError = removeError;
            }
        }

        if (cleanupError) {
            console.error("Unable to remove incomplete review photo uploads:", cleanupError);
            message.textContent = `Unable to upload review photos: ${error.message}. Cleanup also failed: ${cleanupError.message}`;
        } else {
            message.textContent = `Unable to upload review photos: ${error.message}`;
        }

        return;
    }

    complaintData.after_review_image_urls = reviewPhotoUrls;
    displayReviewPhotos(reviewPhotoUrls);
    input.value = "";

    try {
        const { error: notificationError } = await window.supabaseClient
            .from("notifications")
            .insert({
                user_id: complaintData.user_id,
                report_id: complaintId,
                title: "After-review photos added",
                message: `New after-review photos are available for your report "${complaintData.title}".`
            });

        if (notificationError) {
            console.error("Review photo notification failed:", notificationError);
            message.textContent = `Photos uploaded, but the user notification failed: ${notificationError.message}`;
        } else {
            message.textContent = "Review photos uploaded and shared with the user.";
        }
    } catch (error) {
        console.error("Review photo notification failed:", error);
        message.textContent = `Photos uploaded, but the user notification failed: ${error.message}`;
    } finally {
        button.disabled = false;
    }

});

// ==========================================
// MAP BUTTON
// ==========================================


document
.getElementById("mapButton")
?.addEventListener(

"click",

()=>{


    if(
        complaintData.latitude &&
        complaintData.longitude
    ){


        window.open(

        `https://www.google.com/maps?q=${complaintData.latitude},${complaintData.longitude}`,

        "_blank"

        );


    }

    else{


        alert(
            "Location coordinates unavailable"
        );


    }


}

);









// ==========================================
// UPDATE STATUS
// ==========================================


document
.getElementById("updateButton")
?.addEventListener(

"click",

async ()=>{



    const button =
    document.getElementById(
        "updateButton"
    );



    const status =
    document.getElementById(
        "statusUpdate"
    ).value;





    button.innerText =
    "Updating...";

    button.disabled =
    true;







    const {

        error

    } = await window.supabaseClient



    .from("reports")



    .update({

        status:status

    })



    .eq(

        "id",

        complaintId

    );







    if(error){


        alert(
            error.message
        );


        button.innerText =
        "✅ Update Status";


        button.disabled =
        false;


        return;


    }









    await window.supabaseClient



    .from("notifications")



    .insert({


        user_id:
        complaintData.user_id,



        report_id:
        complaintId,



        title:
        "Complaint Status Updated",



        message:

        `Your complaint "${complaintData.title}" status changed to ${status}`


    });








    alert(
        "✅ Status Updated"
    );




    button.innerText =
    "✅ Update Status";


    button.disabled =
    false;




    loadComplaint();




}

);











// ==========================================
// DELETE COMPLAINT
// ==========================================


document
.getElementById("deleteButton")
?.addEventListener(

"click",

async ()=>{



    const confirmDelete =
    confirm(
        "Delete this complaint permanently?"
    );



    if(!confirmDelete)

    return;






    const {

        error

    } = await window.supabaseClient



    .from("reports")



    .delete()



    .eq(

        "id",

        complaintId

    );






    if(error){


        alert(
            error.message
        );


        return;


    }







    alert(
        "🗑 Complaint Deleted"
    );




    window.location.href =
    "admin.html";



}

);











// ==========================================
// DOWNLOAD PDF
// ==========================================


document
.getElementById("downloadPdfButton")
?.addEventListener(

"click",

async ()=>{

    if (!complaintData) return;

    try {
        await window.downloadReportPdf(complaintData, {
            includeReporter: true,
            includeAfterReviewPhotos: true
        });
    } catch (error) {
        console.error("PDF generation failed:", error);
        alert(error.message);
    }

}

);








// ==========================================
// START
// ==========================================


loadComplaint();