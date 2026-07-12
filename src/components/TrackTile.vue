<template>
    <div class="track-tile"
        :class="{ 'active-track': isActive, 'has-open-menu': isPlaylistMenuOpen || isEditMenuOpen || isMenuClosing }"
        @click="$emit('play')">
        <div class="track-left">
            <div class="track-number-container">
                <div v-if="isActive && isPlaying" class="box">
                    <div class="line-1"></div>
                    <div class="line-2"></div>
                    <div class="line-3"></div>
                </div>
                <span v-else class="track-number">{{ index + 1 }}</span>
            </div>

            <div class="track-cover">
                <img :src="track.cover" alt="Track cover" />
            </div>
            <div class="track-info">
                <div class="track-title">{{ track.title }}</div>
                <div class="track-artist">{{ track.artist }}</div>
            </div>
        </div>

        <div class="track-right">

            <div class="dropdown-container">
                <button @click.stop="togglePlaylistMenu" class="track-action-btn" title="Добавить в плейлист"
                    :class="{ 'btn-active': isPlaylistMenuOpen }">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>

                <Transition name="slide-fade" @before-leave="isMenuClosing = true" @after-leave="isMenuClosing = false">
                    <div v-if="isPlaylistMenuOpen" class="playlists-dropdown" v-inside-click-outside="closePlaylistMenu"
                        @click.stop>
                        <div class="dropdown-header">Мои плейлисты</div>
                        <div class="dropdown-list">
                            <div v-for="playlist in myPlaylists" :key="playlist.id"
                                @click="handlePlaylistClick(playlist)" class="dropdown-item"
                                :class="{ 'has-track': isTrackInPlaylist(playlist) }">
                                <div class="dropdown-item-left">
                                    <img :src="playlist.cover" class="dropdown-item-cover" />
                                    <span class="dropdown-item-title">{{ playlist.title }}</span>
                                </div>

                                <div class="status-icon-wrapper">
                                    <svg v-if="isTrackInPlaylist(playlist)" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24" fill="none" stroke="var(--color-foundation-orange-normal)"
                                        stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14"
                                        height="14">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <div v-if="myPlaylists.length === 0" class="dropdown-empty">
                                У вас еще нет плейлистов
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <div v-if="isEditable" class="dropdown-container">
                <button @click.stop="toggleEditMenu" class="track-action-btn" title="Управление треком"
                    :class="{ 'btn-active': isEditMenuOpen }">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>

                <Transition name="slide-fade" @before-leave="isMenuClosing = true" @after-leave="isMenuClosing = false">
                    <div v-if="isEditMenuOpen" class="playlists-dropdown edit-dropdown"
                        v-inside-click-outside="closeEditMenu" @click.stop>
                        <div class="context-actions">
                            <div class="dropdown-item action-item" @click="handleEdit">
                                <div class="dropdown-item-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" width="14" height="14">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span class="dropdown-item-title">Редактировать</span>
                                </div>
                            </div>
                            <div class="dropdown-item action-item delete-action" @click="handleDelete">
                                <div class="dropdown-item-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" width="14" height="14">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                        </path>
                                    </svg>
                                    <span class="dropdown-item-title">Удалить трек</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <button @click.stop="$emit('toggle-favorite')" class="track-like-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    :fill="isFavorite ? 'var(--color-foundation-orange-normal)' : 'none'"
                    :stroke="isFavorite ? 'var(--color-foundation-orange-normal)' : 'var(--color-foundation-dark-lighter)'"
                    width="20" height="20">
                    <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </button>

            <span class="track-listens">🎧 {{ formattedListens }}</span>
        </div>
    </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "../stores/player";

