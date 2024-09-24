# 🎬 Movie Explorer App

Welcome to the **Movie Explorer App**! This is a simple, lightweight movie browsing website built using HTML, CSS, and JavaScript that fetches data from [The Movie Database (TMDb)](https://www.themoviedb.org/) API. It allows users to browse popular movies, search for specific titles, and view details about individual movies.

Hosted on [GitHub Pages](https://yourusername.github.io/my-movie-app/).

---

## 🚀 Features

- Browse the latest **popular movies**.
- **Search** for any movie by its title.
- View detailed information about any movie, including its release date, overview, and more.
- Embedded movie **player** for external sources (optional).
- Responsive design that works on desktop and mobile devices.

---

## 🔧 Technologies Used

- **HTML5** and **CSS3** for structure and styling.
- **JavaScript (ES6)** for client-side functionality.
- **TMDb API** for fetching movie data.
- **GitHub Pages** for hosting the static website.

---

## 🖥️ Live Demo

You can view the live demo of this project here:

👉 **[Live Demo](https://yourusername.github.io/my-movie-app/)**

---

## 📸 Screenshots

| Home Page | Movie Details |
|-----------|---------------|
| ![Home Page](assets/homepage-screenshot.png) | ![Movie Details](assets/movie-details-screenshot.png) |

---

## ⚙️ Installation & Setup

Follow the steps below to set up the project locally:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/my-movie-app.git
    ```

2. **Navigate to the project directory**:

    ```bash
    cd my-movie-app
    ```

3. **Open `index.html` in your browser**:

    You can open the `index.html` file directly in your browser to view the project locally.

---

## 🛠️ API Configuration

This project uses the [TMDb API](https://www.themoviedb.org/documentation/api) to fetch movie data. To set up your own TMDb API key:

1. Sign up on [The Movie Database (TMDb)](https://www.themoviedb.org/).
2. Go to your account settings and generate a new API key.
3. Replace the existing API key in `js/main.js` and `js/movie.js`:

    ```javascript
    const API_KEY = 'your_tmdb_api_key';  // Replace with your actual TMDb API key
    ```

---

## 💻 Usage

Once you have the project up and running, you can:

- Browse the popular movies on the homepage.
- Click on any movie to view its detailed information.
- Use the search bar to find a specific movie.

---

## 🗂️ File Structure

```bash
my-movie-app/
├── index.html          # Main homepage
├── movie.html          # Movie details page
├── player.html         # Movie player page
├── search.html         # Search results page
├── assets/             # Static assets (CSS, images)
│   ├── styles.css      # CSS file for styling
├── js/                 # JavaScript files
│   ├── main.js         # Logic for fetching popular movies
│   ├── movie.js        # Logic for fetching and displaying movie details
│   ├── player.js       # Logic for displaying movie player
└── README.md           # Project documentation
