import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [bgColor, setBgColor] = useState("rgb(25, 25, 35)");
  const [albumArt, setAlbumArt] = useState(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);

  useEffect(() => {
    if (currentSong) {
      // Change background color every 5 seconds
      const interval = setInterval(() => {
        const colors = [
          "rgb(25, 25, 35)",
          "rgb(35, 25, 35)",
          "rgb(25, 35, 35)",
          "rgb(35, 35, 25)",
        ];
        setBgColor(colors[Math.floor(Math.random() * colors.length)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentSong]);

  const handleFolderSelect = (event) => {
    const folder = event.target.files;
    setSelectedFolder(folder);
    // Convert FileList to array of songs
    const songList = Array.from(folder).filter((file) =>
      file.type.startsWith("audio/")
    );
    setSongs(songList);
  };

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const fetchAlbumArt = async (songName) => {
    setIsLoadingArt(true);
    try {
      const query = encodeURIComponent(
        songName.replace(".mp3", "") + " album art"
      );
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${process.env.REACT_APP_GOOGLE_API_KEY}&cx=${process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID}&q=${query}&searchType=image`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setAlbumArt(data.items[0].link);
      }
    } catch (error) {
      console.error("Error fetching album art:", error);
      setAlbumArt(null);
    }
    setIsLoadingArt(false);
  };

  useEffect(() => {
    if (currentSong) {
      fetchAlbumArt(currentSong.name);
    }
  }, [currentSong]);

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      <div className="sidebar">
        <div className="folder-select">
          <label className="folder-label">
            <i className="fas fa-folder-open"></i>
            <input
              type="file"
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderSelect}
            />
          </label>
        </div>
        <div className="song-list">
          {songs.map((song, index) => (
            <div
              key={index}
              className={`song-item ${currentSong === song ? "active" : ""}`}
              onClick={() => setCurrentSong(song)}
            >
              <i className="fas fa-music"></i>
              <span>{song.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="player">
        {currentSong && (
          <div className="player-content">
            <div className="now-playing">
              <div className="album-art-container">
                {isLoadingArt ? (
                  <div className="loading-art">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading album art...</p>
                  </div>
                ) : albumArt ? (
                  <img src={albumArt} alt="Album Art" className="album-art" />
                ) : (
                  <i className="fas fa-music default-art"></i>
                )}
              </div>
              <h2>{currentSong.name}</h2>
            </div>
            <div className="player-controls">
              <button
                className="control-btn"
                onClick={() => (audioRef.current.currentTime -= 10)}
              >
                <i className="fas fa-backward"></i>
              </button>
              <button className="control-btn play-btn" onClick={togglePlay}>
                <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              </button>
              <button
                className="control-btn"
                onClick={() => (audioRef.current.currentTime += 10)}
              >
                <i className="fas fa-forward"></i>
              </button>
            </div>
            <audio
              ref={audioRef}
              src={URL.createObjectURL(currentSong)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
