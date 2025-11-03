/**
 * Utility class for debouncing function calls
 */
class Debouncer {
    constructor(func, delay) {
        this.func = func;
        this.delay = delay;
        this.timeoutId = null;
    }

    execute(...args) {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.func.apply(this, args);
        }, this.delay);
    }

    cancel() {
        clearTimeout(this.timeoutId);
    }
}

/**
 * SearchFilter - Component for handling search and filtering functionality
 * Provides real-time search and genre filtering capabilities with debouncing
 */
class SearchFilter {
    constructor(searchInputId, genreFilterId, dataManager) {
        this.searchInput = document.getElementById(searchInputId);
        this.genreFilterContainer = document.getElementById(genreFilterId);
        this.dataManager = dataManager;
        
        // Search state
        this.currentSearchQuery = '';
        this.currentGenre = 'all';
        this.debounceDelay = 300; // milliseconds
        
        // Create debounced search function
        this.debouncedSearch = new Debouncer((query) => {
            this.performSearch(query);
        }, this.debounceDelay);
        
        // Event callbacks
        this.onSearchCallback = null;
        this.onFilterCallback = null;
        
        if (!this.searchInput) {
            throw new Error(`Search input with ID '${searchInputId}' not found`);
        }
        
        if (!this.genreFilterContainer) {
            throw new Error(`Genre filter container with ID '${genreFilterId}' not found`);
        }
        
        this.init();
    }

    /**
     * Initialize the search filter component
     */
    async init() {
        try {
            await this.setupGenreFilter();
            this.setupSearchInput();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize SearchFilter:', error);
        }
    }

    /**
     * Set up the search input with debouncing
     */
    setupSearchInput() {
        // Add search icon and clear button
        const searchContainer = this.searchInput.parentElement;
        searchContainer.classList.add('search-input-container');
        
        // Create search icon
        const searchIcon = document.createElement('span');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '🔍';
        searchIcon.setAttribute('aria-hidden', 'true');
        
        // Create clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear-btn';
        clearButton.innerHTML = '✕';
        clearButton.setAttribute('aria-label', 'Clear search');
        clearButton.style.display = 'none';
        
        // Insert elements
        searchContainer.insertBefore(searchIcon, this.searchInput);
        searchContainer.appendChild(clearButton);
        
        // Store references
        this.clearButton = clearButton;
        this.searchIcon = searchIcon;
    }

    /**
     * Set up genre filter dropdown
     */
    async setupGenreFilter() {
        try {
            const genres = await this.dataManager.getGenres();
            
            // Create genre filter HTML
            const filterHTML = `
                <div class="genre-filter-container">
                    <label for="genre-select" class="genre-filter-label">Filter by Genre:</label>
                    <select id="genre-select" class="genre-select" aria-label="Filter games by genre">
                        <option value="all">All Genres</option>
                        ${genres.map(genre => 
                            `<option value="${this.escapeHtml(genre)}">${this.escapeHtml(genre)}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
            
            this.genreFilterContainer.innerHTML = filterHTML;
            this.genreSelect = document.getElementById('genre-select');
            
        } catch (error) {
            console.error('Failed to setup genre filter:', error);
            this.genreFilterContainer.innerHTML = '<p>Unable to load genre filters</p>';
        }
    }

