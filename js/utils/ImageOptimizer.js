// ImageOptimizer - Utility for client-side image optimization
class ImageOptimizer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.webpSupported = null;
    }

    // Check if WebP is supported
    async checkWebPSupport() {
        if (this.webpSupported !== null) {
            return this.webpSupported;
        }

        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.webpSupported = webP.height === 2;
                resolve(this.webpSupported);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Generate responsive image URLs
    generateResponsiveImageUrls(baseUrl, sizes = [320, 640, 768, 1024, 1200]) {
        const extension = baseUrl.split('.').pop().toLowerCase();
        const baseName = baseUrl.replace(`.${extension}`, '');
        
        return sizes.map(size => ({
            url: `${baseName}_${size}w.${extension}`,
            width: size,
            descriptor: `${size}w`
        }));
    }

    // Create srcset string for responsive images
    createSrcSet(baseUrl, sizes) {
        const imageUrls = this.generateResponsiveImageUrls(baseUrl, sizes);
        return imageUrls.map(img => `${img.url} ${img.descriptor}`).join(', ');
    }

    // Get optimal image format based on browser support
    async getOptimalFormat(originalUrl) {
        const webpSupported = await this.checkWebPSupport();
        
        if (webpSupported) {
            // Convert extension to WebP
            return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return originalUrl;
    }

    // Compress image client-side (for user uploads)
    compressImage(file, quality = 0.8, maxWidth = 1200, maxHeight = 800) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = this.calculateDimensions(
                    img.width, 
                    img.height, 
                    maxWidth, 
                    maxHeight
                );

                // Set canvas dimensions
                this.canvas.width = width;
                this.canvas.height = height;

                // Draw and compress
                this.ctx.drawImage(img, 0, 0, width, height);
                
                this.canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Calculate optimal dimensions maintaining aspect ratio
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // Scale down if necessary
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    // Create placeholder image data URL
    createPlaceholder(width, height, color = '#f0f0f0') {
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, width, height);
        
        return this.canvas.toDataURL();
    }

    // Create blur placeholder from image
    createBlurPlaceholder(imageUrl, blurAmount = 10) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const smallWidth = 40;
                const smallHeight = (img.height / img.width) * smallWidth;
                
                this.canvas.width = smallWidth;
                this.canvas.height = smallHeight;
                
                // Draw small version
                this.ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
                
                // Apply blur effect
                this.ctx.filter = `blur(${blurAmount}px)`;
                this.ctx.drawImage(this.canvas, 0, 0);
                
                resolve(this.canvas.toDataURL());
            };
            
            img.src = imageUrl;
        });
    }

    // Optimize image loading with intersection observer
    optimizeImageLoading(images) {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without intersection observer
            images.forEach(img => this.loadImage(img));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        images.forEach(img => observer.observe(img));
    }

    // Load image with optimization
    async loadImage(img) {
        const originalSrc = img.dataset.src || img.src;
        
        try {
            // Get optimal format
            const optimizedSrc = await this.getOptimalFormat(originalSrc);
            
            // Create new image to preload
            const newImg = new Image();
            
            newImg.onload = () => {
                img.src = optimizedSrc;
                img.classList.remove('lazy-load');
                img.classList.add('loaded');
            };
            
            newImg.onerror = () => {
                // Fallback to original if optimized version fails
                img.src = originalSrc;
                img.classList.remove('lazy-load');
                img.classList.add('loaded');
            };
            
            newImg.src = optimizedSrc;
            
        } catch (error) {
            // Fallback to original image
            img.src = originalSrc;
            img.classList.remove('lazy-load');
            img.classList.add('loaded');
        }
    }

    // Add responsive image attributes
    makeImageResponsive(img, sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw') {
        const originalSrc = img.src || img.dataset.src;
        
        if (originalSrc) {
            const srcset = this.createSrcSet(originalSrc, [320, 640, 768, 1024, 1200]);
            img.srcset = srcset;
            img.sizes = sizes;
        }
    }

    // Preload critical images
    preloadImages(imageUrls) {
        imageUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // Clean up resources
    destroy() {
        this.canvas = null;
        this.ctx = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}