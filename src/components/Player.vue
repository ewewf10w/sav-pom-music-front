<template>
  <div class="player-container">
    <div class="player">
      <audio ref="audioPlayer" src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @ended="isPlaying = false"></audio>

      <div class="player-left">
        <div class="player-cover">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
            alt="">
        </div>
        <div class="player-info">
          <p class="player-title">Song Title</p>
          <p class="player-artist">Artist Name</p>
        </div>
        <div class="player-liked">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
              stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div class="player-controls">
        <div class="player-buttons">
          <button class="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.24 7.22V16.79C20.24 18.75 18.11 19.98 16.41 19L12.26 16.61L8.11002 14.21C6.41002 13.23 6.41002 10.78 8.11002 9.8L12.26 7.4L16.41 5.01C18.11 4.03 20.24 5.25 20.24 7.22ZM3.76001 18.93C3.35001 18.93 3.01001 18.59 3.01001 18.18V5.82001C3.01001 5.41001 3.35001 5.07001 3.76001 5.07001C4.17001 5.07001 4.51001 5.41001 4.51001 5.82001V18.18C4.51001 18.59 4.17001 18.93 3.76001 18.93Z"
                fill="#FF7E3A" />
            </svg>
          </button>

          <button class="control-btn play-pause-btn" @click="togglePlay">
            <svg v-if="isPlaying" width="47" height="47" viewBox="0 0 47 47" fill="none">
              <circle cx="23.5" cy="23.5" r="23.5" fill="#FF7E3A" />
              <path d="M18 15H21V32H18V15ZM26 15H29V32H26V15Z" fill="white" />
            </svg>
            <svg v-else width="47" height="47" viewBox="0 0 47 47" fill="none">
              <path
                d="M23.3333 0C10.4533 0 0 10.4533 0 23.3333C0 36.2133 10.4533 46.6667 23.3333 46.6667C36.2133 46.6667 46.6667 36.2133 46.6667 23.3333C46.6667 10.4533 36.2133 0 23.3333 0ZM29.54 27.37L26.5533 29.0967L23.5667 30.8233C19.7167 33.04 16.5667 31.22 16.5667 26.7867V23.3333V19.88C16.5667 15.4233 19.7167 13.6267 23.5667 15.8433L26.5533 17.57L29.54 19.2967C33.39 21.5133 33.39 25.1533 29.54 27.37Z"
                fill="#FF7E3A" />
            </svg>
          </button>

          <button class="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3.76001 7.22V16.79C3.76001 18.75 5.89001 19.98 7.59001 19L11.74 16.61L15.89 14.21C17.59 13.23 17.59 10.78 15.89 9.8L11.74 7.4L7.59001 5.01C5.89001 4.03 3.76001 5.25 3.76001 7.22ZM20.24 18.93C19.83 18.93 19.49 18.59 19.49 18.18V5.82001C19.49 5.41001 19.83 5.07001 20.24 5.07001C20.65 5.07001 20.99 5.41001 20.99 5.82001V18.18C20.99 18.59 20.66 18.93 20.24 18.93Z"
                fill="#FF7E3A" />
            </svg>
          </button>
        </div>

        <div class="player-progress">
          <p>{{ formatTime(currentTime) }}</p>
          <div class="slider-wrapper" :style="{ '--progress': progressPercent + '%' }">
            <input type="range" min="0" :max="duration" step="0.1" :value="currentTime" @input="onInputProgress"
              @change="onSeek" class="progress-slider" />
          </div>
          <p>-{{ formatTime(duration - currentTime) }}</p>
        </div>
      </div>

      <div class="player-right">
        <div class="volume-control">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#99938f" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <div class="slider-wrapper" :style="{ '--progress': volume * 100 + '%' }">
            <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="onVolumeChange"
              class="volume-slider" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Player',
  data() {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isDragging: false,
    }
  },
  computed: {
    progressPercent() {
      if (!this.duration) return 0;
      return (this.currentTime / this.duration) * 100;
    }
  },
  methods: {
    togglePlay() {
      const audio = this.$refs.audioPlayer;
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    onInputProgress(event) {
      this.isDragging = true;
      this.currentTime = parseFloat(event.target.value);
    },
    onLoadedMetadata() {
      const audio = this.$refs.audioPlayer;
      this.duration = audio.duration;
      audio.volume = this.volume;
    },
    onTimeUpdate() {
      if (!this.isDragging && this.$refs.audioPlayer) {
        this.currentTime = this.$refs.audioPlayer.currentTime;
      }
    },
    onSeek(event) {
      const audio = this.$refs.audioPlayer;
      const newTime = parseFloat(event.target.value);

      audio.currentTime = newTime;
      this.currentTime = newTime;

      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    },
    onVolumeChange(event) {
      const audio = this.$refs.audioPlayer;
      this.volume = parseFloat(event.target.value);
      audio.volume = this.volume;
    },
    formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }
}
</script>

<style scoped>
.player {
  background: var(--color-foundation-surface-white);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  padding: 20px;
  align-items: center;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-cover img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
}

.player-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.player-title {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 14px;
  color: var(--color-foundation-dark-dark);
}

.player-artist {
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 12px;
  color: var(--color-foundation-dark-lighter);
}

/* Кнопки управления */
.control-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 550px;
}

.player-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-progress {
  display: flex;
  align-items: center;
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 10px;
  gap: 10px;
  color: var(--color-foundation-dark-light-hover);
  font-variant-numeric: tabular-nums;
}

.player-progress p {
  width: 40px;
  text-align: center;
}

.player-right {
  display: flex;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 130px;
}

.slider-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 478px;
}

.volume-control .slider-wrapper {
  width: 100%;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: transparent;
  cursor: pointer;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: linear-gradient(to right,
      var(--color-foundation-orange-normal) var(--progress, 0%),
      var(--color-foundation-orange-light-hover) var(--progress, 0%));
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--color-foundation-orange-normal);
  border: 2px solid var(--color-foundation-surface-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  margin-top: -4px;

  opacity: 0;
  transition: opacity 0.15s ease;
}

.slider-wrapper:hover input[type="range"]::-webkit-slider-thumb {
  opacity: 1;
}
</style>