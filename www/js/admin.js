"use strict";


let allReports = [];

let statusChart;
let categoryChart;



// ==========================================
// LOAD ADMIN DASHBOARD
// ==========================================


async function loadAdminDashboard() {


    const {
        data: { session }
    } = await window.supabaseClient.auth.getSession();



    if (!session) {

        window.location.href = "login.html";
        return;

    }



    const user = session.user;



    const {
        data: profile,
        error: profileError

    } = await window.supabaseClient

        .from("profiles")

        .select("role")

        .eq("id", user.id)

        .single();



    if (profileError || profile.role !== "admin") {


        alert("Access Denied");

        window.location.href = "user.html";

        return;

    }




    const {
        data: reports,
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

        .order(

            "created_at",

            {
                ascending: false
            }

        );




    if (error) {

        console.error(error);

        return;

    }



    console.log(
        "ADMIN REPORTS:",
        reports
    );



    allReports = reports;



    updateStatistics(reports);


    loadCharts(reports);



}






// ==========================================
// STATISTICS
// ==========================================



function updateStatistics(reports) {



    const total =
        document.getElementById("totalReports");



    const pending =
        document.getElementById("pendingReports");



    const progress =
        document.getElementById("progressReports");



    const resolved =
        document.getElementById("resolvedReports");




    if (total)

        total.innerText =
            reports.length;



    if (pending)

        pending.innerText =
            reports.filter(
                r => r.status === "Pending"
            ).length;




    if (progress)

        progress.innerText =
            reports.filter(
                r => r.status === "In Progress"
            ).length;




    if (resolved)

        resolved.innerText =
            reports.filter(
                r => r.status === "Resolved"
            ).length;



}





// ==========================================
// CHARTS
// ==========================================



function loadCharts(reports) {



    if (statusChart)

        statusChart.destroy();



    if (categoryChart)

        categoryChart.destroy();




    const statusElement =
        document.getElementById(
            "statusChart"
        );



    const categoryElement =
        document.getElementById(
            "categoryChart"
        );



    if (!statusElement || !categoryElement)

        return;





    statusChart = new Chart(

        statusElement,

        {

            type: "pie",


            data: {


                labels: [

                    "Pending",
                    "In Progress",
                    "Resolved"

                ],



                datasets: [{

                    data: [


                        reports.filter(
                            r => r.status === "Pending"
                        ).length,



                        reports.filter(
                            r => r.status === "In Progress"
                        ).length,



                        reports.filter(
                            r => r.status === "Resolved"
                        ).length


                    ]

                }]

            }

        }

    );


    categoryChart = new Chart(

        categoryElement,

        {

            type: "bar",


            data: {


                labels: [

                    "Pothole",
                    "Broken Road",
                    "Street Light",
                    "Traffic Signal",
                    "Other"

                ],



                datasets: [{


                    label: "Complaints",



                    data: [


                        reports.filter(
                            r => r.category === "Pothole"
                        ).length,



                        reports.filter(
                            r => r.category === "Broken Road"
                        ).length,



                        reports.filter(
                            r => r.category === "Street Light"
                        ).length,



                        reports.filter(
                            r => r.category === "Traffic Signal"
                        ).length,



                        reports.filter(
                            r => r.category === "Other"
                        ).length


                    ]

                }]

            }

        }

    );


}









// ==========================================
// LOGOUT
// ==========================================



async function logout() {


    await window.supabaseClient.auth.signOut();


    window.location.href =
        "login.html";


}



window.logout = logout;








// ==========================================
// START
// ==========================================



loadAdminDashboard();








// ==========================================
// REALTIME UPDATES
// ==========================================



window.supabaseClient


    .channel("admin-reports")


    .on(

        "postgres_changes",

        {

            event: "*",


            schema: "public",


            table: "reports"


        },


        () => {


            console.log(
                "Realtime Admin Update"
            );


            loadAdminDashboard();


        }


    )


    .subscribe();









// ==========================================
// ADMIN BOTTOM NAVIGATION
// ==========================================



document

    .getElementById("adminDashboardNav")

    ?.addEventListener(

        "click",

        () => {


            window.location.href =
                "admin.html";


        }

    );





document

    .getElementById("adminComplaintNav")

    ?.addEventListener(

        "click",

        () => {


            window.location.href =
                "admin-complaints.html";


        }

    );






document

    .getElementById("adminUsersNav")

    ?.addEventListener(

        "click",

        () => {


            window.location.href =
                "admin-users.html";


        }

    );






document

    .getElementById("adminProfileNav")

    ?.addEventListener(

        "click",

        () => {


            window.location.href =
                "admin-profile.html";


        }

    );
