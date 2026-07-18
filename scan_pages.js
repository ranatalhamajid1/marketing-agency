const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function getFiles(dir, files_ = []) {
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = path.join(dir, files[i]);
        if (fs.statSync(name).isDirectory()) {
            if (!name.includes('.git') && !name.includes('node_modules') && !name.includes('blog-cluade')) {
                getFiles(name, files_);
            }
        } else {
            if (name.endsWith('.html')) {
                files_.push(name);
            }
        }
    }
    return files_;
}

const htmlFiles = getFiles(rootDir);
const results = [];

htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
    
    // Title
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'No Title';
    
    // Description
    const descMatch = content.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) || 
                       content.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);
    const description = descMatch ? descMatch[1] : 'No Description';
    
    // Canonical
    const canonicalMatch = content.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ||
                           content.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'No Canonical';
    
    // Schema
    const hasSchema = content.includes('application/ld+json');
    
    // Word Count (strip HTML tags and count words)
    const bodyMatch = content.match(/<body[^>]*>([\s\S]+)<\/body>/i);
    let bodyText = bodyMatch ? bodyMatch[1] : content;
    // Strip scripts and styles
    bodyText = bodyText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    bodyText = bodyText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Strip tags
    bodyText = bodyText.replace(/<[^>]+>/g, ' ');
    // Strip extra whitespace
    bodyText = bodyText.replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    
    // Links
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"/gi;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        links.push(match[1]);
    }
    
    const internalLinks = links.filter(l => !l.startsWith('http') && !l.startsWith('//') && !l.startsWith('mailto') && !l.startsWith('tel') && !l.startsWith('#'));
    const externalLinks = links.filter(l => l.startsWith('http') || l.startsWith('//'));
    const anchorLinks = links.filter(l => l.startsWith('#'));
    
    // Cookie Consent banner
    const hasCookieConsent = content.includes('id="cookie-consent"') || content.includes('cookie-consent');
    
    // H1 tags
    const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    const h1s = h1Match ? h1Match.map(h => h.replace(/<[^>]+>/g, '').trim()) : [];

    results.push({
        relativePath,
        title,
        description,
        canonical,
        hasSchema,
        wordCount,
        internalLinksCount: internalLinks.length,
        externalLinksCount: externalLinks.length,
        anchorLinksCount: anchorLinks.length,
        hasCookieConsent,
        h1s
    });
});

fs.writeFileSync(
    path.join(rootDir, 'scan_results.json'),
    JSON.stringify(results, null, 2)
);

console.log(`Scanned ${results.length} files. Saved to scan_results.json.`);
