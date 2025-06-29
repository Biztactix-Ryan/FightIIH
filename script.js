// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            navToggle.classList.toggle('active');
            
            if (navToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 100; // Account for fixed header
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Active Navigation Highlighting
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollY = window.pageYOffset;
            
            if (scrollY >= sectionTop - 150 && scrollY < sectionTop + sectionHeight - 150) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Call once on load
});

// Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create search input and results container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-input-wrapper">
            <input type="text" id="search-input" placeholder="Search IIH information..." />
            <button id="search-clear" aria-label="Clear search">&times;</button>
        </div>
        <div id="search-results" class="search-results"></div>
    `;
    
    // Add search to navigation
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(searchContainer);
    }
    
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput && searchResults) {
        // Create searchable content index
        const searchableContent = [];
        
        // Index all sections
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const title = section.querySelector('h2')?.textContent || '';
            const content = section.textContent || '';
            const id = section.id;
            
            searchableContent.push({
                title,
                content: content.toLowerCase(),
                id,
                element: section
            });
            
            // Index subsections
            const subsections = section.querySelectorAll('h3, h4');
            subsections.forEach(subsection => {
                const subTitle = subsection.textContent;
                const subContent = subsection.closest('div')?.textContent || subsection.textContent;
                
                searchableContent.push({
                    title: `${title} - ${subTitle}`,
                    content: subContent.toLowerCase(),
                    id,
                    element: subsection,
                    isSubsection: true
                });
            });
        });
        
        function performSearch(query) {
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            
            const results = searchableContent.filter(item => 
                item.content.includes(query.toLowerCase()) || 
                item.title.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8); // Limit to 8 results
            
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            } else {
                searchResults.innerHTML = results.map(result => {
                    const snippet = getSnippet(result.content, query);
                    return `
                        <div class="search-result" data-target="${result.id}">
                            <div class="search-result-title">${result.title}</div>
                            <div class="search-result-snippet">${snippet}</div>
                        </div>
                    `;
                }).join('');
                
                // Add click handlers to results
                searchResults.querySelectorAll('.search-result').forEach(result => {
                    result.addEventListener('click', function() {
                        const targetId = this.getAttribute('data-target');
                        const targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            const headerOffset = 100;
                            const elementPosition = targetElement.offsetTop;
                            const offsetPosition = elementPosition - headerOffset;
                            
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                            
                            // Close search
                            searchInput.value = '';
                            searchResults.innerHTML = '';
                            searchResults.style.display = 'none';
                        }
                    });
                });
            }
            
            searchResults.style.display = 'block';
        }
        
        function getSnippet(content, query) {
            const index = content.toLowerCase().indexOf(query.toLowerCase());
            if (index === -1) return content.substring(0, 100) + '...';
            
            const start = Math.max(0, index - 50);
            const end = Math.min(content.length, index + query.length + 50);
            const snippet = content.substring(start, end);
            
            return (start > 0 ? '...' : '') + 
                   snippet.replace(new RegExp(query, 'gi'), '<mark>$&</mark>') + 
                   (end < content.length ? '...' : '');
        }
        
        // Search input event listeners
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
        
        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                performSearch(this.value);
            }
        });
        
        // Clear search
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            searchInput.focus();
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
        
        // Show/hide clear button
        searchInput.addEventListener('input', function() {
            searchClear.style.display = this.value ? 'block' : 'none';
        });
    }
});

// Last Updated Date
document.addEventListener('DOMContentLoaded', function() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const currentDate = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        lastUpdatedElement.textContent = currentDate.toLocaleDateString('en-US', options);
    }
});

// Scroll Progress Indicator
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    const progressBarFill = progressBar.querySelector('.scroll-progress-bar');
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBarFill.style.width = scrollPercent + '%';
    }
    
    window.addEventListener('scroll', updateScrollProgress);
});

// Lazy Loading for Images (if any are added later)
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Print Functionality
function printPage() {
    window.print();
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes search
    if (e.key === 'Escape') {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        if (searchResults && searchInput) {
            searchResults.style.display = 'none';
            searchInput.blur();
        }
    }
    
    // Ctrl/Cmd + K opens search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Accessibility: Skip to content
document.addEventListener('DOMContentLoaded', function() {
    const skipLink = document.createElement('a');
    skipLink.href = '#what-is-iih';
    skipLink.textContent = 'Skip to content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3498db;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1001;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
});

// Add CSS for search functionality
const searchStyles = `
    .search-container {
        position: relative;
        margin-left: 2rem;
    }
    
    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    #search-input {
        width: 250px;
        padding: 0.5rem 2rem 0.5rem 0.75rem;
        border: 1px solid #ddd;
        border-radius: 20px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    #search-input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        width: 300px;
    }
    
    #search-clear {
        position: absolute;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #999;
        cursor: pointer;
        display: none;
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        transition: color 0.3s ease;
    }
    
    #search-clear:hover {
        color: #666;
        background: #f0f0f0;
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        margin-top: 0.5rem;
    }
    
    .search-result {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .search-result:last-child {
        border-bottom: none;
    }
    
    .search-result:hover {
        background-color: #f8f9fa;
    }
    
    .search-result-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.25rem;
    }
    
    .search-result-snippet {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.4;
    }
    
    .search-result-snippet mark {
        background: #fff3cd;
        padding: 0.1rem 0.2rem;
        border-radius: 2px;
    }
    
    .search-no-results {
        padding: 1rem;
        text-align: center;
        color: #666;
        font-style: italic;
    }
    
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(52, 152, 219, 0.1);
        z-index: 999;
    }
    
    .scroll-progress-bar {
        height: 100%;
        background: #3498db;
        transition: width 0.1s ease;
    }
    
    .nav-menu a.active {
        color: #3498db;
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .search-container {
            margin-left: 0;
            margin-top: 1rem;
            order: 3;
            width: 100%;
        }
        
        #search-input {
            width: 100%;
        }
        
        #search-input:focus {
            width: 100%;
        }
        
        .nav-container {
            flex-wrap: wrap;
        }
    }
`;

// Inject search styles
const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);