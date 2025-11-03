/**
 * GameDetailView - Component for displaying detailed game information
 * Handles rendering comprehensive game details, screenshots gallery, and system requirements
 */
class GameDetailView {
    constructor(containerId, dataManager) {
        this.container = document.getElementById(containerId);
        this.dataManager = dataManager;
        this.currentGame = null;
        this.currentScreenshotIndex = 0;
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
    }

    /**
     * Set up event listeners for the component
     */
    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            // Handle screenshot navigation
            if (e.target.matches('.screenshot-nav-btn')) {
                e.preventDefault();
                const direction = e.target.dataset.direction;
                this.navigateScreenshots(direction);
            }
            
            // Handle screenshot thumbnail clicks
            if (e.target.matches('.screenshot-thumbnail')) {
                e.preventDefault();
                const index = parseInt(e.target.dataset.index);
                this.showScreenshot(index);
            }
            
            // Handle external links
            if (e.target.matches('.external-link')) {
                e.preventDefault();
                const url = e.target.href;
                this.handleExternalLink(url);
            }
            
            // Handle social sharing buttons
            if (e.target.matches('.social-share-btn')) {
                e.preventDefault();
                const platform = e.target.dataset.platform;
                this.handleSocialShare(platform);
            }
            
            // Handle back to list button
            if (e.target.matches('.back-to-list-btn')) {
                e.preventDefault();
                this.handleBackToList();
            }
        });
        
        // Handle keyboard navigation for screenshots
        this.container.addEventListener('keydown', (e) => {
            if (this.currentGame && this.currentGame.hasScreenshots()) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.navigateScreenshots('prev');
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.navigateScreenshots('next');
                }
            }
        });
    }

    /**
     * Load and display a game by ID
     * @param {string} gameId - ID of the game to display
     */
    async loadGame(gameId) {
        try {
            this.showLoading();
            const game = await this.dataManager.getGameById(gameId);
            
            if (!game) {
                this.showGameNotFound(gameId);
                return;
            }
            
            this.currentGame = game;
            this.currentScreenshotIndex = 0;
            this.renderGameDetail();
            
            // Update page SEO metadata
            this.updatePageMetadata(game);
            
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showError('Failed to load game details. Please try again later.');
        }
    }

    /**
     * Render the complete game detail view
     */
    renderGameDetail() {
        if (!this.currentGame) return;
        
        const game = this.currentGame;
        
        const detailHTML = `
            <article class="game-detail" itemscope itemtype="https://schema.org/VideoGame">
                ${this.renderGameHeader(game)}
                ${this.renderScreenshotsGallery(game)}
                ${this.renderGameInfo(game)}
                ${this.renderSystemRequirements(game)}
                ${this.renderDownloadLinks(game)}
                ${this.renderSocialSharing(game)}
            </article>
        `;
        
        this.container.innerHTML = detailHTML;
        
        // Setup lazy loading for screenshots
        this.setupLazyLoading();
    }

    /**
     * Render game header section
     * @param {Game} game - Game object
     * @returns {string} HTML string for game header
     */
    renderGameHeader(game) {
        const ratingStars = this.renderRatingStars(game.rating);
        
        return `
            <header class="game-header">
                <button class="back-to-list-btn" aria-label="Back to game list">
                    ← Back to Games
                </button>
                
                <div class="game-title-section">
                    <h1 class="game-title" itemprop="name">${this.escapeHtml(game.title)}</h1>
                    <div class="game-meta">
                        <div class="game-developer">
                            <span class="meta-label">Developer:</span>
                            <span class="meta-value" itemprop="author">${this.escapeHtml(game.developer)}</span>
                        </div>
                        <div class="game-release-date">
                            <span class="meta-label">Release Date:</span>
                            <time class="meta-value" itemprop="datePublished" datetime="${game.releaseDate ? game.releaseDate.toISOString().split('T')[0] : ''}">
                                ${game.getFormattedReleaseDate()}
                            </time>
                        </div>
                        <div class="game-genre">
                            <span class="meta-label">Genre:</span>
                            <span class="meta-value" itemprop="genre">${this.escapeHtml(game.getGenreString())}</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-rating-section" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                    <div class="rating-display">
                        <div class="rating-stars" aria-label="Rating: ${game.rating} out of 5 stars">
                            ${ratingStars}
                        </div>
                        <div class="rating-text">
                            <span class="rating-value" itemprop="ratingValue">${game.rating}</span>/5
                            <span class="rating-count">(<span itemprop="reviewCount">${game.reviewCount}</span> reviews)</span>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    /**
     * Render screenshots gallery section
     * @param {Game} game - Game object
     * @returns {string} HTML string for screenshots gallery
     */
    renderScreenshotsGallery(game) {
        if (!game.hasScreenshots()) {
            return `
                <section class="game-image-section">
                    <div class="main-image-container">
                        <img class="main-game-image lazy-load" 
                             data-src="${game.thumbnail}"
                             alt="${this.escapeHtml(game.title)} thumbnail"
                             itemprop="image"
                             loading="lazy">
                    </div>
                </section>
            `;
        }
        
        const mainImage = game.screenshots[this.currentScreenshotIndex];
        const thumbnails = game.screenshots.map((screenshot, index) => `
            <button class="screenshot-thumbnail ${index === this.currentScreenshotIndex ? 'active' : ''}"
                    data-index="${index}"
                    aria-label="View screenshot ${index + 1}">
                <img class="lazy-load" 
                     data-src="${screenshot}"
                     alt="${this.escapeHtml(game.title)} screenshot ${index + 1}"
                     loading="lazy">
            </button>
        `).join('');
        
        return `
            <section class="game-screenshots-section">
                <div class="main-screenshot-container">
                    <img class="main-screenshot lazy-load" 
                         data-src="${mainImage}"
                         alt="${this.escapeHtml(game.title)} screenshot ${this.currentScreenshotIndex + 1}"
                         itemprop="image"
                         loading="lazy">
                    
                    ${game.screenshots.length > 1 ? `
                        <button class="screenshot-nav-btn prev" 
                                data-direction="prev"
                                aria-label="Previous screenshot">
                            ‹
                        </button>
                        <button class="screenshot-nav-btn next" 
                                data-direction="next"
                                aria-label="Next screenshot">
                            ›
                        </button>
                    ` : ''}
                </div>
                
                ${game.screenshots.length > 1 ? `
                    <div class="screenshot-thumbnails" data-lazy-content>
                        ${thumbnails}
                    </div>
                ` : ''}
            </section>
        `;
    }

    /**
     * Render game information section
     * @param {Game} game - Game object
     * @returns {string} HTML string for game info
     */
    renderGameInfo(game) {
        const tags = game.tags.map(tag => `
            <span class="game-tag">${this.escapeHtml(tag)}</span>
        `).join('');
        
        return `
            <section class="game-info-section">
                <div class="game-description">
                    <h2>About This Game</h2>
                    <div class="description-content" itemprop="description">
                        ${this.formatDescription(game.fullDescription)}
                    </div>
                </div>
                
                ${game.tags.length > 0 ? `
                    <div class="game-tags">
                        <h3>Tags</h3>
                        <div class="tags-container">
                            ${tags}
                        </div>
                    </div>
                ` : ''}
            </section>
        `;
    }

    /**
     * Render system requirements section
     * @param {Game} game - Game object
     * @returns {string} HTML string for system requirements
     */
    renderSystemRequirements(game) {
        if (!game.systemRequirements || 
            (!game.systemRequirements.minimum && !game.systemRequirements.recommended)) {
            return '';
        }
        
        return `
            <section class="system-requirements-section">
                <h2>System Requirements</h2>
                <div class="requirements-container">
                    ${game.systemRequirements.minimum ? `
                        <div class="requirements-column">
                            <h3>Minimum Requirements</h3>
                            <div class="requirements-content">
                                ${this.formatSystemRequirements(game.systemRequirements.minimum)}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${game.systemRequirements.recommended ? `
                        <div class="requirements-column">
                            <h3>Recommended Requirements</h3>
                            <div class="requirements-content">
                                ${this.formatSystemRequirements(game.systemRequirements.recommended)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }

    /**
     * Render download links section
     * @param {Game} game - Game object
     * @returns {string} HTML string for download links
     */
    renderDownloadLinks(game) {
        if (game.downloadLinks.length === 0 && !game.officialWebsite) {
            return '';
        }
        
        const downloadLinks = game.downloadLinks.map(link => `
            <a href="${link.url}" 
               class="download-link external-link"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="Download from ${link.platform}">
                <span class="platform-name">${this.escapeHtml(link.platform)}</span>
                <span class="link-icon">↗</span>
            </a>
        `).join('');
        
        return `
            <section class="download-links-section">
                <h2>Get This Game</h2>
                <div class="links-container">
                    ${game.officialWebsite ? `
                        <a href="${game.officialWebsite}" 
                           class="official-website-link external-link"
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="Visit official website">
                            <span class="link-text">Official Website</span>
                            <span class="link-icon">↗</span>
                        </a>
                    ` : ''}
                    
                    ${downloadLinks}
                </div>
            </section>
        `;
    }

    /**
     * Render social sharing section
     * @param {Game} game - Game object
     * @returns {string} HTML string for social sharing
     */
    renderSocialSharing(game) {
        const gameUrl = encodeURIComponent(window.location.href);
        const gameTitle = encodeURIComponent(game.title);
        const gameDescription = encodeURIComponent(game.description);
        
        return `
            <section class="social-sharing-section">
                <h3>Share This Game</h3>
                <div class="social-buttons">
                    <button class="social-share-btn twitter" 
                            data-platform="twitter"
                            aria-label="Share on Twitter">
                        <span class="social-icon">🐦</span>
                        <span class="social-text">Twitter</span>
                    </button>
                    
                    <button class="social-share-btn facebook" 
                            data-platform="facebook"
                            aria-label="Share on Facebook">
                        <span class="social-icon">📘</span>
                        <span class="social-text">Facebook</span>
                    </button>
                    
                    <button class="social-share-btn reddit" 
                            data-platform="reddit"
                            aria-label="Share on Reddit">
                        <span class="social-icon">🔴</span>
                        <span class="social-text">Reddit</span>
                    </button>
                    
                    <button class="social-share-btn copy-link" 
                            data-platform="copy"
                            aria-label="Copy link">
                        <span class="social-icon">🔗</span>
                        <span class="social-text">Copy Link</span>
                    </button>
                </div>
            </section>
        `;
    }

    /**
     * Navigate through screenshots
     * @param {string} direction - 'prev' or 'next'
     */
    navigateScreenshots(direction) {
        if (!this.currentGame || !this.currentGame.hasScreenshots()) return;
        
        const totalScreenshots = this.currentGame.screenshots.length;
        
        if (direction === 'prev') {
            this.currentScreenshotIndex = (this.currentScreenshotIndex - 1 + totalScreenshots) % totalScreenshots;
        } else if (direction === 'next') {
            this.currentScreenshotIndex = (this.currentScreenshotIndex + 1) % totalScreenshots;
        }
        
        this.updateScreenshotDisplay();
    }

    /**
     * Show specific screenshot by index
     * @param {number} index - Screenshot index
     */
    showScreenshot(index) {
        if (!this.currentGame || !this.currentGame.hasScreenshots()) return;
        
        if (index >= 0 && index < this.currentGame.screenshots.length) {
            this.currentScreenshotIndex = index;
            this.updateScreenshotDisplay();
        }
    }

    /**
     * Update screenshot display without full re-render
     */
    updateScreenshotDisplay() {
        const mainScreenshot = this.container.querySelector('.main-screenshot');
        const thumbnails = this.container.querySelectorAll('.screenshot-thumbnail');
        
        if (mainScreenshot && this.currentGame) {
            const newImage = this.currentGame.screenshots[this.currentScreenshotIndex];
            mainScreenshot.src = newImage;
            mainScreenshot.alt = `${this.currentGame.title} screenshot ${this.currentScreenshotIndex + 1}`;
        }
        
        // Update thumbnail active states
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === this.currentScreenshotIndex);
        });
    }

    /**
     * Handle external link clicks
     * @param {string} url - URL to open
     */
    handleExternalLink(url) {
        if (url && url.startsWith('http')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * Handle social sharing
     * @param {string} platform - Social platform name
     */
    handleSocialShare(platform) {
        if (!this.currentGame) return;
        
        const gameUrl = encodeURIComponent(window.location.href);
        const gameTitle = encodeURIComponent(this.currentGame.title);
        const gameDescription = encodeURIComponent(this.currentGame.description);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=Check out ${gameTitle}&url=${gameUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${gameUrl}`;
                break;
            case 'reddit':
                shareUrl = `https://reddit.com/submit?url=${gameUrl}&title=${gameTitle}`;
                break;
            case 'copy':
                this.copyToClipboard(window.location.href);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
        }
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess();
        } catch (error) {
            console.warn('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (error) {
            console.error('Fallback copy failed:', error);
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show copy success feedback
     */
    showCopySuccess() {
        const copyBtn = this.container.querySelector('.social-share-btn.copy-link .social-text');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }
    }

    /**
     * Handle back to list navigation
     */
    handleBackToList() {
        // Navigate back to game list
        window.location.hash = '';
        
        // Trigger custom event for routing system
        window.dispatchEvent(new CustomEvent('backToList'));
    }

    /**
     * Update page metadata for SEO
     * @param {Game} game - Game object
     */
    updatePageMetadata(game) {
        document.title = `${game.title} - Game Hub`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = game.description;
        }
        
        // Update Open Graph tags
        this.updateOpenGraphTags(game);
    }

    /**
     * Update Open Graph meta tags for social sharing
     * @param {Game} game - Game object
     */
    updateOpenGraphTags(game) {
        const ogTags = {
            'og:title': game.title,
            'og:description': game.description,
            'og:image': game.getPrimaryImage(),
            'og:url': window.location.href,
            'og:type': 'website'
        };
        
        Object.entries(ogTags).forEach(([property, content]) => {
            let metaTag = document.querySelector(`meta[property="${property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', property);
                document.head.appendChild(metaTag);
            }
            metaTag.content = content;
        });
    }

    /**
     * Format description text with paragraphs
     * @param {string} description - Description text
     * @returns {string} Formatted HTML
     */
    formatDescription(description) {
        if (!description) return '';
        
        return description
            .split('\n\n')
            .map(paragraph => `<p>${this.escapeHtml(paragraph.trim())}</p>`)
            .join('');
    }

    /**
     * Format system requirements text
     * @param {string} requirements - Requirements text
     * @returns {string} Formatted HTML
     */
    formatSystemRequirements(requirements) {
        if (!requirements) return '';
        
        return requirements
            .split(',')
            .map(req => `<div class="requirement-item">${this.escapeHtml(req.trim())}</div>`)
            .join('');
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
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if (this.lazyLoadManager) {
            // Use the advanced lazy loading manager
            this.lazyLoadManager.lazyLoadImages(this.container);
            this.lazyLoadManager.lazyLoadContent(this.container);
        } else {
            // Fallback to simple lazy loading
            const lazyImages = this.container.querySelectorAll('img[loading="lazy"], .lazy-load');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy-load');
                                img.removeAttribute('data-src');
                            }
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                lazyImages.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for browsers without IntersectionObserver
                lazyImages.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-load');
                        img.removeAttribute('data-src');
                    }
                });
            }
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="loading game-detail-loading" role="status" aria-live="polite">
                <div class="loading-spinner"></div>
                <p>Loading game details...</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-state game-detail-error" role="alert">
                <h3>Oops! Something went wrong</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="btn retry-btn back-to-list-btn">
                    ← Back to Games
                </button>
            </div>
        `;
    }

    /**
     * Show game not found state
     * @param {string} gameId - ID of the game that wasn't found
     */
    showGameNotFound(gameId) {
        this.container.innerHTML = `
            <div class="error-state game-not-found" role="alert">
                <h3>Game Not Found</h3>
                <p>The game you're looking for doesn't exist or may have been removed.</p>
                <button class="btn back-to-list-btn">
                    ← Back to Games
                </button>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameDetailView;
}