document.addEventListener("DOMContentLoaded", function () {
    const menus = document.querySelectorAll(".sidenav");
    if (typeof M !== 'undefined' && M.Sidenav) {
        M.Sidenav.init(menus, { edge: "right" });
    } else {
        console.error("Materialize library is not loaded.");
    }
});