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
    if (!checkLoggedIn()) return;
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
    if (!checkLoggedIn()) return;
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
                    <p class="movie-meta">${movie.release_date.split('-')[0]} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}</p>
                    <div class="movie-rating">
                        <span class="star-icon">★</span>
                        <span class="rating-value">${movie.vote_average.toFixed(1)}</span>
                    </div>
                    <p class="movie-description">${movie.overview}</p>
                    <button class="play-button" onclick="loadMoviePlayer(${movie.id})">Watch Now</button>
                    <button class="watchlist-button" onclick="addToWatchlist(${JSON.stringify(movie)})">Add to Watchlist</button>
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
    const videoUrl = `https://moviesapi.club/movie/${movieId}`;
    mainContent.innerHTML = `
        <div class="player-container">
            <div class="player-wrapper">
                <div class="fullscreen-player">
                    <iframe src="${videoUrl}" allowfullscreen></iframe>
                </div>
            </div>
            <div class="movie-info-panel">
                <h2 id="movie-title"></h2>
                <p id="movie-details"></p>
                <p id="movie-overview"></p>
            </div>
        </div>
    `;
}

async function fetchMovieInfo(movieId) {
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-details').textContent = `${movie.release_date.split('-')[0]} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}`;
        document.getElementById('movie-overview').textContent = movie.overview;
    } catch (error) {
        console.error('Error fetching movie info:', error);
    }
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
    if (!checkLoggedIn()) return;
    const username = getCookie('username');
    const watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="watchlist-container">
            <h1>My Watchlist</h1>
            <div class="watchlist-grid">
                ${watchlist.map(movie => `
                    <div class="watchlist-card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                        <div class="watchlist-card-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.release_date.split('-')[0]}</p>
                        </div>
                        <button class="remove-button" onclick="removeFromWatchlist(${movie.id})">Remove</button>
                        <button class="play-button" onclick="loadMoviePlayer(${movie.id})">Watch</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function addToWatchlist(movie) {
    const username = getCookie('username');
    let watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    if (!watchlist.some(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem(`watchlist_${username}`, JSON.stringify(watchlist));
        alert('Movie added to watchlist!');
    } else {
        alert('Movie is already in your watchlist!');
    }
}

function removeFromWatchlist(movieId) {
    const username = getCookie('username');
    let watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem(`watchlist_${username}`, JSON.stringify(watchlist));
    loadWatchlist();
}

// Add movie to watched list
function addToWatched(movie) {
    const username = getCookie('username');
    let watchedMovies = JSON.parse(localStorage.getItem(`watchedMovies_${username}`)) || [];
    if (!watchedMovies.some(m => m.id === movie.id)) {
        watchedMovies.push(movie);
        localStorage.setItem(`watchedMovies_${username}`, JSON.stringify(watchedMovies));
    }
}

// Load watched movies page
function loadWatchedMovies() {
    if (!checkLoggedIn()) return;
    const username = getCookie('username');
    const watchedMovies = JSON.parse(localStorage.getItem(`watchedMovies_${username}`)) || [];
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="watched-movies-container">
            <h1>Watched Movies</h1>
            <div class="watched-movies-grid">
                ${watchedMovies.map(movie => `
                    <div class="watched-movie-card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                        <div class="watched-movie-card-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.release_date.split('-')[0]}</p>
                        </div>
                        <button class="play-button" onclick="loadMoviePlayer(${movie.id})">Watch Again</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Set up event listeners
function setupEventListeners() {
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            const query = event.target.query.value;
            performSearch(query);
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
    const username = getCookie('username');
    const apiKey = getCookie('tmdb_api_key');
    if (!username || !apiKey) {
        showLoginForm();
    } else {
        loadHomePage();
    }
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

async function loadMoviesPage() {
    if (!checkLoggedIn()) return;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="movies-page-container">
            <h1>Explore Movies</h1>
            <div class="filter-container">
                <div class="filter-group">
                    <label for="genre-filter">Genre</label>
                    <select id="genre-filter">
                        <option value="">All Genres</option>
                        <option value="28">Action</option>
                        <option value="35">Comedy</option>
                        <option value="18">Drama</option>
                        <option value="27">Horror</option>
                        <option value="10749">Romance</option>
                        <option value="878">Science Fiction</option>
                        <option value="53">Thriller</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="sort-filter">Sort by</label>
                    <select id="sort-filter">
                        <option value="popularity.desc">Most Popular</option>
                        <option value="release_date.desc">Newest</option>
                        <option value="vote_average.desc">Top Rated</option>
                        <option value="revenue.desc">Highest Grossing</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="year-filter">Year</label>
                    <input type="number" id="year-filter" min="1900" max="2099" step="1" placeholder="Enter year">
                </div>
                <button id="apply-filters" class="apply-filters-btn">Apply Filters</button>
            </div>
            <div class="movies-grid" id="movies-grid"></div>
            <div class="loading-spinner" id="loading-spinner"></div>
        </div>
    `;

    let currentPage = 1;
    let currentGenre = '';
    let currentSort = 'popularity.desc';
    let currentYear = '';
    let isLoading = false;

    async function loadMovies(page, genre, sort, year) {
        isLoading = true;
        const params = { page: page, sort_by: sort };
        if (genre) {
            params.with_genres = genre;
        }
        if (year) {
            params.primary_release_year = year;
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
                        <p>${movie.release_date.split('-')[0]}</p>
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
            await loadMovies(currentPage, currentGenre, currentSort, currentYear);
            document.getElementById('loading-spinner').style.display = 'none';
        }
    }

    function applyFilters() {
        currentGenre = document.getElementById('genre-filter').value;
        currentSort = document.getElementById('sort-filter').value;
        currentYear = document.getElementById('year-filter').value;
        currentPage = 1;
        document.getElementById('movies-grid').innerHTML = '';
        document.getElementById('loading-spinner').style.display = 'block';
        loadMovies(currentPage, currentGenre, currentSort, currentYear);
    }

    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    window.addEventListener('scroll', handleScroll);
    await loadMovies(currentPage, currentGenre, currentSort, currentYear);
}


function loadMoviePlayer(movieId) {
    if (!checkLoggedIn()) return;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="movie-player-container">
            <h1>Now Playing</h1>
            <div class="movie-player">
                <iframe src="https://moviesapi.club/movie/${movieId}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="movie-player-info">
                <h2 id="movie-title"></h2>
                <p id="movie-meta"></p>
                <p id="movie-overview"></p>
            </div>
        </div>
    `;
    fetchMovieInfo(movieId);
}

async function fetchMovieInfo(movieId) {
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-meta').textContent = `${movie.release_date.split('-')[0]} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}`;
        document.getElementById('movie-overview').textContent = movie.overview;
        
        // Add movie to watched list
        addToWatched({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        });
    } catch (error) {
        console.error('Error fetching movie info:', error);
    }
}

function showRegistrationForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="auth-form-container">
            <h1>Register</h1>
            <form id="register-form">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <input type="text" id="api-key" placeholder="TMDb API Key" required>
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="#" onclick="showLoginForm()">Login</a></p>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegistration);
}

