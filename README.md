# Hexa Flix

Hexa Flix is a modern, responsive web application for streaming movies and TV series. It provides users with a Netflix-like experience, allowing them to browse, search, and watch their favorite content.

## Features

- User authentication (login and registration)
- Browse popular, newest, action, and comedy movies
- Detailed movie information pages
- Add movies to a personal watchlist
- Keep track of watched movies
- Search functionality for finding specific movies
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
- `loadMoviesPage()`: Loads the movies page with various movie carousels
- `loadMovieDetail(movieId)`: Loads the detailed information page for a specific movie
- `loadWatchlist()`: Loads the user's watchlist
- `loadWatchedMovies()`: Loads the user's watched movies
- `loadUserProfile()`: Loads the user's profile page
- `logout()`: Logs the user out and clears the current user's data from local storage
- `hashPassword(password)`: Hashes the password using SHA-256
- `verifyPassword(inputPassword, storedHash)`: Verifies the input password against the stored hash

## Authentication

The project uses a client-side authentication system with password hashing for demonstration purposes. In a production environment, you should implement server-side authentication for better security.


## API Integration

The application integrates with The Movie Database (TMDb) API. Make sure to use your own API key when registering for an account within the app.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