export default {
    name: "TrackTile",
    props: {
        track: { type: Object, required: true },
        index: { type: Number, required: true },
        isActive: { type: Boolean, default: false },
        isPlaying: { type: Boolean, default: false },
        isFavorite: { type: Boolean, default: false },
        isEditable: { type: Boolean, default: false }
    },
    emits: ["play", "toggle-favorite", "edit-track", "delete-track"],
    setup(props, { emit }) {
        const playerStore = usePlayerStore();
        const { myPlaylists, activeTrackMenuId } = storeToRefs(playerStore);

        const isEditMenuOpen = ref(false);
        const isMenuClosing = ref(false);

        const isPlaylistMenuOpen = computed(() => activeTrackMenuId.value === props.track.id);

        watch(activeTrackMenuId, (newId) => {
            if (newId !== props.track.id) {
                isEditMenuOpen.value = false;
            }
        });

        const formattedListens = computed(() => {
            const count = props.track.listens;
            if (!count) return "0";
            if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
            if (count >= 1000) return (count / 1000).toFixed(1) + "K";
            return count;
        });

        const togglePlaylistMenu = () => {
            if (isPlaylistMenuOpen.value) {
                playerStore.activeTrackMenuId = null;
            } else {
                isEditMenuOpen.value = false;
                playerStore.activeTrackMenuId = props.track.id;
                playerStore.fetchUserPlaylists(true);
            }
        };

        const closePlaylistMenu = () => {
            if (isPlaylistMenuOpen.value) {
                playerStore.activeTrackMenuId = null;
            }
        };

        const toggleEditMenu = () => {
            if (isEditMenuOpen.value) {
                isEditMenuOpen.value = false;
            } else {
                playerStore.activeTrackMenuId = null;
                isEditMenuOpen.value = true;
            }
        };

        const closeEditMenu = () => {
            isEditMenuOpen.value = false;
        };

        const isTrackInPlaylist = (playlist) => {
            if (!playlist.songs) return false;
            return playlist.songs.some(song => {
                const id = typeof song === 'object' ? song.id : song;
                return id === props.track.id;
            });
        };

        const handlePlaylistClick = async (playlist) => {
            const alreadyAdded = isTrackInPlaylist(playlist);
            await playerStore.toggleTrackInPlaylist(playlist.id, props.track.id, alreadyAdded);
        };

        const handleEdit = () => {
            emit("edit-track", props.track);
            closeEditMenu();
        };

        const handleDelete = () => {
            emit("delete-track", props.track.id);
            closeEditMenu();
        };

        return {
            formattedListens,
            myPlaylists,
            isPlaylistMenuOpen,
            isEditMenuOpen,
            isMenuClosing,
            togglePlaylistMenu,
            closePlaylistMenu,
            toggleEditMenu,
            closeEditMenu,
            isTrackInPlaylist,
            handlePlaylistClick,
            handleEdit,
            handleDelete,
            playerStore
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
    position: relative;
}

.track-tile.has-open-menu {
    z-index: 10;
}

.track-tile:hover {
    background: var(--color-foundation-orange-light);
}

.track-tile:active:not(:has(button:hover)) {
    transform: scale(0.99);
}

.active-track {
    background: var(--color-foundation-orange-light-hover) !important;
    border-left-color: var(--color-foundation-orange-normal, #ff7e3a);
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
    height: 24px;
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

.track-like-btn,
.track-action-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, color 0.2s ease;
    color: var(--color-foundation-dark-lighter);
}

.track-like-btn:hover,
.track-action-btn:hover,
.btn-active {
    transform: scale(1.1);
    color: var(--color-foundation-dark-dark) !important;
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
    gap: 12px;
}

.track-listens {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-lighter);
    width: 70px;
    margin-left: 4px;
}

.dropdown-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.playlists-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 12px);
    width: 220px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: default;
}

.edit-dropdown {
    width: 180px;
}

.context-actions {
    padding: 6px 0;
    display: flex;
    flex-direction: column;
}

.action-item {
    padding: 10px 14px !important;
}

.action-item svg {
    color: var(--color-foundation-dark-lighter);
    transition: color 0.2s ease;
}

.action-item:hover svg {
    color: var(--color-foundation-dark-dark);
}

.delete-action:hover {
    background: rgba(239, 68, 68, 0.08) !important;
}

.delete-action:hover .dropdown-item-title,
.delete-action:hover svg {
    color: #ef4444 !important;
}

.dropdown-header {
    padding: 12px 14px 8px;
    font-family: var(--font-family);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-foundation-dark-lighter);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.dropdown-list {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.dropdown-item:hover {
    background: var(--color-foundation-orange-light);
}

.dropdown-item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex-grow: 1;
}

.dropdown-item-cover {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
}

.dropdown-item-title {
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-icon-wrapper {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.dropdown-item.has-track {
    background: rgba(255, 126, 58, 0.03);
}

.dropdown-item.has-track:hover {
    background: var(--color-foundation-orange-light);
}

.dropdown-empty {
    padding: 16px;
    text-align: center;
    font-family: var(--font-family);
    font-size: 13px;
    color: var(--color-foundation-dark-lighter);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-6px);
    opacity: 0;
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
    position: relative;
    width: 3px;
    height: 15px;
    background-color: var(--color-foundation-orange-normal, #ff7e3a);
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