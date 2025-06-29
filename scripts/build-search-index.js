const fs = require('fs');
const lunr = require('lunr');
const path = require('path');

// Read the research database
const database = JSON.parse(fs.readFileSync('research-database.json', 'utf8'));

// Build Lunr search index
const idx = lunr(function () {
  this.ref('id');
  this.field('title', { boost: 10 });
  this.field('authors', { boost: 5 });
  this.field('abstract', { boost: 3 });
  this.field('journal', { boost: 2 });
  this.field('tags');
  
  // Add documents
  database.papers.forEach(paper => {
    this.add({
      id: paper.id,
      title: paper.title,
      authors: paper.authors.join(' '),
      abstract: paper.abstract,
      journal: paper.journal,
      tags: paper.tags.join(' ')
    });
  });
});

// Save the pre-built index
const searchData = {
  index: idx,
  papers: database.papers
};

fs.writeFileSync('search-index.json', JSON.stringify(searchData), 'utf8');
console.log('✅ Search index built successfully!');