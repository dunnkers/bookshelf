import handlebars from 'handlebars';
import { readFileSync, writeFileSync } from 'fs';

// Load a template
var template = readFileSync('src/index.hbs', 'utf8');

const SHELVES_FILE = process.env.SHELVES_FILE || 'data/shelves.json';

function sortBooks(books) {
    const dateCmp = (a, b) => (a < b) - (a > b); // stackoverflow q492994
    books = books.sort((a, b) => {
        if (a.read_at && b.read_at) {// has read_at data
            return dateCmp(new Date(a.read_at), new Date(b.read_at));
        }

        return 0;
    });
    return books
}

// Load data, fetched beforehand by `ruby scripts/fetch_shelves.rb`
const shelf = JSON.parse(readFileSync(SHELVES_FILE, 'utf8'));

const current = sortBooks(shelf.current.books)
const read = sortBooks(shelf.read.books)
const today = new Date();
const todayString = today.toDateString();
const todayTime = today.toTimeString();
const year = today.getFullYear();

// Compile said template
var compiled = handlebars.compile(template);
var html = compiled({
    PUBLIC_URL: process.env.PUBLIC_URL || "",
    year,
    current,
    read,
    todayString,
    todayTime
});

// Write HTML file
writeFileSync('build/index.html', html);
