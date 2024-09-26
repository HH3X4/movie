const BASE_URL = 'https://api.themoviedb.org/3';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

async function validateApiKey(apiKey) {
    const url = new URL(`${BASE_URL}/movie/popular`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    return response.ok;
}

function showApiKeyForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="api-key-form-container">
            <h1>Enter Your TMDb API Key</h1>
            <p>You can get your API key from <a href="https://www.themoviedb.org/settings/api" target="_blank">TMDb API Settings</a>.</p>
            <form id="api-key-form">
                <input type="text" id="api-key-input" placeholder="Enter your TMDb API key" required>
                <button type="submit">Save API Key</button>
            </form>
            <p id="api-key-error" class="error-message"></p>
        </div>
    `;

    document.getElementById('api-key-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const apiKey = document.getElementById('api-key-input').value;
        const isValid = await validateApiKey(apiKey);
        if (isValid) {
            setCookie('tmdb_api_key', apiKey, 365);
            init();
        } else {
            document.getElementById('api-key-error').textContent = 'Invalid API key. Please try again.';
        }
    });
}

function getApiKey() {
    return getCookie('tmdb_api_key');
}

async function fetchFromTMDb(endpoint, params = {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
        showApiKeyForm();
        return;
    }
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Failed to fetch data from TMDb');
}

async function loadHomePage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="loading-spinner"></div>'; // Show loading spinner

    try {
        const popularMovies = await fetchFromTMDb('movie/popular');
        console.log('Popular Movies:', popularMovies);
        const newestMovies = await fetchFromTMDb('movie/now_playing');
        console.log('Newest Movies:', newestMovies);
        const actionMovies = await fetchFromTMDb('discover/movie', { with_genres: 28 });
        console.log('Action Movies:', actionMovies);
        const comedyMovies = await fetchFromTMDb('discover/movie', { with_genres: 35 });
        console.log('Comedy Movies:', comedyMovies);

        const displayedMovieIds = new Set();

        function filterMovies(movies) {
            const filtered = [];
            for (const movie of movies) {
                if (!displayedMovieIds.has(movie.id)) {
                    displayedMovieIds.add(movie.id);
                    filtered.push(movie);
                }
                if (filtered.length >= 20) break;
            }
            return filtered;
        }

        const filteredPopularMovies = filterMovies(popularMovies.results);
        const filteredNewestMovies = filterMovies(newestMovies.results);
        const filteredActionMovies = filterMovies(actionMovies.results);
        const filteredComedyMovies = filterMovies(comedyMovies.results);

        mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="hero-section" style="background-image: url('https://image.tmdb.org/t/p/original${filteredPopularMovies[0].backdrop_path}')">
                <div class="hero-content">
                    <h1>Welcome to Hexa Flix</h1>
                    <p>Your go-to platform for streaming movies and series</p>
                    <a href="#" class="play-button" data-movie-id="${filteredPopularMovies[0].id}">Watch Now</a>
                </div>
            </section>
            <!-- Popular Movies Carousel -->
            <section class="movie-carousel">
                <h2>Popular Movies</h2>
                <div class="movie-list">
                    ${filteredPopularMovies.map(movie => `
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
            <!-- Newest Movies Carousel -->
            <section class="movie-carousel">
                <h2>Newest Movies</h2>
                <div class="movie-list">
                    ${filteredNewestMovies.map(movie => `
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
            <!-- Action Movies Carousel -->
            <section class="movie-carousel">
                <h2>Action Movies</h2>
                <div class="movie-list">
                    ${filteredActionMovies.map(movie => `
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
            <!-- Comedy Movies Carousel -->
            <section class="movie-carousel">
                <h2>Comedy Movies</h2>
                <div class="movie-list">
                    ${filteredComedyMovies.map(movie => `
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
        mainContent.innerHTML = '<p class="error-message">Error loading home page. Please try again later.</p>';
        console.error('Error loading home page:', error);
    }
}

// Load movie detail page
async function loadMovieDetail(movieId) {
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        
        // Add movie to watched list
        addToWatched({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        });

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
        <div class="player-container">
            <div class="fullscreen-player">
                <iframe src="https://vidsrc.xyz/embed/movie?tmdb=${movieId}" allowfullscreen></iframe>
            </div>
            <div class="player-controls">
                <button id="cast-button" class="cast-button">
                    <i class="fas fa-cast"></i> Cast
                </button>
                <button id="fullscreen-button" class="fullscreen-button">
                    <i class="fas fa-expand"></i> Fullscreen
                </button>
            </div>
        </div>
    `;

    const castButton = document.getElementById('cast-button');
    castButton.addEventListener('click', () => {
        const session = cast.framework.CastContext.getInstance().getCurrentSession();
        if (session) {
            loadMedia(session);
        } else {
            cast.framework.CastContext.getInstance().requestSession().then(loadMedia);
        }
    });

    const fullscreenButton = document.getElementById('fullscreen-button');
    fullscreenButton.addEventListener('click', () => {
        const playerContainer = document.querySelector('.player-container');
        if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen();
        } else if (playerContainer.mozRequestFullScreen) {
            playerContainer.mozRequestFullScreen();
        } else if (playerContainer.webkitRequestFullscreen) {
            playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
            playerContainer.msRequestFullscreen();
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
// Helper function to get cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Helper function to set cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

// Add movie to watched list
function addToWatched(movie) {
    let watchedMovies = JSON.parse(getCookie('watchedMovies') || '[]');
    if (!watchedMovies.some(m => m.id === movie.id)) {
        watchedMovies.push(movie);
        setCookie('watchedMovies', JSON.stringify(watchedMovies), 365);
    }
}

// Load watched movies page
function loadWatchedMovies() {
    const watchedMovies = JSON.parse(getCookie('watchedMovies') || '[]');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="watched-movies-container">
            <h1>Watched Movies</h1>
            <div class="movies-grid">
                ${watchedMovies.map(movie => `
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
}

// Set up event listeners
function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            const query = event.target.query.value;
            loadSearchResults(query);
        });
    }

    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const movieId = button.getAttribute('data-movie-id');
            loadMovieDetail(movieId);
        });
    });

    // Add more event listeners as needed
}
// Initialize the application
function init() {
    const apiKey = getApiKey();
    if (!apiKey) {
        showApiKeyForm();
    } else {
        loadHomePage();
        initializeCastApi();
    }
}
// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

async function loadMoviesPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="movies-page-container">
            <h1>All Movies</h1>
            <div class="filter-container">
                <select id="genre-filter">
                    <option value="">All Genres</option>
                    <option value="28">Action</option>
                    <option value="35">Comedy</option>
                    <option value="18">Drama</option>
                    <option value="27">Horror</option>
                    <!-- Add more genres as needed -->
                </select>
                <select id="sort-filter">
                    <option value="popularity.desc">Most Popular</option>
                    <option value="release_date.desc">Newest</option>
                    <option value="vote_average.desc">Top Rated</option>
                </select>
            </div>
            <div class="movies-grid" id="movies-grid"></div>
            <div class="loading-spinner" id="loading-spinner"></div>
        </div>
    `;

    let currentPage = 1;
    let currentGenre = '';
    let currentSort = 'popularity.desc';
    let isLoading = false;

    async function loadMovies(page, genre, sort) {
        isLoading = true;
        const params = { page, sort_by: sort };
        if (genre) {
            params.with_genres = genre;
        }
        const movies = await fetchFromTMDb('discover/movie', params);
        const moviesGrid = document.getElementById('movies-grid');
        movies.results.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <a href="#" onclick="loadMovieDetail(${movie.id})">
                    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <p>${movie.release_date}</p>
                    </div>
                </a>
            `;
            moviesGrid.appendChild(movieCard);
        });
        isLoading = false;
    }

    async function handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200 && !isLoading) {
            currentPage++;
            document.getElementById('loading-spinner').style.display = 'block';
            await loadMovies(currentPage, currentGenre, currentSort);
            document.getElementById('loading-spinner').style.display = 'none';
        }
    }

    document.getElementById('genre-filter').addEventListener('change', async (event) => {
        currentGenre = event.target.value;
        currentPage = 1;
        document.getElementById('movies-grid').innerHTML = '';
        await loadMovies(currentPage, currentGenre, currentSort);
    });

    document.getElementById('sort-filter').addEventListener('change', async (event) => {
        currentSort = event.target.value;
        currentPage = 1;
        document.getElementById('movies-grid').innerHTML = '';
        await loadMovies(currentPage, currentGenre, currentSort);
    });

    window.addEventListener('scroll', handleScroll);

    await loadMovies(currentPage, currentGenre, currentSort);
}

const context = cast.framework.CastContext.getInstance();
context.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
});

function initializeCastApi() {
    const castButton = document.getElementById('cast-button');
    castButton.style.display = 'block';
    castButton.addEventListener('click', () => {
        const session = context.getCurrentSession();
        if (session) {
            loadMedia(session);
        } else {
            context.requestSession().then(loadMedia);
        }
    });
}

function loadMedia(session) {
    const iframe = document.querySelector('.fullscreen-player iframe');
    if (iframe) {
        const videoUrl = iframe.src;
        const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, 'application/vnd.apple.mpegurl');
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request).then(
            () => console.log('Cast succeed'),
            (errorCode) => console.log('Error code: ' + errorCode)
        );
    } else {
        console.log('No video playing');
    }
}

window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
};
