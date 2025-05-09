# 🎧 Spotifriends 🎧 

A Chrome extension to view, like, and comment on your friends' Spotify listening activity — directly from your browser popup.

## Features

- Recreates Spotify's "Friend Activity" feed as on desktop.
- View what your friends are listening to in real-time.
- See track, artist, context (album/playlist) and user profile images.
- Like and play tracks your friends are listening to.
- Advanced backend integration (comments/shared playlists) coming soon!

## Demo

![Demo](./demo.gif)

## Getting Started

### Prerequisites
- Google Chrome browser
- A Spotify account
- Friends on Spotify with public listening activity enabled

### Setup

1. Clone the repository:
```bash
git clone https://github.com/xgui2001/spotify-social.git
cd spotify-social
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
./build.sh
```

4. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`.
- Enable "Developer mode" if it is not already enabled.
- Click "Load unpacked" and select the `dist` directory of the cloned repository.
- The extension should now be loaded and ready to use.

### Usage

1. Click the Spotifriends extension icon in your Chrome toolbar
2. Log in with your Spotify account when prompted
3. View your friends' listening activity in the popup
4. Like tracks by clicking the heart icon
5. Play tracks by clicking the play icon

## Architecture & Technologies

The project consists of:

- **Frontend**: React + Vite based Chrome extension popup
- **Backend**: Express.js API deployed on Vercel
- **Database**: PostgreSQL for storing user data, tracks, and likes

Key technologies used:
- React and Vite for the frontend UI
- Express.js and Node.js for the backend API
- PostgreSQL with pg-promise for database operations
- Vercel for backend deployment 
- JWT and Spotify OAuth for authentication

### Development

Frontend:
```bash
npm run dev
``` 

Backend:
```bash 
# Navigate to backend directory
cd backend #IMPORTANT! Vercel only builds properly from the backend directory 

# Install backend dependencies
npm install

# Run in development mode
npm run dev

# Run database migrations
npm run migrate
``` 

### API Endpoints

- `/api/auth/login` - Authenticate with Spotify
- `/api/tracks` - Track management
- `/api/tracks/:trackId/likes` - Like/unlike tracks
- `/api/health` - API health check

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Spotify's Friend Activity feature
- Content injection technique inspired by [this](https://github.com/jackweatherford/spotify-friend-activity) repo
- Thanks to the Spotify Web API for making this possible



