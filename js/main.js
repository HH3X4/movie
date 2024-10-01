const BASE_URL = 'https://api.themoviedb.org/3';

const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

function getGenreName(genreId) {
    return genreMap[genreId] || "Unknown";
}

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
    mainContent.innerHTML = `
        <div class="hero-section">
            <div class="hero-content">
                <h1 class="glitch-effect" data-text="Welcome to HexaFlix">Welcome to HexaFlix</h1>
                <p>Your ultimate destination for movies and entertainment</p>
                <button class="cta-button" onclick="loadMoviesPage(); window.location.hash = '#movies';">Explore Movies</button>
            </div>
        </div>
        <div class="page-container">
            <section class="about-section">
                <h2 class="section-title">About Us</h2>
                <p>HexaFlix is your premier destination for streaming the latest and greatest movies. Our platform offers a vast library of films across all genres, ensuring there's something for everyone. With our user-friendly interface and personalized recommendations, finding your next favorite movie has never been easier.</p>
                <p>We're committed to providing high-quality streaming services, regular updates to our movie collection, and an unparalleled viewing experience. Join us today and dive into the world of cinema from the comfort of your home!</p>
            </section>
            <section class="features-section">
                <h2 class="section-title">Why Choose HexaFlix?</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <i class="fas fa-film"></i>
                        <h3>Vast Movie Library</h3>
                        <p>Access thousands of movies across all genres</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-desktop"></i>
                        <h3>HD Streaming</h3>
                        <p>Enjoy crystal-clear video quality</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-user-circle"></i>
                        <h3>Personalized Recommendations</h3>
                        <p>Discover new movies tailored to your taste</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-mobile-alt"></i>
                        <h3>Watch Anywhere</h3>
                        <p>Stream on your favorite devices</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function renderMovieCard(movie) {
    return `
        <div class="movie-card">
            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" onclick="loadMovieDetail(${movie.id})">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
            </div>
        </div>
    `;
}

function renderMovieCarousel(title, movies) {
    return `
        <section class="movie-carousel">
            <h2>${title}</h2>
            <div class="movie-list">
                ${movies.map(renderMovieCard).join('')}
            </div>
        </section>
    `;
}

function initializeSlider(carousel) {
    const movieList = carousel.querySelector('.movie-list');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    let scrollPosition = 0;

    nextButton.addEventListener('click', () => {
        scrollPosition += 220;
        if (scrollPosition > movieList.scrollWidth - movieList.clientWidth) {
            scrollPosition = movieList.scrollWidth - movieList.clientWidth;
        }
        movieList.style.transform = `translateX(-${scrollPosition}px)`;
    });

    prevButton.addEventListener('click', () => {
        scrollPosition -= 220;
        if (scrollPosition < 0) {
            scrollPosition = 0;
        }
        movieList.style.transform = `translateX(-${scrollPosition}px)`;
    });
}

async function loadMovieDetail(movieId) {
    if (!checkLoggedIn()) return;
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        const isInWatchlist = checkIfInWatchlist(movie.id);
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="movie-detail-container">
                <div class="movie-detail-header">
                    <div class="movie-detail-img">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    </div>
                    <div class="movie-detail-content">
                        <h1 class="glitch-effect" data-text="${movie.title}">${movie.title}</h1>
                        <p class="movie-meta">${movie.release_date.split('-')[0]} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}</p>
                        <div class="movie-rating">
                            <span class="star-icon">★</span>
                            <span class="rating-value">${movie.vote_average.toFixed(1)}</span>
                        </div>
                        <p class="movie-description">${movie.overview}</p>
                        <div class="movie-actions">
                            <button class="play-button" onclick="loadMoviePlayer(${movie.id})"><i class="fas fa-play"></i> Watch Now</button>
                            <button class="watchlist-button" onclick="toggleWatchlist(${movie.id}, '${movie.title}', '${movie.poster_path}', '${movie.release_date}')">${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading movie detail:', error);
        mainContent.innerHTML = '<p>Error loading movie detail. Please try again later.</p>';
    }
}

function toggleWatchlist(id, title, poster_path, release_date) {
    const movie = { id, title, poster_path, release_date };
    const watchlistButton = document.querySelector('.watchlist-button');
    
    if (checkIfInWatchlist(id)) {
        removeFromWatchlist(id);
        watchlistButton.textContent = 'Add to Watchlist';
        showCustomAlert('Movie removed from watchlist', 'success');
    } else {
        addToWatchlist(movie);
        watchlistButton.textContent = 'Remove from Watchlist';
        showCustomAlert('Movie added to watchlist', 'success');
    }
}

function checkIfInWatchlist(movieId) {
    const username = getCookie('username');
    const watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`) || '[]');
    return watchlist.some(movie => movie.id === movieId);
}

