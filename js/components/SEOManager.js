/**
 * SEOManager - Handles SEO optimization including meta tags and structured data
 */
class SEOManager {
    constructor() {
        this.defaultMeta = {
            title: 'Game Hub - Latest Game Reviews & Recommendations',
            description: 'Discover the best games with our comprehensive reviews and ratings. Your ultimate destination for game reviews and recommendations.',
            keywords: 'games, reviews, gaming, indie games, game ratings, game recommendations',
            author: 'Game Hub Team'
        };
        
        this.siteUrl = window.location.origin;
        this.siteName = 'Game Hub';
    }

    /**
     * Update page meta tags dynamically
     * @param {Object} meta - Meta tag data
     * @param {string} meta.title - Page title
     * @param {string} meta.description - Page description
     * @param {string} meta.keywords - Page keywords
     * @param {string} meta.url - Canonical URL
     * @param {string} meta.image - Open Graph image
     */
    updatePageMeta(meta = {}) {
        const pageTitle = meta.title || this.defaultMeta.title;
        const pageDescription = meta.description || this.defaultMeta.description;
        const pageKeywords = meta.keywords || this.defaultMeta.keywords;
        const canonicalUrl = meta.url || window.location.href;
        const ogImage = meta.image || `${this.siteUrl}/images/og-default.jpg`;

        // Update document title
        document.title = pageTitle;

        // Update or create meta tags
        this.updateMetaTag('description', pageDescription);
        this.updateMetaTag('keywords', pageKeywords);
        this.updateMetaTag('author', this.defaultMeta.author);

        // Open Graph meta tags
        this.updateMetaProperty('og:title', pageTitle);
        this.updateMetaProperty('og:description', pageDescription);
        this.updateMetaProperty('og:url', canonicalUrl);
        this.updateMetaProperty('og:image', ogImage);
        this.updateMetaProperty('og:type', 'website');
        this.updateMetaProperty('og:site_name', this.siteName);

        // Twitter Card meta tags
        this.updateMetaProperty('twitter:card', 'summary_large_image');
        this.updateMetaProperty('twitter:title', pageTitle);
        this.updateMetaProperty('twitter:description', pageDescription);
        this.updateMetaProperty('twitter:image', ogImage);

        // Canonical URL
        this.updateCanonicalUrl(canonicalUrl);
    }

    /**
     * Update or create a meta tag
     * @param {string} name - Meta tag name
     * @param {string} content - Meta tag content
     */
    updateMetaTag(name, content) {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = name;
            document.head.appendChild(metaTag);
        }
        metaTag.content = content;
    }

    /**
     * Update or create a meta property tag
     * @param {string} property - Meta property name
     * @param {string} content - Meta property content
     */
    updateMetaProperty(property, content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('property', property);
            document.head.appendChild(metaTag);
        }
        metaTag.content = content;
    }

    /**
     * Update canonical URL
     * @param {string} url - Canonical URL
     */
    updateCanonicalUrl(url) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = url;
    }

    /**
     * Generate structured data for a game
     * @param {Object} game - Game object
     * @returns {Object} JSON-LD structured data
     */
    generateGameStructuredData(game) {
        return {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": game.title,
            "description": game.description,
            "genre": Array.isArray(game.genre) ? game.genre : [game.genre],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": game.rating,
                "bestRating": 5,
                "worstRating": 1,
                "reviewCount": game.reviewCount || 0
            },
            "offers": game.downloadLinks ? game.downloadLinks.map(link => ({
                "@type": "Offer",
                "url": link.url,
                "seller": {
                    "@type": "Organization",
                    "name": link.platform
                }
            })) : [],
            "developer": game.developer ? {
                "@type": "Organization",
                "name": game.developer
            } : undefined,
            "datePublished": game.releaseDate,
            "image": game.thumbnail ? `${this.siteUrl}/${game.thumbnail}` : undefined,
            "url": `${this.siteUrl}/game/${game.id}`,
            "sameAs": game.officialWebsite ? [game.officialWebsite] : []
        };
    }

    /**
     * Generate structured data for the game listing page
     * @param {Array} games - Array of game objects
     * @returns {Object} JSON-LD structured data
     */
    generateGameListStructuredData(games) {
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Game Reviews and Recommendations",
            "description": "Comprehensive list of game reviews with ratings and recommendations",
            "url": `${this.siteUrl}/`,
            "numberOfItems": games.length,
            "itemListElement": games.slice(0, 20).map((game, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "VideoGame",
                    "name": game.title,
                    "url": `${this.siteUrl}/game/${game.id}`,
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": game.rating,
                        "bestRating": 5
                    }
                }
            }))
        };
    }

    /**
     * Add structured data to the page
     * @param {Object} structuredData - JSON-LD structured data
     */
    addStructuredData(structuredData) {
        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }

    /**
     * Update SEO for game detail page
     * @param {Object} game - Game object
     */
    updateGamePageSEO(game) {
        const gameTitle = `${game.title} - Game Review & Rating | ${this.siteName}`;
        const gameDescription = `${game.description} Rating: ${game.rating}/5. Read our comprehensive review and find download links.`;
        const gameKeywords = `${game.title}, ${game.genre.join(', ')}, game review, ${game.developer || 'indie game'}`;
        const gameUrl = `${this.siteUrl}/game/${game.id}`;
        const gameImage = game.thumbnail ? `${this.siteUrl}/${game.thumbnail}` : undefined;

        // Update meta tags
        this.updatePageMeta({
            title: gameTitle,
            description: gameDescription,
            keywords: gameKeywords,
            url: gameUrl,
            image: gameImage
        });

        // Add game structured data
        const structuredData = this.generateGameStructuredData(game);
        this.addStructuredData(structuredData);
    }

    /**
     * Update SEO for game list page
     * @param {Array} games - Array of game objects
     * @param {string} searchQuery - Current search query (optional)
     * @param {string} genre - Current genre filter (optional)
     */
    updateGameListSEO(games, searchQuery = '', genre = '') {
        let pageTitle = this.defaultMeta.title;
        let pageDescription = this.defaultMeta.description;
        let pageKeywords = this.defaultMeta.keywords;

        // Customize for search results
        if (searchQuery) {
            pageTitle = `Search Results for "${searchQuery}" | ${this.siteName}`;
            pageDescription = `Find games matching "${searchQuery}". Browse our collection of ${games.length} games with reviews and ratings.`;
            pageKeywords = `${searchQuery}, game search, ${this.defaultMeta.keywords}`;
        }

        // Customize for genre filter
        if (genre && !searchQuery) {
            pageTitle = `${genre} Games - Reviews & Ratings | ${this.siteName}`;
            pageDescription = `Discover the best ${genre} games with our comprehensive reviews and ratings. Browse ${games.length} ${genre} games.`;
            pageKeywords = `${genre} games, ${genre}, ${this.defaultMeta.keywords}`;
        }

        // Update meta tags
        this.updatePageMeta({
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            url: window.location.href
        });

        // Add game list structured data
        if (games.length > 0) {
            const structuredData = this.generateGameListStructuredData(games);
            this.addStructuredData(structuredData);
        }
    }

    /**
     * Initialize default SEO settings
     */
    init() {
        // Set default meta tags if not already present
        this.updatePageMeta();
        
        // Add website structured data
        const websiteStructuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.siteName,
            "url": this.siteUrl,
            "description": this.defaultMeta.description,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.siteUrl}/?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
        
        this.addStructuredData(websiteStructuredData);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOManager;
}