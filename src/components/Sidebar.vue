<template>
  <aside class="sidebar">
    <div class="logo">
      <img src="../assets/Logo.png" alt="SavPomMusic Логотип" class="logo-img" />
    </div>

    <nav class="menu" style="position: relative;">
      <div class="menu-label">Меню</div>

      <div class="menu-items">
        <a href="#" class="menu-item" :class="{ active: activeIndex === 0 }" @click.prevent="activeIndex = 0">
          <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.7 5.68333L11.9 2.325C10.5917 1.40833 8.58333 1.45833 7.325 2.43333L3.15 5.69167C2.31667 6.34167 1.65833 7.675 1.65833 8.725V14.475C1.65833 16.6 3.38333 18.3333 5.50833 18.3333H14.4917C16.6167 18.3333 18.3417 16.6083 18.3417 14.4833V8.83333C18.3417 7.70833 17.6167 6.325 16.7 5.68333ZM10.625 15C10.625 15.3417 10.3417 15.625 10 15.625C9.65833 15.625 9.375 15.3417 9.375 15V12.5C9.375 12.1583 9.65833 11.875 10 11.875C10.3417 11.875 10.625 12.1583 10.625 12.5V15Z"
              fill="currentColor" />
          </svg>
          Главная
        </a>

        <a href="#" class="menu-item" :class="{ active: activeIndex === 1 }" @click.prevent="activeIndex = 1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.58333 17.5C13.9556 17.5 17.5 13.9556 17.5 9.58332C17.5 5.21107 13.9556 1.66666 9.58333 1.66666C5.21108 1.66666 1.66667 5.21107 1.66667 9.58332C1.66667 13.9556 5.21108 17.5 9.58333 17.5Z"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M18.3333 18.3333L16.6667 16.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          Поиск
        </a>

        <a href="#" class="menu-item" :class="{ active: activeIndex === 2 }" @click.prevent="activeIndex = 2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.5167 17.3417C10.2333 17.4417 9.76667 17.4417 9.48333 17.3417C7.06667 16.5167 1.66667 13.075 1.66667 7.24168C1.66667 4.66668 3.74167 2.58334 6.3 2.58334C7.81667 2.58334 9.15833 3.31668 10 4.45001C10.8417 3.31668 12.1917 2.58334 13.7 2.58334C16.2583 2.58334 18.3333 4.66668 18.3333 7.24168C18.3333 13.075 12.9333 16.5167 10.5167 17.3417Z"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Любимые
        </a>

        <div class="sliding-indicator"
          :style="{ transform: `translateY(calc(${activeIndex * 100}% + ${activeIndex * 16.5}px))` }">
        </div>
      </div>


    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      activeIndex: 0
    }
  }
}
</script>

<style scoped>
.sidebar {
  background-color: #F9F9F9;
  padding-left: 32px;
  padding-top: 24px;
  height: 100vh;
  gap: 56px;
  display: flex;
  flex-direction: column;
  max-width: 314px;
  border-right: 1px solid var(--color-foundation-orange-light-active);

}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1db954;
  width: 179px;
  height: 56px;
}


.menu {
  display: flex;
  flex-direction: column;
}

.menu-label {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-foundation-dark-lighter);
  margin-bottom: 24px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 16.5px;
  position: relative;
}

.menu-item {
  text-decoration: none;
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0.03em;
  color: var(--color-foundation-dark-lighter);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  transition: color 0.2s ease;
  z-index: 1;
  padding: 7.5px 0;
  width: 283px;
}

.menu-item .icon {
  transition: transform 0.2s ease;
}

.menu-item:hover {
  color: var(--color-foundation-orange-normal-hover);
}

.menu-item.active {
  color: var(--color-foundation-orange-normal);
}

.sliding-indicator {
  position: absolute;
  right: 0px;
  top: 0px;

  width: 5px;
  height: 35px;
  border-radius: 50px;
  background: var(--color-foundation-orange-normal);

  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>