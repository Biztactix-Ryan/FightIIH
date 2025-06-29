# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **FightIIH** - a static educational website about Idiopathic Intracranial Hypertension (IIH). The site provides comprehensive information about IIH symptoms, diagnosis, treatment, and includes a searchable research database.

## Development Commands

### Build & Development
- `npm run build` - Builds the Lunr.js search index from research-database.json
- `npm run serve` - Starts local development server on port 8000 using Python's built-in server
- `python -m http.server 8000` - Alternative way to serve the site locally

### Dependencies
- **lunr**: Full-text search library for the research database
- **gray-matter**: YAML front matter parser (currently unused but available)

## Architecture & Key Components

### Core Structure
- **Static HTML Site**: Multi-page website with shared navigation and styling
- **Research Database**: JSON-based searchable database of IIH research papers
- **Search System**: Dual search engines (Lunr.js and Fuse.js) for different search experiences

### Key Files
- `research-database.json` - Central database of IIH research papers with metadata
- `research-search.js` - Advanced search functionality with filters, timeline, and faceted search
- `scripts/build-search-index.js` - Generates Lunr.js search index for faster searches
- `script.js` - Global navigation, mobile menu, and UI animations
- `styles.css` - Global stylesheet with responsive design

### Search Implementation
The site implements two complementary search approaches:
1. **Lunr.js** (via build script): Pre-built index for fast full-text search
2. **Fuse.js** (client-side): Real-time fuzzy search with scoring and advanced filtering

### Research Database Schema
Each research paper entry includes:
- `id`, `title`, `authors`, `journal`, `year`, `month`
- `abstract`, `tags`, `category`
- Optional: `doi`, `pubmedId` for external links

### Page Structure
- `index.html` - Home page with simple/detailed explanations
- `about-iih.html` - Comprehensive IIH information
- `diagnosis.html` - Diagnostic information
- `research-search.html` - Interactive research database
- `specialists.html` - Directory of specialists
- `resources.html` - Support resources and links

## Development Patterns

### Search Features
- Real-time search with debouncing (300ms delay)
- Multi-faceted filtering (year, category, tags, date ranges)
- Interactive timeline visualization by month/year
- Relevance scoring and sorting options
- Tag-based filtering with visual feedback

### UI Patterns
- Mobile-first responsive design
- Animated hamburger navigation menu
- Intersection Observer for scroll-based animations
- Smooth scrolling for anchor links
- Active navigation highlighting based on scroll position

### Data Management
- Research data centralized in JSON format
- Search indices generated at build time
- Client-side filtering and sorting
- Dynamic statistics calculation

## Common Tasks

### Adding Research Papers
1. Edit `research-database.json` to add new papers
2. Run `npm run build` to regenerate search index
3. Test search functionality on research page

### Updating Search Functionality
- Main search logic in `research-search.js`
- Search index generation in `scripts/build-search-index.js`
- Consider both Lunr.js and Fuse.js implementations when making changes

### Styling Changes
- Global styles in `styles.css`
- Mobile-first approach with responsive breakpoints
- CSS Grid and Flexbox for layouts