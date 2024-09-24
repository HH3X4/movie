const apiKey = '8391e2d3dbcc1df8d4716820aee5fdc4'; // Replace with your TMDb API key

// Function to fetch popular movies
async function fetchPopularMovies() {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
    const data = await response.json();
    displayPopularMovies(data.results);
}

// Function to display popular movies
function displayPopularMovies(movies) {
    const movieGrid = document.getElementById('popular-movies');
    movieGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        movieItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="info">
                <h3>${movie.title}</h3>
                <p>Rating: ${movie.vote_average}</p>
                <a href="movie_detail.html?id=${movie.id}" class="details-button">View Details</a>
            </div>
        `;
        movieGrid.appendChild(movieItem);
    });
}

// Function to handle search
document.getElementById('search-button').addEventListener('click', async () => {
    const searchQuery = document.getElementById('search-input').value;
    if (searchQuery) {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchQuery}`);
        const data = await response.json();
        displaySearchResults(data.results);
    }
});

// Function to display search results
function displaySearchResults(movies) {
    const resultsPage = document.getElementById('search-results');
    resultsPage.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        movieItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="info">
                <h3>${movie.title}</h3>
                <p>Rating: ${movie.vote_average}</p>
                <a href="movie_detail.html?id=${movie.id}" class="details-button">View Details</a>
            </div>
        `;
        resultsPage.appendChild(movieItem);
    });
}

// Function to fetch movie details
async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (movieId) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const movie = await response.json();
        displayMovieDetails(movie);
    }
}

// Function to display movie details
function displayMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details');
    detailsContainer.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <p>${movie.overview}</p>
        <p>Rating: ${movie.vote_average}</p>
        <a href="player.html?videoId=${movie.id}" class="details-button">Watch Now</a>
    `;
}

// Function to set up the player
function setupPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId');
    const moviePlayer = document.getElementById('movie-player');
    if (videoId) {
        moviePlayer.src = `https://www.youtube.com/embed/${videoId}`; // Replace with appropriate video source if needed
    }
}

// Initialize
if (document.getElementById('popular-movies')) {
    fetchPopularMovies();
}

if (document.getElementById('search-results')) {
    fetchMovieDetails();
}

if (document.getElementById('movie-details')) {
    fetchMovieDetails();
}

if (document.getElementById('movie-player')) {
    setupPlayer();
}
