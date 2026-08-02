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


        image.src =
        report.image_url;


        image.style.display =
        "block";


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



}
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

()=>{



    if(!complaintData)

    return;




    const {

        jsPDF

    } = window.jspdf;




    const pdf =
    new jsPDF();





    pdf.setFontSize(18);


    pdf.text(

    "Road Welfare System",

    20,

    20

    );



    pdf.setFontSize(14);


    pdf.text(

    "Complaint Report",

    20,

    32

    );






    pdf.setFontSize(11);




    let y = 50;





    const addLine=(label,value)=>{


        pdf.text(

        `${label}: ${value}`,

        20,

        y

        );


        y += 10;


    };





    addLine(

    "Title",

    complaintData.title

    );



    addLine(

    "Category",

    complaintData.category

    );



    addLine(

    "Status",

    complaintData.status

    );



    addLine(

    "Citizen",

    complaintData.profiles?.full_name || "Unknown"

    );



    addLine(

    "Email",

    complaintData.profiles?.email || "-"

    );



    addLine(

    "Phone",

    complaintData.profiles?.phone || "-"

    );



    addLine(

    "Date",

    new Date(
        complaintData.created_at
    ).toLocaleString()

    );





    pdf.text(

    "Description:",

    20,

    y + 5

    );





    pdf.text(

    complaintData.description || "No description",

    20,

    y + 15,

    {

        maxWidth:160

    }

    );







    pdf.save(

    `Complaint_${complaintId}.pdf`

    );



}

);








// ==========================================
// START
// ==========================================


loadComplaint();