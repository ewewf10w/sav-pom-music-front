import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { useAuthStore } from '../stores/auth'
import EditProfileView from '../views/EditProfileView.vue'
import PlaylistsView from '../views/PlaylistsView.vue'

const Placeholder = { 
  template: '<div style="padding: 24px; color: #99938f; font-family: var(--font-family);">Страница находится в разработке...</div>' 
}

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/profile/edit',
    name: 'edit-profile',
    component: EditProfileView
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: PlaylistsView // Твой компонент плейлистов
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  { path: '/login', name: 'Login', component: LoginView, meta: { hideNavigation: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { hideNavigation: true } },
  {
    path: '/genre/:id',
    name: 'genre-playlist',
    component: PlaylistView,
    props: route => ({ id: Number(route.params.id), type: 'genre' })
  },
  {
    path: '/playlist/:id',
    name: 'regular-playlist',
    component: PlaylistView,
    props: route => ({ id: Number(route.params.id), type: 'regular' })
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Placeholder
  },
  {
    path: '/search',
    name: 'search',
    component: Placeholder
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.hideNavigation && authStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router