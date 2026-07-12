<template>
  <Transition name="fade-alert">
    <div v-if="isRegisteredSuccess" class="success-alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>Вы успешно зарегистрировались! Введите данные для входа.</span>
    </div>
  </Transition>

  <div class="auth-wrapper">
    <div class="auth-logo">
      <img src="../assets/Logo.svg" alt="Logo" class="logo-image" width="242" height="56" />
    </div>

    <div class="auth-card">
      <h2 class="auth-title">Войти</h2>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label for="username">Логин</label>
          <input type="text" id="username" v-model="username" placeholder="Введи свой логин" required />
        </div>

        <div class="input-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" v-model="password" placeholder="Введи пароль" required />
        </div>

        <button type="submit" class="auth-btn">Войти</button>
      </form>

      <div class="error-container">
        <Transition name="fade-error" mode="out-in">
          <span v-if="errorMessage" :key="errorMessage" class="error-text">
            {{ errorMessage }}
          </span>
        </Transition>
      </div>

      <p class="auth-footer">
        Нет аккаунта?
        <router-link to="/register" class="auth-link">Зарегистрироваться</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

export default {
  name: "LoginView",
  setup() {
    const username = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const error = ref("");

    const isRegisteredSuccess = computed(
      () => route.query.registered === "true",
    );

    onMounted(() => {
      if (isRegisteredSuccess.value) {
        setTimeout(() => {
          router.replace({ query: {} });
        }, 5000);
      }
    });

    const handleLogin = async () => {
      try {
        errorMessage.value = "";
        await authStore.login(username.value, password.value);

        router.push("/home");
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    return {
      username,
      password,
      errorMessage,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.auth-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-wrapper {
  gap: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 180px);
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
