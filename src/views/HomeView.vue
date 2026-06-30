<template>
  <div class="home-view">

    <Transition name="fade" mode="out-in">

      <AppLoader v-if="isLoading" key="loader" />

      <div v-else class="home-content" key="content">

        <div class="block-container">
          <div class="block">
            <div class="block-title">
              Топ треков по жанрам
            </div>
            <div class="playlists">
              <router-link v-for="genre in playerStore.genres" :key="genre.id" :to="`/genre/${genre.id}`"
                class="playlist-card" style="text-decoration: none;">
                <div class="playlist-cover">
                  <img :src="genre.cover" alt="Genre cover">
                </div>
                <div class="playlist-info">
                  <div class="playlist-title">
                    {{ genre.title }}
                  </div>
                  <div class="playlist-desc">
                    {{ genre.description }}
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="block">
            <div class="block-title">
              Популярные плейлисты
            </div>
            <div class="playlists">
              <router-link v-for="playlist in playerStore.playlists" :key="playlist.id" :to="`/playlist/${playlist.id}`"
                class="playlist-card" style="text-decoration: none;">
                <div class="playlist-cover">
                  <img :src="playlist.cover" alt="Playlist cover">
                </div>
                <div class="playlist-info">
                  <div class="playlist-title">
                    {{ playlist.title }}
                  </div>
                  <div class="playlist-desc">
                    {{ playlist.description }}
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="top-tracks">
            <div class="block-title">
              Самые популярные треки
            </div>
            <div class="tracklist">
              <div v-for="(track, index) in playerStore.tracks" :key="track.id" class="track-tile"
                :class="{ 'active-track': playerStore.currentTrack?.id === track.id }"
                @click="playerStore.selectTrack(track.id)">
                <div class="track-left">
                  <div class="track-number-container">
                    <div v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying" class="box">
                      <div class="line-1"></div>
                      <div class="line-2"></div>
                      <div class="line-3"></div>
                    </div>
                    <span v-else class="track-number">{{ index + 1 }}</span>
                  </div>

                  <div class="track-cover">
                    <img :src="track.cover" alt="">
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
            </div>
          </div>
        </div>

      </div>
    </Transition>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import AppLoader from '../components/AppLoader.vue'

export default {
  name: 'HomeView',
  components: {
    AppLoader
  },
  setup() {
    const playerStore = usePlayerStore()
    const isLoading = ref(true)

    onMounted(async () => {
      try {
        isLoading.value = true
        await Promise.all([
          playerStore.fetchPlaylist(),
          playerStore.fetchGenres(),
          playerStore.fetchPlaylists()
        ])
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    const formatListens = (count) => {
      if (!count) return '0'
      if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
      if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
      return count
    }

    return {
      playerStore,
      isLoading,
      formatListens
    }
  }
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.block-container {
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
}

.block-title {
  font-family: var(--third-family);
  font-weight: 500;
  font-size: 20px;
  line-height: 120%;
  letter-spacing: 0.05em;
  color: var(--color-foundation-dark-dark);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.playlist-card {
  border: 0.75px solid var(--color-foundation-orange-light-active);
  border-radius: 16px;
  padding: 16px 16px 12px;
  max-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playlist-card:hover {
  background: var(--color-foundation-orange-light);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.playlists {
  display: flex;
  gap: 32px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-title {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-dark);
}

.playlist-desc {
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-lighter);
}

.playlist-cover img {
  border-radius: 12px;
  width: 128px;
  height: 128px;
  object-fit: cover;
}

.top-tracks {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.track-tile {
  background: var(--color-foundation-surface-white);
  border-radius: 16px;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  border-left: 4px solid transparent;
}

.track-tile:hover {
  background: var(--color-foundation-orange-light);
}

.track-tile:active {
  transform: scale(0.99);
}

.playlist-card:active {
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

.track-number {
  min-width: 24px;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-foundation-dark-lighter);
  display: flex;
  justify-content: center;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.track-title {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-dark);
}

.track-artist {
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-lighter);
}

.track-cover img {
  border-radius: 16px;
  width: 52px;
  height: 52px;
  object-fit: cover;
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

.tracklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.line-1 {
  position: relative;
  width: 3px;
  height: 15px;
  background-color: var(--color-foundation-orange-normal, #FF7E3A);
  animation: go-up-down 0.5s infinite alternate;
}

.line-2 {
  position: relative;
  width: 3px;
  height: 15px;
  background-color: var(--color-foundation-orange-normal, #FF7E3A);
  animation: go-up-down 0.7s infinite alternate;
}

.line-3 {
  position: relative;
  width: 3px;
  height: 15px;
  background-color: var(--color-foundation-orange-normal, #FF7E3A);
  animation: go-up-down 0.6s infinite alternate;
}

.track-number-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
</style>