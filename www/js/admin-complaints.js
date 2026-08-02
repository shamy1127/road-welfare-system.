"use strict";


let allReports = [];





async function loadComplaints(){



const {
data:{session}
}
=
await window.supabaseClient.auth.getSession();



if(!session){

window.location.href="login.html";

return;

}





const {

data:profile

}

=
await window.supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();





if(!profile || profile.role!=="admin"){


alert("Access Denied");


window.location.href="user.html";


return;


}






const {

data:reports,

error

}
=
await window.supabaseClient

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
ascending:false
}

);






if(error){

console.error(error);

return;

}





allReports=reports;


displayReports(reports);



}







function displayReports(reports){



const container=document.getElementById(
"adminReports"
);



container.innerHTML="";





if(!reports.length){


container.innerHTML=`

<div class="admin-card">

<h2>
📭 No Complaints Found
</h2>

</div>

`;

return;

}





reports.forEach(report=>{



container.innerHTML += `


<div class="admin-card">



${report.image_url ? `

<img

src="${report.image_url}"

class="report-image"

>

`:""}



<h2>
🚧 ${report.title}
</h2>




<p>
${report.description}
</p>



<hr>



<p>
👤 <b>User:</b>
${report.profiles?.full_name || "Unknown"}
</p>



<p>
📧 <b>Email:</b>
${report.profiles?.email || "Not Available"}
</p>



<p>
📞 <b>Phone:</b>
${report.profiles?.phone || "Not Available"}
</p>



<p>
📂 <b>Category:</b>
${report.category}
</p>



<p>
📍 <b>Location:</b>
${report.address || "Not Available"}
</p>




<p>

📅

${new Date(report.created_at).toLocaleString()}

</p>





<select onchange="updateStatus('${report.id}',this.value)">



<option ${report.status==="Pending"?"selected":""}>
Pending
</option>



<option ${report.status==="In Progress"?"selected":""}>
In Progress
</option>



<option ${report.status==="Resolved"?"selected":""}>
Resolved
</option>


</select>




<a class="details-btn"

href="admin-complaint.html?id=${report.id}">

👁 View Details

</a>



</div>



`;



});



}









async function updateStatus(id,status){



const {

data:report

}

=
await window.supabaseClient

.from("reports")

.select("user_id,title")

.eq("id",id)

.single();





await window.supabaseClient

.from("reports")

.update({

status:status

})

.eq(

"id",

id

);






await window.supabaseClient

.from("notifications")

.insert({

user_id:report.user_id,

report_id:id,

title:"Complaint Status Updated",

message:
`Your complaint "${report.title}" is now ${status}`

});





loadComplaints();



}









function filterReports(){



const search=

document.getElementById("searchInput")
.value
.toLowerCase();



const status=

document.getElementById("statusFilter")
.value;




const category=

document.getElementById("categoryFilter")
.value;





const filtered=allReports.filter(r=>{


return (

(
r.title.toLowerCase()
.includes(search)

||

r.description.toLowerCase()
.includes(search)

||

r.category.toLowerCase()
.includes(search)

)

&&

(status==="All" || r.status===status)

&&

(category==="All" || r.category===category)


);


});




displayReports(filtered);



}







document
.getElementById("searchInput")
.addEventListener(
"input",
filterReports
);



document
.getElementById("statusFilter")
.addEventListener(
"change",
filterReports
);



document
.getElementById("categoryFilter")
.addEventListener(
"change",
filterReports
);








async function logout(){


await window.supabaseClient.auth.signOut();


window.location.href="login.html";


}


window.logout=logout;






loadComplaints();





// REALTIME UPDATE


window.supabaseClient

.channel("admin-complaints")

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"reports"

},

()=>{

loadComplaints();

}

)

.subscribe();