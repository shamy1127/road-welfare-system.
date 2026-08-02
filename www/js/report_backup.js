// ==========================================
// ROAD WELFARE SYSTEM
// report.js
// ==========================================



let latitude = null;

let longitude = null;




// -----------------------------
// GET LOCATION
// -----------------------------


function getLocation() {


    if (!navigator.geolocation) {


        alert(
            "Geolocation not supported"
        );


        return;


    }



    navigator.geolocation.getCurrentPosition(

        (position) => {


            latitude =
                position.coords.latitude;


            longitude =
                position.coords.longitude;



            document.getElementById(
                "locationText"
            ).innerHTML =


                `

Location captured ✅

<br>

Latitude:
${latitude}

<br>

Longitude:
${longitude}

`;



        },


        (error) => {


            alert(
                "Please allow location permission"
            );


        }



    );



}




// -----------------------------
// SUBMIT REPORT
// -----------------------------



const reportForm =
    document.getElementById("reportForm");



if (reportForm) {



    reportForm.addEventListener(
        "submit",
        async (e) => {


            e.preventDefault();




            const title =
                document.getElementById("title").value.trim();



            const description =
                document.getElementById("description").value.trim();



            const category =
                document.getElementById("category").value;



            const address =
                document.getElementById("address").value.trim();

            const imageFile =
                document.getElementById("image").files[0];



            const {

                data: { session }

            }
                =
                await window.supabaseClient.auth.getSession();




            if (!session) {


                alert(
                    "Please login again"
                );


                window.location.href = "login.html";


                return;


            }




            const user =
                session.user;




            console.log(
                "AUTH USER:",
                user.id
            );


            let imageUrl = null;



            if (imageFile) {


                const fileName =
                    Date.now() + "_" + imageFile.name;



                const {

                    error: uploadError

                }

                    =
                    await window.supabaseClient.storage

                        .from("road-images")

                        .upload(
                            fileName,
                            imageFile
                        );



                if (uploadError) {


                    alert(uploadError.message);

                    return;


                }




                const {

                    data: urlData

                }

                    =
                    window.supabaseClient.storage

                        .from("road-images")

                        .getPublicUrl(fileName);



                imageUrl =
                    urlData.publicUrl;


            }


            const {

                data,

                error

            }

                =
                await window.supabaseClient

                    .from("reports")

                    .insert({


                        user_id: user.id,


                        title,


                        description,


                        category,


                        latitude,


                        longitude,


                        address,

                        image_url: imageUrl,

                        status: "Pending"



                    })

                    .select();






            console.log(
                "REPORT DATA:",
                data
            );



            console.log(
                "REPORT ERROR:",
                error
            );





            if (error) {


                alert(error.message);


                return;


            }





            alert(
                "Road issue reported successfully! 🚧"
            );



            window.location.href = "user.html";



        });


}