// bookshelf-ghost-admin-update.mjs
// Usage: node ghost_version/bookshelf-ghost-admin-update.mjs
// Requires env vars: GHOST_ADMIN_API_KEY, GHOST_API_URL (e.g. http://localhost:2368), BOOKS_API_URL

import GhostAdminAPI from '@tryghost/admin-api';
import fetch from 'node-fetch';
import fs from 'fs';
import handlebars from 'handlebars';

const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;
const GHOST_API_URL = process.env.GHOST_API_URL || 'http://localhost:2368';
const BOOKS_API_URL = process.env.BOOKS_API_URL || 'https://europe-west1-dunnkers-bookshelf.cloudfunctions.net/goodreads-api';
const PAGE_SLUG = 'books';

function sortBooks(books) {
    return books.sort((a, b) => {
        if (a.read_at && b.read_at) {
            return new Date(a.read_at) - new Date(b.read_at);
        }
        return 0;
    });
}

function normalizeBook(bookObj) {
    const book = bookObj.book || bookObj;
    return {
        image_url: book.image_url || book.small_image_url || "https://via.placeholder.com/120x180?text=No+Cover",
        title: book.title || "Untitled",
        link: book.link || "#",
        author: (book.authors && book.authors.author)
            ? (Array.isArray(book.authors.author)
                ? book.authors.author.map(a => a.name).filter(Boolean).join(", ")
                : (book.authors.author.name || ""))
            : ""
    };
}

async function main() {
    // 1. Fetch bookshelf data
    const shelfResp = await fetch(BOOKS_API_URL + '/?bust=false');
    const shelf = await shelfResp.json();
    const current = sortBooks(shelf.current.books).map(normalizeBook);
    const read = sortBooks(shelf.read.books).map(normalizeBook);

    // 2. Render HTML from handlebars template
    const hbsTemplate = fs.readFileSync('ghost_version/bookshelf-bookshelf.hbs', 'utf8');
    const compiled = handlebars.compile(hbsTemplate);
    const bookshelfHTML = compiled({ current, read });

    // 3. Read CSS and prepare for codeinjection_head
    const cssContent = fs.readFileSync('ghost_version/bookshelf-bookshelf.css', 'utf8');
    const jsContent = fs.readFileSync('ghost_version/bookshelf-shelfify.js', 'utf8');
    const bookshelfScript = `\n<script>\n${jsContent}\n</script>\n`;
    const codeinjection_head = `<style>\n${cssContent}\n</style>${bookshelfScript}`;

    // 4. Connect to Ghost Admin API
    const api = new GhostAdminAPI({
        url: GHOST_API_URL,
        key: GHOST_ADMIN_API_KEY,
        version: 'v5.0'
    });


    // 5. Find or create the page by slug
    let page;
    const pages = await api.pages.browse({filter: `slug:${PAGE_SLUG}`});
    if (!pages.length) {
        // Create the page if it doesn't exist
        page = await api.pages.add({
            title: 'Bookshelf',
            slug: PAGE_SLUG,
            html: bookshelfHTML,
            codeinjection_head: codeinjection_head,
            status: 'published',
            custom_template: 'custom-bookshelf'
        }, { source: 'html' }); // Tell the API to use HTML as the content source
        console.log(`Created new page '${PAGE_SLUG}' with bookshelf content and CSS.`);
        return;
    } else if (pages.length > 1) {
        throw new Error(`Multiple pages found with slug '${PAGE_SLUG}', please ensure there is only one.`);
    } else {
        console.log(`Found page '${PAGE_SLUG}' with ID '${pages[0].id}'.`);
        page = pages[0];
    }

    // 6. Update the page's HTML and codeinjection_head
    await api.pages.edit({
        id: page.id,
        html: bookshelfHTML,
        codeinjection_head: codeinjection_head,
        updated_at: page.updated_at, // Use the current value from the API
        custom_template: 'custom-bookshelf'
    }, { source: 'html' }); // Tell the API to use HTML as the content source
    console.log(`Updated page '${PAGE_SLUG}' with bookshelf content and CSS.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
