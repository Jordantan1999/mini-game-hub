/**
 * AnalyticsManager - Handles Google Analytics 4 integration and event tracking
 */
class AnalyticsManager {
    constructor(measurementId = 'G-XXXXXXXXXX') {
        this.measurementId = measurementId;
        this.isInitialized = false;
        this.debugMode = false; // Set to true for development
    }

    /**
     * Initialize Google Analytics 4
     */
    init() {
        if (this.isInitialized) {
            console.warn('Analytics already initialized');
            return;
        }

        try {
            // Load Google Analytics script
            this.loadGtagScript();
            
            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                dataLayer.push(arguments);
            };
            
            // Configure Google Analytics
            gtag('js', new Date());
            gtag('config', this.measurementId, {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true
            });

            this.isInitialized = true;
            
            if (this.debugMode) {
                console.log('Google Analytics initialized with ID:', this.measurementId);
            }
        } catch (error) {
            console.error('Failed to initialize Google Analytics:', error);
        }
    }

    /**
     * Load Google Analytics script
     */
    loadGtagScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);
    }

    /**
     * Track page view
     * @param {string} pageTitle - Page title
     * @param {string} pagePath - Page path
     */
    trackPageView(pageTitle, pagePath) {
        if (!this.isInitialized) {
            console.warn('Analytics not initialized');
            return;
        }

        try {
            gtag('config', this.measurementId, {
                page_title: pageTitle,
                page_path: pagePath,
                page_location: window.location.origin + pagePath
            });

            if (this.debugMode) {
                console.log('Page view tracked:', { pageTitle, pagePath });
            }
        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    }

    /**
     * Track custom event
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) {
            console.warn('Analytics not initialized');
            return;
        }

        try {
            gtag('event', eventName, parameters);

            if (this.debugMode) {
                console.log('Event tracked:', eventName, parameters);
            }
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Track game view event
     * @param {Object} game - Game object
     */
    trackGameView(game) {
        this.trackEvent('view_item', {
            item_id: game.id,
            item_name: game.title,
            item_category: game.genre ? game.genre[0] : 'Unknown',
            item_category2: game.genre ? game.genre.join(', ') : 'Unknown',
            value: game.rating || 0,
            currency: 'USD' // For potential future monetization tracking
        });
    }

    /**
     * Track search event
     * @param {string} searchTerm - Search query
     * @param {number} resultCount - Number of results
     */
    trackSearch(searchTerm, resultCount = 0) {
        this.trackEvent('search', {
            search_term: searchTerm,
            result_count: resultCount
        });
    }

    /**
     * Track filter usage
     * @param {string} filterType - Type of filter (genre, rating, etc.)
     * @param {string} filterValue - Filter value
     * @param {number} resultCount - Number of results after filtering
     */
    trackFilter(filterType, filterValue, resultCount = 0) {
        this.trackEvent('filter_games', {
            filter_type: filterType,
            filter_value: filterValue,
            result_count: resultCount
        });
    }

    /**
     * Track external link clicks
     * @param {string} url - External URL
     * @param {string} linkType - Type of link (download, official_site, etc.)
     * @param {string} gameId - Game ID (if applicable)
     */
    trackExternalLink(url, linkType, gameId = null) {
        this.trackEvent('click_external_link', {
            link_url: url,
            link_type: linkType,
            game_id: gameId,
            outbound: true
        });
    }

    /**
     * Track social share events
     * @param {string} platform - Social platform (twitter, facebook, etc.)
     * @param {string} gameId - Game ID
     * @param {string} gameTitle - Game title
     */
    trackSocialShare(platform, gameId, gameTitle) {
        this.trackEvent('share', {
            method: platform,
            content_type: 'game',
            item_id: gameId,
            item_name: gameTitle
        });
    }

    /**
     * Track pagination events
     * @param {number} pageNumber - Page number
     * @param {number} totalPages - Total number of pages
     */
    trackPagination(pageNumber, totalPages) {
        this.trackEvent('pagination_click', {
            page_number: pageNumber,
            total_pages: totalPages
        });
    }

    /**
     * Track ad interaction events
     * @param {string} adUnit - Ad unit identifier
     * @param {string} action - Action type (view, click, etc.)
     */
    trackAdInteraction(adUnit, action) {
        this.trackEvent('ad_interaction', {
            ad_unit: adUnit,
            action: action
        });
    }

    /**
     * Track user engagement time
     * @param {number} timeSpent - Time spent in seconds
     * @param {string} pageType - Type of page (home, game_detail, etc.)
     */
    trackEngagement(timeSpent, pageType) {
        this.trackEvent('user_engagement', {
            engagement_time_msec: timeSpent * 1000,
            page_type: pageType
        });
    }

    /**
     * Track performance metrics
     * @param {Object} metrics - Performance metrics object
     */
    trackPerformance(metrics) {
        this.trackEvent('page_performance', {
            page_load_time: metrics.loadTime || 0,
            dom_content_loaded: metrics.domContentLoaded || 0,
            first_contentful_paint: metrics.firstContentfulPaint || 0
        });
    }

    /**
     * Set user properties
     * @param {Object} properties - User properties
     */
    setUserProperties(properties) {
        if (!this.isInitialized) {
            console.warn('Analytics not initialized');
            return;
        }

        try {
            gtag('config', this.measurementId, {
                custom_map: properties
            });

            if (this.debugMode) {
                console.log('User properties set:', properties);
            }
        } catch (error) {
            console.error('Failed to set user properties:', error);
        }
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('Analytics debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
    }

    /**
     * Track page timing automatically
     */
    trackPageTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.trackPerformance({
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                    });
                }
            }, 1000);
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        let maxScroll = 0;
        let scrollTimer = null;

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }

            // Clear existing timer
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }

            // Set new timer to track scroll depth after user stops scrolling
            scrollTimer = setTimeout(() => {
                if (maxScroll >= 25 && maxScroll < 50) {
                    this.trackEvent('scroll_depth', { depth: '25%' });
                } else if (maxScroll >= 50 && maxScroll < 75) {
                    this.trackEvent('scroll_depth', { depth: '50%' });
                } else if (maxScroll >= 75 && maxScroll < 90) {
                    this.trackEvent('scroll_depth', { depth: '75%' });
                } else if (maxScroll >= 90) {
                    this.trackEvent('scroll_depth', { depth: '90%' });
                }
            }, 500);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}