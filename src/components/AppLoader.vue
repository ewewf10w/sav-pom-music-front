<template>
    <div class="loader-container">
        <div class="spinner"></div>
    </div>
</template>

<script>
export default {
    name: 'AppLoader'
}
</script>

<style scoped>
.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    width: 100%;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 126, 58, 0.1);
    border-left-color: var(--color-foundation-orange-normal, #FF7E3A);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>