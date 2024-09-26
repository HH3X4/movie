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
            <div class="home-container">
                <h1>Welcome to Hexa Flix</h1>
                <a href="#" onclick="loadMoviePage()" class="browse-movies-btn">Browse All Movies</a>
                <section class="movie-carousel">
                    <h2>Popular Movies</h2>
                    <div class="movie-list">
                        ${popularMovies.results.map(movie => `
                            <div class="movie-card">
                                <a href="#" onclick="loadMovieDetail(${movie.id})">
                                    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                                    <div class="movie-info">
                                        <h3>${movie.title}</h3>
                                        <p>${movie.release_date.split('-')[0]}</p>
                                    </div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
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
    
    checkAdBlocker().then(isAdBlockerActive => {
        if (isAdBlockerActive) {
            loadMoviePlayer(movieId);
        } else {
            mainContent.innerHTML = `
                <div class="adblock-notice">
                    <div class="adblock-content">
                        <h2>Enhance Your Viewing Experience</h2>
                        <p>We recommend using an ad blocker for the best streaming experience.</p>
                        <p>uBlock Origin is a free, efficient, and easy-to-use ad blocker.</p>
                        <div class="adblock-buttons">
                            <a href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm" target="_blank" class="adblock-install-btn">
                                <i class="fab fa-chrome"></i> Install for Chrome
                            </a>
                            <a href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/" target="_blank" class="adblock-install-btn">
                                <i class="fab fa-firefox"></i> Install for Firefox
                            </a>
                        </div>
                        <button onclick="loadMoviePlayer(${movieId})" class="adblock-skip-btn">Continue without Ad Blocker</button>
                    </div>
                </div>
            `;
        }
    });
}

function checkAdBlocker() {
    return new Promise(resolve => {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        window.setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                resolve(true);
            } else {
                resolve(false);
            }
            testAd.remove();
        }, 100);
    });
}

function loadMoviePlayer(movieId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="fullscreen-player-container">
            <div class="fullscreen-player">
                <iframe id="movie-iframe" src="https://moviesapi.club/movie/${movieId}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;

    const iframe = document.getElementById('movie-iframe');
    
    iframe.addEventListener('load', function() {
        try {
            const iframeWindow = iframe.contentWindow;
            const iframeDocument = iframe.contentDocument || iframeWindow.document;
            
            // Function to handle the play button click
            function handlePlayButtonClick(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Play button clicked');
                // Add your custom play logic here
            }

            // MutationObserver to watch for the play button
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        const playButton = iframeDocument.querySelector('.jw-icon-display');
                        if (playButton) {
                            playButton.removeEventListener('click', handlePlayButtonClick);
                            playButton.addEventListener('click', handlePlayButtonClick);
                        }
                    }
                });
            });

            observer.observe(iframeDocument.body, {
                childList: true,
                subtree: true
            });

            // Prevent navigation
            Object.defineProperty(iframeWindow, 'location', {
                set: function() {
                    console.log('Blocked navigation attempt');
                }
            });

            // Override window.open
            iframeWindow.open = function() {
                console.log('Blocked window.open attempt');
                return null;
            };

            // Block popups
            iframeWindow.alert = iframeWindow.confirm = iframeWindow.prompt = function() {};

            // Prevent form submissions
            iframeDocument.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Blocked form submission');
                return false;
            }, true);

        } catch (error) {
            console.error('Error setting up iframe content handling:', error);
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

let currentPage = 1;
let isLoading = false;

async function loadMoviePage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="movie-grid" id="movie-grid"></div>';
    await loadMoreMovies();

    window.addEventListener('scroll', handleScroll);
}

async function loadMoreMovies() {
    if (isLoading) return;
    isLoading = true;

    try {
        const movies = await fetchFromTMDb('movie/popular', { page: currentPage });
        const movieGrid = document.getElementById('movie-grid');

        movies.results.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieGrid.appendChild(movieCard);
        });

        currentPage++;
        isLoading = false;
    } catch (error) {
        console.error('Error loading movies:', error);
        isLoading = false;
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <a href="#" onclick="loadMovieDetail(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.release_date.split('-')[0]}</p>
            </div>
        </a>
    `;
    return card;
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadMoreMovies();
    }
}
