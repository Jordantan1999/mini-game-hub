// Game Hub - Main JavaScript File

// Global variables
let gameDataManager;
let gameListView;
let gameDetailView;
let searchFilter;

let seoManager;
let analyticsManager;
let accessibilityManager;
let performanceOptimizer;
let currentView = 'list'; // 'list' or 'detail'

document.addEventListener('DOMContentLoaded', function() {
    console.log('Game Hub initialized');
    
    // Initialize the application
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize data manager
        gameDataManager = new GameDataManager();
        
        // Initialize game list view
        gameListView = new GameListView('game-grid', gameDataManager);
        
        // Initialize game detail view
        gameDetailView = new GameDetailView('game-detail', gameDataManager);
        
        // Initialize search filter component
        await setupSearchFilter();
        

        
        // Initialize SEO manager for search engine optimization
        setupSEOManager();
        
        // Initialize Analytics manager for tracking
        setupAnalyticsManager();
        
        // Initialize Accessibility manager for better user experience
        setupAccessibilityManager();
        
        // Initialize Performance optimizer for Core Web Vitals
        setupPerformanceOptimizer();
        
        // Set up URL-based page navigation and routing
        setupPageNavigation();
        setupRouting();
        
        // Make components globally accessible for cross-component communication
        window.gameListView = gameListView;
        window.gameDetailView = gameDetailView;
        window.searchFilter = searchFilter;

        window.seoManager = seoManager;
        window.analyticsManager = analyticsManager;
        window.accessibilityManager = accessibilityManager;
        window.performanceOptimizer = performanceOptimizer;
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showInitializationError();
    }
}

async function setupSearchFilter() {
    try {
        // Find search input - it might be in a container with class 'search-input'
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) {
            console.warn('Search input not found, skipping search filter setup');
            return;
        }
        
        // Ensure search input has an ID
        if (!searchInput.id) {
            searchInput.id = 'search-input';
        }
        
        // Find or create genre filter container
        let genreFilterContainer = document.getElementById('genre-filters');
        if (!genreFilterContainer) {
            console.warn('Genre filter container not found, skipping genre filter setup');
            // Create a temporary container for now
            genreFilterContainer = document.createElement('div');
            genreFilterContainer.id = 'genre-filters';
            genreFilterContainer.style.display = 'none';
            document.body.appendChild(genreFilterContainer);
        }
        
        // Initialize search filter component
        searchFilter = new SearchFilter('search-input', 'genre-filters', gameDataManager);
        
        // Set up filter callback to update game list
        searchFilter.onFilter((searchQuery, genre) => {
            if (gameListView) {
                gameListView.filterGames(searchQuery, genre);
            }
        });
        
        console.log('Search filter initialized successfully');
    } catch (error) {
        console.error('Failed to initialize search filter:', error);
    }
}



function setupSEOManager() {
    try {
        // Initialize SEO manager for search engine optimization
        seoManager = new SEOManager();
        
        // Initialize default SEO settings
        seoManager.init();
        
        console.log('SEO manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize SEO manager:', error);
        // Continue without SEO enhancements if it fails
    }
}

function setupAnalyticsManager() {
    try {
        // Initialize Analytics manager with your Google Analytics 4 measurement ID
        analyticsManager = new AnalyticsManager('G-XXXXXXXXXX');
        
        // Initialize Google Analytics
        analyticsManager.init();
        
        // Set up automatic tracking
        analyticsManager.trackPageTiming();
        analyticsManager.trackScrollDepth();
        
        console.log('Analytics manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Analytics manager:', error);
        // Continue without analytics if it fails
    }
}

function setupAccessibilityManager() {
    try {
        // Initialize Accessibility manager for better user experience
        accessibilityManager = new AccessibilityManager();
        
        console.log('Accessibility manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Accessibility manager:', error);
        // Continue without accessibility enhancements if it fails
    }
}

function setupPerformanceOptimizer() {
    try {
        // Initialize Performance optimizer for Core Web Vitals
        performanceOptimizer = new PerformanceOptimizer();
        
        console.log('Performance optimizer initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Performance optimizer:', error);
        // Continue without performance optimizations if it fails
    }
}

function setupPageNavigation() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        handleRouteChange();
    });
    
    // Set initial page from URL
    if (gameListView) {
        const initialPage = GameListView.getCurrentPageFromURL();
        if (initialPage > 1) {
            gameListView.currentPage = initialPage;
        }
    }
}

