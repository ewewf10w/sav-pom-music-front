import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    currentTrackIndex: null,
    tracks: [],
    queue: [],
    genres: [],
    playlists: [],
    playlistName: 'Загрузка...',
    audio: null,
    isCurrentTrackTracked: false
  }),
  
  getters: {
    currentTrack: (state) => state.queue[state.currentTrackIndex] || null
  },
  
  actions: {
    initAudio() {
      if (!this.audio) {
        this.audio = new Audio()
        
        this.audio.ontimeupdate = () => {
          if (!this.audio.duration || this.isCurrentTrackTracked) return

          if (this.audio.currentTime >= this.audio.duration / 2) {
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

    async fetchPlaylists() {
      try {
        const response = await fetch('http://26.64.191.160:8000/api/playlists?skip=0&limit=50')
        if (!response.ok) throw new Error('Ошибка при загрузке плейлистов')
      
        const serverPlaylists = await response.json()
      
        // Маппим данные точно так же, как для жанров
        this.playlists = serverPlaylists.map(playlist => ({
          id: playlist.id,
          // На бэкенде поле называется "name", а у жанров было "title"
          title: playlist.name, 
          description: playlist.description || 'Пользовательский плейлист',
          cover: playlist.cover_url ? `http://26.64.191.160:8000${playlist.cover_url}` : '/DefaultCover.svg',
        }))
      } catch (error) {
        console.error('Не удалось загрузить плейлисты:', error)
      }
    },

    async fetchPlaylist() {
      try {
        const response = await fetch('http://26.64.191.160:8000/api/songs/popular') 
        if (!response.ok) throw new Error('Ошибка при ответе сервера')
        
        const serverTracks = await response.json()
        
        this.tracks = serverTracks.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          src: (track.url && track.url !== 'string') ? `http://26.64.191.160:8000${track.url}` : '', 
          listens: track.plays_count || 0,
          cover: track.cover_url ? `http://26.64.191.160:8000${track.cover_url}` : '/DefaultCover.svg',
          duration: track.duration,
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
        const response = await fetch('http://26.64.191.160:8000/api/genres')
        if (!response.ok) throw new Error('Ошибка при загрузке жанров')
        
        const serverGenres = await response.json()
        
        this.genres = serverGenres.map(genre => ({
          id: genre.id,
          title: genre.title,
          description: genre.description || 'Лучшие треки этого жанра',
          cover: genre.cover_url ? `http://26.64.191.160:8000${genre.cover_url}` : '/DefaultCover.svg',
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

      if (this.audio) {
        this.audio.src = targetTrack.src
        this.audio.load()
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
        const response = await fetch(`http://26.64.191.160:8000/api/songs/${songId}/play`, {
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
    }
  }
})