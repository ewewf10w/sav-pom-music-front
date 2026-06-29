<template>
  <div class="home-view">

    <div class="block-container">
      <div class="block">
        <div class="block-title">
          Топ треков по жанрам
        </div>
        <div class="playlists">
          <div class="playlist-card">
            <div class="playlist-cover">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                alt="">
            </div>
            <div class="playlist-info">
              <div class="playlist-title">
                Playlist name
              </div>
              <div class="playlist-desc">
                Description
              </div>
            </div>
          </div>
          <div class="playlist-card">
            <div class="playlist-cover">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                alt="">
            </div>
            <div class="playlist-info">
              <div class="playlist-title">
                Playlist name
              </div>
              <div class="playlist-desc">
                Description
              </div>
            </div>
          </div>

          <div class="playlist-card">
            <div class="playlist-cover">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                alt="">
            </div>
            <div class="playlist-info">
              <div class="playlist-title">
                Playlist name
              </div>
              <div class="playlist-desc">
                Description
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="block-container">
      <div class="top-tracks">
        <div class="block-title">
          Самые популярные треки
        </div>
        <div class="tracklist">
          <div class="track-tile">
            <div class="track-left">
              <div class="track-cover">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                  alt="">

              </div>
              <div class="track-info">
                <div class="track-title">Come As You Are</div>
                <div class="track-artist">Nirvana</div>
              </div>
            </div>
            <div class="track-right"></div>
          </div>

          <div class="track-tile">
            <div class="track-left">
              <div class="track-cover">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                  alt="">

              </div>
              <div class="track-info">
                <div class="track-title">Come As You Are</div>
                <div class="track-artist">Nirvana</div>
              </div>
            </div>
            <div class="track-right"></div>
          </div>

          <div class="track-tile">
            <div class="track-left">
              <div class="track-cover">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                  alt="">

              </div>
              <div class="track-info">
                <div class="track-title">Come As You Are</div>
                <div class="track-artist">Nirvana</div>
              </div>
            </div>
            <div class="track-right"></div>
          </div>

          <div class="track-tile">
            <div class="track-left">
              <div class="track-cover">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVQZIC-nZ87kQQMxaymtqi1yJGBY0c5VNY7Q&s"
                  alt="">

              </div>
              <div class="track-info">
                <div class="track-title">Come As You Are</div>
                <div class="track-artist">Nirvana</div>
              </div>
            </div>
            <div class="track-right"></div>
          </div>
        </div>
      </div>


    </div>



  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.block-container {
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
}

.block-title {
  font-family: var(--third-family);
  font-weight: 500;
  font-size: 20px;
  line-height: 120%;
  letter-spacing: 0.05em;
  color: var(--color-foundation-dark-dark);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.playlist-card {
  border: 0.75px solid var(--color-foundation-orange-light-active);
  border-radius: 16px;
  padding: 16px 16px 12px;
  max-width: 160px;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playlists {
  display: flex;
  gap: 32px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-title {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-dark);
}

.playlist-desc {
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-lighter);
}

.playlist-cover img {
  border-radius: 12px;
  max-width: 128px;

}

.top-tracks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.track-tile {
  background: var(--color-foundation-surface-white);
  border-radius: 16px;
  max-width: 1014px;
  padding: 8px;
}

.track-left {
  display: flex;
  gap: 8px;

}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;

}

.track-title {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-dark);
}

.track-artist {
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.01em;
  color: var(--color-foundation-dark-lighter);
}

.track-cover img {
  border-radius: 16px;
  width: 52px;
  height: 52px;
}

.tracklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-cover {
  height: 52px;
}
</style>