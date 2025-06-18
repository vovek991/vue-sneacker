<script setup>
import { computed, inject, ref } from 'vue'
import editIcon from '../assets/edit.svg?url'
import trashIcon from '../assets/trash.svg?url'
import heartIcon from '../assets/heart.svg?url'
import heartLikedIcon from '../assets/heart-liked.svg?url'
import plusIcon from '../assets/plus.svg?url'
import addedBtnIcon from '../assets/added-btn.svg?url'
import { useAuthStore } from '../store/auth'

const emit = defineEmits(['add-to-cart'])

const { cart } = inject('cart')

const props = defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  isFavorite: Boolean,
  isAdded: Boolean,
  onClickFavorite: Function,
  sizes: Array,
  gender: String,
  description: String,
  isAdmin: Boolean,
  onDelete: Function,
  onEdit: Function,
  brand: String,
  season: String,
  color: String,
  drawerOpen: Boolean
})

const selectedSize = ref(null)

const isInCart = computed(() => {
  return cart.value.some(item => item.id === props.id && item.selectedSize === selectedSize.value)
})

const displayPrice = computed(() => props.price)

const auth = useAuthStore()

const getAverageRating = (id) => {
  const reviews = JSON.parse(localStorage.getItem(`reviews_${id}`)) || []
  if (!reviews.length) return 0
  return (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1)
}

const averageRating = computed(() => getAverageRating(props.id))

function handleAddToCart(e) {
  if (!selectedSize.value) return
  e.stopPropagation()
  emit('add-to-cart', { id: props.id, size: selectedSize.value })
}
</script>

<template>
  <div
    class="relative bg-white border border-slate-100 rounded-3xl p-4 md:p-6 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl w-full flex flex-col justify-between h-full"
    @click="$emit('click')"
  >
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <button
        v-if="isAdmin"
        @click.stop="onEdit"
        class="bg-blue-500 rounded-full p-2 opacity-70 hover:opacity-100"
      >
        <img :src="editIcon" alt="Edit" class="w-4 h-4" />
      </button>
      <button
        v-if="isAdmin"
        @click.stop="onDelete"
        class="bg-red-500 rounded-full p-2 opacity-70 hover:opacity-100"
      >
        <img :src="trashIcon" alt="Delete" class="w-4 h-4" />
      </button>
    </div>

    <div>
      <div class="relative mb-4">
        <img
          :src="imageUrl"
          :alt="title"
          class="w-full h-48 md:h-40 object-contain mx-auto"
        />
        <button
          v-if="!isAdmin && !drawerOpen"
          @click.stop="onClickFavorite"
          class="absolute top-0 left-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 hover:border-slate-400"
        >
          <img
            :src="isFavorite ? heartLikedIcon : heartIcon"
            :alt="isFavorite ? 'Liked' : 'Like'"
            class="w-5 h-5"
          />
        </button>
      </div>

      <h3 class="font-bold text-lg mb-2">{{ brand }} {{ title }}</h3>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-yellow-500 text-base">{{ averageRating }}</span>
        <span class="text-yellow-400">
          <template v-for="n in 5">
            <span v-if="n <= Math.round(averageRating)" :key="'star-full-'+n">★</span>
            <span v-else :key="'star-empty-'+n">☆</span>
          </template>
        </span>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        <span v-if="gender" class="text-sm text-gray-500">{{ gender }}</span>
        <span v-if="season" class="text-sm text-gray-500">{{ season }}</span>
        <span v-if="color" class="text-sm text-gray-500">{{ color }}</span>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-sm text-gray-500">Цена:</p>
          <b class="text-lg">{{ displayPrice }} BYN</b>
        </div>
        <button
          v-if="!isAdmin && !drawerOpen"
          @click.stop="handleAddToCart"
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="[selectedSize ? (isInCart ? 'bg-lime-200' : 'bg-lime-500 hover:bg-lime-600') : 'bg-gray-200 cursor-not-allowed', !auth.user ? 'opacity-50 cursor-not-allowed' : '']"
          :disabled="!selectedSize || !auth.user"
        >
          <img
            :src="isInCart ? addedBtnIcon : plusIcon"
            :alt="isInCart ? 'Added' : 'Add'"
            class="w-6 h-6"
          />
        </button>
      </div>
      
      <div v-if="sizes && sizes.length" class="flex flex-wrap gap-1 mb-2">
        <button
          v-for="size in sizes"
          :key="size"
          @click.stop="selectedSize = size"
          :class="['px-2 py-1 text-xs rounded border', selectedSize === size ? 'bg-lime-500 text-white border-lime-500' : 'bg-gray-100 border-gray-200 hover:border-lime-400']"
        >
          {{ size }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .rounded-3xl {
    border-radius: 1rem;
  }
  
  img.object-contain {
    height: 200px;
  }
}
</style>