# How to add the embed script to your site

Use this guide to install the AACA auto-fix script and confirm it is working. The same steps are linked from the Script Setup page in the dashboard.

## Before you start
- Find your **site ID or embed key** in the dashboard under Script Setup.
- Decide which environments to enable: production, staging, or both.
- Ensure you can edit the `<head>` of your site or publish a tag manager snippet.

## Install the script
1. Copy the script snippet from the dashboard. It will look like:
   ```html
   <script src="https://cdn.aaca.com/autofix.js" data-site-id="YOUR_SITE_ID" defer></script>
   ```
2. Paste it before the closing `</head>` tag of every page you want covered.
3. Publish or deploy your site as usual.

### Tag manager option
- Add a new custom HTML tag with the snippet above.
- Fire it on all page views for the domains connected to your AACA site.

## Verify it works
- Open your page and press **Tab** to move through the page. You should see a visible focus outline and, if missing, a “Skip to main content” link at the top.
- Check a page with images. If alt text was missing, the script applies short AI-generated descriptions.
- If you block network requests, the script should fail gracefully without breaking the page.

## Common questions
- **Will this change my design?** The script makes minimal, reversible CSS adjustments (focus outlines and contrast tweaks) and does not rewrite your layout.
- **Do I still need code fixes?** Yes. The script helps quickly, but you should still fix issues in code for performance and long-term compliance.
- **Where can I learn more?** Read the FAQ entry "How does the AI auto-fix script work?" on the marketing site and the report-reading guide for tips on prioritizing fixes.
