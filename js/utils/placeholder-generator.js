/**
 * Placeholder Image Generator
 * Creates SVG placeholder images for games when actual images are not available
 */
class PlaceholderGenerator {
    static generateGameThumbnail(gameTitle, width = 300, height = 200) {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const initials = gameTitle.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
        
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${randomColor};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${this.darkenColor(randomColor, 20)};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)" rx="8"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
                      text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.9">
                    ${initials}
                </text>
                <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="14" font-weight="normal" 
                      text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.7">
                    ${gameTitle}
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    static generateScreenshot(gameTitle, width = 400, height = 300) {
        const patterns = [
            'dots', 'grid', 'diagonal', 'waves'
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const baseColor = '#2c3e50';
        const accentColor = '#3498db';
        
        let patternDef = '';
        let patternFill = '';
        
        switch (pattern) {
            case 'dots':
                patternDef = `
                    <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="${accentColor}" opacity="0.3"/>
                    </pattern>
                `;
                patternFill = 'url(#pattern)';
                break;
            case 'grid':
                patternDef = `
                    <pattern id="pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>
                    </pattern>
                `;
                patternFill = 'url(#pattern)';
                break;
            case 'diagonal':
                patternDef = `
                    <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 0 20 L 20 0" stroke="${accentColor}" stroke-width="2" opacity="0.3"/>
                    </pattern>
                `;
                patternFill = 'url(#pattern)';
                break;
            default:
                patternFill = baseColor;
        }
        
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    ${patternDef}
                </defs>
                <rect width="100%" height="100%" fill="${baseColor}"/>
                <rect width="100%" height="100%" fill="${patternFill}"/>
                <rect x="20" y="20" width="${width - 40}" height="${height - 40}" 
                      fill="none" stroke="${accentColor}" stroke-width="2" rx="8" opacity="0.5"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
                      text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.8">
                    ${gameTitle}
                </text>
                <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="12" font-weight="normal" 
                      text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.6">
                    Screenshot
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    static darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaceholderGenerator;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.PlaceholderGenerator = PlaceholderGenerator;
}