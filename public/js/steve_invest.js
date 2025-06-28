function openForm() {
   document.getElementById('myForm').style.display = "block";
}
function closeForm() {
    document.getElementById('myForm').style.display = "none";
}
    
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}
window.onload = function (){
    document.getElementsByClassName('preloader').style.display = none;
    document.querySelector('body').style.backgroundColor = "red";
}