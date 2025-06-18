<script setup>
import { computed, inject, ref } from 'vue'
import Card from './Card.vue'
import SneakerModal from './SneakerModal.vue'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  items: Array,
  isFavorites: Boolean,
  onDelete: Function,
  onEdit: Function,
  drawerOpen: Boolean
})

const emit = defineEmits(['add-to-cart'])
const { addToFavorite } = inject('favorites')
const { currency, currencyRate } = inject('currency')

const auth = useAuthStore()
const isAdmin = computed(() => Boolean(auth.user && auth.user.является_админом))

const filteredItems = computed(() => {
  return props.items.filter(item => item.imageUrl && item.imageUrl.trim() !== '')
})

const showModal = ref(false)
const selectedSneaker = ref(null)

const openModal = (item) => {
  selectedSneaker.value = item
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
  selectedSneaker.value = null
}
</script>

<template>
  <div>
    <div v-if="isFavorites" class="mb-6">
      <h2 class="text-xl font-semibold">Избранные товары</h2>
      <p class="text-gray-500">Здесь отображаются все ваши избранные товары. Вы можете добавить их в корзину или удалить из избранного.</p>
    </div>
    <SneakerModal :sneaker="selectedSneaker" :show="showModal" @close="closeModal" :currency="currency" :currency-rate="currencyRate" @addToCart="payload => emit('add-to-cart', payload)" />
    <transition-group name="slide-fade" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
      <Card
        v-for="item in filteredItems"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :imageUrl="item.imageUrl"
        :price="item.price"
        :onClickFavorite="auth.user ? () => addToFavorite(item) : null"
        :onClickAdd="isFavorites ? null : () => emit('add-to-cart', item)"
        :isFavorite="item.isFavorite"
        :isAdded="item.isAdded"
        :sizes="item.sizes"
        :gender="item.gender"
        :description="item.description"
        :isAdmin="isAdmin"
        :onDelete="() => props.onDelete && props.onDelete(item.id)"
        :onEdit="() => props.onEdit && props.onEdit(item)"
        :brand="item.brand"
        :season="item.season"
        :color="item.color"
        :drawer-open="props.drawerOpen"
        @add-to-cart="payload => emit('add-to-cart', payload)"
        @click="openModal(item)"
      />
    </transition-group>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

@media (max-width: 640px) {
  .grid {
    padding: 0 1rem;
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>