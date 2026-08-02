// ==========================================
// ROAD WELFARE SYSTEM
// dashboard.js
// ==========================================



async function loadDashboard(){



const {

data:{session}

}

=
await window.supabaseClient.auth.getSession();





if(!session){

window.location.href="login.html";

return;

}





const user=session.user;





// PROFILE


const {

data:profile,

error

}

=
await window.supabaseClient

.from("profiles")

.select("*")

.eq("id",user.id)

.single();





if(error){

console.log(error);

return;

}





document.getElementById("username").innerText =
profile.full_name;






// REPORTS


const {

data:reports,

error:reportError

}

=
await window.supabaseClient

.from("reports")

.select("*")

.eq("user_id",user.id)

.order(
"created_at",
{
ascending:false
}
);






if(reportError){

console.log(reportError);

return;

}





const container =
document.getElementById("reportContainer");



container.innerHTML="";





if(!reports || reports.length===0){



container.innerHTML=

`

<div class="report-card">

<h3>
No Reports Yet
</h3>


<p>
You have not submitted any road issues.
</p>


</div>

`;

return;

}







reports.forEach(report=>{



let statusClass="";



if(report.status==="Pending"){

statusClass="pending";

}


else if(report.status==="In Progress"){


statusClass="progress";


}


else if(report.status==="Resolved"){


statusClass="resolved";


}





container.innerHTML +=


`

<div class="report-card">



<h2>

🚧 ${report.title}

</h2>




<p>

${report.description}

</p>




<p>

Category:
${report.category}

</p>





<h3 class="${statusClass}">

Status:
${report.status}

</h3>





<p>

📍 ${report.address || "Location unavailable"}

</p>





${
report.image_url

?

`

<img

src="${report.image_url}"

style="
width:100%;
border-radius:15px;
margin-top:15px;
"

>

`

:

""

}





<p>

Submitted:

${new Date(report.created_at).toLocaleDateString()}

</p>




</div>


`;



});





}





loadDashboard();

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================


async function loadNotifications(){


const {

data:{session}

}

=
await window.supabaseClient.auth.getSession();



if(!session)
return;



const user=session.user;



const {

data:notifications,

error

}

=
await window.supabaseClient

.from("notifications")

.select("*")

.eq("user_id",user.id)

.order(

"created_at",

{
ascending:false
}

);



if(error){

console.log(error);

return;

}




const list =
document.getElementById("notificationList");

const count =
document.getElementById("notificationCount");



if(!notifications || notifications.length===0){


list.innerHTML=

`
<p>
No notifications
</p>
`;

count.innerText=0;

return;

}





count.innerText =
notifications.filter(n=>!n.is_read).length;




list.innerHTML="";



notifications.forEach(notification=>{


list.innerHTML +=


`

<div class="notification-card">

<p>
🔔 ${notification.message}
</p>


<small>

${new Date(notification.created_at)
.toLocaleString()}

</small>


</div>

`;



});



}





// Toggle notification box


document
.getElementById("notificationBtn")
?.addEventListener("click", async () => {

    const box = document.getElementById("notificationBox");

    box.style.display =
        box.style.display === "block"
            ? "none"
            : "block";

    const {
        data: { session }
    } = await window.supabaseClient.auth.getSession();

    if (!session) return;

    await window.supabaseClient
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id);

    loadNotifications();

});

// ==========================================
// TOAST POPUP
// ==========================================

let toastTimer;

function showToast(message){

    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMessage");
    const closeBtn = document.getElementById("toastClose");

    let icon = "🔔";
    let color = "#3498db";

    if(message.toLowerCase().includes("resolved")){

        icon="✅";
        color="#2ecc71";

    }

    else if(message.toLowerCase().includes("progress")){

        icon="🟡";
        color="#f39c12";

    }

    else if(message.toLowerCase().includes("pending")){

        icon="🔴";
        color="#e74c3c";

    }

    document.querySelector(".toast-logo").innerHTML = icon;

    toast.style.borderLeft="8px solid "+color;

    msg.innerHTML=message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer=setTimeout(()=>{

        toast.classList.remove("show");

    },7000);

    closeBtn.onclick=()=>{

        toast.classList.remove("show");

    }

}


// ==========================================
// REALTIME NOTIFICATIONS
// ==========================================

async function startRealtimeNotifications() {

    const {
        data: { session }
    } = await window.supabaseClient.auth.getSession();

    if (!session) return;

    const userId = session.user.id;

    window.supabaseClient
        .channel("user-notifications")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notifications",
                filter: `user_id=eq.${userId}`
            },
            (payload) => {

                console.log("Realtime Working:", payload);

                loadNotifications();

                showToast(payload.new.message);

            }
        )
        .subscribe((status) => {

            console.log("Realtime Status:", status);

        });

}

startRealtimeNotifications();