let alertQueue = [];
let isShowingAlert = false;

function showCustomAlert(message, type = 'info') {
    alertQueue.push({ message, type });
    if (!isShowingAlert) {
        showNextAlert();
    }
}

function showNextAlert() {
    if (alertQueue.length === 0) {
        isShowingAlert = false;
        return;
    }

    isShowingAlert = true;
    const { message, type } = alertQueue.shift();
    const alertContainer = document.createElement('div');
    alertContainer.className = `custom-alert ${type}`;
    alertContainer.textContent = message;
    document.body.appendChild(alertContainer);

    const existingAlerts = document.querySelectorAll('.custom-alert');
    const offset = existingAlerts.length * 60; // 60px per alert

    alertContainer.style.top = `${20 + offset}px`;

    setTimeout(() => {
        alertContainer.classList.add('show');
        setTimeout(() => {
            alertContainer.classList.remove('show');
            setTimeout(() => {
                alertContainer.remove();
                showNextAlert();
            }, 300);
        }, 2000);
    }, 100);
}

function loadMoviePlayer(movieId) {
    if (!checkLoggedIn()) return;
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
    fetchMovieInfo(movieId);
}

async function fetchMovieInfo(movieId) {
    try {
        const movie = await fetchFromTMDb(`movie/${movieId}`);
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-details').textContent = `${movie.release_date.split('-')[0]} | ${movie.runtime} min | ${movie.genres.map(genre => genre.name).join(', ')}`;
        document.getElementById('movie-overview').textContent = movie.overview;
        
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

function loadWatchlist() {
    if (!checkLoggedIn()) return;
    const username = getCookie('username');
    const watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            ${generatePageTitle("My Watchlist")}
            <div class="movie-grid">
                ${watchlist.map(movie => `
                    <div class="movie-card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" onclick="loadMovieDetail(${movie.id})">
                        <div class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.release_date.split('-')[0]}</p>
                        </div>
                        <button class="remove-button" onclick="removeFromWatchlist(${movie.id})">Remove</button>
                    </div>
                `).join('')}
            </div>
            ${watchlist.length === 0 ? '<p class="empty-list-message">Your watchlist is empty. Start adding movies!</p>' : ''}
        </div>
    `;
}

function addToWatchlist(movie) {
    const username = getCookie('username');
    let watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    if (!watchlist.some(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem(`watchlist_${username}`, JSON.stringify(watchlist));
        showCustomAlert('Movie added to watchlist', 'success');
    } else {
        showCustomAlert('Movie is already in your watchlist', 'info');
    }
}

function removeFromWatchlist(movieId) {
    const username = getCookie('username');
    let watchlist = JSON.parse(localStorage.getItem(`watchlist_${username}`)) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem(`watchlist_${username}`, JSON.stringify(watchlist));
    showCustomAlert('Movie removed from watchlist', 'success');
    if (document.querySelector('.page-title').textContent === 'My Watchlist') {
        loadWatchlist();
    }
}

function addToWatched(movie) {
    const username = getCookie('username');
    let watchedMovies = JSON.parse(localStorage.getItem(`watchedMovies_${username}`)) || [];
    if (!watchedMovies.some(m => m.id === movie.id)) {
        watchedMovies.push(movie);
        localStorage.setItem(`watchedMovies_${username}`, JSON.stringify(watchedMovies));
    }
}

function loadWatchedMovies() {
    if (!checkLoggedIn()) return;
    const username = getCookie('username');
    const watchedMovies = JSON.parse(localStorage.getItem(`watchedMovies_${username}`)) || [];
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            ${generatePageTitle("Watched Movies")}
            <div class="movie-grid">
                ${watchedMovies.map(renderMovieCard).join('')}
            </div>
        </div>
    `;
}

function setupEventListeners() {
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            const query = event.target.query.value;
            performSearch(query);
        });
    }
}

