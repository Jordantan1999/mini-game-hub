// AccessibilityManager - Handles accessibility features and ARIA labels
class AccessibilityManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupAccessibilityFeatures();
    }

    // Setup keyboard navigation for the entire application
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Handle focus trapping in modals or overlays
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    // Handle keyboard navigation events
    handleKeyboardNavigation(e) {
        const activeElement = document.activeElement;
        
        switch (e.key) {
            case 'Enter':
            case ' ':
                // Handle Enter and Space on clickable elements
                if (activeElement && this.isClickableElement(activeElement)) {
                    e.preventDefault();
                    activeElement.click();
                }
                break;
                
            case 'Escape':
                // Close modals, overlays, or return to main content
                this.handleEscapeKey();
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // Handle arrow key navigation in grids and lists
                this.handleArrowNavigation(e);
                break;
        }
    }

    // Check if element is clickable
    isClickableElement(element) {
        const clickableTypes = ['button', 'a', '[role="button"]', '[tabindex]'];
        return clickableTypes.some(selector => element.matches(selector)) ||
               element.classList.contains('game-card') ||
               element.classList.contains('pagination-btn');
    }

    // Handle escape key functionality
    handleEscapeKey() {
        // Close any open modals or overlays
        const modals = document.querySelectorAll('[role="dialog"]:not([hidden])');
        if (modals.length > 0) {
            modals[modals.length - 1].setAttribute('hidden', '');
            return;
        }

        // Return focus to main content if in detail view
        if (window.location.hash.startsWith('#game/')) {
            const backButton = document.querySelector('.back-to-list-btn');
            if (backButton) {
                backButton.click();
            }
        }
    }

    // Handle arrow key navigation in grids
    handleArrowNavigation(e) {
        const gameGrid = document.querySelector('.game-grid');
        if (!gameGrid || !gameGrid.contains(document.activeElement)) {
            return;
        }

        const gameCards = Array.from(gameGrid.querySelectorAll('.game-card'));
        const currentIndex = gameCards.indexOf(document.activeElement);
        
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        const gridColumns = this.getGridColumns();

        switch (e.key) {
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - gridColumns);
                break;
            case 'ArrowDown':
                newIndex = Math.min(gameCards.length - 1, currentIndex + gridColumns);
                break;
            case 'ArrowLeft':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                newIndex = Math.min(gameCards.length - 1, currentIndex + 1);
                break;
        }

        if (newIndex !== currentIndex) {
            e.preventDefault();
            gameCards[newIndex].focus();
        }
    }

    // Get current grid columns based on screen size
    getGridColumns() {
        const width = window.innerWidth;
        if (width >= 1200) return 5;
        if (width >= 1024) return 4;
        if (width >= 768) return 3;
        return 1;
    }

    // Handle tab navigation and focus trapping
    handleTabNavigation(e) {
        const modal = document.querySelector('[role="dialog"]:not([hidden])');
        if (modal) {
            this.trapFocusInModal(e, modal);
        }
    }

    // Trap focus within modal dialogs
    trapFocusInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Setup focus management
    setupFocusManagement() {
        // Add focus indicators for better visibility
        document.addEventListener('focusin', (e) => {
            this.handleFocusIn(e.target);
        });

        document.addEventListener('focusout', (e) => {
            this.handleFocusOut(e.target);
        });

        // Skip to main content link
        this.addSkipToMainContent();
    }

    // Handle focus in events
    handleFocusIn(element) {
        // Add visual focus indicator
        element.classList.add('focused');
        
        // Announce focus changes to screen readers for dynamic content
        if (element.classList.contains('game-card')) {
            this.announceToScreenReader(`Focused on game: ${element.getAttribute('aria-label')}`);
        }
    }

    // Handle focus out events
    handleFocusOut(element) {
        element.classList.remove('focused');
    }

    // Add skip to main content link
    addSkipToMainContent() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-main';
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('aria-label', 'Skip to main content');
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content') || 
                              document.querySelector('main') ||
                              document.querySelector('.game-grid');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Setup screen reader support
    setupScreenReaderSupport() {
        // Create live region for announcements
        this.createLiveRegion();
        
        // Setup dynamic content announcements
        this.setupDynamicContentAnnouncements();
    }

    // Create ARIA live region for screen reader announcements
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    // Announce messages to screen readers
    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Setup announcements for dynamic content changes
    setupDynamicContentAnnouncements() {
        // Announce page changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash.startsWith('#game/')) {
                this.announceToScreenReader('Loading game details');
            } else {
                this.announceToScreenReader('Showing game list');
            }
        });

        // Announce search results
        document.addEventListener('searchResultsUpdated', (e) => {
            const count = e.detail.count;
            const message = `Search updated. ${count} game${count !== 1 ? 's' : ''} found.`;
            this.announceToScreenReader(message);
        });

        // Announce pagination changes
        document.addEventListener('pageChanged', (e) => {
            const page = e.detail.page;
            const total = e.detail.totalPages;
            this.announceToScreenReader(`Page ${page} of ${total} loaded`);
        });
    }

    // Setup additional accessibility features
    setupAccessibilityFeatures() {
        // Add proper alt text to images without it
        this.ensureImageAltText();
        
        // Add ARIA labels to interactive elements
        this.addAriaLabels();
        
        // Setup high contrast mode detection
        this.setupHighContrastMode();
        
        // Setup reduced motion preferences
        this.setupReducedMotionPreferences();
    }

    // Ensure all images have proper alt text
    ensureImageAltText() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                // Try to derive alt text from context
                const gameCard = img.closest('.game-card');
                if (gameCard) {
                    const title = gameCard.querySelector('.card-title');
                    if (title) {
                        img.alt = `${title.textContent} thumbnail`;
                    }
                } else {
                    img.alt = 'Game image';
                }
            }
        });
    }

    // Add ARIA labels to interactive elements
    addAriaLabels() {
        // Add labels to buttons without text
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const context = this.getButtonContext(button);
                if (context) {
                    button.setAttribute('aria-label', context);
                }
            }
        });

        // Add labels to form inputs
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            if (!input.labels || input.labels.length === 0) {
                const placeholder = input.placeholder;
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
    }

    // Get context for button labeling
    getButtonContext(button) {
        if (button.classList.contains('pagination-btn')) {
            return `Go to page ${button.textContent}`;
        }
        if (button.classList.contains('screenshot-nav-btn')) {
            return button.classList.contains('prev') ? 'Previous screenshot' : 'Next screenshot';
        }
        if (button.classList.contains('back-to-list-btn')) {
            return 'Back to game list';
        }
        return null;
    }

    // Setup high contrast mode detection and support
    setupHighContrastMode() {
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            
            const handleHighContrast = (e) => {
                if (e.matches) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
            };

            highContrastQuery.addListener(handleHighContrast);
            handleHighContrast(highContrastQuery);
        }
    }

    // Setup reduced motion preferences
    setupReducedMotionPreferences() {
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            const handleReducedMotion = (e) => {
                if (e.matches) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                }
            };

            reducedMotionQuery.addListener(handleReducedMotion);
            handleReducedMotion(reducedMotionQuery);
        }
    }

    // Update accessibility features when content changes
    updateAccessibility(container = document) {
        this.ensureImageAltText();
        this.addAriaLabels();
        
        // Update focusable elements list
        this.updateFocusableElements(container);
    }

    // Update list of focusable elements
    updateFocusableElements(container) {
        this.focusableElements = Array.from(container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), .game-card'
        ));
    }

    // Focus management for single page app navigation
    manageFocusOnNavigation(targetElement) {
        if (targetElement) {
            // Set focus to the target element
            targetElement.focus();
            
            // If element is not naturally focusable, make it focusable temporarily
            if (!targetElement.matches('button, [href], input, select, textarea, [tabindex]')) {
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                
                // Remove tabindex after focus is moved elsewhere
                targetElement.addEventListener('blur', () => {
                    targetElement.removeAttribute('tabindex');
                }, { once: true });
            }
        }
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.remove();
        }
        
        const skipLink = document.querySelector('.skip-to-main');
        if (skipLink) {
            skipLink.remove();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}