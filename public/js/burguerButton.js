// Modifica el script para manejar la clase 'expanded' en .navHeader y .logo
document.addEventListener('DOMContentLoaded', () => {
    const burgerButton = document.querySelector('.aBurgerButton');
    const navHeader = document.querySelector('.navHeader');
    const logo = document.querySelector('.logo');

    burgerButton.addEventListener('click', () => {
        navHeader.classList.toggle('active');
        logo.classList.toggle('active');
    });
});
