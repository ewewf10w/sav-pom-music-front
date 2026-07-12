<template>
    <Transition name="modal-fade">
        <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">{{ isEditMode ? "Редактирование плейлиста" : "Создание плейлиста" }}</h3>
                    <button class="close-btn" @click="closeModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="modal-body">
                    <div class="modal-grid">
                        <div class="cover-upload-section">
                            <div class="cover-preview" @click="triggerFileInput">
                                <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="Preview" />
                                <div v-else class="upload-placeholder">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Выбрать обложку</span>
                                </div>
                            </div>
                            <input type="file" ref="fileInput" accept="image/*" class="hidden-file-input"
                                @change="handleFileChange" />
                        </div>

                        <div class="inputs-section">
                            <div class="form-group">
                                <label for="name">Название *</label>
                                <input type="text" id="name" v-model="form.name" placeholder="Добавьте название"
                                    required autocomplete="off" />
                            </div>
                            <div class="form-group">
                                <label for="description">Описание</label>
                                <textarea id="description" v-model="form.description"
                                    placeholder="Добавьте необязательное описание" rows="3"></textarea>
                            </div>

                            <div class="form-group-checkbox">
                                <label class="checkbox-container">
                                    <input type="checkbox" v-model="form.isPrivate" />
                                    <span class="checkmark"></span>
                                    <span class="checkbox-label">
                                        Приватный плейлист
                                        <span class="checkbox-sublabel">Будет виден только вам</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" @click="closeModal">
                            Отмена
                        </button>
                        <button type="submit" class="btn-primary" :disabled="isSubmitting || !form.name.trim()">
                            {{ isSubmitting ? (isEditMode ? "Сохранение..." : "Создание...") : (isEditMode ? "Сохранить"
                                : "Создать") }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Transition>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {
    name: "PlaylistModal",
    props: {
        isOpen: { type: Boolean, required: true },
        playlist: { type: Object, default: null }
    },
    emits: ["close", "saved"],
    setup(props, { emit }) {
        const isSubmitting = ref(false);
        const fileInput = ref(null);
        const coverPreviewUrl = ref(null);
        const selectedFile = ref(null);

        const form = ref({
            name: "",
            description: "",
            isPrivate: false,
        });

        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const isEditMode = computed(() => !!props.playlist);

        watch(() => props.isOpen, (newVal) => {
            if (newVal && props.playlist) {
                form.value.name = props.playlist.title || "";
                form.value.description = props.playlist.description || "";
                form.value.isPrivate = !!props.playlist.isPrivate;
                coverPreviewUrl.value = props.playlist.cover || null;
            } else if (newVal) {
                form.value.name = "";
                form.value.description = "";
                form.value.isPrivate = false;
                coverPreviewUrl.value = null;
            }
            selectedFile.value = null;
        });

        const triggerFileInput = () => { fileInput.value.click(); };

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedFile.value = file;
                coverPreviewUrl.value = URL.createObjectURL(file);
            }
        };

        const closeModal = () => { emit("close"); };

        const handleSubmit = async () => {
            if (!form.value.name.trim()) return;

            try {
                isSubmitting.value = true;
                const token = localStorage.getItem("token");

                const formData = new FormData();
                formData.append("name", form.value.name.trim());
                formData.append("description", form.value.description.trim());
                formData.append("is_public", (!form.value.isPrivate).toString());

                if (selectedFile.value) {
                    formData.append("cover", selectedFile.value);
                }

                const url = isEditMode.value
                    ? `${BACKEND_URL}/api/playlists/${props.playlist.id}`
                    : `${BACKEND_URL}/api/playlists`;

                const method = isEditMode.value ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (response.ok) {
                    closeModal();
                    emit("saved");
                } else {
                    alert(isEditMode.value ? "Не удалось обновить плейлист" : "Не удалось создать плейлист");
                }
            } catch (error) {
                console.error("Ошибка при сохранении:", error);
            } finally {
                isSubmitting.value = false;
            }
        };

        return {
            isSubmitting,
            form,
            fileInput,
            coverPreviewUrl,
            isEditMode,
            triggerFileInput,
            handleFileChange,
            closeModal,
            handleSubmit,
        };
    },
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.modal-container {
    background: #ffffff;
    border-radius: 24px;
    width: 100%;
    max-width: 560px;
    padding: 24px;
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

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-foundation-dark-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.modal-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 24px;
    align-items: start;
}

.cover-upload-section {
    width: 140px;
    height: 140px;
}

.cover-preview {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: 1px dashed var(--color-foundation-orange-light-active);
    background: var(--color-foundation-orange-light);
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, background 0.2s;
}

.cover-preview:hover {
    border-color: var(--color-foundation-orange-normal);
    background: rgba(255, 126, 58, 0.08);
}

.cover-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--color-foundation-orange-normal);
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    padding: 8px;
}

.hidden-file-input {
    display: none;
}

.inputs-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
}

.form-group input,
.form-group textarea {
    font-family: var(--font-family);
    font-size: 14px;
    padding: 10px 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.02);
    color: var(--color-foundation-dark-dark);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--color-foundation-orange-normal);
    background: #fff;
}

.form-group textarea {
    resize: none;
}

.form-group-checkbox {
    margin-top: 4px;
}

.checkbox-container {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    user-select: none;
}

.checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkmark {
    position: absolute;
    top: 2px;
    left: 0;
    height: 18px;
    width: 18px;
    background-color: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    transition: background-color 0.2s, border-color 0.2s;
}

.checkbox-container:hover input~.checkmark {
    border-color: var(--color-foundation-orange-normal);
}

.checkbox-container input:checked~.checkmark {
    background-color: var(--color-foundation-orange-normal);
    border-color: var(--color-foundation-orange-normal);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.checkbox-container input:checked~.checkmark:after {
    display: block;
}

.checkbox-container .checkmark:after {
    left: 5px;
    top: 2px;
    width: 5px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-label {
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-foundation-dark-dark);
    display: flex;
    flex-direction: column;
    line-height: 120%;
}

.checkbox-sublabel {
    font-size: 12px;
    color: var(--color-foundation-dark-lighter);
    margin-top: 2px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
}

.btn-secondary {
    background: rgba(0, 0, 0, 0.04);
    color: var(--color-foundation-dark-dark);
    border: none;
    padding: 10px 18px;
    border-radius: 12px;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-secondary:hover {
    background: rgba(0, 0, 0, 0.08);
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
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #f06a25;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-container {
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active .modal-container {
    transition: transform 0.2s ease;
}

.modal-fade-enter-from .modal-container {
    transform: scale(0.9) translateY(10px);
}

.modal-fade-leave-to .modal-container {
    transform: scale(0.95);
}
</style>