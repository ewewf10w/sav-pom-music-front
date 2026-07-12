<template>
    <router-link :to="`${routePrefix}/${item.id}`" class="playlist-card" style="text-decoration: none">
        <div class="playlist-cover">
            <img :src="item.cover" alt="Playlist cover" />
        </div>
        <div class="playlist-info">
            <div class="playlist-title">
                {{ item.title || item.name }}
            </div>
            <div class="playlist-desc">
                {{ item.description }}
            </div>
        </div>
    </router-link>
</template>

<script>
export default {
    name: "PlaylistCard",
    props: {
        item: {
            type: Object,
            required: true,
        },
        routePrefix: {
            type: String,
            required: true,
        },
    },
};
</script>

<style scoped>
.playlist-card {
    border: 0.75px solid var(--color-foundation-orange-light-active);
    background: var(--color-foundation-surface-white, #fff);
    border-radius: 16px;
    padding: 16px 16px 12px;
    max-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition:
        background 0.2s ease,
        transform 0.1s ease;
}

.playlist-card:hover {
    background: var(--color-foundation-orange-light);
    cursor: pointer;
    transform: translateY(-2px);
}

.playlist-card:active {
    transform: scale(0.99);
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-desc {
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 14px;
    letter-spacing: 0.01em;
    color: var(--color-foundation-dark-lighter);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.playlist-cover img {
    border-radius: 12px;
    width: 128px;
    height: 128px;
    object-fit: cover;
}
</style>