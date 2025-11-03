/**
 * GameDataManager - Handles loading, caching, and managing game data
 * Implements localStorage caching with TTL for performance optimization
 */
class GameDataManager {
    constructor() {
        this.cacheKey = 'gameData';
        this.cacheTimestampKey = 'gameDataTimestamp';
        this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.dataUrl = 'data/games.json';
        this.games = [];
        this.isLoaded = false;
    }

    /**
     * Load game data with caching support
     * @returns {Promise<Array>} Array of game objects
     */
    async loadGames() {
        try {
            // Check if data is already loaded in memory
            if (this.isLoaded && this.games.length > 0) {
                return this.games;
            }

            // Try to load from cache first
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.games = cachedData;
                this.isLoaded = true;
                return this.games;
            }

            // Load from server if no valid cache
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Validate data structure
            if (!data || !Array.isArray(data.games)) {
                throw new Error('Invalid data format: expected games array');
            }

            // Transform raw data into Game objects
            this.games = data.games.map(gameData => new Game(gameData));
            
            // Cache the data
            this.setCachedData(this.games);
            this.isLoaded = true;

            return this.games;
        } catch (error) {
            console.error('Failed to load game data:', error);
            throw new GameDataError(`Failed to load games: ${error.message}`);
        }
    }

    /**
     * Get cached data if it exists and is not expired
     * @returns {Array|null} Cached game data or null if not available/expired
     */
    getCachedData() {
        try {
            const cachedData = localStorage.getItem(this.cacheKey);
            const cacheTimestamp = localStorage.getItem(this.cacheTimestampKey);

            if (!cachedData || !cacheTimestamp) {
                return null;
            }

            const timestamp = parseInt(cacheTimestamp, 10);
            const now = Date.now();

            // Check if cache is expired
            if (now - timestamp > this.cacheTTL) {
                this.clearCache();
                return null;
            }

            return JSON.parse(cachedData);
        } catch (error) {
            console.warn('Error reading cache:', error);
            this.clearCache();
            return null;
        }
    }

    /**
     * Store data in localStorage cache
     * @param {Array} data - Game data to cache
     */
    setCachedData(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
        } catch (error) {
            console.warn('Failed to cache data:', error);
            // Continue without caching if localStorage is not available
        }
    }

    /**
     * Clear cached data
     */
    clearCache() {
        try {
            localStorage.removeItem(this.cacheKey);
            localStorage.removeItem(this.cacheTimestampKey);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    /**
     * Get a game by its ID
     * @param {string} gameId - The game ID to search for
     * @returns {Game|null} The game object or null if not found
     */
    async getGameById(gameId) {
        const games = await this.loadGames();
        return games.find(game => game.id === gameId) || null;
    }

    /**
     * Search games with advanced algorithm and scoring
     * @param {string} query - Search query
     * @returns {Promise<Array>} Filtered and scored array of games
     */
    async searchGames(query) {
        const games = await this.loadGames();
        if (!query || query.trim() === '') {
            return games;
        }

        const searchTerm = query.toLowerCase().trim();
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        
        // Score and filter games
        const scoredGames = games.map(game => {
            const score = this.calculateSearchScore(game, searchTerm, searchWords);
            return { game, score };
        }).filter(item => item.score > 0);

        // Sort by score (highest first) and return games
        return scoredGames
            .sort((a, b) => b.score - a.score)
            .map(item => item.game);
    }

    /**
     * Calculate search relevance score for a game
     * @param {Game} game - Game to score
     * @param {string} searchTerm - Full search term
     * @param {Array} searchWords - Individual search words
     * @returns {number} Relevance score (0 = no match, higher = better match)
     */
    calculateSearchScore(game, searchTerm, searchWords) {
        let score = 0;
        const title = game.title.toLowerCase();
        const description = game.description.toLowerCase();
        const fullDescription = game.fullDescription.toLowerCase();
        const developer = game.developer.toLowerCase();
        const genres = game.genre.map(g => g.toLowerCase());
        const tags = game.tags.map(t => t.toLowerCase());

        // Exact title match (highest priority)
        if (title === searchTerm) {
            score += 100;
        }
        // Title starts with search term
        else if (title.startsWith(searchTerm)) {
            score += 80;
        }
        // Title contains full search term
        else if (title.includes(searchTerm)) {
            score += 60;
        }

        // Check individual words in title
        searchWords.forEach(word => {
            if (title.includes(word)) {
                score += 40;
            }
        });

        // Genre exact matches (high priority)
        genres.forEach(genre => {
            if (genre === searchTerm) {
                score += 70;
            } else if (genre.includes(searchTerm)) {
                score += 50;
            }
            searchWords.forEach(word => {
                if (genre.includes(word)) {
                    score += 30;
                }
            });
        });

        // Tag matches
        tags.forEach(tag => {
            if (tag === searchTerm) {
                score += 60;
            } else if (tag.includes(searchTerm)) {
                score += 40;
            }
            searchWords.forEach(word => {
                if (tag.includes(word)) {
                    score += 25;
                }
            });
        });

        // Developer matches
        if (developer.includes(searchTerm)) {
            score += 35;
        }
        searchWords.forEach(word => {
            if (developer.includes(word)) {
                score += 20;
            }
        });

        // Description matches (lower priority)
        if (description.includes(searchTerm)) {
            score += 25;
        }
        if (fullDescription.includes(searchTerm)) {
            score += 20;
        }
        searchWords.forEach(word => {
            if (description.includes(word)) {
                score += 15;
            }
            if (fullDescription.includes(word)) {
                score += 10;
            }
        });

        return score;
    }

    /**
     * Advanced search with multiple filters
     * @param {Object} filters - Search filters object
     * @param {string} filters.query - Text search query
     * @param {string} filters.genre - Genre filter
     * @param {number} filters.minRating - Minimum rating filter
     * @param {number} filters.maxRating - Maximum rating filter
     * @param {string} filters.sortBy - Sort criteria (rating, title, releaseDate)
     * @param {string} filters.sortOrder - Sort order (asc, desc)
     * @returns {Promise<Array>} Filtered and sorted games
     */
    async advancedSearch(filters = {}) {
        let games = await this.loadGames();
        
        // Apply text search
        if (filters.query && filters.query.trim() !== '') {
            games = await this.searchGames(filters.query);
        }
        
        // Apply genre filter
        if (filters.genre && filters.genre !== 'all') {
            games = games.filter(game => 
                game.genre.some(g => g.toLowerCase() === filters.genre.toLowerCase())
            );
        }
        
        // Apply rating filters
        if (filters.minRating !== undefined) {
            games = games.filter(game => game.rating >= filters.minRating);
        }
        
        if (filters.maxRating !== undefined) {
            games = games.filter(game => game.rating <= filters.maxRating);
        }
        
        // Apply sorting
        if (filters.sortBy) {
            games = this.sortGames(games, filters.sortBy, filters.sortOrder || 'desc');
        }
        
        return games;
    }

    /**
     * Sort games by specified criteria
     * @param {Array} games - Games to sort
     * @param {string} sortBy - Sort criteria
     * @param {string} order - Sort order (asc/desc)
     * @returns {Array} Sorted games
     */
    sortGames(games, sortBy, order = 'desc') {
        const sortedGames = [...games];
        
        sortedGames.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'rating':
                    comparison = a.rating - b.rating;
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'releaseDate':
                    const dateA = a.releaseDate || new Date(0);
                    const dateB = b.releaseDate || new Date(0);
                    comparison = dateA - dateB;
                    break;
                case 'reviewCount':
                    comparison = a.reviewCount - b.reviewCount;
                    break;
                default:
                    return 0;
            }
            
            return order === 'asc' ? comparison : -comparison;
        });
        
        return sortedGames;
    }

    /**
     * Filter games by genre
     * @param {string} genre - Genre to filter by
     * @returns {Promise<Array>} Filtered array of games
     */
    async filterByGenre(genre) {
        const games = await this.loadGames();
        if (!genre || genre === 'all') {
            return games;
        }

        return games.filter(game => 
            game.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
    }

    /**
     * Get all unique genres from loaded games
     * @returns {Promise<Array>} Array of unique genres
     */
    async getGenres() {
        const games = await this.loadGames();
        const genres = new Set();
        
        games.forEach(game => {
            game.genre.forEach(g => genres.add(g));
        });

        return Array.from(genres).sort();
    }

    /**
     * Force refresh data from server
     * @returns {Promise<Array>} Fresh game data
     */
    async refreshData() {
        this.clearCache();
        this.isLoaded = false;
        this.games = [];
        return await this.loadGames();
    }
}

