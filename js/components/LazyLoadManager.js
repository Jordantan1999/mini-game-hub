// LazyLoadManager - Handles lazy loading for images and content
class LazyLoadManager {
    constructor() {
        this.imageObserver = null;
        this.contentObserver = null;
        this.loadedImages = new Set();
        this.loadedContent = new Set();
        this.init();
    }

    init() {
        // Initialize intersection observers for lazy loading
        this.setupImageObserver();
        this.setupContentObserver();
    }

    setupImageObserver() {
        // Create intersection observer for images
        const imageObserverOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, imageObserverOptions);
    }

    setupContentObserver() {
        // Create intersection observer for progressive content loading
        const contentObserverOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        this.contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target);
                    this.contentObserver.unobserve(entry.target);
                }
            });
        }, contentObserverOptions);
    }

    // Observe an image for lazy loading
    observeImage(img) {
        if (!img || this.loadedImages.has(img)) return;
        
        // Add loading placeholder
        img.classList.add('lazy-load');
        img.setAttribute('loading', 'lazy');
        
        // Store original src in data attribute
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            img.src = this.createPlaceholderDataURL(img.width || 300, img.height || 200);
        }
        
        this.imageObserver.observe(img);
    }

    // Observe content for progressive loading
    observeContent(element) {
        if (!element || this.loadedContent.has(element)) return;
        
        element.classList.add('lazy-content');
        this.contentObserver.observe(element);
    }

    // Load an image when it comes into view
    loadImage(img) {
        if (this.loadedImages.has(img)) return;

        const src = img.dataset.src;
        if (!src) return;

        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Image loaded successfully
            img.src = src;
            img.classList.remove('lazy-load');
            img.classList.add('lazy-loaded');
            this.loadedImages.add(img);
            
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            // Trigger fade-in
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        };
        
        imageLoader.onerror = () => {
            // Handle image load error
            img.classList.remove('lazy-load');
            img.classList.add('lazy-error');
            img.alt = 'Image failed to load';
            this.loadedImages.add(img);
        };
        
        // Start loading the image
        imageLoader.src = src;
    }

    // Load content when it comes into view
    loadContent(element) {
        if (this.loadedContent.has(element)) return;

        element.classList.remove('lazy-content');
        element.classList.add('lazy-content-loaded');
        this.loadedContent.add(element);

        // Trigger any custom loading logic
        const loadEvent = new CustomEvent('lazyContentLoaded', {
            detail: { element }
        });
        element.dispatchEvent(loadEvent);
    }

    // Create a placeholder data URL for images
    createPlaceholderDataURL(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(0.5, '#e0e0e0');
        gradient.addColorStop(1, '#f0f0f0');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        return canvas.toDataURL();
    }

    // Lazy load all images in a container
    lazyLoadImages(container = document) {
        const images = container.querySelectorAll('img[data-src], img[src]');
        images.forEach(img => this.observeImage(img));
    }

    // Lazy load all content in a container
    lazyLoadContent(container = document) {
        const contentElements = container.querySelectorAll('[data-lazy-content]');
        contentElements.forEach(element => this.observeContent(element));
    }

    // Preload critical images
    preloadCriticalImages(imageUrls) {
        imageUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // Clean up observers
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        this.loadedImages.clear();
        this.loadedContent.clear();
    }

    // Static method to check if intersection observer is supported
    static isSupported() {
        return 'IntersectionObserver' in window;
    }

    // Fallback for browsers without intersection observer support
    static fallbackLoad(container = document) {
        const images = container.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                img.classList.add('lazy-loaded');
            }
        });

        const contentElements = container.querySelectorAll('[data-lazy-content]');
        contentElements.forEach(element => {
            element.classList.remove('lazy-content');
            element.classList.add('lazy-content-loaded');
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoadManager;
}