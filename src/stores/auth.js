import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from './player'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  
  const backendUrl = import.meta.env.VITE_API_URL

  const isAuthenticated = computed(() => !!token.value)

  async function register(username, password) {
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Ошибка при регистрации')
    }

    return true
  }

  async function updateProfile(payload) {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: payload
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Ошибка обновления профиля')
    }

    const data = await response.json()

    user.value = {
      name: data.username,
      avatarUrl: data.avatar_url
        ? (data.avatar_url.startsWith('http') ? data.avatar_url : `${backendUrl}${data.avatar_url}`)
        : ''
    }

    localStorage.setItem('user', JSON.stringify(user.value))
    return data
  }

  async function fetchUserProfile(authToken) {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.ok) {
      const userData = await response.json()

      user.value = {
        name: userData.username || userData.sub || 'Пользователь',
        avatarUrl: userData.avatar_url
          ? (userData.avatar_url.startsWith('http') ? userData.avatar_url : `${backendUrl}${userData.avatar_url}`)
          : ''
      }

      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  async function login(username, password) {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Неверный логин или пароль')
    }

    const data = await response.json()
    token.value = data.access_token
    localStorage.setItem('token', data.access_token)

    await fetchUserProfile(data.access_token)

    const playerStore = usePlayerStore()
    await playerStore.fetchFavorites()
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    const playerStore = usePlayerStore()
    playerStore.favoriteTrackIds = []
  }

  return {
    token,
    isAuthenticated,
    user,
    login,
    logout,
    register,
    updateProfile
  }
})