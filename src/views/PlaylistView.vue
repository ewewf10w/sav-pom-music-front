<template>
    <div class="playlist-view">

        <Transition name="fade" mode="out-in">
            <AppLoader v-if="isLoading" key="loader" />

            <div v-else class="playlist-content" key="content">
                <div class="playlist-header-block">
                    <div class="playlist-big-cover">
                        <img :src="playlistData.cover" alt="Cover">
                    </div>
                    <div class="playlist-header-info">
                        <span class="playlist-badge">
                            {{ type === 'genre' ? 'Топ по жанру' : 'Плейлист' }}
                        </span>
                        <h1 class="playlist-main-title">{{ playlistData.title }}</h1>
                        <p class="playlist-main-desc">{{ playlistData.description }}</p>
                        <span class="playlist-meta">{{ formatTracksCount(playlistSongs.length) }}</span>
                    </div>
                </div>

                <div class="block-container">
                    <div class="tracklist">
                        <div v-for="(track, index) in playlistSongs" :key="track.id" class="track-tile"
                            :class="{ 'active-track': playerStore.currentTrack?.id === track.id }"
                            @click="playTrack(index)">

                            <div class="track-left">
                                <div class="track-number-container">
                                    <div v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying"
                                        class="box">
                                        <div class="line-1"></div>
                                        <div class="line-2"></div>
                                        <div class="line-3"></div>
                                    </div>
                                    <span v-else class="track-number">{{ index + 1 }}</span>
                                </div>

                                <div class="track-cover">
                                    <img :src="track.cover" alt="Track cover">
                                </div>
                                <div class="track-info">
                                    <div class="track-title">{{ track.title }}</div>
                                    <div class="track-artist">{{ track.artist }}</div>
                                </div>
                            </div>

                            <div class="track-right">
                                <span class="track-listens">🎧 {{ formatListens(track.listens) }}</span>
                            </div>
                        </div>

                        <div v-if="playlistSongs.length === 0" class="playlist-main-desc" style="padding: 16px 0;">
                            В этом списке пока нет треков.
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { usePlayerStore } from '../stores/player'
import AppLoader from '../components/AppLoader.vue'
import { pluralizeTracks } from '../utils/pluralize'

export default {
    name: 'PlaylistView',
    components: {
        AppLoader
    },
    props: {
        id: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const playerStore = usePlayerStore()

        const isLoading = ref(true)
        const playlistData = ref({})
        const playlistSongs = ref([])

        const BASE_URL = 'http://26.64.191.160:8000'

        const formatTracksCount = (count) => {
            return pluralizeTracks(count)
        }

        const fetchPlaylistFromServer = async () => {
            try {
                isLoading.value = true

                const endpoint = props.type === 'genre'
                    ? `${BASE_URL}/api/genres/${props.id}`
                    : `${BASE_URL}/api/playlists/${props.id}`

                const response = await fetch(endpoint)
                if (!response.ok) throw new Error('Не удалось загрузить данные с сервера')

                const data = await response.json()

                playlistData.value = {
                    title: props.type === 'genre' ? data.title : data.name,
                    description: data.description || (props.type === 'genre' ? `Лучшие треки в жанре ${data.title}` : 'Пользовательский плейлист'),
                    cover: data.cover_url ? `${BASE_URL}${data.cover_url}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s'
                }

                playlistSongs.value = (data.songs || []).map(song => ({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    cover: song.cover_url ? `${BASE_URL}${song.cover_url}` : '/DefaultCover.svg',
                    // Берем song.url (или song.src) и склеиваем с базовым URL, если там нет http
                    src: (song.url && song.url !== 'string') ? `${BASE_URL}${song.url}` : '',
                    listens: song.plays_count || 0,
                    duration: song.duration
                }))

            } catch (error) {
                console.error('Ошибка:', error)
            } finally {
                isLoading.value = false // 3. Гасим спиннер, запускается анимация fade
            }
        }

        onMounted(() => {
            fetchPlaylistFromServer()
        })

        watch(() => props.id, () => {
            fetchPlaylistFromServer()
        })

        const playTrack = (index) => {
            playerStore.playTrackFromList(
                playlistSongs.value,
                index,
                playlistData.value.title
            )
        }

        const formatListens = (count) => {
            if (!count) return '0'
            if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
            if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
            return count
        }

        return {
            playerStore,
            isLoading,
            playlistData,
            playlistSongs,
            playTrack,
            formatListens,
            formatTracksCount,
        }
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.playlist-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
}

.playlist-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.back-btn {
    background: none;
    border: none;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-foundation-dark-lighter);
    cursor: pointer;
    align-self: flex-start;
    transition: color 0.2s;
}

.back-btn:hover {
    color: var(--color-foundation-orange-normal);
}

.playlist-header-block {
    display: flex;
    gap: 28px;
    align-items: flex-end;
    padding: 10px 6px;
}

.playlist-big-cover img {
    width: 192px;
    height: 192px;
    border-radius: 20px;
    object-fit: cover;
}

.playlist-header-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-self: center;
}

.playlist-badge {
    font-family: var(--font-family);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--color-foundation-orange-normal);
}

.playlist-main-title {
    font-family: var(--third-family);
    font-size: 36px;
    font-weight: 600;
    color: var(--color-foundation-dark-dark);
}

.playlist-main-desc {
    font-family: var(--font-family);
    font-size: 15px;
    color: var(--color-foundation-dark-lighter);
}

.playlist-meta {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-light-active);
    word-spacing: 2px;
}

.block-container {
    padding: 24px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 24px;
}

.tracklist {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.track-tile {
    background: var(--color-foundation-surface-white);
    border-radius: 16px;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-left: 4px solid transparent;
    transition: background 0.2s, transform 0.1s;
}

.track-tile:hover {
    background: var(--color-foundation-orange-light);
}

.track-tile:active {
    transform: scale(0.99);
}

.active-track {
    background: var(--color-foundation-orange-light-hover) !important;
    border-left-color: var(--color-foundation-orange-normal, #FF7E3A);
}

.track-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.track-number-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
}

.track-number {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-lighter);
}

.track-cover img {
    border-radius: 16px;
    width: 52px;
    height: 52px;
    object-fit: cover;
}

.track-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.track-title {
    font-family: var(--font-family);
    font-weight: 500;
    font-size: 16px;
    color: var(--color-foundation-dark-dark);
}

.track-artist {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-lighter);
}

.track-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.track-listens {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-lighter);
}

.box {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 15px;
    height: 15px;
}

@keyframes go-up-down {
    0% {
        height: 2px;
    }

    100% {
        height: 15px;
    }
}

.line-1,
.line-2,
.line-3 {
    width: 3px;
    background-color: var(--color-foundation-orange-normal, #FF7E3A);
}

.line-1 {
    animation: go-up-down 0.5s infinite alternate;
}

.line-2 {
    animation: go-up-down 0.7s infinite alternate;
}

.line-3 {
    animation: go-up-down 0.6s infinite alternate;
}
</style>