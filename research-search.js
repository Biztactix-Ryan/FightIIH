// Research Database Search Functionality
let researchData = [];
let fuse;
let currentFilters = {
    year: '',
    category: '',
    tags: [],
    startDate: null,
    endDate: null,
    selectedMonths: []
};
let currentYear = 2025;
let timelineView = 'month';

// Initialize Fuse.js options
const fuseOptions = {
    keys: [
        { name: 'title', weight: 2 },
        { name: 'authors', weight: 1.5 },
        { name: 'abstract', weight: 1 },
        { name: 'journal', weight: 0.8 },
        { name: 'tags', weight: 1.2 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
};

// Load research data
async function loadResearchData() {
    try {
        const response = await fetch('research-database.json');
        const data = await response.json();
        researchData = data.papers;
        
        // Initialize Fuse.js
        fuse = new Fuse(researchData, fuseOptions);
        
        // Populate filters and stats
        populateFilters();
        updateStats();
        
        // Initial display
        displayResults(researchData);
        renderTimeline();
        
        // Update results info
        document.getElementById('resultsInfo').textContent = `Showing ${researchData.length} papers`;
    } catch (error) {
        console.error('Error loading research data:', error);
        document.getElementById('researchGrid').innerHTML = 
            '<div class="no-results">Error loading research database. Please try again later.</div>';
    }
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique years
    const years = [...new Set(researchData.map(paper => paper.year))].sort((a, b) => b - a);
    const yearFilter = document.getElementById('yearFilter');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Populate tag cloud
    const allTags = {};
    researchData.forEach(paper => {
        paper.tags.forEach(tag => {
            allTags[tag] = (allTags[tag] || 0) + 1;
        });
    });
    
    const tagCloud = document.getElementById('tagCloud');
    Object.entries(allTags)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tag, count]) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = `${tag} (${count})`;
            tagElement.onclick = () => toggleTag(tag);
            tagElement.dataset.tag = tag;
            tagCloud.appendChild(tagElement);
        });
}

// Update statistics
function updateStats() {
    // Total papers
    document.getElementById('totalPapers').textContent = researchData.length;
    
    // Year range
    const years = researchData.map(p => p.year).sort((a, b) => a - b);
    document.getElementById('yearRange').textContent = 
        years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : '-';
    
    // Unique authors
    const authors = new Set();
    researchData.forEach(paper => {
        paper.authors.forEach(author => authors.add(author));
    });
    document.getElementById('totalAuthors').textContent = authors.size;
    
    // Unique journals
    const journals = new Set(researchData.map(p => p.journal));
    document.getElementById('totalJournals').textContent = journals.size;
}

