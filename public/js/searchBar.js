document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.getElementById('searchIcon');
    const searchBar = document.getElementById('searchBar');
    const closeSearch = document.getElementById('closeSearch');
    const header = document.querySelector('header');

    searchBar.classList.remove('active');
    header.classList.remove('expanded');

    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        searchBar.classList.toggle('active');
        header.classList.toggle('expanded');
    });

    closeSearch.addEventListener('click', (e) => {
        e.preventDefault();
        searchBar.classList.remove('active');
        header.classList.remove('expanded');
    });
});
