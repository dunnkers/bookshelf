import fetch from 'node-fetch';
import handlebars from 'handlebars';
import { readFileSync, writeFileSync } from 'fs';

// Load a template
var template = readFileSync('src/index.hbs', 'utf8');


const API_URL = "https://europe-west1-dunnkers-bookshelf.cloudfunctions.net/goodreads-api";

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

// Load data
fetch(`${API_URL}/?bust=false`)
    .then((response) => response.json())
    .then((shelf) => {
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
    });
