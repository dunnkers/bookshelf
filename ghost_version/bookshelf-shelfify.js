// bookshelf-shelfify.js
// This script wraps all <figure> siblings after each <h2> in .single-content in a .shelf div

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.single-content h2').forEach(function(header) {
    let figures = [];
    let next = header.nextElementSibling;
    while (next && next.tagName && next.tagName.toLowerCase() === 'figure') {
      figures.push(next);
      next = next.nextElementSibling;
    }
    if (figures.length > 0) {
      const shelfDiv = document.createElement('div');
      shelfDiv.className = 'shelf kg-width-wide';
      // Save the parent before moving figures
      const parent = figures[0].parentNode;
      figures.forEach(fig => shelfDiv.appendChild(fig));
      // Only insert if parent still contains the reference node
      if (parent && parent.contains(header)) {
        parent.insertBefore(shelfDiv, next || null);
      }
    }
  });
});
