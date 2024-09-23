from flask import Flask, render_template, redirect, url_for, request, jsonify, make_response
import requests
import locale
import webbrowser
from threading import Timer
import os
import sys
import shutil
import subprocess

app = Flask(__name__)

# Set locale for currency formatting
locale.setlocale(locale.LC_ALL, '')

def format_currency(value):
    try:
        return locale.currency(value, grouping=True)
    except (TypeError, ValueError):
        return value

# Register the custom filter
app.jinja_env.filters['format_currency'] = format_currency

# TMDb API configurations
BASE_URL = 'https://api.themoviedb.org/3'
API_KEY = '8391e2d3dbcc1df8d4716820aee5fdc4'  # Replace with your actual TMDb API key

# Helper function to fetch data from TMDb
def fetch_from_tmdb(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    params = params or {}
    params['api_key'] = API_KEY
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return {}

# Function to get movie details
def get_movie_details(movie_id):
    return fetch_from_tmdb(f'movie/{movie_id}')

# Home route (displays paginated movies)
@app.route('/')
def home():
    page = request.args.get('page', 1, type=int)
    response = fetch_from_tmdb('movie/popular', {'page': page})
    movies = response.get('results', [])[:10]  # Show 10 movies per page
    total_pages = response.get('total_pages', 1)

    # Get watch history from cookies
    search_history = request.cookies.get('search_history')
    viewed_movies = []

    if search_history:
        movie_ids = search_history.split(',')
        for movie_id in movie_ids:
            movie = get_movie_details(movie_id)
            viewed_movies.append(movie)

    return render_template('home.html', movies=movies, viewed_movies=viewed_movies, page=page, total_pages=total_pages)

@app.route('/movie/<int:movie_id>')
def movie_detail(movie_id):
    # Fetch the movie details based on the movie_id
    movie_details = get_movie_details(movie_id)
    if not movie_details:
        return render_template('error.html', message='Movie not found!')

    # Create response and set a cookie for search history
    response = make_response(render_template('movie_detail.html', movie=movie_details))

    # Get current search history from cookies (if it exists)
    search_history = request.cookies.get('search_history')
    
    if search_history:
        # Convert the cookie string into a list
        history_list = search_history.split(',')
        if str(movie_id) not in history_list:
            history_list.append(str(movie_id))  # Append movie_id if not already in history
        # Limit history to the last 5 movies
        if len(history_list) > 7:
            history_list.pop(0)  # Remove the oldest entry if more than 7
    else:
        history_list = [str(movie_id)]

    # Convert the list back to a comma-separated string and set it as a cookie
    response.set_cookie('search_history', ','.join(history_list), max_age=60*60*24*7)  # 1 week expiration

    return response

# Movie player route
@app.route('/movie/<int:movie_id>/play')
def player(movie_id):
    movie_details = get_movie_details(movie_id)
    if not movie_details:
        return render_template('error.html', message='Movie not found!')

    # The player URL from external source
    movie_player_url = f"https://moviesapi.club/movie/{movie_id}"
    return render_template('player.html', movie=movie_details, movie_player_url=movie_player_url)

# Search route with paginated results
@app.route('/search')
def search():
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    if not query:
        return redirect(url_for('home'))

    search_results = fetch_from_tmdb('search/movie', {'query': query, 'page': page})
    movies = search_results.get('results', [])[:10]
    total_pages = search_results.get('total_pages', 1)
    return render_template('search_results.html', movies=movies, query=query, page=page, total_pages=total_pages)

# Automatically open the local website in a browser
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")  # Localhost address for Flask

# Version checking and updating logic
CURRENT_VERSION = "1.0.0"  # Update this with your app's version
VERSION_URL = "https://example.com/version.json"  # URL where the version.json is hosted

def get_executable_path():
    """Get the current executable path"""
    if getattr(sys, 'frozen', False):
        # If the application is bundled into an executable (PyInstaller)
        return sys.executable
    else:
        # If running from source
        return os.path.abspath(__file__)

def check_for_updates():
    try:
        response = requests.get(VERSION_URL)
        if response.status_code == 200:
            data = response.json()
            latest_version = data['version']
            download_url = data['download_url']

            # Compare the current version with the latest version
            if latest_version != CURRENT_VERSION:
                print(f"New version {latest_version} is available!")
                return download_url
            else:
                print("You are using the latest version.")
                return None
        else:
            print("Failed to check for updates.")
            return None
    except Exception as e:
        print(f"Error while checking for updates: {e}")
        return None

def download_update(download_url):
    try:
        # Download the update to the same directory as the current executable
        exe_path = get_executable_path()
        update_path = exe_path + ".new"  # Temporary name for the new EXE

        print("Downloading the latest version...")
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(update_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        print("Update downloaded successfully.")
        return update_path
    except Exception as e:
        print(f"Error while downloading the update: {e}")
        return None

def replace_and_restart(new_exe_path):
    try:
        current_exe = get_executable_path()  # Path to the current EXE

        # Replace the current EXE with the updated one
        print("Replacing the current version with the new one...")
        os.remove(current_exe)  # Remove the old EXE
        shutil.move(new_exe_path, current_exe)  # Replace with the new one
        
        print("Relaunching the new version...")
        # Relaunch the new version
        subprocess.Popen([current_exe])
        sys.exit(0)  # Exit the current app
    except Exception as e:
        print(f"Error while replacing and restarting: {e}")

if __name__ == '__main__':
    # Check for updates before launching the app
    update_url = check_for_updates()
    if update_url:
        new_exe_path = download_update(update_url)
        if new_exe_path:
            replace_and_restart(new_exe_path)

    # Open the browser in a separate thread
    Timer(1, open_browser).start()  # Delay to ensure Flask starts first
    # Run the Flask app
    app.run(debug=True)
