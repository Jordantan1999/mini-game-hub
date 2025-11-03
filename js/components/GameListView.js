/**
 * GameListView - Component for displaying games in a responsive grid layout
 * Handles rendering, pagination, and user interactions for game listings
 */
class GameListView {
    constructor(containerId, dataManager) {
        this.container = document.getElementById(containerId);
        this.dataManager = dataManager;
        this.currentPage = 1;
        this.gamesPerPage = 20;
        this.currentGames = [];
        this.filteredGames = [];
        this.isLoading = false;
        this.lazyLoadManager = null;
        
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        this.init();
    }

    /**
     * Initialize the component
     */
    init() {
        // Initialize lazy loading manager if available
        if (typeof LazyLoadManager !== 'undefined') {
            this.lazyLoadManager = new LazyLoadManager();
        }
        
        this.setupEventListeners();
        this.loadAndRenderGames();
    }

    /**
     * Set up event listeners for the component
     */
    setupEventListeners() {
        // Listen for pagination clicks
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.pagination-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            }
            
            // Handle game card clicks for navigation
            if (e.target.closest('.game-card')) {
                const gameCard = e.target.closest('.game-card');
                const gameId = gameCard.dataset.gameId;
                if (gameId) {
                    this.handleGameClick(gameId);
                }
            }
        });
    }

    /**
     * Load games from data manager and render them
     */
    async loadAndRenderGames() {
        try {
            this.showLoading();
            const games = await this.dataManager.loadGames();
            this.currentGames = games;
            this.filteredGames = games;
            this.currentPage = 1;
            this.renderGameGrid();
        } catch (error) {
            console.error('Failed to load games:', error);
            this.showError('Failed to load games. Please try again later.');
        }
    }

    /**
     * Render the game grid with current filtered games
     */
    renderGameGrid() {
        if (this.isLoading) return;
        
        const startIndex = (this.currentPage - 1) * this.gamesPerPage;
        const endIndex = startIndex + this.gamesPerPage;
        const gamesToShow = this.filteredGames.slice(startIndex, endIndex);
        
        if (gamesToShow.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Insert ads strategically between games
        const gameCardsWithAds = this.insertInContentAds(gamesToShow);
        
        const gridHTML = `
            <div class="game-grid-container">
                <div class="game-grid grid" role="grid" aria-label="Game listings">
                    ${gameCardsWithAds.join('')}
                </div>
                ${this.renderPagination()}
            </div>
        `;
        
        this.container.innerHTML = gridHTML;
        
        // Trigger lazy loading for images
        this.setupLazyLoading();
        

    }

    /**
     * Insert in-content ads strategically between game cards
     * @param {Array} games - Array of games to display
     * @returns {Array} Array of HTML strings with ads inserted
     */
    insertInContentAds(games) {
        const gameCards = games.map(game => this.renderGameCard(game));
        const result = [];
        
        // Insert ads after every 8 games (2 rows on desktop, 4 rows on tablet, 8 rows on mobile)
        const adInterval = 8;
        
        for (let i = 0; i < gameCards.length; i++) {
            result.push(gameCards[i]);
            
            // Insert ad after every adInterval games, but not after the last game
            if ((i + 1) % adInterval === 0 && i < gameCards.length - 1) {
                result.push(this.renderInContentAd(Math.floor(i / adInterval) + 1));
            }
        }
        
        return result;
    }

    /**
     * Render an in-content ad unit
     * @param {number} adIndex - Index of the ad for unique identification
     * @returns {string} HTML string for the in-content ad
     */
    renderInContentAd(adIndex) {
        return `

                     data-ad-slot="XXXXXXXXXX"
                     data-ad-format="rectangle"
                     data-ad-width="336"
                     data-ad-height="280"></ins>
                <div class="ad-fallback">
                    <p>Support our site by allowing ads or consider our premium content!</p>
                </div>
            </div>
        `;
    }

    /**
     * Render a single game card
     * @param {Game} game - Game object to render
     * @returns {string} HTML string for the game card
     */
    renderGameCard(game) {
        const ratingStars = this.renderRatingStars(game.rating);
        
        return `
            <article class="game-card card" 
                     data-game-id="${game.id}" 
                     role="gridcell"
                     tabindex="0"
                     aria-label="Game: ${game.title}">
                <div class="card-image-container">
                    <img class="card-image lazy-load" 
                         data-src="${game.thumbnail}" 
                         alt="${game.title} thumbnail"
                         loading="lazy"
                         width="300"
                         height="200"
                         decoding="async">
                    <div class="card-overlay">
                        <span class="card-overlay-text">View Details</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${this.escapeHtml(game.title)}</h3>
                    <p class="card-description">${this.escapeHtml(game.description)}</p>
                    <div class="card-meta">
                        <div class="card-genre">
                            <span class="genre-label">Genre:</span>
                            <span class="genre-text">${this.escapeHtml(game.getGenreString())}</span>
                        </div>
                        <div class="card-rating">
                            <div class="rating-stars" aria-label="Rating: ${game.rating} out of 5 stars">
                                ${ratingStars}
                            </div>
                            <span class="rating-text">${game.rating}/5 (${game.reviewCount})</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render star rating display
     * @param {number} rating - Rating value (0-5)
     * @returns {string} HTML string for star rating
     */
    renderRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star star-full">★</span>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<span class="star star-half">☆</span>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star star-empty">☆</span>';
        }
        
        return starsHTML;
    }

    /**
     * Render pagination controls
     * @returns {string} HTML string for pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredGames.length / this.gamesPerPage);
        
        if (totalPages <= 1) {
            return '';
        }
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        let paginationHTML = '<nav class="pagination" role="navigation" aria-label="Game list pagination">';
        paginationHTML += '<ul class="pagination-list">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <li>
                    <button class="pagination-btn pagination-prev" 
                            data-page="${this.currentPage - 1}"
                            aria-label="Go to previous page">
                        ← Previous
                    </button>
                </li>
            `;
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            paginationHTML += `
                <li>
                    <button class="pagination-btn" data-page="1" aria-label="Go to page 1">1</button>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += '<li><span class="pagination-ellipsis">...</span></li>';
            }
        }
        
        // Page numbers
        for (let page = startPage; page <= endPage; page++) {
            const isActive = page === this.currentPage;
            paginationHTML += `
                <li>
                    <button class="pagination-btn ${isActive ? 'active' : ''}" 
                            data-page="${page}"
                            aria-label="Go to page ${page}"
                            ${isActive ? 'aria-current="page"' : ''}>
                        ${page}
                    </button>
                </li>
            `;
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<li><span class="pagination-ellipsis">...</span></li>';
            }
            paginationHTML += `
                <li>
                    <button class="pagination-btn" 
                            data-page="${totalPages}" 
                            aria-label="Go to page ${totalPages}">
                        ${totalPages}
                    </button>
                </li>
            `;
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <li>
                    <button class="pagination-btn pagination-next" 
                            data-page="${this.currentPage + 1}"
                            aria-label="Go to next page">
                        Next →
                    </button>
                </li>
            `;
        }
        
        paginationHTML += '</ul></nav>';
        
        return paginationHTML;
    }

    /**
     * Navigate to a specific page
     * @param {number} page - Page number to navigate to
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredGames.length / this.gamesPerPage);
        
        if (page < 1 || page > totalPages || page === this.currentPage) {
            return;
        }
        
        this.currentPage = page;
        this.renderGameGrid();
        
        // Scroll to top of game grid
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update URL without page reload (for better UX)
        this.updateURL();
    }

    /**
     * Update URL with current page (for bookmarking and back button support)
     */
    updateURL() {
        const url = new URL(window.location);
        if (this.currentPage > 1) {
            url.searchParams.set('page', this.currentPage);
        } else {
            url.searchParams.delete('page');
        }
        window.history.replaceState({}, '', url);
    }

    /**
     * Handle game card click for navigation
     * @param {string} gameId - ID of the clicked game
     */
    handleGameClick(gameId) {
        // Navigate to game detail page using hash-based routing
        window.location.hash = `game/${gameId}`;
        
        // Trigger custom event for routing system
        window.dispatchEvent(new CustomEvent('gameNavigate', {
            detail: { gameId }
        }));
    }

    /**
     * Filter games based on search query and/or genre
     * @param {string} searchQuery - Search query string
     * @param {string} genre - Genre filter
     * @param {Object} additionalFilters - Additional filter options
     */
    async filterGames(searchQuery = '', genre = 'all', additionalFilters = {}) {
        try {
            this.showLoading();
            
            // Use advanced search with all filters
            const filters = {
                query: searchQuery,
                genre: genre,
                ...additionalFilters
            };
            
            const filteredGames = await this.dataManager.advancedSearch(filters);
            
            this.filteredGames = filteredGames;
            this.currentPage = 1;
            this.renderGameGrid();
            
            // Update filter summary display
            this.updateFilterSummary(searchQuery, genre, filteredGames.length);
            
        } catch (error) {
            console.error('Failed to filter games:', error);
            this.showError('Failed to filter games. Please try again.');
        }
    }

    /**
     * Update filter summary display
     * @param {string} searchQuery - Current search query
     * @param {string} genre - Current genre filter
     * @param {number} resultCount - Number of filtered results
     */
    updateFilterSummary(searchQuery, genre, resultCount) {
        const hasFilters = (searchQuery && searchQuery.trim() !== '') || (genre && genre !== 'all');
        
        if (!hasFilters) {
            this.hideFilterSummary();
            return;
        }
        
        let summaryText = `Showing ${resultCount} game${resultCount !== 1 ? 's' : ''}`;
        const filters = [];
        
        if (searchQuery && searchQuery.trim() !== '') {
            filters.push(`matching "${searchQuery}"`);
        }
        
        if (genre && genre !== 'all') {
            filters.push(`in ${genre}`);
        }
        
        if (filters.length > 0) {
            summaryText += ` ${filters.join(' and ')}`;
        }
        
        this.showFilterSummary(summaryText, searchQuery, genre);
    }

    /**
     * Show filter summary
     * @param {string} text - Summary text
     * @param {string} searchQuery - Current search query
     * @param {string} genre - Current genre filter
     */
    showFilterSummary(text, searchQuery, genre) {
        let summaryContainer = document.getElementById('filter-summary');
        
        if (!summaryContainer) {
            summaryContainer = document.createElement('div');
            summaryContainer.id = 'filter-summary';
            summaryContainer.className = 'filter-summary';
            this.container.insertBefore(summaryContainer, this.container.firstChild);
        }
        
        const clearButton = `
            <button class="clear-filters-btn" onclick="window.gameListView.clearAllFilters()">
                Clear Filters
            </button>
        `;
        
        summaryContainer.innerHTML = `
            <span>${text}</span>
            ${clearButton}
        `;
        
        summaryContainer.style.display = 'block';
    }

    /**
     * Hide filter summary
     */
    hideFilterSummary() {
        const summaryContainer = document.getElementById('filter-summary');
        if (summaryContainer) {
            summaryContainer.style.display = 'none';
        }
    }

    /**
     * Clear all filters and reset to show all games
     */
    clearAllFilters() {
        this.filteredGames = this.currentGames;
        this.currentPage = 1;
        this.renderGameGrid();
        this.hideFilterSummary();
        
        // Notify search filter component to reset
        if (window.searchFilter) {
            window.searchFilter.resetFilters();
        }
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if (this.lazyLoadManager) {
            // Use the advanced lazy loading manager
            this.lazyLoadManager.lazyLoadImages(this.container);
            this.lazyLoadManager.lazyLoadContent(this.container);
        } else {
            // Fallback to simple lazy loading
            const lazyImages = this.container.querySelectorAll('.lazy-load');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy-load');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                lazyImages.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for browsers without IntersectionObserver
                lazyImages.forEach(img => {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                });
            }
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.isLoading = true;
        this.container.innerHTML = `
            <div class="loading" role="status" aria-live="polite">
                <div class="loading-spinner"></div>
                <p>Loading games...</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.isLoading = false;
        this.container.innerHTML = `
            <div class="error-state" role="alert">
                <h3>Oops! Something went wrong</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="btn retry-btn" onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Show empty state when no games match filters
     */
    showEmptyState() {
        this.isLoading = false;
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>No games found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
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
     * Get current page from URL parameters
     * @returns {number} Current page number
     */
    static getCurrentPageFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;
        return Math.max(1, page);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameListView;
}