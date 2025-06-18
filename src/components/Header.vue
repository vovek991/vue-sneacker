<script setup>
import { ref, computed } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

defineProps({
  totalPrice: Number,
  favoritesCount: Number
})

const emit = defineEmits(['openDrawer'])
const isProfileDropdownOpen = ref(false)
const showLoginForm = ref(false)
const showRegisterForm = ref(false)
const isAuth = ref(!!localStorage.getItem('token'))
const userName = ref(localStorage.getItem('userName') || '')
const auth = useAuthStore()
const isAdmin = computed(() => auth.user && auth.user.является_админом)
const router = useRouter()

let closeTimeout

const openProfileDropdown = () => {
  isProfileDropdownOpen.value = true
  if (closeTimeout) clearTimeout(closeTimeout)
}

const closeProfileDropdown = () => {
  closeTimeout = setTimeout(() => {
    isProfileDropdownOpen.value = false
  }, 200)
}

const cancelClose = () => {
  if (closeTimeout) clearTimeout(closeTimeout)
}

const openLoginForm = () => {
  showLoginForm.value = true
  isProfileDropdownOpen.value = false
}

const closeLoginForm = () => {
  showLoginForm.value = false
}

const showRegister = () => {
  showLoginForm.value = false
  showRegisterForm.value = true
}

const closeRegisterForm = () => {
  showRegisterForm.value = false
}

const showLogin = () => {
  showRegisterForm.value = false
  showLoginForm.value = true
}

const logout = () => {
  auth.logout()
  isAuth.value = false
  userName.value = ''
  router.push('/')
}
</script>

<template>
  <header class="flex flex-wrap justify-between border-b border-slate-200 px-4 md:px-10 py-4 md:py-8 relative">
    <router-link to="/" class="flex-shrink-0">
      <div class="flex items-center gap-2 md:gap-4">
        <img src="/logo.png" alt="Logo" class="w-8 md:w-10" />
        <div>
          <h2 class="text-lg md:text-xl font-bold uppercase">Vue Sneakers</h2>
          <p class="text-slate-400 text-sm">Магазин лучших кроссовок</p>
        </div>
      </div>
    </router-link>

    <ul class="flex items-center gap-4 md:gap-10">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-2 md:gap-3 text-gray-500 hover:text-black"
      >
        <img src="/cart.svg" alt="Cart" class="w-6 md:w-auto" />
        <div class="flex flex-col items-end">
          <b class="text-sm md:text-base">{{ Number(totalPrice).toFixed(2) }} BYN</b>
        </div>
      </li>

      <router-link to="/favorites" v-if="!isAdmin">
        <li class="flex items-center cursor-pointer gap-2 md:gap-3 text-gray-500 hover:text-black relative">
          <img src="/heart.svg" alt="Cart" class="w-6 md:w-auto" />
          <span class="hidden md:inline">Закладки</span>
          <span 
            v-if="favoritesCount > 0" 
            class="absolute -top-2 -right-2 bg-lime-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ favoritesCount }}
          </span>
        </li>
      </router-link>

      <li
        class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black relative"
        @mouseenter="openProfileDropdown"
        @mouseleave="closeProfileDropdown"
      >
        <img src="/profile.svg" alt="Cart" />
        <span>Профиль</span>
        <span v-if="isAuth && userName" class="ml-2 font-bold text-black user-name-mobile">{{ userName }}</span>
        <div
          v-if="isProfileDropdownOpen"
          class="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-100"
          @mouseenter="cancelClose"
          @mouseleave="closeProfileDropdown"
        >
          <template v-if="isAuth">
            <router-link to="/profile" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Личный кабинет
            </router-link>
            <button
              @click="logout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Выйти
            </button>
          </template>
          <template v-else>
            <button
              @click="openLoginForm"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Вход
            </button>
            <button
              @click="showRegister"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Регистрация
            </button>
          </template>
        </div>
      </li>
    </ul>

    <LoginForm v-if="showLoginForm" @close="closeLoginForm" @show-register="showRegister" />
    <RegisterForm v-if="showRegisterForm" @close="closeRegisterForm" @show-login="showLogin" />
  </header>
</template>

<style scoped>
@media (max-width: 640px) {
  .user-name-mobile {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
