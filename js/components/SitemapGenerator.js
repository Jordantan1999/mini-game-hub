/**
 * SitemapGenerator - Generates XML sitemap dynamically based on game data
 */
class SitemapGenerator {
    constructor(baseUrl = 'https://yourdomain.com') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    /**
     * Generate complete XML sitemap
     * @param {Array} games - Array of game objects
     * @returns {string} XML sitemap content
     */
    generateSitemap(games) {
        const urls = [];
        
        // Add homepage
        urls.push(this.createUrlEntry('/', 1.0, 'weekly'));
        
        // Add game detail pages
        games.forEach(game => {
            urls.push(this.createUrlEntry(`/game/${game.id}`, 0.8, 'monthly'));
        });
        
        // Add genre pages (extract unique genres from games)
        const genres = this.extractUniqueGenres(games);
        genres.forEach(genre => {
            urls.push(this.createUrlEntry(`/?genre=${encodeURIComponent(genre)}`, 0.7, 'weekly'));
        });
        
        return this.wrapInXmlStructure(urls);
    }

    /**
     * Create a URL entry for the sitemap
     * @param {string} path - URL path
     * @param {number} priority - Priority (0.0 to 1.0)
     * @param {string} changefreq - Change frequency
     * @returns {string} XML URL entry
     */
    createUrlEntry(path, priority, changefreq) {
        const fullUrl = `${this.baseUrl}${path}`;
        return `  <url>
    <loc>${this.escapeXml(fullUrl)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${this.currentDate}</lastmod>
  </url>`;
    }

    /**
     * Extract unique genres from games array
     * @param {Array} games - Array of game objects
     * @returns {Array} Array of unique genre strings
     */
    extractUniqueGenres(games) {
        const genreSet = new Set();
        games.forEach(game => {
            if (Array.isArray(game.genre)) {
                game.genre.forEach(g => genreSet.add(g));
            } else if (game.genre) {
                genreSet.add(game.genre);
            }
        });
        return Array.from(genreSet).sort();
    }

    /**
     * Wrap URL entries in XML structure
     * @param {Array} urls - Array of URL entry strings
     * @returns {string} Complete XML sitemap
     */
    wrapInXmlStructure(urls) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
    }

    /**
     * Escape XML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Generate and download sitemap file (for development/testing)
     * @param {Array} games - Array of game objects
     */
    downloadSitemap(games) {
        const sitemapContent = this.generateSitemap(games);
        const blob = new Blob([sitemapContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Log sitemap to console (for development/testing)
     * @param {Array} games - Array of game objects
     */
    logSitemap(games) {
        const sitemapContent = this.generateSitemap(games);
        console.log('Generated Sitemap:');
        console.log(sitemapContent);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SitemapGenerator;
}