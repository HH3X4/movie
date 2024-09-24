const API_KEY = '8391e2d3dbcc1df8d4716820aee5fdc4';  // Replace with your actual TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';

// Function to fetch movie details
async function fetchMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const movie = await response.json();
    return movie;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

// Get movie ID from URL query parameters
function getMovieIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Display movie details on the page
async function displayMovieDetails() {
  const movieId = getMovieIdFromURL();
  const movie = await fetchMovieDetails(movieId);

  if (movie) {
    const movieDetailDiv = document.getElementById('movie-detail');
    movieDetailDiv.innerHTML = `
      <h2>${movie.title}</h2>
      <p>Release Date: ${movie.release_date}</p>
      <p>${movie.overview}</p>
      <a href="player.html?id=${movie.id}">Watch Movie</a>
    `;
  } else {
    document.getElementById('movie-detail').innerText = 'Movie not found.';
  }
}

displayMovieDetails();
