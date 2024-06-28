// script.js
document.getElementById('menu-toggle').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar');
    sidebar.style.left = sidebar.style.left === '0px' ? '-300px' : '0px';
});

document.querySelector('.submenu-toggle').addEventListener('click', function(event) {
    event.stopPropagation();  // Stop the event from bubbling up to higher-level elements
    var submenu = this.querySelector('.submenu');
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    this.classList.toggle('active');  // Toggle an 'active' class to help with styling and state
});


// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar.contains(event.target) && !document.getElementById('menu-toggle').contains(event.target)) {
        sidebar.style.left = '-300px';
        document.querySelector('.submenu').style.display = 'none'; // Ensure submenu also closes
    }
});
