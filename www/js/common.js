// ==========================================
// ROAD WELFARE SYSTEM
// common.js
// ==========================================

"use strict";

// ------------------------------------------
// Get Current Session
// ------------------------------------------

async function getSession() {

    const {
        data: { session },
        error
    } = await window.supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        return null;
    }

    return session;
}


// ------------------------------------------
// Get Logged-in User
// ------------------------------------------

async function getCurrentUser() {

    const session = await getSession();

    return session ? session.user : null;

}


// ------------------------------------------
// Get User Profile
// ------------------------------------------

async function getProfile() {

    const user = await getCurrentUser();

    if (!user) return null;

    const { data, error } =
        await window.supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", user.id)

        .single();

    if (error) {

        console.error(error);

        return null;

    }

    return data;

}


// ------------------------------------------
// Redirect if Not Logged In
// ------------------------------------------

async function requireLogin() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// ------------------------------------------
// Logout
// ------------------------------------------

async function logout() {

    await window.supabaseClient.auth.signOut();

    window.location.href = "login.html";

}

window.logout = logout;


// ------------------------------------------
// Format Date
// ------------------------------------------

function formatDate(date) {

    return new Date(date).toLocaleString();

}


// ------------------------------------------
// Loading Spinner
// ------------------------------------------

function showLoading(elementId) {

    const el = document.getElementById(elementId);

    if (!el) return;

    el.innerHTML = `

        <div class="loading">

            Loading...

        </div>

    `;

}

// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser(){

    const {
        data:{session}
    } = await window.supabaseClient.auth.getSession();


    if(!session){

        return null;

    }


    return session.user;

}