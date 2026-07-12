<template>
    <div class="uploads-view">
        <div class="page-header">
            <h1 class="page-title">Мои загрузки</h1>
            <button @click="openCreateModal" class="upload-track-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Загрузить трек
            </button>
        </div>

        <Transition name="fade" mode="out-in">
            <AppLoader v-if="isLoading" key="loader" />

            <div v-else class="uploads-content" key="content">
                <div class="block-container">
                    <div class="tracklist">
                        <div v-for="(track, index) in playerStore.myUploadedTracks" :key="track.id"
                            class="track-item-row">

                            <TrackTile :track="track" :index="index"
                                :is-active="playerStore.currentTrack?.id === track.id"
                                :is-playing="playerStore.isPlaying"
                                :is-favorite="playerStore.favoriteTrackIds.includes(track.id)" :is-editable="true"
                                @play="playUploadedTrack(index)" @toggle-favorite="playerStore.toggleFavorite(track.id)"
                                @edit-track="openEditModal(track)" @delete-track="handleDeleteTrack(track.id)" />

                        </div>

                        <div v-if="playerStore.myUploadedTracks.length === 0" class="empty-message">
                            Вы ещё не загрузили ни одного трека.
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <Transition name="fade">
            <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            {{ isEditMode ? 'Редактирование трека' : 'Добавление нового трека' }}
                        </h2>
                        <button @click="closeModal" class="modal-close-btn">&times;</button>
                    </div>

                    <form @submit.prevent="handleFormSubmit" class="modal-form">
                        <div v-if="!isEditMode" class="form-group">
                            <label class="form-label">Аудиофайл (.mp3, .wav) <span class="required">*</span></label>
                            <div class="file-input-wrapper">
                                <input type="file" ref="fileInput" accept=".mp3,.wav" @change="handleFileChange"
                                    required class="hidden-file-input" id="track-file" />
                                <label for="track-file" class="file-custom-btn">
                                    {{ selectedFile ? `🎵 ${selectedFile.name}` : 'Выбрать аудиофайл' }}
                                </label>
                            </div>
                        </div>

                        <div v-if="!isEditMode" class="form-group">
                            <label class="form-label">Обложка трека (.jpg, .png, .svg)</label>
                            <div class="file-input-wrapper">
                                <input type="file" ref="coverInput" accept=".jpg,.jpeg,.png,.svg"
                                    @change="handleCoverChange" class="hidden-file-input" id="cover-file" />
                                <label for="cover-file" class="file-custom-btn cover-btn">
                                    {{ selectedCover ? `🖼️ ${selectedCover.name}` : 'Выбрать изображение обложки' }}
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="title" class="form-label">Название трека <span class="required">*</span></label>
                            <input type="text" id="title" v-model="form.title" placeholder="Например, Billie Jean"
                                required class="form-input" />
                        </div>

                        <div class="form-group">
                            <label for="artist" class="form-label">Исполнитель <span class="required">*</span></label>
                            <input type="text" id="artist" v-model="form.artist" placeholder="Например, Michael Jackson"
                                required class="form-input" />
                        </div>

                        <div class="form-group">
                            <label for="genre" class="form-label">Жанр</label>
                            <input type="text" id="genre" v-model="form.genre"
                                placeholder="Например, Pop, Rock, Electronic" class="form-input" />
                        </div>

                        <div class="form-actions">
                            <button type="button" @click="closeModal" class="btn-secondary" :disabled="isSubmitting">
                                Отмена
                            </button>
                            <button type="submit" class="btn-primary" :disabled="isSubmitting">
                                {{ isSubmitting ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' :
                                    'Опубликовать') }}
                            </button>
                        </div>
                    </form>
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

