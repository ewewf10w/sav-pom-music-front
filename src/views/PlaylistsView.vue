<template>
  <div class="playlists-view">
    <div class="page-header">
      <h1 class="page-title">Мои плейлисты</h1>
      <button @click="isModalOpen = true" class="create-playlist-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Создать плейлист
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <AppLoader v-if="isLoading" key="loader" />

      <div v-else class="playlists-content" key="content">
        <div class="block-container">
          <div class="block">
            <div class="block-header">
              <div class="block-title">Созданные плейлисты</div>
              <div v-if="myPlaylists.length > 0" class="carousel-controls">
                <button @click="scrollCarousel(myPlaylistsSlider, 'left')" class="control-btn" aria-label="Назад">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button @click="scrollCarousel(myPlaylistsSlider, 'right')" class="control-btn" aria-label="Вперед">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="myPlaylists.length > 0" ref="myPlaylistsSlider" class="playlists">
              <PlaylistCard v-for="playlist in myPlaylists" :key="playlist.id" :item="preparePlaylistForCard(playlist)"
                routePrefix="/playlist" type="playlist" />
            </div>
            <div v-else class="empty-message">
              У вас пока нет созданных плейлистов. Создайте первый!
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="block">
            <div class="block-header">
              <div class="block-title">Понравившиеся плейлисты</div>
              <div v-if="likedPlaylists.length > 0" class="carousel-controls">
                <button @click="scrollCarousel(likedPlaylistsSlider, 'left')" class="control-btn" aria-label="Назад">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button @click="scrollCarousel(likedPlaylistsSlider, 'right')" class="control-btn" aria-label="Вперед">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="likedPlaylists.length > 0" ref="likedPlaylistsSlider" class="playlists">
              <PlaylistCard v-for="playlist in likedPlaylists" :key="playlist.id"
                :item="preparePlaylistForCard(playlist)" routePrefix="/playlist" type="playlist" />
            </div>
            <div v-else class="empty-message">
              Вы ещё не добавляли чужие плейлисты в избранное.
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <PlaylistModal :is-open="isModalOpen" @close="isModalOpen = false" @saved="loadPlaylists" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "../stores/player";
import AppLoader from "../components/AppLoader.vue";
import PlaylistCard from "../components/PlaylistCard.vue";
import PlaylistModal from "../components/PlaylistModal.vue";
import { pluralizeTracks } from "../utils/pluralize";

export default {
  name: "PlaylistsView",
  components: {
    AppLoader,
    PlaylistCard,
    PlaylistModal,
  },
  setup() {
    const playerStore = usePlayerStore();
    const { myPlaylists, likedPlaylists } = storeToRefs(playerStore);

    const isLoading = ref(true);
    const isModalOpen = ref(false);

    const myPlaylistsSlider = ref(null);
    const likedPlaylistsSlider = ref(null);

    const BACKEND_URL = import.meta.env.VITE_API_URL || "";

    const loadPlaylists = async () => {
      isLoading.value = true;
      await playerStore.fetchUserPlaylists(true);
      isLoading.value = false;
    };

    const preparePlaylistForCard = (playlist) => {
      const count = playlist.songsCount !== undefined ? playlist.songsCount : (playlist.songs_count || 0);

      const coverUrl = playlist.cover_url
        ? `${BACKEND_URL}${playlist.cover_url}`
        : (playlist.cover || "/DefaultCover.svg");

      return {
        ...playlist,
        title: playlist.name || playlist.title,
        cover: coverUrl,
        description: count > 0
          ? pluralizeTracks(count)
          : playlist.description || "Нет описания"
      };
    };

    const scrollCarousel = (elementRef, direction) => {
      if (!elementRef) return;

      const scrollAmount = elementRef.clientWidth * 0.75;

      elementRef.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    };

    onMounted(() => {
      loadPlaylists();
    });

    return {
      isLoading,
      isModalOpen,
      myPlaylists,
      likedPlaylists,
      myPlaylistsSlider,
      likedPlaylistsSlider,
      loadPlaylists,
      preparePlaylistForCard,
      scrollCarousel
    };
  },
};
</script>

<style scoped>
.playlists-view {
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

.create-playlist-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-foundation-orange-normal, #ff7e3a);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 14px;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 126, 58, 0.2);
  transition: background 0.2s, transform 0.1s;
}

.create-playlist-btn:hover {
  background: #f06a25;
}

.create-playlist-btn:active {
  transform: scale(0.98);
}

.playlists-content {
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
  /* Скрываем стандартный скроллбар */
  scrollbar-width: none;
  /* Для Firefox */
  padding-bottom: 4px;
}

.playlists::-webkit-scrollbar {
  display: none;
}

.playlists>* {
  flex-shrink: 0;
}

.empty-message {
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-foundation-dark-lighter);
  padding: 10px 0;
}
</style>