// Display results
function displayResults(papers, scores = null) {
    const grid = document.getElementById('researchGrid');
    
    if (papers.length === 0) {
        grid.innerHTML = '<div class="no-results">No papers found matching your search criteria.</div>';
        return;
    }
    
    grid.innerHTML = papers.map((paper, index) => {
        const score = scores ? scores[index] : null;
        const relevanceBar = score ? 
            `<div style="height: 2px; background: linear-gradient(to right, #3b82f6 ${(1 - score) * 100}%, #e5e7eb ${(1 - score) * 100}%); margin-bottom: 0.5rem;"></div>` : '';
        
        return `
            <div class="research-card" data-paper-id="${paper.id}">
                ${relevanceBar}
                <h3 class="research-title">${paper.title}</h3>
                <p class="research-authors">${paper.authors.join(', ')}</p>
                <p class="research-journal">${paper.journal} • ${getMonthName(paper.month)} ${paper.year}</p>
                <p class="research-abstract">${paper.abstract}</p>
                <div class="research-tags">
                    ${paper.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="research-meta">
                    <span class="research-date">${paper.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <div class="research-links">
                        ${paper.doi ? `<a href="https://doi.org/${paper.doi}" target="_blank" class="research-link">DOI</a>` : ''}
                        ${paper.pubmedId ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/" target="_blank" class="research-link">PubMed</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get month name
function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
}

// Search function
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    let results = researchData;
    let scores = null;
    
    // Apply search
    if (searchTerm) {
        const searchResults = fuse.search(searchTerm);
        results = searchResults.map(r => r.item);
        scores = searchResults.map(r => r.score);
    }
    
    // Apply filters
    results = applyFilters(results);
    
    // Apply sorting
    results = applySorting(results);
    
    // Update results info
    const resultsInfo = document.getElementById('resultsInfo');
    if (searchTerm || currentFilters.year || currentFilters.category || currentFilters.tags.length > 0) {
        resultsInfo.textContent = `Found ${results.length} papers`;
    } else {
        resultsInfo.textContent = `Showing all ${results.length} papers`;
    }
    
    // Display results
    displayResults(results, scores);
}

// Apply filters
function applyFilters(papers) {
    return papers.filter(paper => {
        // Year filter
        if (currentFilters.year && paper.year !== parseInt(currentFilters.year)) {
            return false;
        }
        
        // Category filter
        if (currentFilters.category && paper.category !== currentFilters.category) {
            return false;
        }
        
        // Tag filters
        if (currentFilters.tags.length > 0) {
            const paperTags = paper.tags.map(t => t.toLowerCase());
            const hasAllTags = currentFilters.tags.every(tag => 
                paperTags.includes(tag.toLowerCase())
            );
            if (!hasAllTags) return false;
        }
        
        // Selected months filter
        if (currentFilters.selectedMonths.length > 0) {
            const paperMonth = `${paper.year}-${paper.month}`;
            if (!currentFilters.selectedMonths.includes(paperMonth)) {
                return false;
            }
        }
        
        // Date range filter
        if (currentFilters.startDate || currentFilters.endDate) {
            const paperDate = paper.year * 12 + (paper.month || 1);
            
            if (currentFilters.startDate) {
                const startDate = currentFilters.startDate.year * 12 + currentFilters.startDate.month;
                if (paperDate < startDate) return false;
            }
            
            if (currentFilters.endDate) {
                const endDate = currentFilters.endDate.year * 12 + currentFilters.endDate.month;
                if (paperDate > endDate) return false;
            }
        }
        
        return true;
    });
}

// Apply sorting
function applySorting(papers) {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch(sortBy) {
        case 'date-desc':
            return papers.sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        case 'date-asc':
            return papers.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });
        case 'title':
            return papers.sort((a, b) => a.title.localeCompare(b.title));
        case 'relevance':
        default:
            return papers; // Already sorted by relevance if searching
    }
}

// Toggle tag selection
function toggleTag(tag) {
    const index = currentFilters.tags.indexOf(tag);
    if (index > -1) {
        currentFilters.tags.splice(index, 1);
    } else {
        currentFilters.tags.push(tag);
    }
    
    // Update UI
    document.querySelectorAll('.tag-cloud .tag').forEach(el => {
        if (el.dataset.tag === tag) {
            el.classList.toggle('active');
        }
    });
    
    performSearch();
}

// Timeline functions
function renderTimeline() {
    const monthsGrid = document.getElementById('monthsGrid');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Count papers by month for current year
    const monthCounts = new Array(12).fill(0);
    researchData.forEach(paper => {
        if (paper.year === currentYear && paper.month >= 1 && paper.month <= 12) {
            monthCounts[paper.month - 1]++;
        }
    });
    
    // Render month bars
    monthsGrid.innerHTML = monthNames.map((month, index) => {
        const count = monthCounts[index];
        const monthNum = index + 1;
        const monthKey = `${currentYear}-${monthNum}`;
        const isActive = currentFilters.selectedMonths.includes(monthKey);
        const hasData = count > 0;
        
        return `
            <div class="month-bar ${hasData ? 'has-papers' : 'empty'} ${isActive ? 'active' : ''}" 
                 data-month="${monthKey}"
                 onclick="toggleMonth('${monthKey}')">
                <div class="month-name">${month}</div>
                <div class="month-count">${count}</div>
            </div>
        `;
    }).join('');
    
    // Update year display
    document.getElementById('currentYear').textContent = currentYear;
}

function toggleMonth(monthKey) {
    const index = currentFilters.selectedMonths.indexOf(monthKey);
    if (index > -1) {
        currentFilters.selectedMonths.splice(index, 1);
    } else {
        currentFilters.selectedMonths.push(monthKey);
    }
    
    renderTimeline();
    performSearch();
}

// Make toggleMonth available globally for onclick
window.toggleMonth = toggleMonth;

function changeYear(delta) {
    const years = [...new Set(researchData.map(p => p.year))];
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    currentYear += delta;
    currentYear = Math.max(minYear, Math.min(maxYear, currentYear));
    
    // Update nav buttons
    document.getElementById('prevYear').disabled = currentYear <= minYear;
    document.getElementById('nextYear').disabled = currentYear >= maxYear;
    
    renderTimeline();
}

function applyDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate) {
        const [year, month] = startDate.split('-').map(Number);
        currentFilters.startDate = { year, month };
    } else {
        currentFilters.startDate = null;
    }
    
    if (endDate) {
        const [year, month] = endDate.split('-').map(Number);
        currentFilters.endDate = { year, month };
    } else {
        currentFilters.endDate = null;
    }
    
    performSearch();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadResearchData();
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
    
    // Filter changes
    document.getElementById('yearFilter').addEventListener('change', (e) => {
        currentFilters.year = e.target.value;
        performSearch();
    });
    
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        performSearch();
    });
    
    document.getElementById('sortFilter').addEventListener('change', performSearch);
    
    // Timeline controls
    document.getElementById('prevYear').addEventListener('click', () => changeYear(-1));
    document.getElementById('nextYear').addEventListener('click', () => changeYear(1));
    document.getElementById('applyDateRange').addEventListener('click', applyDateRange);
    
    // Timeline view buttons
    document.querySelectorAll('.timeline-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timeline-btn[data-view]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            timelineView = e.target.dataset.view;
            
            if (timelineView === 'all') {
                currentFilters.selectedMonths = [];
                currentFilters.startDate = null;
                currentFilters.endDate = null;
                performSearch();
            }
            renderTimeline();
        });
    });
});