async function handleRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const apiKey = document.getElementById('api-key').value;

    // Validate API key
    try {
        const isValid = await validateApiKey(apiKey);
        if (!isValid) {
            alert('Invalid TMDb API Key. Please check and try again.');
            return;
        }
    } catch (error) {
        console.error('Error validating API key:', error);
        alert('Error validating API key. Please try again.');
        return;
    }

    // Store user data in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('Username already exists. Please choose a different one.');
        return;
    }
    users[username] = { password, apiKey };
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful!');
    loginUser(username, apiKey);
}

function showLoginForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="auth-form-container">
            <h1>Login</h1>
            <form id="login-form">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" onclick="showRegistrationForm()">Register</a></p>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    if (user && user.password === password) {
        loginUser(username, user.apiKey);
    } else {
        alert('Invalid username or password');
    }
}

function loginUser(username, apiKey) {
    setCookie('username', username, 365);
    setCookie('tmdb_api_key', apiKey, 365);
    loadHomePage();
}

function logout() {
    setCookie('username', '', -1);
    setCookie('tmdb_api_key', '', -1);
    showLoginForm();
}

function checkLoggedIn() {
    const username = getCookie('username');
    const apiKey = getCookie('tmdb_api_key');
    if (!username || !apiKey) {
        showLoginForm();
        return false;
    }
    return true;
}

async function validateApiKey(apiKey) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
        return response.ok;
    } catch (error) {
        console.error('Error validating API key:', error);
        return false;
    }
}