    /**
     * Set up event listeners for search and filter interactions
     */
    setupEventListeners() {
        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        
        // Clear button event
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Genre filter events
        if (this.genreSelect) {
            this.genreSelect.addEventListener('change', (e) => {
                this.handleGenreChange(e.target.value);
            });
        }
        
        // Focus events for accessibility
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.parentElement.classList.add('focused');
        });
        
        this.searchInput.addEventListener('blur', () => {
            this.searchInput.parentElement.classList.remove('focused');
        });
    }

    /**
     * Handle search input with debouncing
     * @param {string} query - Search query
     */
    handleSearchInput(query) {
        // Update UI immediately for responsive feel
        this.updateSearchUI(query);
        
        // Debounce the actual search to avoid excessive API calls
        this.debouncedSearch.execute(query);
    }

    /**
     * Update search UI elements
     * @param {string} query - Current search query
     */
    updateSearchUI(query) {
        const hasQuery = query && query.trim().length > 0;
        
        // Show/hide clear button
        if (this.clearButton) {
            this.clearButton.style.display = hasQuery ? 'block' : 'none';
        }
        
        // Update search input styling
        this.searchInput.parentElement.classList.toggle('has-content', hasQuery);
    }

    /**
     * Perform the actual search
     * @param {string} query - Search query
     */
    performSearch(query) {
        this.currentSearchQuery = query.trim();
        
        // Track search event in analytics
        if (window.analyticsManager && this.currentSearchQuery) {
            // Get result count from data manager if available
            this.dataManager.searchGames(this.currentSearchQuery, this.currentGenre)
                .then(results => {
                    window.analyticsManager.trackSearch(this.currentSearchQuery, results.length);
                })
                .catch(error => {
                    console.error('Failed to get search results for analytics:', error);
                    window.analyticsManager.trackSearch(this.currentSearchQuery, 0);
                });
        }
        
        this.triggerFilter();
    }

    /**
     * Handle genre filter change
     * @param {string} genre - Selected genre
     */
    handleGenreChange(genre) {
        this.currentGenre = genre;
        
        // Track filter event in analytics
        if (window.analyticsManager && genre !== 'all') {
            // Get result count from data manager if available
            this.dataManager.searchGames(this.currentSearchQuery, genre)
                .then(results => {
                    window.analyticsManager.trackFilter('genre', genre, results.length);
                })
                .catch(error => {
                    console.error('Failed to get filter results for analytics:', error);
                    window.analyticsManager.trackFilter('genre', genre, 0);
                });
        }
        
        this.triggerFilter();
    }

    /**
     * Clear search input and reset search
     */
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearchQuery = '';
        this.updateSearchUI('');
        this.triggerFilter();
        this.searchInput.focus();
    }

    /**
     * Reset all filters to default state
     */
    resetFilters() {
        this.searchInput.value = '';
        this.currentSearchQuery = '';
        this.currentGenre = 'all';
        
        if (this.genreSelect) {
            this.genreSelect.value = 'all';
        }
        
        this.updateSearchUI('');
        this.triggerFilter();
    }

    /**
     * Trigger filter callback with current search and genre
     */
    triggerFilter() {
        if (this.onFilterCallback) {
            this.onFilterCallback(this.currentSearchQuery, this.currentGenre);
        }
    }

    /**
     * Set callback function for filter changes
     * @param {Function} callback - Function to call when filters change
     */
    onFilter(callback) {
        this.onFilterCallback = callback;
    }

    /**
     * Set callback function for search changes
     * @param {Function} callback - Function to call when search changes
     */
    onSearch(callback) {
        this.onSearchCallback = callback;
    }

    /**
     * Get current search query
     * @returns {string} Current search query
     */
    getSearchQuery() {
        return this.currentSearchQuery;
    }

    /**
     * Get current genre filter
     * @returns {string} Current genre filter
     */
    getGenreFilter() {
        return this.currentGenre;
    }

    /**
     * Set search query programmatically
     * @param {string} query - Search query to set
     */
    setSearchQuery(query) {
        this.searchInput.value = query;
        this.handleSearchInput(query);
    }

    /**
     * Set genre filter programmatically
     * @param {string} genre - Genre to set
     */
    setGenreFilter(genre) {
        if (this.genreSelect) {
            this.genreSelect.value = genre;
            this.handleGenreChange(genre);
        }
    }

    /**
     * Get filter summary for display
     * @returns {Object} Object containing filter summary
     */
    getFilterSummary() {
        return {
            hasSearch: this.currentSearchQuery.length > 0,
            searchQuery: this.currentSearchQuery,
            hasGenreFilter: this.currentGenre !== 'all',
            genre: this.currentGenre,
            isEmpty: this.currentSearchQuery.length === 0 && this.currentGenre === 'all'
        };
    }

    /**
     * Show loading state in search input
     */
    showLoading() {
        this.searchInput.classList.add('loading');
        this.searchInput.disabled = true;
    }

    /**
     * Hide loading state in search input
     */
    hideLoading() {
        this.searchInput.classList.remove('loading');
        this.searchInput.disabled = false;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Destroy the component and clean up event listeners
     */
    destroy() {
        // Cancel any pending debounced searches
        this.debouncedSearch.cancel();
        
        // Remove event listeners would be handled by removing elements
        // or could be tracked and removed explicitly if needed
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchFilter;
}