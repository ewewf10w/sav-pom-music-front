<template>
    <div class="search-results-page">
        <h1 class="page-title">Результаты поиска по запросу «{{ currentQuery }}»</h1>

        <div v-if="isSearchLoading" class="loader">Ищем лучшие треки и плейлисты...</div>

        <div v-else-if="!hasResults" class="no-results">
            По вашему запросу ничего не найдено. Попробуйте ввести что-то другое.
        </div>

        <div v-else class="results-content">
            <section v-if="searchPageResults.songs.length > 0" class="results-section">
                <h2 class="section-subtitle">Найденные треки</h2>
                <div class="tracks-list">
                    <TrackTile v-for="(track, index) in searchPageResults.songs" :key="track.id" :track="track"
                        :index="index" :isActive="playerStore.currentTrack?.id === track.id"
                        :isPlaying="playerStore.isPlaying" :isFavorite="playerStore.favoriteTrackIds.includes(track.id)"
                        @play="playTrack(index)" @toggle-favorite="playerStore.toggleFavorite(track.id)" />
                </div>
            </section>

            <section v-if="searchPageResults.playlists.length > 0" class="results-section">
                <h2 class="section-subtitle">Плейлисты</h2>
                <div class="playlists">
                    <PlaylistCard v-for="playlist in searchPageResults.playlists" :key="playlist.id"
                        :item="preparePlaylistForCard(playlist)" routePrefix="/playlist" />
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player'
import TrackTile from '../components/TrackTile.vue'
import PlaylistCard from '../components/PlaylistCard.vue'
import { pluralizeTracks } from '../utils/pluralize'

export default {
    name: "SearchResultsView",
    components: { TrackTile, PlaylistCard },
    setup() {
        const route = useRoute()
        const playerStore = usePlayerStore()

        const { searchPageResults, isSearchLoading } = storeToRefs(playerStore)

        const currentQuery = computed(() => route.query.q || '')

        const hasResults = computed(() => {
            return searchPageResults.value.songs.length > 0 || searchPageResults.value.playlists.length > 0
        })

        const triggerSearch = () => {
            if (currentQuery.value) {
                playerStore.searchFull(currentQuery.value)
            }
        }

        const playTrack = (index) => {
            playerStore.playTrackFromList(searchPageResults.value.songs, index, `Поиск: ${currentQuery.value}`);
        }

        const preparePlaylistForCard = (playlist) => {
            return {
                ...playlist,
                description: playlist.songsCount > 0
                    ? pluralizeTracks(playlist.songsCount)
                    : playlist.description || "Нет описания"
            }
        }

        watch(() => route.query.q, triggerSearch)
        onMounted(triggerSearch)

        return {
            currentQuery,
            searchPageResults,
            isSearchLoading,
            hasResults,
            playerStore,
            playTrack,
            preparePlaylistForCard
        }
    }
}
</script>

<style scoped>
.search-results-page {
    padding: 80px 32px 32px 32px;
}

.page-title {
    font-family: 'Pliant', sans-serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--color-foundation-dark-dark);
}

.results-section {
    margin-bottom: 48px;
}

.section-subtitle {
    font-family: 'Pliant', sans-serif;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--color-foundation-dark-dark);
}

.tracks-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.playlists {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
}

.loader,
.no-results {
    font-family: 'Pliant', sans-serif;
    color: var(--color-foundation-dark-lighter);
    text-align: center;
    padding: 80px 0;
    font-size: 15px;
}
</style>