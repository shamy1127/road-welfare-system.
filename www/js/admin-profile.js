"use strict";



async function loadAdminProfile(){


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

        console.error(
            "Profile Error:",
            error
        );

        return;

    }





    document.getElementById("adminName").innerText =
        profile.full_name || "Administrator";



    document.getElementById("adminEmail").innerText =
        profile.email || user.email;



}





async function logout(){


    await window.supabaseClient.auth.signOut();


    window.location.href="login.html";


}



window.logout=logout;



loadAdminProfile();