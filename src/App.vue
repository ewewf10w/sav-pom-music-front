<template>
  <div class="layout">
    <Sidebar />

    <main class="main-content">
      <AppHeader />
      <div class="content-body">
        <router-view></router-view>
      </div>
    </main>

    <div class="player-container">
      <Player />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import Player from './components/Player.vue'
import HomeView from './views/HomeView.vue'
import AppHeader from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    Player,
    AppHeader,
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Pliant:ital,wght@0,100..900;1,100..900&display=swap');

:root {
  --color-foundation-orange-light: #fff2eb;
  --color-foundation-orange-light-hover: #ffece1;
  --color-foundation-orange-light-active: #ffd7c2;
  --color-foundation-orange-normal: #ff7e3a;
  --color-foundation-orange-normal-hover: #e67134;
  --color-foundation-orange-normal-active: #cc652e;
  --color-foundation-orange-dark: #bf5f2c;
  --color-foundation-orange-dark-hover: #994c23;
  --color-foundation-orange-dark-active: #73391a;
  --color-foundation-orange-darker: #592c14;
  --color-foundation-surface-white: #fff;
  --color-foundation-surface-white-hover: #fff9f5;
  --color-foundation-surface-white-active: #ffeadf;
  --color-foundation-surface-light: #fff9f5;
  --color-foundation-surface-light-hover: #ffeadf;
  --color-foundation-surface-light-active: #ffdfce;
  --color-foundation-surface-normal: #fff2eb;
  --color-foundation-surface-normal-hover: #ffe3d4;
  --color-foundation-surface-normal-active: #ffd3bc;
  --color-foundation-surface-dark: #ffece1;
  --color-foundation-dark-lighter: #99938f;
  --color-foundation-dark-light-hover: #847d79;
  --color-foundation-dark-light-active: #6b625d;
  --color-foundation-dark-normal: #1c0e06;
  --color-foundation-dark-normal-hover: #180c05;
  --color-foundation-dark-normal-active: #140a04;
  --color-foundation-dark-dark: #0a0502;
  --color-foundation-dark-dark-hover: #070402;
  --color-foundation-dark-dark-active: #030201;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #F3F4F8;
  font-family: 'Pliant', sans-serif;
}

.layout {
  display: grid;
  height: 100vh;
  width: 100vw;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
}

.sidebar {
  grid-column: 1;
  grid-row: 1 / 3;
  height: 100%;
}


.main-content {
  grid-column: 2;
  grid-row: 1;

  display: flex;
  flex-direction: column;
  height: 100%;

  /* padding: 32px 38px; */
  position: relative;
  overflow: hidden;
}

.content-body {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 64px;
  padding: 32px 38px;
  height: 100%;
}

.player-container {
  grid-column: 1/3;
  grid-row: 2;

  width: 100%;
  z-index: 20;
}
</style>