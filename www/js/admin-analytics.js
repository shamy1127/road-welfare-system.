"use strict";


let statusChart;
let categoryChart;
let monthlyChart;



loadAnalytics();



async function loadAnalytics() {



    const { data: { session } }

        =
        await window.supabaseClient.auth.getSession();



    if (!session) {

        window.location.href = "login.html";

        return;

    }




    const { data: reports, error } =


        await window.supabaseClient

            .from("reports")

            .select("*");




    if (error) {

        console.error(error);

        return;

    }



    calculateStatistics(reports);


    createCharts(reports);



}





// ==============================
// STATISTICS
// ==============================


function calculateStatistics(reports) {



    document.getElementById("analyticsTotal")

        .innerText =

        reports.length;



    document.getElementById("analyticsPending")

        .innerText =

        reports.filter(

            r => r.status === "Pending"

        ).length;




    document.getElementById("analyticsProgress")

        .innerText =

        reports.filter(

            r => r.status === "In Progress"

        ).length;




    document.getElementById("analyticsResolved")

        .innerText =

        reports.filter(

            r => r.status === "Resolved"

        ).length;



}







// ==============================
// CHARTS
// ==============================


function createCharts(reports) {



    let pending = 0;
    let progress = 0;
    let resolved = 0;



    let categories = {

        "Pothole": 0,

        "Broken Road": 0,

        "Street Light": 0,

        "Traffic Signal": 0,

        "Other": 0

    };




    let months = {};




    reports.forEach(report => {


        if (report.status === "Pending")
            pending++;


        if (report.status === "In Progress")
            progress++;


        if (report.status === "Resolved")
            resolved++;




        if (categories[report.category] !== undefined)

            categories[report.category]++;




        let date =
            new Date(report.created_at);


        let month =
            date.toLocaleString(
                "default",
                {
                    month: "short"
                }
            );



        if (!months[month])
            months[month] = 0;


        months[month]++;



    });






    if (statusChart)
        statusChart.destroy();


    if (categoryChart)
        categoryChart.destroy();


    if (monthlyChart)
        monthlyChart.destroy();






    statusChart =
        new Chart(

            document.getElementById(
                "statusAnalyticsChart"
            ),

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

                            pending,

                            progress,

                            resolved

                        ]


                    }]


                }

            }

        );







    categoryChart =

        new Chart(

            document.getElementById(
                "categoryAnalyticsChart"
            ),

            {


                type: "bar",


                data: {


                    labels: Object.keys(categories),


                    datasets: [{

                        label: "Complaints",

                        data: Object.values(categories)

                    }]


                },


                options: {


                    responsive: true,


                    plugins: {


                        legend: {

                            display: false

                        }


                    }


                }



            }

        );







    monthlyChart =

        new Chart(

            document.getElementById(
                "monthlyChart"
            ),

            {


                type: "line",


                data: {


                    labels: Object.keys(months),


                    datasets: [{

                        label: "Complaints",

                        data: Object.values(months)

                    }]


                },


                options: {


                    responsive: true


                }



            }

        );




}







async function logout() {


    await window.supabaseClient.auth.signOut();


    window.location.href = "login.html";


}



window.logout = logout;