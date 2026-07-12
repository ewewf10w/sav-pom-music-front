<template>
  <div class="auth-wrapper">
    <div class="auth-logo">
      <img src="../assets/Logo.svg" alt="Logo" class="logo-image" width="242" height="56" />
    </div>

    <div class="auth-card">
      <h2 class="auth-title">Регистрация аккаунта</h2>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label for="username">Логин</label>
          <input type="text" id="username" v-model="username" placeholder="Придумай логин" required />
        </div>

        <div class="input-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" v-model="password" placeholder="Придумай надежный пароль" required />
        </div>

        <div class="input-group">
          <label for="confirmPassword">Повторите пароль</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Введите пароль еще раз"
            required :class="{ 'input-error': errorMessage }" />
        </div>

        <div class="error-container">
          <Transition name="fade-error" mode="out-in">
            <span v-if="errorMessage" :key="errorMessage" class="error-text">
              {{ errorMessage }}
            </span>
          </Transition>
        </div>

        <button type="submit" class="auth-btn">Создать аккаунт</button>
      </form>

      <p class="auth-footer">
        Уже есть аккаунт?
        <router-link to="/login" class="auth-link">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

export default {
  name: "RegisterView",
  setup() {
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const errorMessage = ref("");
    const isLoading = ref(false);

    const router = useRouter();
    const authStore = useAuthStore();

    watch([password, confirmPassword], () => {
      if (confirmPassword.value && password.value !== confirmPassword.value) {
        errorMessage.value = "Пароли не совпадают";
      } else {
        errorMessage.value = "";
      }
    });

    const handleRegister = async () => {
      try {
        errorMessage.value = "";
        isLoading.value = true;

        await authStore.register(username.value, password.value);

        router.push({ path: "/login", query: { registered: "true" } });
      } catch (err) {
        errorMessage.value = err.message || "Произошла ошибка при регистрации";
      } finally {
        isLoading.value = false;
      }
    };

    return {
      username,
      password,
      confirmPassword,
      errorMessage,
      isLoading,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 180px);
  width: 100%;
  gap: 40px;
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
  gap: 20px;
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
  font-family: "Pliant", sans-serif;
  font-size: 14px;
  color: var(--color-foundation-dark-dark);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-group input.input-error {
  border-color: #e64646;
  background: #fff5f5;
}

.input-group input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(230, 70, 70, 0.15);
}

.input-group input:focus {
  border-color: var(--color-foundation-orange-normal);
  box-shadow: 0 0 0 3px var(--color-foundation-orange-light);
  background: var(--color-foundation-surface-white);
}

.auth-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 50px;
  background-color: var(--color-foundation-orange-normal);
  color: var(--color-foundation-surface-white);
  font-family: "Pliant", sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  margin-top: 8px;
}

.error-container {
  height: 20px;
  margin-top: -12px;
  margin-bottom: -4px;
  display: flex;
  align-items: center;
  position: relative;
}

.error-text {
  color: #e64646;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  padding-left: 4px;
  width: 100%;
}

.fade-error-enter-active,
.fade-error-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-error-leave-active {
  position: absolute;
}

.fade-error-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-error-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.auth-btn:hover {
  background-color: var(--color-foundation-orange-normal-hover);
}

.auth-btn:active {
  transform: scale(0.98);
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--color-foundation-dark-lighter);
}

.auth-link {
  color: var(--color-foundation-orange-normal);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: var(--color-foundation-orange-normal-hover);
}
</style>
