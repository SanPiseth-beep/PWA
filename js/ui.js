document.addEventListener("DOMContentLoaded", function () {
    // Sidenav Initialization
    const menus = document.querySelector(".sidenav");
    M.Sidenav.init(menus, { edge: "right" });
  });

document.addEventListener('DOMContentLoaded', function() {
  const sidenav = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenav);
});