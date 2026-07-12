<template>
  <div class="home-view">
    <div class="page-header">
      <h1 class="page-title">Главная</h1>
    </div>

    <Transition name="fade" mode="out-in">
      <AppLoader v-if="isLoading" key="loader" />

      <div v-else class="home-content" key="content">

        <div class="block-container">
          <div class="block">
            <div class="block-header">
              <div class="block-title">Топ треков по жанрам</div>
              <div v-if="playerStore.genres.length > 0" class="carousel-controls">
                <button @click="scrollCarousel(genresSlider, 'left')" class="control-btn" aria-label="Назад">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button @click="scrollCarousel(genresSlider, 'right')" class="control-btn" aria-label="Вперед">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div ref="genresSlider" class="playlists">
              <PlaylistCard v-for="genre in playerStore.genres" :key="genre.id" :item="genre" route-prefix="/genre" />
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="block">
            <div class="block-header">
              <div class="block-title">Популярные плейлисты</div>
              <div v-if="playerStore.playlists.length > 0" class="carousel-controls">
                <button @click="scrollCarousel(playlistsSlider, 'left')" class="control-btn" aria-label="Назад">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button @click="scrollCarousel(playlistsSlider, 'right')" class="control-btn" aria-label="Вперед">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div ref="playlistsSlider" class="playlists">
              <PlaylistCard v-for="playlist in playerStore.playlists" :key="playlist.id" :item="playlist"
                route-prefix="/playlist" />
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="top-tracks">
            <div class="block-title">Самые популярные треки</div>
            <div class="tracklist">
              <TrackTile v-for="(track, index) in popularTracks" :key="track.id" :track="track" :index="index"
                :is-active="playerStore.currentTrack?.id === track.id" :is-playing="playerStore.isPlaying"
                :is-favorite="playerStore.favoriteTrackIds.includes(track.id)" @play="playPopularTrack(index)"
                @toggle-favorite="playerStore.toggleFavorite(track.id)" />

              <div v-if="popularTracks.length === 0" class="empty-message">
                Не удалось загрузить популярные треки.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { usePlayerStore } from "../stores/player";
import AppLoader from "../components/AppLoader.vue";
import TrackTile from "../components/TrackTile.vue";
import PlaylistCard from "../components/PlaylistCard.vue";

export default {
  name: "HomeView",
  components: {
    AppLoader,
    TrackTile,
    PlaylistCard,
  },
  setup() {
    const playerStore = usePlayerStore();
    const isLoading = ref(true);
    const popularTracks = ref([]);

    const genresSlider = ref(null);
    const playlistsSlider = ref(null);

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://26.64.191.160:8000";

    const mapSongStructure = (song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.cover_url ? `${BACKEND_URL}${song.cover_url}` : "/DefaultCover.svg",
      src: song.url && song.url !== "string" ? `${BACKEND_URL}${song.url}` : "",
      listens: song.plays_count || 0,
      duration: song.duration,
    });

    const fetchPopularTracks = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/songs/popular?limit=10`, {
          method: "GET",
          headers: {
            "accept": "application/json"
          }
        });
        if (!response.ok) throw new Error("Не удалось загрузить популярные треки");
        const data = await response.json();
        popularTracks.value = data.map(mapSongStructure);
      } catch (error) {
        console.error("Ошибка при получении популярных треков:", error);
      }
    };

    const playPopularTrack = (index) => {
      if (typeof playerStore.playTrackFromList === "function") {
        playerStore.playTrackFromList(popularTracks.value, index, "Самые популярные треки");
      } else {
        const trackId = popularTracks.value[index].id;
        playerStore.selectTrack(trackId);
      }
    };

    const scrollCarousel = (elementRef, direction) => {
      if (!elementRef) return;
      const scrollAmount = elementRef.clientWidth * 0.75;
      elementRef.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    };

    onMounted(async () => {
      try {
        isLoading.value = true;
        await Promise.all([
          playerStore.fetchPlaylist(),
          playerStore.fetchGenres(),
          playerStore.fetchPlaylists(),
          fetchPopularTracks(),
          playerStore.fetchFavorites ? playerStore.fetchFavorites() : Promise.resolve(),
        ]);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      playerStore,
      isLoading,
      popularTracks,
      genresSlider,
      playlistsSlider,
      playPopularTrack,
      scrollCarousel
    };
  },
};
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 6px 0;
}

.page-title {
  font-family: var(--third-family);
  font-size: 36px;
  font-weight: 600;
  color: var(--color-foundation-dark-dark);
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
  overflow: hidden;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.block-title {
  font-family: var(--third-family);
  font-weight: 500;
  font-size: 20px;
  line-height: 120%;
  letter-spacing: 0.05em;
  color: var(--color-foundation-dark-dark);
}

.carousel-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--color-foundation-dark-dark);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: background 0.2s, color 0.2s, transform 0.1s;
}

.control-btn:hover {
  background: var(--color-foundation-orange-light);
  color: var(--color-foundation-orange-normal);
  border-color: var(--color-foundation-orange-light-active);
}

.control-btn:active {
  transform: scale(0.95);
}

.block {
  display: flex;
  flex-direction: column;
}

.playlists {
  display: flex;
  flex-wrap: nowrap;
  gap: 32px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.playlists::-webkit-scrollbar {
  display: none;
}

.playlists>* {
  flex-shrink: 0;
}

.top-tracks {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tracklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-message {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-foundation-dark-lighter);
  padding: 10px 0;
}
</style>