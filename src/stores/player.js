import { defineStore } from 'pinia'

const BACKEND_URL = import.meta.env.VITE_API_URL

const mapPlaylistData = (playlist) => {
  const count = playlist.songs_count || (playlist.songs ? playlist.songs.length : 0)
  
  return {
    id: playlist.id,
    title: playlist.name, 
    songsCount: count,
    songs: playlist.songs || [], 
    description: playlist.description || '',
    isPrivate: playlist.is_public === false,
    cover: playlist.cover_url 
      ? `${BACKEND_URL}${playlist.cover_url}` 
      : '/DefaultCover.svg',
  }
}

const mapSongData = (song) => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  cover: song.cover_url ? `${BACKEND_URL}${song.cover_url}` : '/DefaultCover.svg',
  src: song.url && song.url !== 'string' ? `${BACKEND_URL}${song.url}` : '',
  listens: song.plays_count || 0,
  duration: song.duration,
  genre: song.genre || '',
});

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    currentTrackIndex: null,
    tracks: [],
    queue: [],
    genres: [],
    playlists: [],
    myPlaylists: [],
    likedPlaylists: [],
    playlistName: 'Загрузка...',
    audio: null,
    isCurrentTrackTracked: false,
    favoriteTrackIds: [],
    activeTrackMenuId: null,
    searchPreviewResults: { songs: [], playlists: [] },
    searchPageResults: { songs: [], playlists: [] },
    isSearchLoading: false,
    myUploadedTracks: [],
  }),
  
  getters: {
    currentTrack: (state) => state.queue[state.currentTrackIndex] || null
  },
  
  actions: {
    initAudio() {
      if (!this.audio) {
        this.audio = new Audio()
        
        let lastTime = 0;
        this.secondsListened = 0;
        
        this.audio.ontimeupdate = () => {
          if (!this.audio.duration || this.isCurrentTrackTracked) return

          const delta = this.audio.currentTime - lastTime;
          
          if (delta > 0 && delta < 2) {
            this.secondsListened += delta;
          }
          
          lastTime = this.audio.currentTime;

          if (this.secondsListened >= this.audio.duration / 2) {
            this.isCurrentTrackTracked = true
            if (this.currentTrack) {
              this.trackPlayed(this.currentTrack.id)
            }
          }
        }
        
        this.audio.onended = () => {
          this.nextTrack()
        }
      }
    },

    async fetchMyUploadedTracks() {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "accept": "application/json"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BACKEND_URL}/api/songs/mine?skip=0&limit=50`, {
          method: "GET",
          headers: headers
        });

        if (!response.ok) throw new Error("Не удалось загрузить ваши треки");
        
        const data = await response.json();
        
        this.myUploadedTracks = Array.isArray(data) ? data.map(mapSongData) : [];
      } catch (error) {
        console.error("Ошибка при получении загруженных треков:", error);
      }
    },

    async deleteUploadedTrack(songId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BACKEND_URL}/api/songs/${songId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "application/json"
          }
        });

        if (response.ok) {
          this.myUploadedTracks = this.myUploadedTracks.filter(t => t.id !== songId);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Ошибка при удалении трека в сторе:", error);
        return false;
      }
    },

    async searchPreview(query) {
      if (!query.trim()) {
        this.searchPreviewResults = { songs: [], playlists: [] };
        return;
      }
      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(`${BACKEND_URL}/api/search?query=${encodedQuery}&skip=0&limit=5`, { 
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          this.searchPreviewResults.songs = Array.isArray(data.songs) ? data.songs.map(mapSongData) : [];
          this.searchPreviewResults.playlists = (data.playlists || []).map(mapPlaylistData);
        }
      } catch (error) {
        console.error('Ошибка быстрого поиска:', error);
      }
    },

    async searchFull(query) {
      if (!query.trim()) return;
      
      this.isSearchLoading = true;
      this.searchPreviewResults = { songs: [], playlists: [] }; 

      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(`${BACKEND_URL}/api/search?query=${encodedQuery}&skip=0&limit=50`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          this.searchPageResults.songs = Array.isArray(data.songs) ? data.songs.map(mapSongData) : [];
          this.searchPageResults.playlists = (data.playlists || []).map(mapPlaylistData);
        }
      } catch (error) {
        console.error('Ошибка полного поиска:', error);
      } finally {
        this.isSearchLoading = false;
      }
    },

    getAuthHeaders() {
      const token = localStorage.getItem('token')
      return token ? { 'Authorization': `Bearer ${token}` } : {}
    },

    async fetchPlaylists() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/playlists?skip=0&limit=50`)
        if (!response.ok) throw new Error('Ошибка при загрузке плейлистов')
      
        const serverPlaylists = await response.json()
        this.playlists = serverPlaylists.map(mapPlaylistData)
      } catch (error) {
        console.error('Не удалось загрузить плейлисты:', error)
      }
    },

    async fetchUserPlaylists(includeSongs = true) {
      const headers = this.getAuthHeaders()

      try {
        const url = `${BACKEND_URL}/api/playlists/mine?skip=0&limit=50&include_songs=${includeSongs}`
        
        const [myRes, likedRes] = await Promise.all([
          fetch(url, { headers }),
          fetch(`${BACKEND_URL}/api/playlists/liked?skip=0&limit=50`, { headers })
            .catch(() => ({ ok: false }))
        ])

        const myData = myRes.ok ? await myRes.json() : []
        const likedData = likedRes.ok ? await likedRes.json() : []

        this.myPlaylists = Array.isArray(myData) ? myData.map(mapPlaylistData) : []
        this.likedPlaylists = Array.isArray(likedData) ? likedData.map(mapPlaylistData) : []
      } catch (error) {
        console.error('Ошибка при загрузке пользовательских плейлистов:', error)
      }
    },

    async fetchPlaylist() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/songs/popular`) 
        if (!response.ok) throw new Error('Ошибка при ответе сервера')
        
        const serverTracks = await response.json()
        
        this.tracks = serverTracks.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          src: (track.url && track.url !== 'string') ? `${BACKEND_URL}${track.url}` : '', 
          listens: track.plays_count || 0,
          cover: track.cover_url ? `${BACKEND_URL}${track.cover_url}` : '/DefaultCover.svg',
          duration: track.duration,
          genre: track.genre || '',
        }))
        
        if (this.queue.length === 0) {
          this.playlistName = 'Все треки'
        }
      } catch (error) {
        console.error('Не удалось загрузить плейлист:', error)
      }
    },

    async fetchGenres() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/genres`)
        if (!response.ok) throw new Error('Ошибка при загрузке жанров')
        
        const serverGenres = await response.json()
        
        this.genres = serverGenres.map(genre => ({
          id: genre.id,
          title: genre.title,
          description: genre.description || 'Лучшие треки этого жанра',
          cover: genre.cover_url ? `${BACKEND_URL}${genre.cover_url}` : '/DefaultCover.svg',
        }))
      } catch (error) {
        console.error('Не удалось загрузить жанры:', error)
      }
    },

    playTrackFromList(trackList, index, playlistName) {
      this.initAudio()

      const targetTrack = trackList[index]
      if (!targetTrack) return

      if (this.currentTrack?.id === targetTrack.id && this.playlistName === playlistName) {
        this.togglePlay()
        return
      }

      this.queue = [...trackList]
      this.currentTrackIndex = index
      this.playlistName = playlistName
      this.isPlaying = true
      this.isCurrentTrackTracked = false
      
      this.secondsListened = 0;
      if (this.audio) {
        this.audio.src = targetTrack.src
        this.audio.load()
        this.audio.currentTime = 0; 
        
        this.audio.play().catch(err => console.error("Ошибка воспроизведения:", err))
      }
    },

    selectTrack(trackId) {
      const index = this.tracks.findIndex(t => t.id === trackId)
      if (index !== -1) {
        this.playTrackFromList(this.tracks, index, 'Все треки')
      }
    },

    togglePlay() {
      this.initAudio()
      if (!this.audio || this.queue.length === 0) return
      
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.audio.play().catch(err => console.error("Не удалось воспроизвести:", err))
      } else {
        this.audio.pause()
      }
    },
    
    nextTrack() {
      if (this.queue.length === 0) return
      
      if (this.currentTrackIndex < this.queue.length - 1) {
        this.currentTrackIndex++
      } else {
        this.currentTrackIndex = 0
      }
      
      this.isPlaying = true
      this.isCurrentTrackTracked = false
      
      if (this.audio && this.currentTrack) {
        this.audio.src = this.currentTrack.src
        this.audio.play().catch(err => console.error(err))
      }
    },
    
    prevTrack() {
      if (this.queue.length === 0) return
      
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--
      } else {
        this.currentTrackIndex = this.queue.length - 1
      }
      
      this.isPlaying = true
      this.isCurrentTrackTracked = false
      
      if (this.audio && this.currentTrack) {
        this.audio.src = this.currentTrack.src
        this.audio.play().catch(err => console.error(err))
      }
    },

    async trackPlayed(songId) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/songs/${songId}/play`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      
        if (response.ok) {
          const updatedTrack = await response.json()
          
          const trackInHome = this.tracks.find(t => t.id === songId)
          if (trackInHome) {
            trackInHome.listens = updatedTrack.plays_count
          }
          
          const trackInQueue = this.queue.find(t => t.id === songId)
          if (trackInQueue) {
            trackInQueue.listens = updatedTrack.plays_count
          }
        }
      } catch (error) {
        console.error('Не удалось засчитать прослушивание:', error)
      }
    },

    async fetchFavorites() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`${BACKEND_URL}/api/favorites?skip=0&limit=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Не удалось загрузить избранное')
        
        const favorites = await response.json()
        this.favoriteTrackIds = favorites.map(track => track.id)
      } catch (error) {
        console.error('Ошибка при получении избранного:', error)
      }
    },

    async addToFavorites(songId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const params = new URLSearchParams()
        params.append('song_id', songId)

        const response = await fetch(`${BACKEND_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        })

        if (response.ok) {
          if (!this.favoriteTrackIds.includes(songId)) {
            this.favoriteTrackIds.push(songId)
          }
        }
      } catch (error) {
        console.error('Не удалось добавить в избранное:', error)
      }
    },

    async removeFromFavorites(songId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`${BACKEND_URL}/api/favorites/${songId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          this.favoriteTrackIds = this.favoriteTrackIds.filter(id => id !== songId)
        }
      } catch (error) {
        console.error('Не удалось удалить из избранного:', error)
      }
    },

    toggleFavorite(songId) {
      if (this.favoriteTrackIds.includes(songId)) {
        this.removeFromFavorites(songId)
      } else {
        this.addToFavorites(songId)
      }
    },

    async toggleLikePlaylist(playlistId, isCurrentlyLiked) {
      const headers = this.getAuthHeaders()
      if (!headers.Authorization) return null

      const method = isCurrentlyLiked ? 'DELETE' : 'POST'
      try {
        const response = await fetch(`${BACKEND_URL}/api/playlists/${playlistId}/like`, {
          method,
          headers
        })

        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.error('Ошибка при изменении лайка плейлиста:', error)
      }
      return null
    },

    async toggleTrackInPlaylist(playlistId, songId, isAdded) {
      const headers = this.getAuthHeaders()
      if (!headers.Authorization) return false

      const method = isAdded ? 'DELETE' : 'POST'
      
      try {
        const params = new URLSearchParams()
        params.append('song_id', songId)

        const response = await fetch(`${BACKEND_URL}/api/playlists/${playlistId}/songs`, {
          method: method,
          headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        })

        if (response.ok) {
          const updatedPlaylist = await response.json()
          
          const playlistIndex = this.myPlaylists.findIndex(p => p.id === playlistId)
          if (playlistIndex !== -1) {
            this.myPlaylists[playlistIndex].songs = updatedPlaylist.songs || []
            this.myPlaylists[playlistIndex].songsCount = updatedPlaylist.songs?.length || 0
          }
          return true
        }
      } catch (error) {
        console.error(`Не удалось изменить состояние трека в плейлисте (метод ${method}):`, error)
      }
      return false
    },  

    async checkIfPlaylistLiked(playlistId) {
      const headers = this.getAuthHeaders()
      if (!headers.Authorization) return false

      try {
        const response = await fetch(`${BACKEND_URL}/api/playlists/liked?skip=0&limit=100`, { headers })
        if (response.ok) {
          const likedPlaylists = await response.json()
          return likedPlaylists.some(p => p.id === playlistId)
        }
      } catch (error) {
        console.error('Ошибка при проверке лайка плейлиста:', error)
      }
      return false
    },
  }
})