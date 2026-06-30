<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="auth-title">Редактирование профиля</h2>

            <form @submit.prevent="handleSubmit" class="auth-form">
                <div class="avatar-upload-container">
                    <div class="avatar-preview" @click="triggerFileInput">
                        <img :src="previewUrl || authStore.user?.avatarUrl || '/DefaultAvatar.svg'" alt="Превью">
                        <div class="avatar-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path
                                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z">
                                </path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </div>
                    </div>
                    <input type="file" ref="fileInputRef" @change="handleFileChange" accept="image/*"
                        class="hidden-file-input" />
                    <span class="upload-hint">Нажмите на фото, чтобы изменить</span>
                </div>

                <div class="input-group">
                    <label for="username">Новый логин</label>
                    <input type="text" id="username" v-model="username" placeholder="Изменить логин" />
                </div>

                <div class="input-group">
                    <label for="password">Новый пароль</label>
                    <input type="password" id="password" v-model="password"
                        placeholder="Оставьте пустым, если не хотите менять" />
                </div>

                <div class="error-container">
                    <Transition name="fade-error" mode="out-in">
                        <span v-if="errorMessage" :key="errorMessage" class="error-text">
                            {{ errorMessage }}
                        </span>
                    </Transition>
                </div>

                <div class="button-group">
                    <button type="button" @click="router.back()" class="cancel-btn">Отмена</button>
                    <button type="submit" class="auth-btn submit-btn" :disabled="isLoading">
                        {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'EditProfileView',
    setup() {
        const authStore = useAuthStore()
        const router = useRouter()

        const username = ref('')
        const password = ref('')
        const selectedFile = ref(null)
        const previewUrl = ref('')

        const errorMessage = ref('')
        const isLoading = ref(false)
        const fileInputRef = ref(null)

        onMounted(() => {
            if (authStore.user) {
                username.value = authStore.user.name
            }
        })

        const triggerFileInput = () => {
            fileInputRef.value.click()
        }

        const handleFileChange = (event) => {
            const file = event.target.files[0]
            if (file) {
                selectedFile.value = file
                previewUrl.value = URL.createObjectURL(file)
            }
        }

        const handleSubmit = async () => {
            try {
                isLoading.value = true
                errorMessage.value = ''

                const formData = new FormData()

                if (username.value) formData.append('username', username.value)
                if (password.value) formData.append('password', password.value)
                if (selectedFile.value) formData.append('avatar', selectedFile.value)

                await authStore.updateProfile(formData)

                router.push('/home')
            } catch (error) {
                errorMessage.value = error.message
            } finally {
                isLoading.value = false
            }
        }

        return {
            username,
            password,
            previewUrl,
            errorMessage,
            isLoading,
            fileInputRef,
            authStore,
            router,
            triggerFileInput,
            handleFileChange,
            handleSubmit
        }
    }
}
</script>

<style scoped>
.auth-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    width: 100%;
}

.auth-card {
    background: var(--color-foundation-surface-white);
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.auth-title {
    font-family: var(--third-family), sans-serif;
    font-weight: 600;
    font-size: 24px;
    color: var(--color-foundation-dark-dark);
    text-align: center;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.avatar-upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.avatar-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border: 2px solid var(--color-foundation-orange-light-active);
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.avatar-preview:hover .avatar-overlay {
    opacity: 1;
}

.hidden-file-input {
    display: none;
}

.upload-hint {
    font-size: 12px;
    color: var(--color-foundation-dark-lighter);
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-group label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-foundation-dark-light-active);
}

.input-group input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid var(--color-foundation-orange-light-active);
    background: var(--color-foundation-surface-light);
    font-family: 'Pliant', sans-serif;
    font-size: 14px;
    color: var(--color-foundation-dark-dark);
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
    border-color: var(--color-foundation-orange-normal);
    box-shadow: 0 0 0 3px var(--color-foundation-orange-light);
    background: var(--color-foundation-surface-white);
}

.button-group {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.auth-btn,
.cancel-btn {
    flex: 1;
    padding: 14px;
    border-radius: 50px;
    font-family: 'Pliant', sans-serif;
    font-weight: 500;
    font-size: 15px;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.submit-btn {
    background-color: var(--color-foundation-orange-normal);
    color: var(--color-foundation-surface-white);
}

.submit-btn:hover:not(:disabled) {
    background-color: var(--color-foundation-orange-normal-hover);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-btn {
    background-color: var(--color-foundation-surface-light);
    color: var(--color-foundation-dark-dark);
    border: 1px solid var(--color-foundation-orange-light-active);
}

.cancel-btn:hover {
    background-color: var(--color-foundation-orange-light);
}

.auth-btn:active,
.cancel-btn:active {
    transform: scale(0.98);
}

.error-container {
    height: 20px;
    margin-top: -4px;
    display: flex;
    align-items: center;
}

.error-text {
    color: #E64646;
    font-size: 13px;
    font-weight: 500;
}

.fade-error-enter-active,
.fade-error-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-error-enter-from,
.fade-error-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>