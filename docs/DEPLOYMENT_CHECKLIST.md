# Deployment Checklist

Use this checklist to ensure your game listing website is properly deployed and functioning on GitHub Pages.

## Pre-Deployment Checklist

### Repository Setup
- [ ] Repository is public (required for GitHub Pages free tier)
- [ ] All code is committed and pushed to main branch
- [ ] GitHub Actions workflow file exists (`.github/workflows/deploy.yml`)
- [ ] CNAME file contains your custom domain (if using custom domain)

### Content Verification
- [ ] `index.html` exists in repository root
- [ ] `games.json` contains valid game data
- [ ] All CSS and JavaScript files are properly linked
- [ ] Images are optimized and properly referenced
- [ ] `robots.txt` and `sitemap.xml` are present

### Configuration Files
- [ ] PayPal donation links are properly configured
- [ ] Google Analytics tracking ID is set
- [ ] SEO meta tags are implemented
- [ ] Structured data (JSON-LD) is included

## Deployment Process

### GitHub Pages Setup
- [ ] Go to repository Settings → Pages
- [ ] Set source to "Deploy from a branch" or "GitHub Actions"
- [ ] Select main branch as source
- [ ] Save settings and wait for initial deployment

### Custom Domain Configuration (if applicable)
- [ ] DNS records are configured at domain registrar
- [ ] CNAME file contains correct domain name
- [ ] Domain is added in GitHub Pages settings
- [ ] "Enforce HTTPS" is enabled (after SSL certificate is provisioned)

### GitHub Actions Verification
- [ ] Workflow runs successfully on push to main branch
- [ ] No errors in Actions tab
- [ ] Site deploys automatically on code changes

## Post-Deployment Testing

### Basic Functionality
- [ ] Site loads at GitHub Pages URL (username.github.io/repository-name)
- [ ] Site loads at custom domain (if configured)
- [ ] HTTPS is working (green lock icon in browser)
- [ ] All pages are accessible
- [ ] Navigation works correctly

### Game Listing Features
- [ ] Games load and display correctly
- [ ] Search functionality works
- [ ] Genre filtering works
- [ ] Pagination works (if applicable)
- [ ] Game detail pages load correctly
- [ ] External links work and open in new tabs

### Responsive Design
- [ ] Site works on mobile devices
- [ ] Site works on tablets
- [ ] Site works on desktop
- [ ] Touch interactions work on mobile
- [ ] Text is readable on all screen sizes

### Performance
- [ ] Page loads in under 3 seconds
- [ ] Images load properly (including lazy loading)
- [ ] No JavaScript errors in browser console
- [ ] Lighthouse performance score > 80
- [ ] Core Web Vitals are in good range

### SEO and Analytics
- [ ] Page titles are descriptive and unique
- [ ] Meta descriptions are present
- [ ] Open Graph tags work (test with social media debuggers)
- [ ] Structured data validates (use Google's Rich Results Test)
- [ ] Google Analytics tracking works
- [ ] Site appears in Google Search Console

### Donation Integration
- [ ] PayPal donation links are present on pages
- [ ] Donation buttons work correctly
- [ ] Links open in new tabs with proper security attributes
- [ ] Donation sections are responsive on different screen sizes

### Security and Compliance
- [ ] All external links use `rel="noopener noreferrer"`
- [ ] No mixed content warnings (HTTP resources on HTTPS pages)
- [ ] Content Security Policy headers are appropriate
- [ ] Privacy policy is accessible (if required)

## Troubleshooting Common Issues

### Deployment Failures
- [ ] Check GitHub Actions logs for errors
- [ ] Verify all file paths are correct (case-sensitive)
- [ ] Ensure no large files exceed GitHub's limits
- [ ] Check for syntax errors in HTML/CSS/JavaScript

### Custom Domain Issues
- [ ] Verify DNS propagation (use dig or online tools)
- [ ] Check CNAME file format (single line, no protocol)
- [ ] Ensure domain is not already in use by another GitHub Pages site
- [ ] Wait up to 24 hours for SSL certificate provisioning

### Performance Issues
- [ ] Optimize images (use WebP format with fallbacks)
- [ ] Minify CSS and JavaScript files
- [ ] Enable compression for text-based files
- [ ] Implement proper caching headers

### Donation Issues
- [ ] Ensure PayPal links are correctly formatted
- [ ] Check that donation buttons are visible and accessible
- [ ] Verify links work across different browsers
- [ ] Test donation flow on mobile devices

## Monitoring and Maintenance

### Regular Checks
- [ ] Monitor site uptime and performance
- [ ] Check Google Analytics for traffic patterns
- [ ] Monitor donation activity and user engagement
- [ ] Monitor for broken links or errors
- [ ] Keep game data updated

### Updates and Improvements
- [ ] Regularly update game information
- [ ] Add new games to the database
- [ ] Monitor and improve Core Web Vitals
- [ ] Update SEO meta tags as needed
- [ ] Respond to user feedback and issues

## Emergency Procedures

### Site Down
1. Check GitHub Pages status page
2. Verify repository settings
3. Check GitHub Actions for failed deployments
4. Review recent commits for breaking changes
5. Rollback to last working commit if necessary

### Performance Issues
1. Run Lighthouse audit to identify issues
2. Check for large files or slow-loading resources
3. Verify CDN and caching are working
4. Monitor server response times

### Donation Link Issues
1. Verify PayPal link format and parameters
2. Check that links work in different browsers
3. Test mobile responsiveness of donation buttons
4. Monitor ad performance and earnings

---

**Note**: Keep this checklist updated as your site evolves and new requirements emerge. Regular testing ensures your game listing website continues to provide a great user experience and generates optimal ad revenue.