export default {
    name: "UploadsView",
    components: {
        AppLoader,
        TrackTile,
    },
    setup() {
        const playerStore = usePlayerStore();
        const isLoading = ref(true);
        const isModalOpen = ref(false);
        const isSubmitting = ref(false);
        const isEditMode = ref(false);
        const editingTrackId = ref(null);

        const selectedFile = ref(null);
        const selectedCover = ref(null);

        const fileInput = ref(null);
        const coverInput = ref(null);

        const form = ref({ title: "", artist: "", genre: "" });

        const BACKEND_URL = import.meta.env.VITE_API_URL || "http://26.64.191.160:8000";

        const openCreateModal = () => {
            isEditMode.value = false;
            editingTrackId.value = null;
            form.value = { title: "", artist: "", genre: "" };
            isModalOpen.value = true;
        };

        const openEditModal = (track) => {
            isEditMode.value = true;
            editingTrackId.value = track.id;
            form.value = {
                title: track.title,
                artist: track.artist,
                genre: track.genre || ""
            };
            isModalOpen.value = true;
        };

        const handleFileChange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = file.name.split('.').pop().toLowerCase();
                if (ext === 'mp3' || ext === 'wav') {
                    selectedFile.value = file;
                } else {
                    alert("Пожалуйста, выберите файл в формате .mp3 или .wav");
                    selectedFile.value = null;
                    if (fileInput.value) fileInput.value.value = "";
                }
            }
        };

        const handleCoverChange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = file.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg'];
                if (allowedExtensions.includes(ext)) {
                    selectedCover.value = file;
                } else {
                    alert("Пожалуйста, выберите изображение в формате JPG, PNG или SVG");
                    selectedCover.value = null;
                    if (coverInput.value) coverInput.value.value = "";
                }
            }
        };

        const handleFormSubmit = async () => {
            if (isEditMode.value) {
                await handleUpdateSubmit();
            } else {
                await handleUploadSubmit();
            }
        };

        const handleUploadSubmit = async () => {
            if (!selectedFile.value) {
                alert("Выберите аудиофайл!");
                return;
            }
            try {
                isSubmitting.value = true;
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("file", selectedFile.value);
                formData.append("title", form.value.title);
                formData.append("artist", form.value.artist);
                if (form.value.genre) formData.append("genre", form.value.genre);
                if (selectedCover.value) formData.append("cover", selectedCover.value);

                const response = await fetch(`${BACKEND_URL}/api/songs`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });
                if (!response.ok) throw new Error("Ошибка при отправке файла");

                alert("Трек успешно загружен!");
                closeModal();
                if (playerStore.fetchMyUploadedTracks) await playerStore.fetchMyUploadedTracks();
            } catch (error) {
                console.error(error);
                alert("Не удалось загрузить трек.");
            } finally {
                isSubmitting.value = false;
            }
        };

        const handleUpdateSubmit = async () => {
            try {
                isSubmitting.value = true;
                const token = localStorage.getItem("token");
                const payload = {
                    title: form.value.title,
                    artist: form.value.artist,
                    genre: form.value.genre,
                    album: ""
                };

                const response = await fetch(`${BACKEND_URL}/api/songs/${editingTrackId.value}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error("Ошибка при изменении данных трека");

                alert("Данные трека успешно обновлены!");
                closeModal();
                if (playerStore.fetchMyUploadedTracks) await playerStore.fetchMyUploadedTracks();
            } catch (error) {
                console.error(error);
                alert("Не удалось обновить данные трека.");
            } finally {
                isSubmitting.value = false;
            }
        };

        const handleDeleteTrack = async (songId) => {
            if (!confirm("Вы уверены, что хотите полностью удалить этот трек со своего аккаунта?")) return;
            try {
                if (playerStore.deleteUploadedTrack) {
                    await playerStore.deleteUploadedTrack(songId);
                } else {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${BACKEND_URL}/api/songs/${songId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (response.ok) {
                        if (playerStore.fetchMyUploadedTracks) await playerStore.fetchMyUploadedTracks();
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        const closeModal = () => {
            isModalOpen.value = false;
            isEditMode.value = false;
            editingTrackId.value = null;
            selectedFile.value = null;
            selectedCover.value = null;
            form.value = { title: "", artist: "", genre: "" };
            if (fileInput.value) fileInput.value.value = "";
            if (coverInput.value) coverInput.value.value = "";
        };

        const playUploadedTrack = (index) => {
            const trackList = playerStore.myUploadedTracks || [];
            if (typeof playerStore.playTrackFromList === "function") {
                playerStore.playTrackFromList(trackList, index, "Мои загрузки");
            } else {
                playerStore.selectTrack(trackList[index].id);
            }
        };

        onMounted(async () => {
            try {
                isLoading.value = true;
                if (playerStore.fetchMyUploadedTracks) await playerStore.fetchMyUploadedTracks();
                if (playerStore.fetchFavorites) await playerStore.fetchFavorites();
            } catch (e) {
                console.error(e);
            } finally {
                isLoading.value = false;
            }
        });

        return {
            playerStore,
            isLoading,
            isModalOpen,
            isSubmitting,
            isEditMode,
            selectedFile,
            selectedCover,
            fileInput,
            coverInput,
            form,
            openCreateModal,
            openEditModal,
            handleFileChange,
            handleCoverChange,
            handleFormSubmit,
            handleDeleteTrack,
            closeModal,
            playUploadedTrack
        };
    }
};
</script>

<style scoped>
.uploads-view {
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

.upload-track-btn {
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

.upload-track-btn:hover {
    background: #f06a25;
}

.upload-track-btn:active {
    transform: scale(0.98);
}

.uploads-content {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
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

.track-item-row {
    display: flex;
    align-items: center;
    width: 100%;
}

.track-item-row> :first-child {
    flex: 1;
}

.empty-message {
    font-family: var(--font-family);
    font-size: 14px;
    color: var(--color-foundation-dark-lighter);
    padding: 16px 0;
    text-align: center;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-container {
    background: #ffffff;
    border-radius: 24px;
    width: 100%;
    max-width: 480px;
    padding: 28px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--third-family);
    font-size: 22px;
    font-weight: 600;
    color: var(--color-foundation-dark-dark);
}

.modal-close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--color-foundation-dark-lighter);
    cursor: pointer;
    line-height: 1;
}

.modal-close-btn:hover {
    color: var(--color-foundation-dark-dark);
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-foundation-dark-light-active);
}

.required {
    color: #e13434;
}

.form-input {
    font-family: var(--font-family);
    font-size: 14px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    outline: none;
    color: var(--color-foundation-dark-dark);
    transition: border-color 0.2s;
}

.form-input:focus {
    border-color: var(--color-foundation-orange-normal);
}

.hidden-file-input {
    display: none;
}

.file-custom-btn {
    display: block;
    text-align: center;
    padding: 12px;
    background: var(--color-foundation-orange-light, #fff5f0);
    border: 1px dashed var(--color-foundation-orange-normal, #ff7e3a);
    border-radius: 12px;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 13.5px;
    font-weight: 500;
    color: var(--color-foundation-orange-normal);
    transition: background 0.2s;
}

.file-custom-btn:hover {
    background: var(--color-foundation-orange-light-hover, #ffeadd);
}

.file-custom-btn.cover-btn {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
}

.file-custom-btn.cover-btn:hover {
    background: #f1f5f9;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
}

.btn-secondary {
    background: #f1f5f9;
    border: none;
    padding: 10px 18px;
    border-radius: 12px;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
    cursor: pointer;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

.btn-primary {
    background: var(--color-foundation-orange-normal);
    color: white;
    border: none;
    padding: 10px 22px;
    border-radius: 12px;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.btn-primary:hover {
    background: #f06a25;
}

.btn-primary:disabled,
.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>