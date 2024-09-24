const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// TMDb API configurations
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '8391e2d3dbcc1df8d4716820aee5fdc4';  // Replace with your actual TMDb API key

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Helper function to fetch data from TMDb
const fetchFromTmdb = async (endpoint, params = {}) => {
    const url = `${BASE_URL}/${endpoint}`;
    params.api_key = API_KEY;
    
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching from TMDb:', error);
        return {};
    }
};

// Home route (displays paginated movies)
app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const response = await fetchFromTmdb('movie/popular', { page });
    const movies = response.results.slice(0, 10);
    const total_pages = response.total_pages;

    // Get watch history from cookies
    const search_history = req.cookies.search_history || '';
    const viewed_movies = [];

    if (search_history) {
        const movie_ids = search_history.split(',');
        for (const movie_id of movie_ids) {
            const movie = await fetchFromTmdb(`movie/${movie_id}`);
            viewed_movies.push(movie);
        }
    }

    res.render('home', { movies, viewed_movies, page, total_pages });
});

// Movie detail route
app.get('/movie/:movie_id', async (req, res) => {
    const movie_id = req.params.movie_id;
    const movie_details = await fetchFromTmdb(`movie/${movie_id}`);

    if (!movie_details) {
        return res.render('error', { message: 'Movie not found!' });
    }

    const search_history = req.cookies.search_history || '';
    let history_list = search_history ? search_history.split(',') : [];
    
    if (!history_list.includes(movie_id)) {
        history_list.push(movie_id);
        if (history_list.length > 7) {
            history_list.shift(); // Remove the oldest entry if more than 7
        }
    }

    res.cookie('search_history', history_list.join(','), { maxAge: 604800000 }); // 1 week expiration
    res.render('movie_detail', { movie: movie_details });
});

// Movie player route
app.get('/movie/:movie_id/play', async (req, res) => {
    const movie_id = req.params.movie_id;
    const movie_details = await fetchFromTmdb(`movie/${movie_id}`);
    
    if (!movie_details) {
        return res.render('error', { message: 'Movie not found!' });
    }

    const movie_player_url = `https://moviesapi.club/movie/${movie_id}`;
    res.render('player', { movie: movie_details, movie_player_url });
});

// Search route with paginated results
app.get('/search', async (req, res) => {
    const query = req.query.query || '';
    const page = parseInt(req.query.page) || 1;

    if (!query) {
        return res.redirect('/');
    }

    const search_results = await fetchFromTmdb('search/movie', { query, page });
    const movies = search_results.results.slice(0, 10);
    const total_pages = search_results.total_pages;

    res.render('search_results', { movies, query, page, total_pages });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
