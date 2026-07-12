<template>
    <header class="app-header">
        <div class="header-center">
            <div class="search-container" ref="searchContainerRef">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" v-model="searchQuery" placeholder="Что хочешь послушать?" @input="onSearch"
                    @keydown.enter="goToFullSearch" class="search-input" />

                <Transition name="fade-dropdown">
                    <div v-if="showPreview && hasPreviewResults" class="search-preview-dropdown">

                        <div v-if="searchPreviewResults.songs.length > 0" class="preview-section">
                            <div class="preview-section-title">Треки</div>
                            <div v-for="(track, index) in searchPreviewResults.songs" :key="track.id"
                                class="preview-item" @click.stop="playTrack(index)">
                                <img :src="track.cover || '/default-cover.png'" class="preview-item-cover" />
                                <div class="preview-item-info">
                                    <div class="preview-item-title">{{ track.title }}</div>
                                    <div class="preview-item-subtitle">{{ track.artist }}</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="searchPreviewResults.playlists.length > 0" class="preview-section">
                            <div class="preview-section-title">Плейлисты</div>
                            <div v-for="playlist in searchPreviewResults.playlists" :key="playlist.id"
                                class="preview-item" @click.stop="openPlaylist(playlist.id)">
                                <img :src="playlist.cover || '/default-cover.png'"
                                    class="preview-item-cover-playlist" />
                                <div class="preview-item-info">
                                    <div class="preview-item-title">{{ playlist.title }}</div>
                                    <div class="preview-item-subtitle">Плейлист</div>
                                </div>
                            </div>
                        </div>

                        <div class="preview-footer" @click.stop="goToFullSearch">
                            Нажмите Enter, чтобы увидеть все результаты
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <div class="header-right">
            <div v-if="isAuthenticated" class="profile-dropdown-container" ref="dropdownRef">
                <div class="user-profile" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
                    <span class="user-name">{{ user.name }}</span>
                    <div class="user-avatar">
                        <img :src="user.avatarUrl || '/DefaultAvatar.svg'"
                            @error="$event.target.src = '/DefaultAvatar.svg'" alt="Avatar">
                    </div>
                </div>

                <Transition name="fade-dropdown">
                    <div v-if="isMenuOpen" class="dropdown-menu">
                        <button class="dropdown-item" @click="goToEditProfile">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Редактировать профиль
                        </button>

                        <div class="dropdown-divider"></div>

                        <button class="dropdown-item logout-item" @click="handleLogout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Выйти
                        </button>
                    </div>
                </Transition>
            </div>

            <button v-else @click="handleLogin" class="login-btn">
                Войти
            </button>
        </div>
    </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { usePlayerStore } from '../stores/player'

export default {
    name: 'AppHeader',
    setup() {
        const searchQuery = ref('')
        const isMenuOpen = ref(false)
        const showPreview = ref(false)

        const dropdownRef = ref(null)
        const searchContainerRef = ref(null)
        let debounceTimeout = null

        const router = useRouter()
        const authStore = useAuthStore()
        const playerStore = usePlayerStore()

        const { searchPreviewResults } = storeToRefs(playerStore)

        const isAuthenticated = computed(() => authStore.isAuthenticated)
        const user = computed(() => authStore.user || { name: 'Гость', avatarUrl: '' })

        const hasPreviewResults = computed(() => {
            return searchPreviewResults.value.songs.length > 0 || searchPreviewResults.value.playlists.length > 0
        })

        const onSearch = () => {
            showPreview.value = true
            clearTimeout(debounceTimeout)
            debounceTimeout = setTimeout(() => {
                playerStore.searchPreview(searchQuery.value)
            }, 300)
        }

        const goToFullSearch = () => {
            if (!searchQuery.value.trim()) return
            showPreview.value = false
            router.push({ name: 'Search', query: { q: searchQuery.value } })
        }

        const playTrack = (index) => {
            showPreview.value = false
            // Передаем весь массив результатов и индекс кликнутого трека
            playerStore.playTrackFromList(searchPreviewResults.value.songs, index, `Быстрый поиск: ${searchQuery.value}`)
        }

        const openPlaylist = (id) => {
            showPreview.value = false
            router.push({ name: 'regular-playlist', params: { id } })
        }

        const handleLogin = () => {
            router.push('/login')
        }

        const toggleMenu = () => {
            isMenuOpen.value = !isMenuOpen.value
        }

        const goToEditProfile = () => {
            isMenuOpen.value = false
            router.push('/profile/edit')
        }

        const handleLogout = () => {
            isMenuOpen.value = false
            if (confirm('Выйти из аккаунта?')) {
                authStore.logout()
                router.push('/login')
            }
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
                isMenuOpen.value = false
            }
            if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
                showPreview.value = false
            }
        }

        onMounted(() => {
            document.addEventListener('click', handleClickOutside)
        })

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside)
            clearTimeout(debounceTimeout)
        })

        return {
            searchQuery,
            isMenuOpen,
            showPreview,
            dropdownRef,
            searchContainerRef,
            isAuthenticated,
            user,
            searchPreviewResults,
            hasPreviewResults,
            onSearch,
            goToFullSearch,
            playTrack,
            openPlaylist,
            handleLogin,
            toggleMenu,
            goToEditProfile,
            handleLogout
        }
    }
}
</script>

