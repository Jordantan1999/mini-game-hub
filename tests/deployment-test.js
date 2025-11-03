/**
 * Deployment Testing Script
 * Tests core functionality after GitHub Pages deployment
 */

class DeploymentTester {
    constructor() {
        this.testResults = [];
        this.errors = [];
    }

    async runAllTests() {
        console.log('🚀 Starting deployment tests...');
        
        await this.testPageLoad();
        await this.testGameDataLoading();
        await this.testSearchFunctionality();
        await this.testResponsiveDesign();

        await this.testAnalyticsTracking();
        await this.testSEOElements();
        await this.testPerformance();
        
        this.generateReport();
    }

    async testPageLoad() {
        try {
            console.log('📄 Testing page load...');
            
            // Test if main elements are present
            const gameGrid = document.getElementById('game-grid');
            const searchInput = document.getElementById('search-input');
            const header = document.querySelector('header');
            
            this.assert(gameGrid !== null, 'Game grid element exists');
            this.assert(searchInput !== null, 'Search input exists');
            this.assert(header !== null, 'Header element exists');
            
            // Test page title and meta tags
            this.assert(document.title.length > 0, 'Page title is set');
            this.assert(document.querySelector('meta[name="description"]') !== null, 'Meta description exists');
            
            this.testResults.push({ test: 'Page Load', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Page Load: ${error.message}`);
            this.testResults.push({ test: 'Page Load', status: 'FAIL', error: error.message });
        }
    }

    async testGameDataLoading() {
        try {
            console.log('🎮 Testing game data loading...');
            
            // Test if games are loaded
            const gameCards = document.querySelectorAll('.game-card');
            this.assert(gameCards.length > 0, 'Game cards are rendered');
            
            // Test if game data structure is correct
            const firstCard = gameCards[0];
            const title = firstCard.querySelector('.game-title');
            const thumbnail = firstCard.querySelector('.game-thumbnail');
            const rating = firstCard.querySelector('.game-rating');
            
            this.assert(title !== null, 'Game title element exists');
            this.assert(thumbnail !== null, 'Game thumbnail exists');
            this.assert(rating !== null, 'Game rating exists');
            
            this.testResults.push({ test: 'Game Data Loading', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Game Data Loading: ${error.message}`);
            this.testResults.push({ test: 'Game Data Loading', status: 'FAIL', error: error.message });
        }
    }

    async testSearchFunctionality() {
        try {
            console.log('🔍 Testing search functionality...');
            
            const searchInput = document.getElementById('search-input');
            const initialGameCount = document.querySelectorAll('.game-card').length;
            
            // Simulate search
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));
            
            // Wait for search to process
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Search should work (either filter results or show no results message)
            const afterSearchCount = document.querySelectorAll('.game-card').length;
            const noResultsMessage = document.querySelector('.no-results');
            
            this.assert(
                afterSearchCount !== initialGameCount || noResultsMessage !== null,
                'Search functionality is working'
            );
            
            // Clear search
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            
            this.testResults.push({ test: 'Search Functionality', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Search Functionality: ${error.message}`);
            this.testResults.push({ test: 'Search Functionality', status: 'FAIL', error: error.message });
        }
    }

    async testResponsiveDesign() {
        try {
            console.log('📱 Testing responsive design...');
            
            // Test viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            this.assert(viewportMeta !== null, 'Viewport meta tag exists');
            
            // Test CSS media queries (basic check)
            const gameGrid = document.getElementById('game-grid');
            const computedStyle = window.getComputedStyle(gameGrid);
            
            this.assert(computedStyle.display === 'grid', 'CSS Grid is being used');
            
            this.testResults.push({ test: 'Responsive Design', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Responsive Design: ${error.message}`);
            this.testResults.push({ test: 'Responsive Design', status: 'FAIL', error: error.message });
        }
    }



    async testAnalyticsTracking() {
        try {
            console.log('📊 Testing analytics tracking...');
            
            // Check for Google Analytics script
            const gaScript = document.querySelector('script[src*="googletagmanager.com"]') ||
                           document.querySelector('script[src*="google-analytics.com"]');
            
            // Check if gtag function exists
            this.assert(typeof window.gtag === 'function', 'Google Analytics gtag function exists');
            
            this.testResults.push({ test: 'Analytics Tracking', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Analytics Tracking: ${error.message}`);
            this.testResults.push({ test: 'Analytics Tracking', status: 'FAIL', error: error.message });
        }
    }

    async testSEOElements() {
        try {
            console.log('🔍 Testing SEO elements...');
            
            // Check essential SEO elements
            this.assert(document.title.length > 0, 'Page title exists');
            this.assert(document.querySelector('meta[name="description"]') !== null, 'Meta description exists');
            this.assert(document.querySelector('meta[name="keywords"]') !== null, 'Meta keywords exist');
            
            // Check Open Graph tags
            this.assert(document.querySelector('meta[property="og:title"]') !== null, 'OG title exists');
            this.assert(document.querySelector('meta[property="og:description"]') !== null, 'OG description exists');
            
            // Check structured data
            const structuredData = document.querySelector('script[type="application/ld+json"]');
            this.assert(structuredData !== null, 'Structured data exists');
            
            this.testResults.push({ test: 'SEO Elements', status: 'PASS' });
        } catch (error) {
            this.errors.push(`SEO Elements: ${error.message}`);
            this.testResults.push({ test: 'SEO Elements', status: 'FAIL', error: error.message });
        }
    }

    async testPerformance() {
        try {
            console.log('⚡ Testing performance...');
            
            // Basic performance checks
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.assert(loadTime < 5000, `Page load time under 5 seconds (${loadTime}ms)`);
            
            // Check for lazy loading
            const images = document.querySelectorAll('img[loading="lazy"]');
            this.assert(images.length > 0, 'Lazy loading is implemented');
            
            this.testResults.push({ test: 'Performance', status: 'PASS' });
        } catch (error) {
            this.errors.push(`Performance: ${error.message}`);
            this.testResults.push({ test: 'Performance', status: 'FAIL', error: error.message });
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    generateReport() {
        console.log('\n📋 DEPLOYMENT TEST REPORT');
        console.log('========================');
        
        const passedTests = this.testResults.filter(test => test.status === 'PASS').length;
        const totalTests = this.testResults.length;
        
        console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
        
        if (this.errors.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log('\n📊 Detailed Results:');
        this.testResults.forEach(test => {
            const icon = test.status === 'PASS' ? '✅' : '❌';
            console.log(`  ${icon} ${test.test}: ${test.status}`);
            if (test.error) {
                console.log(`     Error: ${test.error}`);
            }
        });
        
        // Store results for potential CI/CD integration
        window.deploymentTestResults = {
            passed: passedTests,
            total: totalTests,
            success: this.errors.length === 0,
            results: this.testResults,
            errors: this.errors
        };
        
        return window.deploymentTestResults;
    }
}

// Auto-run tests when page loads (for manual testing)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const tester = new DeploymentTester();
            tester.runAllTests();
        }, 2000); // Wait for page to fully initialize
    });
} else {
    setTimeout(() => {
        const tester = new DeploymentTester();
        tester.runAllTests();
    }, 2000);
}

// Export for manual testing
window.DeploymentTester = DeploymentTester;