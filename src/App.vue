<script setup>
import { ref, provide, watch, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import Drawer from './components/Drawer.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './store/auth'

const allItems = ref([])
provide('allItems', allItems)

/* Состояние валюты */
const currency = ref(localStorage.getItem('currency') || 'BYN')
const currencyRate = 26.5957

/* Корзина */
const cart = ref([])
const drawerOpen = ref(false)

const totalPrice = computed(() => {
  return cart.value.reduce((acc, item) => {
    const itemPrice = Number(item.price) || 0
    return acc + itemPrice
  }, 0)
})

watch(currency, (newVal) => {
  localStorage.setItem('currency', newVal)
})

const closeDrawer = () => {
  drawerOpen.value = false
}

const openDrawer = () => {
  drawerOpen.value = true
}

const addToCart = (item) => {
  if (!auth.user) {
    alert('Войдите в аккаунт, чтобы добавить в корзину')
    return
  }
  console.log('addToCart called with:', item)
  const isFavorite = favorites.value.some(fav => fav.id === item.id)
  cart.value.push({
    ...item,
    isAdded: true,
    isFavorite
  })
}

const removeFromCart = (item) => {
  const index = cart.value.findIndex(cartItem => cartItem.id === item.id)
  if (index !== -1) {
    cart.value.splice(index, 1)
  }
}

/* Избранное */
const favorites = ref([])

const addToFavorite = (item) => {
  if (!auth.user) {
    alert('Войдите в аккаунт, чтобы добавить в закладки')
    return
  }
  const idx = favorites.value.findIndex(fav => fav.id === item.id)
  if (idx === -1) {
    favorites.value.push({ ...item, isFavorite: true })
    item.isFavorite = true
  } else {
    favorites.value.splice(idx, 1)
    item.isFavorite = false
  }
}

const auth = useAuthStore()

function getUserKey(suffix) {
  const user = auth.user || JSON.parse(localStorage.getItem('user'))
  if (!user || !user.id_пользователя) return null
  return `${suffix}_${user.id_пользователя}`
}

// Восстановление из localStorage
onMounted(() => {
  // Загружаем корзину и избранное только для текущего пользователя
  const cartKey = getUserKey('cart')
  const favKey = getUserKey('favorites')
  if (cartKey) {
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) cart.value = JSON.parse(savedCart)
  }
  if (favKey) {
    const savedFavorites = localStorage.getItem(favKey)
    if (savedFavorites) favorites.value = JSON.parse(savedFavorites)
  }
})

watch(cart, () => {
  const cartKey = getUserKey('cart')
  if (cartKey) localStorage.setItem(cartKey, JSON.stringify(cart.value))
}, { deep: true })

watch(favorites, () => {
  const favKey = getUserKey('favorites')
  if (favKey) localStorage.setItem(favKey, JSON.stringify(favorites.value))
}, { deep: true })

// Следим за сменой пользователя
watch(() => auth.user, (newUser, oldUser) => {
  if (oldUser && oldUser.id_пользователя) {
    // Очищаем корзину и избранное старого пользователя только в памяти
    cart.value = []
    favorites.value = []
  }
  if (newUser && newUser.id_пользователя) {
    // Загружаем корзину и избранное нового пользователя
    const cartKey = getUserKey('cart')
    const favKey = getUserKey('favorites')
    if (cartKey) {
      const savedCart = localStorage.getItem(cartKey)
      cart.value = savedCart ? JSON.parse(savedCart) : []
    }
    if (favKey) {
      const savedFavorites = localStorage.getItem(favKey)
      favorites.value = savedFavorites ? JSON.parse(savedFavorites) : []
    }
  }
})

provide('cart', {
  cart,
  closeDrawer,
  openDrawer,
  addToCart,
  removeFromCart
})

provide('favorites', {
  favorites,
  addToFavorite
})

provide('currency', {
  currency,
  currencyRate
})

provide('drawerOpen', drawerOpen)
</script>

<template>
  <Drawer v-if="drawerOpen" :total-price="totalPrice" />

  <div class="bg-white w-4/5 m-auto rounded-xl shadow-xl mt-14">
    <Header 
      :total-price="totalPrice" 
      :favorites-count="favorites.length"
      @open-drawer="openDrawer" 
    />

    <div class="p-10">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>