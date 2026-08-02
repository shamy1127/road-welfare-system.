// ==========================================
// ROAD WELFARE SYSTEM
// config.js
// ==========================================

"use strict";

// ------------------------------------------
// SUPABASE CONFIGURATION
// ------------------------------------------

const SUPABASE_URL =
    "https://eyijscoshvgcvqxyaoah.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aWpzY29zaHZnY3ZxeHlhb2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDA0NzIsImV4cCI6MjEwMDkxNjQ3Mn0.9lWE29TrFxKLLmI16uT-moJ2h7qCcB9t2KEdIBHhR2c";

// ------------------------------------------
// CREATE CLIENT
// ------------------------------------------


console.log("Supabase object:", window.supabase);




if (!window.supabase) {

    console.error(
        "Supabase library is missing. Check your CDN link."
    );

} else {

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    console.log("✅ Supabase Connected");

}