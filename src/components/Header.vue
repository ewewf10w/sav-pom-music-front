<template>
    <header class="app-header">
        <div class="header-center">
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" v-model="searchQuery" placeholder="Что хочешь послушать?" @input="onSearch"
                    class="search-input" />
            </div>
        </div>

        <div class="header-right">
            <div v-if="isAuthenticated" class="user-profile">
                <span class="user-name">{{ user.name }}</span>
                <div class="user-avatar">
                    <img :src="user.avatarUrl || '/DefaultAvatar.svg'" alt="Avatar">
                </div>
            </div>

            <button v-else @click="handleLogin" class="login-btn">
                Войти
            </button>
        </div>
    </header>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'AppHeader',
    setup() {
        const searchQuery = ref('')
        const isAuthenticated = ref(false)
        const user = ref({
            name: 'Александр Помчук',
            avatarUrl: ''
        })

        const onSearch = () => {
            console.log('Поиск:', searchQuery.value)
        }

        const handleLogin = () => {
            isAuthenticated.value = true
        }

        return {
            searchQuery,
            isAuthenticated,
            user,
            onSearch,
            handleLogin
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
</style>