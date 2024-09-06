import { useState, useEffect } from 'react'
import './App.css'

const App: React.FC = () => {
  const api_url = 'http://localhost:3000'

  const [playlist, setPlaylist] = useState<any>(null)

  const fetchPlaylist = async () => {
    try {
      const response = await fetch('http://localhost:3000/callback'); // The route where your playlist data is sent
      const data = await response.json();
      setPlaylist(data);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
    }
  };

  const handleLogin = () => {
    window.location.href = `${api_url}/login`
    fetchPlaylist()
  }

  console.log(playlist)

  return (
    <div>
      <div>
        <h1>Spotify Login</h1>
        <button onClick={handleLogin}>Login to Spotify</button>
      </div>
      <h1>Spotify Playlist Info</h1>
      {playlist ? (
        <div>
          <h2>{playlist.name}</h2>
          <img src={playlist.cover_photo} alt={playlist.name} style={{ width: '300px' }} />
          <a href={playlist.tracks} target="_blank" rel="noopener noreferrer">View Track List</a>
        </div>
      ) : (
        <p>No playlist info available</p>
      )}
    </div>
  )
}

export default App
