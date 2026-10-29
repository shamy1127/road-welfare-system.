// ==========================================
// ROAD WELFARE SYSTEM
// report.js
// ==========================================

"use strict";


let latitude = null;
let longitude = null;


// ==========================================
// GET LOCATION
// ==========================================

function getLocation(){


    if(!navigator.geolocation){

        alert(
            "Geolocation not supported"
        );

        return;

    }



    navigator.geolocation.getCurrentPosition(

        position=>{


            latitude =
            position.coords.latitude;


            longitude =
            position.coords.longitude;



            const locationText =
            document.getElementById(
                "locationText"
            );


            if(locationText){

                locationText.innerHTML = `

                Location captured ✅

                <br>

                Latitude:
                ${latitude}

                <br>

                Longitude:
                ${longitude}

                `;

            }


        },


        ()=>{

            alert(
                "Please allow location permission"
            );

        }


    );


}



// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadImage(file){


    if(!file)
        return null;



    const fileName =
    Date.now()+"_"+file.name;



    const {

        error

    } = await window.supabaseClient.storage


        .from("road-images")


        .upload(
            fileName,
            file
        );



    if(error){

        console.error(
            "Upload Error:",
            error
        );

        throw error;

    }



    const {

        data

    } =
    window.supabaseClient.storage


    .from("road-images")


    .getPublicUrl(
        fileName
    );



    return data.publicUrl;


}




// ==========================================
// SUBMIT REPORT
// ==========================================

async function submitReport(e){


    e.preventDefault();



    const user =
    await getCurrentUser();



    if(!user){

        alert(
            "Please login again"
        );

        window.location.href =
        "login.html";

        return;

    }




    const title =
    document.getElementById("title")
    .value.trim();



    const description =
    document.getElementById("description")
    .value.trim();



    const category =
    document.getElementById("category")
    .value;



    const address =
    document.getElementById("address")
    .value.trim();



    const imageFile =
    document.getElementById("image")
    .files[0];

    if(imageFile && (latitude === null || longitude === null)){

        alert(
            "Capture your current location before uploading a geo-tagged report photo."
        );

        return;

    }


    try{


        let imageUrl =
        await uploadImage(imageFile);



        const {

            error

        } =
        await window.supabaseClient


        .from("reports")


        .insert({


            user_id:user.id,

            title,

            description,

            category,

            latitude,

            longitude,

            address,

            image_url:imageUrl,

            status:"Pending"


        });



        if(error){

            throw error;

        }



        alert(
            "Road issue reported successfully! 🚧"
        );



        window.location.href =
        "user.html";



    }


    catch(error){


        console.error(
            error
        );


        alert(
            error.message
        );


    }


}




// ==========================================
// INITIALIZE
// ==========================================

function initReportForm(){


    const form =
    document.getElementById(
        "reportForm"
    );


    if(!form)
        return;



    form.addEventListener(
        "submit",
        submitReport
    );


}



initReportForm();