function init() {
    const username = getCookie('username');
    const apiKey = getCookie('tmdb_api_key');
    if (!username || !apiKey) {
        showLoginForm();
    } else {
        loadHomePage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupCustomScrollbar();
});

let currentPage = 1;
let isLoading = false;

async function loadMoviesPage(page = 1) {
    if (!checkLoggedIn() || isLoading) return;
    isLoading = true;
    const mainContent = document.getElementById('main-content');
    if (page === 1) {
        mainContent.innerHTML = `
            <div class="page-container">
                ${generatePageTitle("Movies")}
                <div class="filter-container">
                    <select id="genre-filter">
                        <option value="">All Genres</option>
                        ${Object.entries(genreMap).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}
                    </select>
                    <input type="number" id="year-from" placeholder="Year From">
                    <input type="number" id="year-to" placeholder="Year To">
                    <input type="number" id="rating-filter" placeholder="Min Rating" min="0" max="10" step="0.1">
                    <select id="sort-by">
                        <option value="popularity.desc">Popularity Descending</option>
                        <option value="popularity.asc">Popularity Ascending</option>
                        <option value="vote_average.desc">Rating Descending</option>
                        <option value="vote_average.asc">Rating Ascending</option>
                        <option value="release_date.desc">Release Date Descending</option>
                        <option value="release_date.asc">Release Date Ascending</option>
                    </select>
                    <select id="language-filter">
                        <option value="">All Languages</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                    </select>
                    <button onclick="applyFilters()">Apply Filters</button>
                </div>
                <div id="movie-grid" class="movie-grid"></div>
                <div id="loading-spinner" class="loading-spinner" style="display: none;">Loading...</div>
            </div>
        `;
        currentPage = 1;
    }
    const filterParams = window.currentFilters || { page: page };
    const movies = await fetchFromTMDb('discover/movie', filterParams);
    const movieGrid = document.getElementById('movie-grid');
    if (page === 1) {
        movieGrid.innerHTML = '';
    }
    movies.results.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
    currentPage = page;
    isLoading = false;

    if (page === 1) {
        window.addEventListener('scroll', handleInfiniteScroll);
    }
}

function handleInfiniteScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        loadMoviesPage(currentPage + 1);
    }
}

function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = renderMovieCard(movie);
    return movieCard;
}

async function applyFilters() {
    const genreId = document.getElementById('genre-filter').value;
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const minRating = document.getElementById('rating-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    const language = document.getElementById('language-filter').value;

    window.currentFilters = { sort_by: sortBy, page: 1 };
    if (genreId) window.currentFilters.with_genres = genreId;
    if (yearFrom) window.currentFilters.primary_release_date_gte = `${yearFrom}-01-01`;
    if (yearTo) window.currentFilters.primary_release_date_lte = `${yearTo}-12-31`;
    if (minRating) window.currentFilters.vote_average_gte = minRating;
    if (language) window.currentFilters.with_original_language = language;

    try {
        const movies = await fetchFromTMDb('discover/movie', window.currentFilters);
        const moviesGrid = document.getElementById('movie-grid');
        moviesGrid.innerHTML = movies.results.map(renderMovieCard).join('');
        window.currentPage = 1;
    } catch (error) {
        console.error('Error applying filters:', error);
        showCustomAlert('Failed to apply filters. Please try again.', 'error');
    }
}

function showRegistrationForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-form-container">
                <h1>Join HexaFlix</h1>
                <form id="register-form">
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <input type="text" id="api-key" placeholder="TMDb API Key" required>
                    <button type="submit">Register</button>
                </form>
                <p>Already have an account? <a href="#" onclick="showLoginForm()">Login</a></p>
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegistration);
}

