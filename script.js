const apiKey = '8391e2d3dbcc1df8d4716820aee5fdc4'; // Replace with your actual TMDB API key
const baseUrl = 'https://api.themoviedb.org/3';
const imageUrl = 'https://image.tmdb.org/t/p/w500';

// Function to fetch popular movies
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

// Function to fetch movies by search query
async function fetchMoviesBySearch(query) {
    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${query}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies by search:', error);
    }
}

// Function to display movies on the page
function displayMovies(movies) {
    const movieContainer = document.getElementById('movieContainer');
    movieContainer.innerHTML = '';

    if (movies.length === 0) {
        movieContainer.innerHTML = '<p>No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');

        movieElement.innerHTML = `
            <img src="${imageUrl}${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
            <button onclick="showMovieDetails(${movie.id})">View Details</button>
            <button onclick="playMovie(${movie.id})">Play</button> <!-- New Play button -->
        `;

        movieContainer.appendChild(movieElement);
    });
}

// Function to play the movie
function playMovie(movieId) {
    // Redirect to the player page with movie ID as a query parameter
    window.location.href = `player.html?id=${movieId}`; // Use query parameter to pass movie ID
}

// Function to show movie details
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}&language=en-US`);
        const movie = await response.json();
        
        const detailsContainer = document.getElementById('movieDetails');
        detailsContainer.innerHTML = `
            <h2>${movie.title}</h2>
            <img src="${imageUrl}${movie.backdrop_path}" alt="${movie.title}">
            <p>${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Rating:</strong> ${movie.vote_average}</p>
            <button onclick="closeDetails()">Close</button>
        `;
        detailsContainer.style.display = 'block';
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Function to close movie details
function closeDetails() {
    const detailsContainer = document.getElementById('movieDetails');
    detailsContainer.style.display = 'none';
}

// Function to handle search form submission
document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    if (query) {
        fetchMoviesBySearch(query);
    }
});

// Function to play the movie
function playMovie(movieId) {
    const moviePlayerUrl = `https://moviesapi.club/movie/${movieId}`;
    window.location.href = moviePlayerUrl; // Redirect to the player page
}

// Initial fetch of popular movies
fetchPopularMovies();
