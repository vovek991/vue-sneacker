<script setup>
import { computed, ref, inject } from 'vue'
import ReviewList from './ReviewList.vue'
import { useItemsStore } from '../store/items'

const props = defineProps({
  sneaker: Object,
  show: Boolean,
  currency: String,
  currencyRate: Number
})

const emit = defineEmits(['close', 'addToCart'])
const { cart } = inject('cart')
const itemsStore = useItemsStore()
const allItems = computed(() => itemsStore.allItems)

const selectedSize = ref(null)

const genderText = computed(() => {
  if (!props.sneaker) return ''
  if (props.sneaker.gender === 'male') return 'Мужские'
  if (props.sneaker.gender === 'female') return 'Женские'
  return 'Унисекс'
})

const displayPrice = computed(() => {
  if (!props.sneaker) return ''
  return props.sneaker.price
})

const isInCart = computed(() => {
  if (!props.sneaker) return false
  return cart.value.some(item => item.id === props.sneaker.id && item.selectedSize === selectedSize.value)
})

const similarSneakers = computed(() => {
  try {
    if (!props.sneaker || !allItems.value || !Array.isArray(allItems.value)) return []
    const curBrand = (props.sneaker.brand || '').toLowerCase().trim()
    const curColor = (props.sneaker.color || '').toLowerCase().trim()
    const curSizes = Array.isArray(props.sneaker.sizes) ? props.sneaker.sizes.map(s => String(s).trim()) : []
    return allItems.value
      .filter(item => {
        if (item.id === props.sneaker.id) return false
        const itemBrand = (item.brand || '').toLowerCase().trim()
        const itemColor = (item.color || '').toLowerCase().trim()
        const itemSizes = Array.isArray(item.sizes) ? item.sizes.map(s => String(s).trim()) : []
        const hasSizeMatch = curSizes.some(size => itemSizes.includes(size))
        return (itemBrand && itemBrand === curBrand) || (itemColor && itemColor === curColor) || hasSizeMatch
      })
      .slice(0, 4)
  } catch (e) {
    console.error('Ошибка в similarSneakers:', e)
    return []
  }
})

const handleAddToCart = () => {
  if (!selectedSize.value) {
    alert('Пожалуйста, выберите размер')
    return
  }
  emit('addToCart', { id: props.sneaker.id, size: selectedSize.value })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
      <button @click="$emit('close')" class="absolute top-6 right-6 text-gray-400 hover:text-black p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div v-if="sneaker" class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="flex flex-col">
          <div class="bg-gray-50 rounded-xl p-8 mb-6">
            <img :src="sneaker.imageUrl" :alt="sneaker.title" class="w-full h-auto object-contain" />
          </div>
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">Сезон</p>
              <p class="font-medium">{{ sneaker.season || 'Не указан' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">Пол</p>
              <p class="font-medium">{{ genderText }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">Цвет</p>
              <p class="font-medium">{{ sneaker.color || 'Не указан' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">Бренд</p>
              <p class="font-medium">{{ sneaker.brand }}</p>
            </div>
          </div>
          <div v-if="Array.isArray(similarSneakers) && similarSneakers.length > 0" class="mb-6 mt-6">
            <h3 class="text-lg font-bold mb-2">Похожие товары</h3>
            <div class="flex flex-col gap-2">
              <div v-for="item in similarSneakers" :key="item.id" class="flex items-center gap-3 bg-gray-50 rounded-lg p-2 min-h-[48px]">
                <img :src="item.imageUrl" :alt="item.title" class="w-12 h-8 object-contain rounded" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate text-sm">{{ item.brand }} {{ item.title }}</div>
                  <div class="text-lime-600 font-bold text-sm">{{ item.price }} BYN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col">
          <h2 class="text-3xl font-bold mb-4">{{ sneaker.brand }} {{ sneaker.title }}</h2>
          
          <div class="mb-8">
            <h3 class="text-xl font-medium mb-4">Размеры:</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="size in sneaker.sizes"
                :key="size"
                @click="selectedSize = size"
                :class="[
                  'px-4 py-3 border rounded-lg text-lg font-medium transition-all',
                  selectedSize === size
                    ? 'bg-lime-500 text-white border-lime-500'
                    : 'hover:border-lime-500'
                ]"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-xl font-medium mb-4">Описание:</h3>
            <p class="text-gray-600 text-lg leading-relaxed">{{ sneaker.description || 'Описание отсутствует' }}</p>
          </div>
          <ReviewList :sneaker-id="sneaker.id" />

          <div class="mt-auto flex items-center justify-between">
            <div>
              <p class="text-gray-600 mb-1">Цена:</p>
              <p class="text-3xl font-bold">{{ displayPrice }} {{ currency }}</p>
            </div>
            
            <button
              @click="handleAddToCart"
              :disabled="!selectedSize"
              :class="[
                'px-8 py-4 rounded-xl text-lg font-medium transition-all',
                selectedSize
                  ? 'bg-lime-500 text-white hover:bg-lime-600 active:bg-lime-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >
              {{ isInCart ? 'Убрать из корзины' : 'Добавить в корзину' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 