async function handleRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const apiKey = document.getElementById('api-key').value;

    try {
        const isValid = await validateApiKey(apiKey);
        if (!isValid) {
            showCustomAlert('Invalid TMDb API Key. Please check and try again.', 'error');
            return;
        }
    } catch (error) {
        console.error('Error validating API key:', error);
        showCustomAlert('Error validating API key. Please try again.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        showCustomAlert('Username already exists. Please choose a different one.', 'error');
        return;
    }
    
    const hashedPassword = await hashPassword(password);
    users[username] = { password: hashedPassword, apiKey };
    localStorage.setItem('users', JSON.stringify(users));

    showCustomAlert('Registration successful!', 'success');
    loginUser(username, apiKey);
}

function showLoginForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-form-container">
                <h1>Login to HexaFlix</h1>
                <form id="login-form">
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#" onclick="showRegistrationForm()">Register</a></p>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    if (user && await verifyPassword(password, user.password)) {
        loginUser(username, user.apiKey);
    } else {
        showCustomAlert('Invalid username or password', 'error');
    }
}

function loginUser(username, apiKey) {
    setCookie('username', username, 365);
    setCookie('tmdb_api_key', apiKey, 365);
    localStorage.setItem('currentUser', username);
    loadHomePage();
}

function logout() {
    setCookie('username', '', -1);
    setCookie('tmdb_api_key', '', -1);
    localStorage.removeItem('currentUser');
    showLoginForm();
}

