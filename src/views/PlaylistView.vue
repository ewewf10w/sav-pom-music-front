<template>
  <div class="playlist-view">
    <Transition name="fade" mode="out-in">
      <AppLoader v-if="isLoading" key="loader" />

      <div v-else class="playlist-content" key="content">
        <div class="playlist-header-block">
          <div class="playlist-big-cover">
            <div v-if="type === 'favorites'" class="heart-gradient-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="64" height="64">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <img v-else :src="playlistData.cover" alt="Cover" />
          </div>

          <div class="playlist-header-info">
            <span class="playlist-badge">
              {{ type === "genre" ? "Топ по жанру" : "Плейлист" }}
            </span>

            <h1 class="playlist-main-title">
              {{ playlistData.title }}
              <span v-if="playlistData.isPrivate" class="lock-icon" title="Приватный плейлист">🔒</span>

              <div v-if="type === 'playlist' && isOwner" class="manage-playlist-container">
                <button @click.stop="toggleManageMenu" class="dots-btn" title="Управление плейлистом">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>

                <Transition name="slide-fade">
                  <div v-if="isManageMenuOpen" class="context-dropdown" v-inside-click-outside="closeManageMenu">
                    <button @click="openEditModal" class="context-item">
                      Редактировать
                    </button>
                    <button @click="handleDeletePlaylist" class="context-item delete-item">
                      Удалить
                    </button>
                  </div>
                </Transition>
              </div>
            </h1>

            <p class="playlist-main-desc">{{ playlistData.description }}</p>

            <div class="playlist-meta-row">
              <span class="playlist-meta">
                {{ formatTracksCount(playlistSongs.length) }}
              </span>

              <button v-if="type === 'playlist'" @click="handleLikeToggle" class="playlist-like-btn"
                :class="{ 'is-liked': isLiked }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  :fill="isLiked ? 'var(--color-foundation-orange-normal)' : 'none'"
                  :stroke="isLiked ? 'var(--color-foundation-orange-normal)' : 'var(--color-foundation-dark-dark)'"
                  width="18" height="18" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{{ isLiked ? "В избранном" : "В избранное" }}</span>
              </button>

              <div v-if="type === 'playlist' && playlistData.likesCount !== undefined" class="likes-counter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-heart-icon">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{{ playlistData.likesCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="block-container">
          <div class="tracklist">
            <TrackTile v-for="(track, index) in playlistSongs" :key="track.id" :track="track" :index="index"
              :is-active="playerStore.currentTrack?.id === track.id" :is-playing="playerStore.isPlaying"
              :is-favorite="playerStore.favoriteTrackIds.includes(track.id)" @play="playTrack(index)"
              @toggle-favorite="handleFavoriteClick(track.id)" />

            <div v-if="playlistSongs.length === 0" class="playlist-main-desc" style="padding: 16px 0">
              В этом списке пока нет треков.
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <PlaylistModal :is-open="isEditModalOpen" :playlist="playlistData" @close="isEditModalOpen = false"
      @saved="onPlaylistUpdated" />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import AppLoader from "../components/AppLoader.vue";
import TrackTile from "../components/TrackTile.vue";
import PlaylistModal from "../components/PlaylistModal.vue";
import { pluralizeTracks } from "../utils/pluralize";

export default {
  name: "PlaylistView",
  components: {
    AppLoader,
    TrackTile,
    PlaylistModal,
  },
  props: {
    id: {
      type: [Number, String],
      required: false,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const playerStore = usePlayerStore();
    const router = useRouter();

    const isLoading = ref(true);
    const playlistData = ref({});
    const playlistSongs = ref([]);
    const isLiked = ref(false);

    // Управление меню и модальным окном
    const isManageMenuOpen = ref(false);
    const isEditModalOpen = ref(false);

    const BACKEND_URL = import.meta.env.VITE_API_URL;

    const isOwner = computed(() => {
      if (props.type !== "playlist") return false;
      return playerStore.myPlaylists.some((p) => p.id === Number(props.id));
    });

    const formatTracksCount = (count) => pluralizeTracks(count);

    const toggleManageMenu = () => {
      isManageMenuOpen.value = !isManageMenuOpen.value;
    };

    const closeManageMenu = () => {
      isManageMenuOpen.value = false;
    };

    const openEditModal = () => {
      isManageMenuOpen.value = false;
      isEditModalOpen.value = true;
    };

    const mapSongStructure = (song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.cover_url ? `${BACKEND_URL}${song.cover_url}` : "/DefaultCover.svg",
      src: song.url && song.url !== "string" ? `${BACKEND_URL}${song.url}` : "",
      listens: song.plays_count || 0,
      duration: song.duration,
    });

    const fetchPlaylistFromServer = async () => {
      try {
        isLoading.value = true;
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let endpoint = "";
        if (props.type === "favorites") {
          endpoint = `${BACKEND_URL}/api/favorites?skip=0&limit=100`;
        } else if (props.type === "genre") {
          endpoint = `${BACKEND_URL}/api/genres/${props.id}`;
        } else {
          endpoint = `${BACKEND_URL}/api/playlists/${props.id}`;
        }

        const response = await fetch(endpoint, { method: "GET", headers });
        if (!response.ok) throw new Error("Не удалось загрузить данные");
        const data = await response.json();

        if (props.type === "favorites") {
          playlistData.value = {
            title: "Любимые треки",
            description: "Ваша персональная коллекция треков",
            cover: "",
            id: 0,
          };
          playlistSongs.value = data.map(mapSongStructure);
          playerStore.favoriteTrackIds = data.map((song) => song.id);
          isLiked.value = false;
        } else {
          playlistData.value = {
            id: data.id,
            title: props.type === "genre" ? data.title : data.name,
            description: data.description || (props.type === "genre" ? `Лучшие треки в жанре ${data.title}` : "Пользовательский плейлист"),
            cover: data.cover_url ? `${BACKEND_URL}${data.cover_url}` : "/DefaultCover.svg",
            isPrivate: data.is_public === false,
            likesCount: data.likes_count || 0,
          };

          playlistSongs.value = (data.songs || []).map(mapSongStructure);

          if (props.type === "playlist" && token) {
            isLiked.value = await playerStore.checkIfPlaylistLiked(data.id);
          } else {
            isLiked.value = false;
          }
        }
      } catch (error) {
        console.error("Ошибка при получении данных плейлиста:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const onPlaylistUpdated = () => {
      fetchPlaylistFromServer();
      playerStore.fetchUserPlaylists(true);
    };

    const handleDeletePlaylist = async () => {
      if (!confirm("Вы уверены, что хотите полностью удалить этот плейлист?")) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BACKEND_URL}/api/playlists/${props.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          isManageMenuOpen.value = false;
          await playerStore.fetchUserPlaylists(true);
          router.push("/playlists");
        } else {
          alert("Не удалось удалить плейлист");
        }
      } catch (error) {
        console.error("Ошибка при удалении:", error);
      }
    };

    const handleLikeToggle = async () => {
      if (!playlistData.value?.id) return;

      const updated = await playerStore.toggleLikePlaylist(playlistData.value.id, isLiked.value);
      if (updated) {
        isLiked.value = !isLiked.value;
        playlistData.value.likesCount = updated.likes_count;
      }
    };

    const playTrack = (index) => {
      playerStore.playTrackFromList(playlistSongs.value, index, playlistData.value.title);
    };

    const handleFavoriteClick = async (songId) => {
      await playerStore.toggleFavorite(songId);
      if (props.type === "favorites") {
        playlistSongs.value = playlistSongs.value.filter((track) => track.id !== songId);
      }
    };

    onMounted(() => {
      fetchPlaylistFromServer();
      playerStore.fetchFavorites();
    });

    watch([() => props.id, () => props.type], () => {
      fetchPlaylistFromServer();
    });

    return {
      playerStore,
      isLoading,
      playlistData,
      playlistSongs,
      isLiked,
      isOwner,
      isManageMenuOpen,
      isEditModalOpen,
      toggleManageMenu,
      closeManageMenu,
      openEditModal,
      onPlaylistUpdated,
      handleDeletePlaylist,
      handleLikeToggle,
      playTrack,
      handleFavoriteClick,
      formatTracksCount,
    };
  },
  directives: {
    "inside-click-outside": {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener("click", el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener("click", el.clickOutsideEvent);
      },
    },
  },
};
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

.playlist-header-block {
  display: flex;
  gap: 28px;
  align-items: flex-end;
  padding: 10px 6px;
}

.playlist-big-cover {
  width: 192px;
  height: 192px;
}

.playlist-big-cover img {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  object-fit: cover;
}

.heart-gradient-icon {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, #ff7e3a 0%, #ff4b2b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(255, 126, 58, 0.3);
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
  display: flex;
  align-items: center;
  gap: 10px;
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

.lock-icon {
  font-size: 20px;
  user-select: none;
}

.playlist-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.playlist-like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid var(--color-foundation-orange-light-active, #ffe2d1);
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-foundation-dark-dark);
  transition: background 0.2s, border-color 0.2s, transform 0.1s;
}

.playlist-like-btn:hover {
  background: var(--color-foundation-orange-light, #fff5f0);
  border-color: var(--color-foundation-orange-normal);
}

.playlist-like-btn:active {
  transform: scale(0.97);
}

.playlist-like-btn.is-liked {
  border-color: var(--color-foundation-orange-normal);
  background: var(--color-foundation-orange-light-hover, #ffeadd);
  color: var(--color-foundation-orange-normal);
  font-weight: 600;
}

.likes-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--color-foundation-dark-light-active, #8a8a8a);
}

.meta-heart-icon {
  width: 14px;
  height: 14px;
  color: var(--color-foundation-dark-light-active, #8a8a8a);
}

.manage-playlist-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.dots-btn {
  background: none;
  border: none;
  color: var(--color-foundation-dark-lighter);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.dots-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-foundation-orange-normal);
}

.context-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  min-width: 180px;
}

.context-item {
  background: none;
  border: none;
  padding: 10px 14px;
  text-align: left;
  font-family: var(--font-family);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-foundation-dark-dark);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.context-item:hover {
  background: var(--color-foundation-orange-light, #fff5f0);
}

.delete-item {
  color: #e13434;
}

.delete-item:hover {
  background: #fff0f0;
}

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-4px);
  opacity: 0;
}
</style>