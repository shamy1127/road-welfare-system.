// ==========================================
// ROAD WELFARE SYSTEM
// auth.js
// ==========================================


// -----------------------------
// SHOW / HIDE PASSWORD
// -----------------------------

const togglePassword = document.getElementById("togglePassword");


if (togglePassword) {


    togglePassword.addEventListener("click", () => {


        const passwordInput =
            document.getElementById("password");


        if (passwordInput.type === "password") {


            passwordInput.type = "text";


            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';


        }

        else {


            passwordInput.type = "password";


            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';


        }


    });


}





// -----------------------------
// SIGNUP
// -----------------------------


const signupForm =
    document.getElementById("signupForm");



if (signupForm) {


    signupForm.addEventListener(
        "submit",
        async function (e) {


            e.preventDefault();



            const full_name =
                document.getElementById("name")
                    .value
                    .trim();



            const email =
                document.getElementById("email")
                    .value
                    .trim();



            const phone =
                document.getElementById("phone")
                    .value
                    .trim();



            const password =
                document.getElementById("password")
                    .value;



            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;




            if (
                full_name === "" ||
                email === "" ||
                phone === "" ||
                password === ""
            ) {


                alert("Please fill all fields.");

                return;


            }




            if (password.length < 6) {


                alert(
                    "Password must contain at least 6 characters."
                );


                return;


            }




            if (password !== confirmPassword) {


                alert(
                    "Passwords do not match."
                );


                return;


            }




            // CREATE AUTH USER


            const {

                data,

                error

            }

                =
                await window.supabaseClient.auth.signUp({

                    email,

                    password

                });




            if (error) {


                alert(error.message);

                return;


            }




            const user =
                data.user;




            if (!user) {


                alert(
                    "User creation failed."
                );


                return;


            }





            // INSERT PROFILE


            const {

                error: profileError

            }

                =
                await window.supabaseClient

                    .from("profiles")

                    .insert({


                        id: user.id,


                        full_name,


                        email,


                        phone,


                        role: "user"



                    });





            if (profileError) {


                alert(profileError.message);

                return;


            }





            alert(
                "Account Created Successfully!"
            );



            window.location.href =
                "login.html";



        });


}







// -----------------------------
// LOGIN
// -----------------------------


const loginForm =
    document.getElementById("loginForm");



if (loginForm) {


    loginForm.addEventListener(
        "submit",
        async function (e) {


            e.preventDefault();




            const email =
                document.getElementById("email")
                    .value
                    .trim();



            const password =
                document.getElementById("password")
                    .value;





            const {

                data,

                error

            }

                =
                await window.supabaseClient.auth.signInWithPassword({

                    email,

                    password

                });





            if (error) {


                alert(error.message);

                return;


            }





            const user =
                data.user;





            const {

                data: profile,

                error: profileError

            }

                =
                await window.supabaseClient

                    .from("profiles")

                    .select("*")

                    .eq("id", user.id)

                    .single();





            if (profileError) {


                alert(profileError.message);

                return;


            }





            alert(
                "Login Successful"
            );





            if (profile.role === "admin") {


                window.location.href =
                    "admin.html";


            }

            else {


                window.location.href =
                    "user.html";


            }



        });


}









// -----------------------------
// SESSION CHECK
// -----------------------------


async function checkSession() {



    const {

        data: { session }

    }

        =
        await window.supabaseClient.auth.getSession();





    if (!session) {

        return;

    }




    const user =
        session.user;





    const {

        data: profile

    }

        =
        await window.supabaseClient

            .from("profiles")

            .select("role")

            .eq("id", user.id)

            .single();





    if (!profile) {

        return;

    }





    const page =
        window.location.pathname;





    if (
        page.includes("login.html") ||
        page.includes("signup.html")
    ) {



        if (profile.role === "admin") {


            window.location.href =
                "admin.html";


        }

        else {


            window.location.href =
                "user.html";


        }



    }



}



checkSession();







// -----------------------------
// LOGOUT
// -----------------------------


async function logout() {


    await window.supabaseClient.auth.signOut();



    window.location.href =
        "login.html";


}




// Make logout available everywhere

window.logout = logout;