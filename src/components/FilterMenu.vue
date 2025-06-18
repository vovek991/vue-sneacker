<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: Boolean,
  brands: Array,
  sizes: Array,
  seasons: Array,
  genders: Array,
  colors: Array,
  modelValue: Object
})
const emit = defineEmits(['close', 'update:modelValue', 'apply', 'reset'])

const localFilters = ref({ 
  ...props.modelValue,
  minPrice: 0,
  maxPrice: 2000
})

const priceRange = ref([0, 2000])

const brandsList = ref([])
const sizesList = Array.from({ length: 46 - 34 + 1 }, (_, i) => 34 + i)
const colorsList = ['Белый', 'Черный', 'Синий', 'Красный', 'Зеленый', 'Желтый', 'Серый']

onMounted(async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:3001/api/brands')
    brandsList.value = data
  } catch {
    brandsList.value = []
  }
})

watch(() => props.modelValue, (val) => {
  localFilters.value = { 
    ...val,
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1]
  }
}, { deep: true })

const handleApply = () => {
  emit('apply', {
    ...localFilters.value,
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1]
  })
  emit('close')
}
const handleReset = () => {
  priceRange.value = [0, 2000]
  emit('reset')
  emit('close')
}

const formatPrice = (price) => {
  return `${price} BYN`
}

const handlePriceInput = (value, type) => {
  let newValue = parseInt(value) || 0
  if (newValue < 0) newValue = 0
  if (newValue > 2000) newValue = 2000
  
  if (type === 'min') {
    if (newValue > priceRange.value[1]) {
      newValue = priceRange.value[1]
    }
    priceRange.value[0] = newValue
  } else {
    if (newValue < priceRange.value[0]) {
      newValue = priceRange.value[0]
    }
    priceRange.value[1] = newValue
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
    <div class="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl">
      <div class="flex flex-col h-full">
        <div class="p-4 md:p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl md:text-2xl font-bold">Фильтры</h2>
            <button @click="$emit('close')" class="text-gray-500 hover:text-black p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1" style="height: calc(100vh - 180px);">
            <!-- Цена -->
            <div class="mb-6">
              <label class="block font-medium mb-2">Цена</label>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">{{ formatPrice(priceRange[0]) }}</span>
                <span class="text-sm text-gray-600">{{ formatPrice(priceRange[1]) }}</span>
              </div>
              <div class="relative h-2 bg-gray-200 rounded-full mb-4">
                <input
                  type="range"
                  v-model="priceRange[0]"
                  :min="0"
                  :max="2000"
                  class="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
                  style="z-index: 2;"
                />
                <input
                  type="range"
                  v-model="priceRange[1]"
                  :min="0"
                  :max="2000"
                  class="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
                  style="z-index: 2;"
                />
                <div 
                  class="absolute h-2 bg-lime-500 rounded-full" 
                  :style="{
                    left: (priceRange[0] / 2000 * 100) + '%',
                    right: (100 - priceRange[1] / 2000 * 100) + '%'
                  }"
                ></div>
              </div>
              <!-- Поля для ручного ввода цены -->
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-1">От</label>
                  <input
                    type="number"
                    :value="priceRange[0]"
                    @input="e => handlePriceInput(e.target.value, 'min')"
                    class="w-full border rounded-md p-2"
                    min="0"
                    max="2000"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-1">До</label>
                  <input
                    type="number"
                    :value="priceRange[1]"
                    @input="e => handlePriceInput(e.target.value, 'max')"
                    class="w-full border rounded-md p-2"
                    min="0"
                    max="2000"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block font-medium mb-2">Бренд</label>
                <select v-model="localFilters.brand" class="w-full border rounded-md p-2">
                  <option value="">Любой</option>
                  <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">Размер</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="size in sizes"
                    :key="size"
                    @click="() => {
                      const idx = localFilters.sizes.indexOf(size)
                      if (idx === -1) {
                        localFilters.sizes.push(size)
                      } else {
                        localFilters.sizes.splice(idx, 1)
                      }
                    }"
                    :class="[
                      'px-3 py-2 border rounded-md text-sm',
                      localFilters.sizes.includes(size)
                        ? 'bg-lime-500 text-white border-lime-500'
                        : 'hover:border-lime-500'
                    ]"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-medium mb-2">Сезон</label>
                <select v-model="localFilters.season" class="w-full border rounded-md p-2">
                  <option value="">Любой</option>
                  <option v-for="season in seasons" :key="season" :value="season">{{ season }}</option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">Пол</label>
                <select v-model="localFilters.gender" class="w-full border rounded-md p-2">
                  <option value="">Любой</option>
                  <option v-for="gender in genders" :key="gender" :value="gender">{{ gender }}</option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">Цвет</label>
                <select v-model="localFilters.color" class="w-full border rounded-md p-2">
                  <option value="">Любой</option>
                  <option v-for="color in colors" :key="color" :value="color">{{ color }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t bg-white mt-auto">
          <div class="flex justify-end gap-2">
            <button @click="handleReset" class="px-4 py-2 border rounded-md hover:bg-gray-100">
              Сбросить
            </button>
            <button @click="handleApply" class="px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600">
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  height: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #84cc16;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #84cc16;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
}

@media (max-width: 640px) {
  .space-y-6 > div {
    margin-bottom: 1.5rem;
  }
  
  input[type="range"] {
    margin: 0;
  }
  
  select, input[type="number"] {
    font-size: 16px; /* Предотвращает масштабирование на iOS */
  }
}
</style> 