import { defineStore } from 'pinia'
import { ref } from 'vue'

const BACKEND_URL = import.meta.env.VITE_API_URL

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref({
    tracks: [],
    playlists: [],
    artists: []
  })
  const isLoading = ref(false)

  async function searchAll(searchQuery) {
    if (!searchQuery.trim()) {
      results.value = { tracks: [], playlists: [], artists: [] }
      return
    }

    isLoading.value = true
    try {
      const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Ошибка поиска')
      
      const data = await response.json()
      
      results.value = {
        tracks: (data.tracks || []).map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          cover: t.cover_url ? `${BACKEND_URL}${t.cover_url}` : '/DefaultCover.svg',
          src: `${BACKEND_URL}${t.url}`
        })),
        playlists: (data.playlists || []).map(p => ({
          id: p.id,
          title: p.name,
          cover: p.cover_url ? `${BACKEND_URL}${p.cover_url}` : '/DefaultCover.svg'
        })),
        artists: (data.artists || []).map(a => ({
          id: a.id,
          name: a.username || a.name,
          avatar: a.avatar_url ? `${BACKEND_URL}${a.avatar_url}` : '/DefaultAvatar.svg'
        }))
      }
    } catch (error) {
      console.error('Ошибка при поиске:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    query,
    results,
    isLoading,
    searchAll
  }
})