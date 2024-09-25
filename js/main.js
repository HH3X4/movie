const API_KEY = '8391e2d3dbcc1df8d4716820aee5fdc4';
const BASE_URL = 'https://api.themoviedb.org/3';
// Helper function to fetch data from TMDb
async function fetchFromTMDb(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Failed to fetch data from TMDb');
}
// Load home page content
async function loadHomePage() {
    try {
        const popularMovies = await fetchFromTMDb('movie/popular');
        const genres = await fetchFromTMDb('genre/movie/list');
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <!-- Featured Banner -->
            <section class="banner" style="background-image: url('https://image.tmdb.org/t/p/original${popularMovies.results[0].backdrop_path}')">
                <div class="banner-content">
                    <h1>${popularMovies.results[0].title}</h1>
                    <p>${popularMovies.results[0].overview}</p>
                    <a href="#" class="play-button" onclick="loadMovieDetail(${popularMovies.results[0].id})">Watch Now</a>
                </div>
            </section>
            <!-- Filters -->
            <section class="filters">
                <div class="filter-container">
                    <button id="filter-toggle" class="filter-toggle">Filters <i class="fas fa-filter"></i></button>
                    <form id="filter-form" class="filter-form">
                        <div class="filter-group">
                            <label for="genre">Genre:</label>
                            <select name="genre" id="genre">
                                <option value="">All Genres</option>
                                ${genres.genres.map(genre => `<option value="${genre.id}">${genre.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="year">Year:</label>
                            <select name="year" id="year">
                                <option value="">All Years</option>
                                ${Array.from({length: 124}, (_, i) => 2023 - i).map(year => `<option value="${year}">${year}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="filter-submit">Apply Filters</button>
                    </form>
                </div>
            </section>
            <!-- Popular Movies Carousel -->
            <section class="movie-carousel">
                <h2>Popular Movies</h2>
                <div class="movie-list">
                    ${popularMovies.results.map(movie => `
                        <div class="movie-card">
                            <a href="#" onclick="loadMovieDetail(${movie.id})">
                                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                                <div class="movie-info">
                                    <h3>${movie.title}</h3>
                                                <p>${movie.release_date}</p>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error loading home page:', error);
    }
}
// Load movie detail page
async function loadMovieDetail(movieId) {
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="movie-detail-container">
                <div class="movie-detail-img">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="movie-detail-content">
                    <h1>${movie.title}</h1>
                    <p class="movie-meta">${movie.release_date} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}</p>
                    <div class="movie-rating">
                        <span class="star-icon">★</span>
                        <span class="rating-value">${movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div class="movie-description">
                        <p>${movie.overview}</p>
                    </div>
                    <a href="#" class="play-button" onclick="loadPlayer(${movie.id})">Watch Now</a>
                    <button class="watchlist-button" onclick="toggleWatchlist(${movie.id})">
                        ${isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading movie detail:', error);
    }
}
// Load player page
function loadPlayer(movieId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="fullscreen-player-container">
            <div class="fullscreen-player">
                <iframe src="https://moviesapi.club/movie/${movieId}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;

    const iframe = mainContent.querySelector('iframe');
    iframe.addEventListener('load', function() {
        try {
            const iframeWindow = iframe.contentWindow;
            
            // Attempt to override navigation methods
            if (iframeWindow.location.href.startsWith('https://moviesapi.club')) {
                iframeWindow.history.pushState = function() {
                    // Do nothing to prevent navigation
                };
                iframeWindow.history.replaceState = function() {
                    // Do nothing to prevent navigation
                };
                iframeWindow.onbeforeunload = function(e) {
                    e.preventDefault();
                    return e.returnValue = "Are you sure you want to exit?";
                };
            }
        } catch (error) {
            console.error('Error setting up iframe navigation prevention:', error);
        }
    });
}
// Search functionality
async function performSearch(query) {
    try {
        const searchResults = await fetchFromTMDb('search/movie', { query: query });
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="search-results">
                <h1>Search Results for "${query}"</h1>
                <div class="movies-grid">
                    ${searchResults.results.map(movie => `
                        <div class="movie-card">
                            <a href="#" onclick="loadMovieDetail(${movie.id})">
                                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                                <div class="movie-info">
                                    <h3>${movie.title}</h3>
                                    <p>${movie.release_date}</p>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error performing search:', error);
    }
}
// Watchlist functionality
function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="watchlist-container">
            <h1>My Watchlist</h1>
            <div class="movies-grid">
                ${watchlist.map(movie => `
                    <div class="movie-card">
                        <a href="#" onclick="loadMovieDetail(${movie.id})">
                            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                            <div class="movie-info">
                                <h3>${movie.title}</h3>
                                <p>${movie.release_date}</p>
                            </div>
                        </a>
                        <button class="remove-button" onclick="toggleWatchlist(${movie.id})">Remove</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
function isInWatchlist(movieId) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    return watchlist.some(movie => movie.id === movieId);
}
async function toggleWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const isAlreadyInWatchlist = watchlist.some(movie => movie.id === movieId);
    if (isAlreadyInWatchlist) {
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert('Movie removed from watchlist!');
    } else {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        watchlist.push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert('Movie added to watchlist!');
    }
    // Refresh the current page
    if (document.querySelector('.watchlist-container')) {
        loadWatchlist();
    } else {
        loadMovieDetail(movieId);
    }
}
// Set up event listeners
function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = e.target.elements.query.value;
        performSearch(query);
    });
    const filterToggle = document.getElementById('filter-toggle');
    const filterForm = document.getElementById('filter-form');
    filterToggle.addEventListener('click', () => {
        filterForm.classList.toggle('active');
        filterToggle.textContent = filterForm.classList.contains('active') ? 'Hide Filters' : 'Show Filters';
    });
    // Add more event listeners as needed
}
// Initialize the application
function init() {
    loadHomePage();
}
// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
