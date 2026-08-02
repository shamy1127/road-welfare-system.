"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // Get current page name
    const currentPage = window.location.pathname.split("/").pop() || "user.html";

    // Select all bottom navigation items
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");

    // Remove active class from all items
    navItems.forEach(item => {
        item.classList.remove("active");
    });

    // Add active class to current page
    navItems.forEach(item => {

        const href = item.getAttribute("href");

        if (href === currentPage) {
            item.classList.add("active");
        }

    });

});