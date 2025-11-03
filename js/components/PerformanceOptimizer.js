// PerformanceOptimizer - Handles performance optimizations and Core Web Vitals
class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null
        };
        this.observers = [];
        this.init();
    }

    init() {
        this.setupPerformanceObservers();
        this.optimizeImages();
        this.optimizeScripts();
        this.optimizeFonts();
        this.setupResourceHints();
        this.monitorCoreWebVitals();
    }

    // Setup performance observers for Core Web Vitals
    setupPerformanceObservers() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.startTime;
                    this.reportMetric('LCP', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(lcpObserver);
            } catch (e) {
                console.warn('LCP observer not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        this.reportMetric('FID', this.metrics.fid);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.push(fidObserver);
            } catch (e) {
                console.warn('FID observer not supported');
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.metrics.cls = clsValue;
                    this.reportMetric('CLS', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(clsObserver);
            } catch (e) {
                console.warn('CLS observer not supported');
            }

            // First Contentful Paint (FCP)
            try {
                const fcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.fcp = entry.startTime;
                            this.reportMetric('FCP', entry.startTime);
                        }
                    });
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(fcpObserver);
            } catch (e) {
                console.warn('FCP observer not supported');
            }
        }
    }

    // Report metrics to analytics
    reportMetric(name, value) {
        // Report to Google Analytics if available
        if (window.gtag) {
            gtag('event', name, {
                event_category: 'Web Vitals',
                value: Math.round(value),
                non_interaction: true
            });
        }

        // Log for debugging
        console.log(`${name}: ${Math.round(value)}ms`);
    }

    // Optimize images for better performance
    optimizeImages() {
        // Add WebP support detection and fallbacks
        this.addWebPSupport();
        
        // Optimize image loading
        this.optimizeImageLoading();
        
        // Add responsive image sizing
        this.addResponsiveImages();
    }

    // Add WebP support with fallbacks
    addWebPSupport() {
        // Check WebP support
        const webpSupported = this.checkWebPSupport();
        
        if (webpSupported) {
            document.documentElement.classList.add('webp-supported');
        } else {
            document.documentElement.classList.add('webp-not-supported');
        }
    }

    // Check if browser supports WebP
    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Optimize image loading strategies
    optimizeImageLoading() {
        // Preload critical images
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src || img.dataset.src;
            document.head.appendChild(link);
        });

        // Add loading="lazy" to non-critical images
        const images = document.querySelectorAll('img:not([data-critical]):not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }

    // Add responsive image sizing
    addResponsiveImages() {
        const images = document.querySelectorAll('img[data-responsive]');
        images.forEach(img => {
            const baseSrc = img.dataset.src || img.src;
            const sizes = img.dataset.sizes || '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw';
            
            // Generate srcset for different screen sizes
            const srcset = this.generateSrcSet(baseSrc);
            if (srcset) {
                img.srcset = srcset;
                img.sizes = sizes;
            }
        });
    }

    // Generate srcset for responsive images
    generateSrcSet(baseSrc) {
        // This would typically be handled by your image processing pipeline
        // For now, we'll assume different sizes are available
        const sizes = [320, 640, 768, 1024, 1200];
        return sizes.map(size => {
            const optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, `_${size}w.$1`);
            return `${optimizedSrc} ${size}w`;
        }).join(', ');
    }

    // Optimize script loading
    optimizeScripts() {
        // Defer non-critical scripts
        this.deferNonCriticalScripts();
        
        // Preload critical scripts
        this.preloadCriticalScripts();
        
        // Add script loading strategies
        this.optimizeScriptLoading();
    }

    // Defer non-critical scripts
    deferNonCriticalScripts() {
        const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
        nonCriticalScripts.forEach(script => {
            script.defer = true;
        });
    }

    // Preload critical scripts
    preloadCriticalScripts() {
        const criticalScripts = [
            'js/components/GameDataManager.js',
            'js/components/GameListView.js'
        ];

        criticalScripts.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Optimize script loading strategies
    optimizeScriptLoading() {
        // Load scripts based on user interaction
        this.loadScriptsOnInteraction();
        
        // Load scripts based on viewport
        this.loadScriptsOnViewport();
    }

    // Load scripts when user interacts with the page
    loadScriptsOnInteraction() {
        const interactionEvents = ['click', 'touchstart', 'keydown'];
        const scriptsToLoad = document.querySelectorAll('script[data-load-on-interaction]');
        
        if (scriptsToLoad.length === 0) return;

        const loadScripts = () => {
            scriptsToLoad.forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.dataset.src;
                newScript.async = true;
                document.head.appendChild(newScript);
            });
            
            // Remove event listeners after loading
            interactionEvents.forEach(event => {
                document.removeEventListener(event, loadScripts, { passive: true });
            });
        };

        interactionEvents.forEach(event => {
            document.addEventListener(event, loadScripts, { passive: true });
        });
    }

    // Load scripts when they come into viewport
    loadScriptsOnViewport() {
        const scriptsToLoad = document.querySelectorAll('script[data-load-on-viewport]');
        
        if (scriptsToLoad.length === 0 || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const script = entry.target;
                    const newScript = document.createElement('script');
                    newScript.src = script.dataset.src;
                    newScript.async = true;
                    document.head.appendChild(newScript);
                    observer.unobserve(script);
                }
            });
        });

        scriptsToLoad.forEach(script => observer.observe(script));
    }

    // Optimize font loading
    optimizeFonts() {
        // Preload critical fonts
        this.preloadCriticalFonts();
        
        // Add font-display: swap for better performance
        this.addFontDisplaySwap();
    }

    // Preload critical fonts
    preloadCriticalFonts() {
        const criticalFonts = [
            // Add your critical font URLs here
            // 'fonts/roboto-regular.woff2',
            // 'fonts/roboto-bold.woff2'
        ];

        criticalFonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = fontUrl;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Add font-display: swap to CSS
    addFontDisplaySwap() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup resource hints for better performance
    setupResourceHints() {
        // DNS prefetch for external domains
        this.addDNSPrefetch();
        
        // Preconnect to critical origins
        this.addPreconnect();
    }

    // Add DNS prefetch for external domains
    addDNSPrefetch() {
        const externalDomains = [
            'https://www.googletagmanager.com',
            'https://pagead2.googlesyndication.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    // Add preconnect to critical origins
    addPreconnect() {
        const criticalOrigins = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        criticalOrigins.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Monitor Core Web Vitals and provide recommendations
    monitorCoreWebVitals() {
        // Wait for page load to complete
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.analyzePerformance();
            }, 3000);
        });
    }

    // Analyze performance and provide recommendations
    analyzePerformance() {
        const recommendations = [];

        // Check LCP
        if (this.metrics.lcp > 2500) {
            recommendations.push('LCP is slow. Consider optimizing images and reducing server response time.');
        }

        // Check FID
        if (this.metrics.fid > 100) {
            recommendations.push('FID is slow. Consider reducing JavaScript execution time.');
        }

        // Check CLS
        if (this.metrics.cls > 0.1) {
            recommendations.push('CLS is high. Ensure images and ads have defined dimensions.');
        }

        // Log recommendations
        if (recommendations.length > 0) {
            console.group('Performance Recommendations:');
            recommendations.forEach(rec => console.log(`• ${rec}`));
            console.groupEnd();
        }

        // Report overall performance score
        this.calculatePerformanceScore();
    }

    // Calculate overall performance score
    calculatePerformanceScore() {
        let score = 100;

        // Deduct points based on metrics
        if (this.metrics.lcp > 2500) score -= 20;
        else if (this.metrics.lcp > 1200) score -= 10;

        if (this.metrics.fid > 100) score -= 20;
        else if (this.metrics.fid > 50) score -= 10;

        if (this.metrics.cls > 0.25) score -= 20;
        else if (this.metrics.cls > 0.1) score -= 10;

        console.log(`Performance Score: ${Math.max(0, score)}/100`);
        
        // Report to analytics
        if (window.gtag) {
            gtag('event', 'performance_score', {
                event_category: 'Performance',
                value: Math.max(0, score),
                non_interaction: true
            });
        }
    }

    // Optimize CSS delivery
    optimizeCSS() {
        // Inline critical CSS
        this.inlineCriticalCSS();
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
    }

    // Inline critical CSS (above-the-fold styles)
    inlineCriticalCSS() {
        const criticalCSS = `
            /* Critical CSS for above-the-fold content */
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; }
            .header { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            .hero { text-align: center; padding: 2rem 0; }
            .loading { text-align: center; padding: 3rem; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }

    // Defer non-critical CSS
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
        
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
        });
    }

    // Cleanup observers
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
    }

    // Get current performance metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Static method to check if Performance API is supported
    static isSupported() {
        return 'performance' in window && 'PerformanceObserver' in window;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}