<style scoped>
.app-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 32px;
    background-color: rgba(248, 246, 244, 0.85);
    backdrop-filter: blur(8px);
    z-index: 10;
}

.header-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 550px;
    display: flex;
    justify-content: center;
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: 16px;
    color: var(--color-foundation-dark-lighter);
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    font-family: 'Pliant', sans-serif;
    font-size: 14px;
    background: var(--color-foundation-surface-white);
    border: 1px solid transparent;
    border-radius: 50px;
    color: var(--color-foundation-dark-dark);
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input::placeholder {
    color: var(--color-foundation-dark-lighter);
}

.search-input:focus {
    border-color: var(--color-foundation-orange-light-active);
    box-shadow: 0 0 0 3px var(--color-foundation-orange-light);
}

.header-right {
    display: flex;
    align-items: center;
    z-index: 2;
}

.user-profile {
    height: 43px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 20px;
    background-color: var(--color-foundation-surface-white);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: background-color 0.2s ease;
}

.user-profile:hover {
    background-color: var(--color-foundation-orange-light);
}

.user-name {
    font-family: 'Pliant', sans-serif;
    font-weight: 500;
    font-size: 13px;
    color: var(--color-foundation-dark-dark);
}

.user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.login-btn {
    height: 43px;
    font-family: 'Pliant', sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: var(--color-foundation-surface-white);
    background-color: var(--color-foundation-orange-normal);
    border: none;
    border-radius: 50px;
    padding: 10px 28px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.login-btn:hover {
    background-color: var(--color-foundation-orange-normal-hover);
}

.login-btn:active {
    transform: scale(0.97);
}

.profile-dropdown-container {
    position: relative;
    z-index: 15;
}

.user-profile.active {
    background-color: var(--color-foundation-orange-light);
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 230px;
    background: var(--color-foundation-surface-white);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid rgba(0, 0, 0, 0.02);
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    border-radius: 10px;
    font-family: 'Pliant', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.dropdown-item svg {
    color: var(--color-foundation-dark-lighter);
    transition: color 0.15s ease;
}

.dropdown-item:hover {
    background-color: var(--color-foundation-surface-light);
}

.dropdown-divider {
    height: 1px;
    background-color: var(--color-foundation-orange-light-active);
    margin: 4px 6px;
    opacity: 0.5;
}

.dropdown-item.logout-item {
    color: #E64646;
}

.dropdown-item.logout-item svg {
    color: #E64646;
}

.dropdown-item.logout-item:hover {
    background-color: #FFF5F5;
}

.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.search-preview-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
    z-index: 200;
    overflow: hidden;
}

.preview-section {
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.preview-section-title {
    padding: 4px 18px;
    font-family: 'Pliant', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-foundation-dark-lighter);
    letter-spacing: 0.05em;
}

.preview-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 18px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.preview-item:hover {
    background: var(--color-foundation-orange-light);
}

.preview-item-cover {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
}

.preview-item-cover-playlist {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
}

.preview-item-info {
    min-width: 0;
}

.preview-item-title {
    font-family: 'Pliant', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preview-item-subtitle {
    font-family: 'Pliant', sans-serif;
    font-size: 11px;
    color: var(--color-foundation-dark-lighter);
    margin-top: 1px;
}

.preview-footer {
    padding: 12px;
    text-align: center;
    font-family: 'Pliant', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-foundation-orange-normal);
    background: rgba(255, 126, 58, 0.03);
    cursor: pointer;
    transition: background 0.15s ease;
}

.preview-footer:hover {
    background: rgba(255, 126, 58, 0.07);
}
</style>