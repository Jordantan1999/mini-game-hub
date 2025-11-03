# Custom Domain and SSL Setup Guide

This guide explains how to configure a custom domain with SSL for your GitHub Pages game listing website.

## Prerequisites

- A registered domain name
- Access to your domain's DNS settings
- GitHub repository with Pages enabled

## Step 1: Configure DNS Settings

### For Root Domain (example.com)
Add these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @  
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### For Subdomain (www.example.com or games.example.com)
Add this DNS record:

```
Type: CNAME
Name: www (or your preferred subdomain)
Value: yourusername.github.io
```

## Step 2: Update CNAME File

1. Edit the `CNAME` file in your repository root
2. Replace `yourgamedomain.com` with your actual domain
3. Commit and push the changes

## Step 3: Enable GitHub Pages with Custom Domain

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Custom domain", enter your domain name
4. Check "Enforce HTTPS" (this may take a few minutes to become available)
5. Save the settings

## Step 4: Verify SSL Certificate

After DNS propagation (can take up to 24 hours):

1. GitHub will automatically provision an SSL certificate
2. The "Enforce HTTPS" option will become available
3. Your site will be accessible via `https://yourdomain.com`

## Step 5: Google Search Console Setup

For better SEO and site monitoring:

1. Add your site to Google Search Console
2. Verify ownership using the HTML file method or DNS TXT record
3. Submit your sitemap for better search indexing

## Troubleshooting

### DNS Propagation Issues
- Use tools like `dig` or online DNS checkers to verify propagation
- DNS changes can take up to 48 hours to fully propagate

### SSL Certificate Issues
- Ensure DNS is properly configured before enabling HTTPS
- Try disabling and re-enabling the custom domain in GitHub Pages settings
- Contact GitHub Support if SSL provisioning fails after 24 hours

### SEO Requirements
- Domain must be fully functional with HTTPS
- Site must have substantial content for good search rankings
- Custom domain provides better SEO benefits

## Testing Your Setup

1. Visit your custom domain in a browser
2. Verify HTTPS is working (look for the lock icon)
3. Test all site functionality
4. Check that donation links work correctly
5. Verify Google Analytics tracking is working

## Security Considerations

- Always use HTTPS for better SEO and security
- Keep your domain registrar account secure
- Monitor your site for any security issues
- Regularly update your DNS records if needed