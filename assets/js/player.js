function getMovieIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Display the movie player
function displayMoviePlayer() {
  const movieId = getMovieIdFromURL();
  const moviePlayerDiv = document.getElementById('movie-player');

  const moviePlayerUrl = `https://moviesapi.club/movie/${movieId}`;
  moviePlayerDiv.innerHTML = `<iframe src="${moviePlayerUrl}" width="800" height="450" allowfullscreen></iframe>`;
}

displayMoviePlayer();
