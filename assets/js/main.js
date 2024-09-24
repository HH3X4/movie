const API_KEY = '8391e2d3dbcc1df8d4716820aee5fdc4';  // Replace with your actual TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';

// Function to fetch popular movies
async function fetchPopularMovies(page = 1) {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
}

// Function to display popular movies
async function displayMovies() {
  const movies = await fetchPopularMovies();
  const movieList = document.getElementById('movie-list');

  movieList.innerHTML = '';  // Clear any previous movies
  movies.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.innerHTML = `
      <h2>${movie.title}</h2>
      <p>Release Date: ${movie.release_date}</p>
      <a href="movie.html?id=${movie.id}">View Details</a>
    `;
    movieList.appendChild(movieElement);
  });
}

displayMovies();