function checkLoggedIn() {
    const username = getCookie('username');
    const apiKey = getCookie('tmdb_api_key');
    const currentUser = localStorage.getItem('currentUser');
    if (!username || !apiKey || !currentUser || username !== currentUser) {
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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(inputPassword, storedHash) {
    const inputHash = await hashPassword(inputPassword);
    return inputHash === storedHash;
}

function loadUserProfile() {
    if (!checkLoggedIn()) return;
    const username = getCookie('username');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            ${generatePageTitle("User Profile")}
            <div class="profile-container">
                <h2 class="section-title glitch-effect" data-text="User Profile">User Profile</h2>
                <div class="profile-info">
                    <p><strong>Username:</strong> ${username}</p>
                </div>
                <div class="profile-actions">
                    <button onclick="showChangePasswordForm()">Change Password</button>
                    <button onclick="showChangeApiKeyForm()">Change API Key</button>
                    <button onclick="logout()">Logout</button>
                </div>
            </div>
        </div>
    `;
}

function showChangePasswordForm() {
    const profileContainer = document.querySelector('.profile-container');
    profileContainer.innerHTML += `
        <div class="change-password-form">
            <h3>Change Password</h3>
            <form id="change-password-form">
                <input type="password" id="current-password" placeholder="Current Password" required>
                <input type="password" id="new-password" placeholder="New Password" required>
                <input type="password" id="confirm-new-password" placeholder="Confirm New Password" required>
                <button type="submit">Change Password</button>
            </form>
        </div>
    `;
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
}

function showChangeApiKeyForm() {
    const profileContainer = document.querySelector('.profile-container');
    profileContainer.innerHTML += `
        <div class="change-api-key-form">
            <h3>Change API Key</h3>
            <form id="change-api-key-form">
                <input type="text" id="new-api-key" placeholder="New TMDb API Key" required>
                <button type="submit">Change API Key</button>
            </form>
        </div>
    `;
    document.getElementById('change-api-key-form').addEventListener('submit', handleChangeApiKey);
}

async function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
        showCustomAlert('New passwords do not match', 'error');
        return;
    }

    const username = getCookie('username');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    if (await verifyPassword(currentPassword, user.password)) {
        user.password = await hashPassword(newPassword);
        localStorage.setItem('users', JSON.stringify(users));
        showCustomAlert('Password changed successfully', 'success');
        loadUserProfile();
    } else {
        showCustomAlert('Current password is incorrect', 'error');
    }
}

async function handleChangeApiKey(event) {
    event.preventDefault();
    const newApiKey = document.getElementById('new-api-key').value;
    const username = getCookie('username');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    user.apiKey = newApiKey;
    localStorage.setItem('users', JSON.stringify(users));
    setCookie('tmdb_api_key', newApiKey, 30);
    showCustomAlert('API Key changed successfully', 'success');
    loadUserProfile();
}

function loadTermsOfService() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            <h1 class="page-title">Terms of Service</h1>
            <div class="content-section">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using HexaFlix, you agree to be bound by these Terms of Service.</p>
                
                <h2>2. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account information and password. HexaFlix does not store any personal information so we are not liable for any damages or losses.</p>
                
                <h2>3. Content Usage</h2>
                <p>HexaFlix provides information about movies using The Movie Database (TMDb) API. We do not host or stream any content directly. We use Iframe to stream the movies from moviesapi.club.</p>
                
                <h2>4. API Key Usage</h2>
                <p>Users are required to provide their own TMDb API key. You are responsible for using this key in accordance with TMDb's terms of service.</p>
                
                <h2>5. Prohibited Activities</h2>
                <p>Users are prohibited from engaging in any illegal or unauthorized use of the service, including but not limited to attempting to access or modify other users' accounts.</p>
                
                <h2>6. Service Availability</h2>
                <p>HexaFlix is a demonstration project and may not be available at all times. We reserve the right to modify or discontinue the service without notice.</p>

                <h2>7. Pirating</h2>
                <p>HexaFlix does not condone piracy. We use Iframe to stream the movies from moviesapi.club. We are not liable for any illagal activities.</p>
            </div>
        </div>
    `;
}

function loadPrivacyPolicy() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            <h1 class="page-title">Privacy Policy</h1>
            <div class="content-section">
                <h2>1. Information Collection</h2>
                <p>HexaFlix does not store any user information or passwords. this can be seen in the code. we might do in the future when we are able to do this secured. Currently this is stored in the local storage of the browser.</p>
                
                <h2>2. API Key Usage</h2>
                <p>Your TMDb API key is stored locally in your browser and is not transmitted to or stored by HexaFlix servers.</p>
                
                <h2>3. Data Storage</h2>
                <p>All user data, including watchlists and viewing history, is stored locally in your browser using localStorage. This data is not accessible to HexaFlix or any third parties.</p>
                
                <h2>4. Third-Party Services</h2>
                <p>HexaFlix uses The Movie Database (TMDb) API to fetch movie information. Please refer to TMDb's privacy policy for information on how they handle data.</p>
                
                <h2>5. Data Security</h2>
                <p>While we implement measures to protect your information, please be aware that no method of transmission over the internet is 100% secure.</p>
                
                <h2>6. Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </div>
        </div>
    `;
}

function setupCustomScrollbar() {
    const scrollbar = document.getElementById('custom-scrollbar-thumb');
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    function updateScrollbar() {
        const scrollPercentage = (window.scrollY / maxScroll) * 100;
        scrollbar.style.height = `${scrollPercentage}%`;
    }

    window.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', () => {
        maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        updateScrollbar();
    });

    updateScrollbar();
}

function generatePageTitle(text) {
    return `
        <div class="page-title-container">
            <h1 class="page-title glitch-effect" data-text="${text}">${text}</h1>
        </div>
    `;
}

async function searchMovies(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm === '') return;

    try {
        const movies = await fetchFromTMDb('search/movie', { query: searchTerm });
        displaySearchResults(movies.results);
    } catch (error) {
        console.error('Error searching movies:', error);
        showCustomAlert('Failed to search movies. Please try again.', 'error');
    }
}

function displaySearchResults(movies) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page-container">
            ${generatePageTitle("Search Results")}
            <div class="movie-grid">
                ${movies.map(movie => `
                    <div class="movie-card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" onclick="loadMovieDetail(${movie.id})">
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
