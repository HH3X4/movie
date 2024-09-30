# Hexa Flix

Hexa Flix is a modern, responsive web application for streaming movies and TV series. It provides users with a Netflix-like experience, allowing them to browse, search, and watch their favorite content.

## Features

- User authentication (login and registration)
- Browse popular, newest, action, and comedy movies
- Search functionality for finding specific movies
- Detailed movie information pages
- Add movies to a personal watchlist
- Keep track of watched movies
- Responsive design for various screen sizes
- Integration with The Movie Database (TMDb) API

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- The Movie Database (TMDb) API

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hexa-flix.git
   ```

2. Open the `index.html` file in your web browser.

3. Register for an account using a valid TMDb API key. You can obtain an API key by signing up at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## Project Structure

- `index.html`: Main HTML file
- `css/styles.min.css`: Minified CSS file for styling
- `js/main.js`: Main JavaScript file containing all the application logic

## Key Functions

- `loadHomePage()`: Loads the main page with movie carousels
- `loadMovieDetail()`: Displays detailed information about a selected movie
- `loadMoviePlayer()`: Loads the movie player for watching content
- `performSearch()`: Handles movie search functionality
- `loadWatchlist()`: Displays the user's watchlist
- `loadWatchedMovies()`: Shows the list of movies the user has watched

## Authentication

The project uses a simple client-side authentication system for demonstration purposes. In a production environment, you should implement server-side authentication for better security.

## API Integration

The application integrates with The Movie Database (TMDb) API. Make sure to use your own API key when registering for an account within the app.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
