document.addEventListener('DOMContentLoaded', function() {
    var filterLinks = document.querySelectorAll('.sb-filter-link');
    var gridItems = document.querySelectorAll('.sb-grid-item');

    // Add click event to each filter link
    filterLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            filterLinks.forEach(function(el) {
                el.classList.remove('sb-active');
            });
            
            // Add active class to clicked link
            this.classList.add('sb-active');
            
            var filterValue = this.getAttribute('data-filter');
            
            // Show/hide items based on filter
            gridItems.forEach(function(item) {
                if (filterValue === '*') {
                    item.style.display = 'block';
                } else if (item.classList.contains(filterValue.replace('.', ''))) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});