/**
 * Game model class
 */
class Game {
    constructor(data) {
        // Validate required fields
        if (!data.id || !data.title) {
            throw new Error('Game data must include id and title');
        }

        this.id = data.id;
        this.title = data.title;
        this.description = data.description || '';
        this.fullDescription = data.fullDescription || data.description || '';
        this.genre = Array.isArray(data.genre) ? data.genre : [];
        this.rating = parseFloat(data.rating) || 0;
        this.reviewCount = parseInt(data.reviewCount) || 0;
        this.thumbnail = data.thumbnail || 'images/placeholder.jpg';
        this.screenshots = Array.isArray(data.screenshots) ? data.screenshots : [];
        this.systemRequirements = data.systemRequirements || {};
        this.officialWebsite = data.officialWebsite || '';
        this.downloadLinks = Array.isArray(data.downloadLinks) ? data.downloadLinks : [];
        this.releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
        this.developer = data.developer || '';
        this.tags = Array.isArray(data.tags) ? data.tags : [];
    }

    /**
     * Get formatted rating string
     * @returns {string} Formatted rating with review count
     */
    getFormattedRating() {
        return `${this.rating}/5 (${this.reviewCount} reviews)`;
    }

    /**
     * Get genre string
     * @returns {string} Comma-separated genre list
     */
    getGenreString() {
        return this.genre.join(', ');
    }

    /**
     * Get formatted release date
     * @returns {string} Formatted date string
     */
    getFormattedReleaseDate() {
        if (!this.releaseDate) return 'Unknown';
        return this.releaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Check if game has screenshots
     * @returns {boolean} True if game has screenshots
     */
    hasScreenshots() {
        return this.screenshots.length > 0;
    }

    /**
     * Get primary screenshot or thumbnail
     * @returns {string} Image URL
     */
    getPrimaryImage() {
        return this.screenshots.length > 0 ? this.screenshots[0] : this.thumbnail;
    }
}

/**
 * Custom error class for game data operations
 */
class GameDataError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GameDataError';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameDataManager, Game, GameDataError };
}