function setupRouting() {
    // Handle hash changes for routing
    window.addEventListener('hashchange', handleRouteChange);
    
    // Handle custom game navigation events
    window.addEventListener('gameNavigate', function(e) {
        showGameDetail(e.detail.gameId);
    });
    
    // Handle initial route on page load
    handleRouteChange();
}

function handleRouteChange() {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    
    if (hash.startsWith('game/')) {
        // Extract game ID from hash
        const gameId = hash.split('/')[1];
        if (gameId) {
            showGameDetail(gameId);
        } else {
            showGameList();
        }
    } else {
        // Show game list for any other hash or no hash
        showGameList();
        
        // Handle pagination if present
        if (gameListView && currentView === 'list') {
            const currentPage = GameListView.getCurrentPageFromURL();
            if (currentPage !== gameListView.currentPage) {
                gameListView.goToPage(currentPage);
            }
        }
    }
}

function showGameList() {
    if (currentView === 'list') return;
    
    currentView = 'list';
    
    // Show game list container and hide game detail container
    const gameGridContainer = document.getElementById('game-grid');
    const gameDetailContainer = document.getElementById('game-detail');
    const searchContainer = document.querySelector('.search-container');
    const sidebar = document.querySelector('.sidebar');
    
    if (gameGridContainer) gameGridContainer.style.display = 'block';
    if (gameDetailContainer) gameDetailContainer.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'block';
    if (sidebar) sidebar.style.display = 'block';
    
    // Manage focus for accessibility
    if (accessibilityManager && gameGridContainer) {
        accessibilityManager.manageFocusOnNavigation(gameGridContainer);
        accessibilityManager.updateAccessibility(gameGridContainer);
    }
    
    // Update SEO for game list page
    if (seoManager && gameDataManager) {
        gameDataManager.getAllGames().then(games => {
            const searchQuery = new URLSearchParams(window.location.search).get('search') || '';
            const genre = new URLSearchParams(window.location.search).get('genre') || '';
            seoManager.updateGameListSEO(games, searchQuery, genre);
        }).catch(error => {
            console.error('Failed to update SEO for game list:', error);
        });
    }
    
    // Track page view in analytics
    if (analyticsManager) {
        analyticsManager.trackPageView('Game Hub - Home', '/');
    }
}

function showGameDetail(gameId) {
    if (currentView === 'detail') return;
    
    currentView = 'detail';
    
    // Hide game list container and show game detail container
    const gameGridContainer = document.getElementById('game-grid');
    const gameDetailContainer = document.getElementById('game-detail');
    const searchContainer = document.querySelector('.search-container');
    const sidebar = document.querySelector('.sidebar');
    
    if (gameGridContainer) gameGridContainer.style.display = 'none';
    if (gameDetailContainer) gameDetailContainer.style.display = 'block';
    if (searchContainer) searchContainer.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    
    // Manage focus for accessibility
    if (accessibilityManager && gameDetailContainer) {
        accessibilityManager.manageFocusOnNavigation(gameDetailContainer);
    }
    
    // Load the game detail and update SEO/Analytics
    if (gameDetailView && gameDataManager) {
        gameDetailView.loadGame(gameId);
        
        // Update SEO and track analytics for game detail page
        gameDataManager.getGameById(gameId).then(game => {
            if (game) {
                // Update SEO for game detail page
                if (seoManager) {
                    seoManager.updateGamePageSEO(game);
                }
                
                // Track game view in analytics
                if (analyticsManager) {
                    analyticsManager.trackPageView(`${game.title} - Game Review`, `/game/${gameId}`);
                    analyticsManager.trackGameView(game);
                }
                
                // Update accessibility after content loads
                if (accessibilityManager) {
                    setTimeout(() => {
                        accessibilityManager.updateAccessibility(gameDetailContainer);
                    }, 100);
                }
            }
        }).catch(error => {
            console.error('Failed to load game for SEO/Analytics:', error);
        });
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function showInitializationError() {
    const gameGrid = document.getElementById('game-grid');
    if (gameGrid) {
        gameGrid.innerHTML = `
            <div class="error-state" role="alert">
                <h3>Failed to Initialize</h3>
                <p>There was a problem loading the application. Please refresh the page to try again.</p>
                <button class="btn retry-btn" onclick="window.location.reload()">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Utility function to handle external links safely
function handleExternalLink(url) {
    if (url && url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

// Export global functions for use in other scripts
window.gameHub = {
    gameDataManager,
    gameListView,
    searchFilter,
    seoManager,
    analyticsManager,
    handleExternalLink
};