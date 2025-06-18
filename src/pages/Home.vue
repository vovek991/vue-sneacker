<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import CardList from '../components/CardList.vue'
import FilterMenu from '../components/FilterMenu.vue'
import { useAuthStore } from '../store/auth'
import { inject } from 'vue'
import AddSneakerModal from '../components/AddSneakerModal.vue'
import EditSneakerModal from '../components/EditSneakerModal.vue'
import { useRoute } from 'vue-router'
import AutocompleteSearch from '../components/AutocompleteSearch.vue'
import { useItemsStore } from '../store/items'

const { cart, favorites, addToCart } = inject('cart') ? inject('cart') : { cart: ref([]), favorites: ref([]), addToCart: () => {} }
const auth = useAuthStore()
const route = useRoute()
const drawerOpen = inject('drawerOpen')

const itemsStore = useItemsStore()
const allItems = computed(() => itemsStore.allItems)
const brands = computed(() => itemsStore.brands)

const items = ref([])
const searchQuery = ref('')
const seasons = ['Зима', 'Лето']
const genders = ['мужские', 'женские', 'унисекс']
const colors = ['Белый', 'Черный', 'Синий', 'Красный', 'Зеленый', 'Желтый', 'Серый']
const sizes = Array.from({ length: 46 - 34 + 1 }, (_, i) => (34 + i).toString())

const showFilters = ref(false)
const filterValues = ref({
  brand: '',
  sizes: [],
  season: '',
  gender: '',
  color: '',
  minPrice: 0,
  maxPrice: 2000
})
const showAddSneakerModal = ref(false)
const showEditSneakerModal = ref(false)
const selectedSneaker = ref(null)
const sortType = ref('default')
const currentPage = ref(1)
const itemsPerPage = 8

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return items.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage))

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

watch([() => items.value, () => sortType.value], () => { currentPage.value = 1 })

const fetchItems = async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:3001/api/sneakers')
    const mapped = data.map(item => ({
      id: item.id_кроссовок,
      title: item.название,
      price: Number(item.цена),
      imageUrl: item.imageUrl,
      sizes: item.размеры ? item.размеры.split(',').map(s => s.trim()) : [],
      gender: item.пол,
      description: item.описание,
      brand: item.бренд,
      season: item.сезон,
      color: item.цвет,
      isFavorite: favorites.value.some(fav => fav.id === item.id_кроссовок)
    }))
    itemsStore.allItems = mapped
    items.value = mapped
    // Обновляем список брендов
    const uniqueBrands = [...new Set(mapped.map(item => item.brand))].filter(Boolean)
    itemsStore.brands = uniqueBrands
  } catch (err) {
    console.log(err)
  }
}

const onClickAddPlus = (payload) => {
  console.log('onClickAddPlus called with:', payload)
  // payload: { id, size }
  const item = items.value.find(i => String(i.id) === String(payload.id))
  if (!item || !payload.size) return
  addToCart({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    price: item.price,
    brand: item.brand,
    season: item.season,
    color: item.color,
    gender: item.gender,
    description: item.description,
    sizes: item.sizes,
    selectedSize: String(payload.size)
  })
}

const onAddSneaker = () => {
  showAddSneakerModal.value = true
}

const closeAddSneakerModal = () => {
  showAddSneakerModal.value = false
}

const onSneakerAdded = () => {
  fetchItems()
  showAddSneakerModal.value = false
}

const handleDeleteSneaker = async (id) => {
  if (!confirm('Удалить кроссовки?')) return
  try {
    await axios.delete(`http://127.0.0.1:3001/api/sneakers/${id}`)
    await fetchItems()
  } catch (e) {
    alert('Ошибка при удалении')
  }
}

const handleEditSneaker = (sneaker) => {
  selectedSneaker.value = sneaker
  showEditSneakerModal.value = true
}

const closeEditSneakerModal = () => {
  showEditSneakerModal.value = false
  selectedSneaker.value = null
}

const onSneakerEdited = () => {
  fetchItems()
  showEditSneakerModal.value = false
  selectedSneaker.value = null
}

const applyFilters = (filters) => {
  let filtered = [...allItems.value]
  // Фильтрация по цене
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    filtered = filtered.filter(item => 
      item.price >= filters.minPrice && item.price <= filters.maxPrice
    )
  }
  // Фильтрация по бренду
  if (filters.brand) {
    filtered = filtered.filter(i => i.brand === filters.brand)
  }
  // Фильтрация по размерам
  if (filters.sizes && filters.sizes.length) {
    filtered = filtered.filter(i => i.sizes && i.sizes.some(size => filters.sizes.includes(size)))
  }
  // Фильтрация по сезону
  if (filters.season) {
    filtered = filtered.filter(i => i.season === filters.season)
  }
  // Фильтрация по полу
  if (filters.gender) {
    filtered = filtered.filter(i => i.gender === filters.gender)
  }
  // Фильтрация по цвету
  if (filters.color) {
    filtered = filtered.filter(i => i.color === filters.color)
  }
  items.value = filtered
}

const resetFilters = () => {
  items.value = allItems.value
  searchQuery.value = ''
  filterValues.value = {
    brand: '',
    sizes: [],
    season: '',
    gender: '',
    color: '',
    minPrice: 0,
    maxPrice: 2000
  }
}

const applySearch = (query) => {
  if (!query.trim()) {
    items.value = allItems.value
    return
  }
  const searchLower = query.toLowerCase()
  items.value = allItems.value.filter(item => 
    item.title.toLowerCase().includes(searchLower) ||
    item.brand.toLowerCase().includes(searchLower) ||
    item.description?.toLowerCase().includes(searchLower)
  )
}

watch(searchQuery, (newQuery) => {
  applySearch(newQuery)
})

function sortItems() {
  if (sortType.value === 'price_asc') {
    items.value = [...items.value].sort((a, b) => a.price - b.price)
  } else if (sortType.value === 'price_desc') {
    items.value = [...items.value].sort((a, b) => b.price - a.price)
  } else if (sortType.value === 'newest') {
    items.value = [...items.value].sort((a, b) => new Date(b.дата_создания) - new Date(a.дата_создания))
  } else {
    items.value = [...items.value]
  }
}

function updateItemsAndSort(newItems) {
  items.value = newItems
  if (sortType.value !== 'default') sortItems()
}

onMounted(async () => {
  await itemsStore.fetchItems()
  items.value = [...itemsStore.allItems]
  const urlBrand = route.query.brand
  const urlCategory = route.query.category
  if (urlBrand) {
    filterValues.value.brand = urlBrand
    applyFilters(filterValues.value)
  }
  if (urlCategory) {
    if (urlCategory === 'all') {
      resetFilters()
    } else {
      switch (urlCategory) {
        case 'зимние':
          filterValues.value = {
            ...filterValues.value,
            season: 'Зима'
          }
          break;
        case 'летние':
          filterValues.value = {
            ...filterValues.value,
            season: 'Лето'
          }
          break;
        case 'мужские':
          filterValues.value = {
            ...filterValues.value,
            gender: 'мужские'
          }
          break;
        case 'женские':
          filterValues.value = {
            ...filterValues.value,
            gender: 'женские'
          }
          break;
        case 'бег':
        case 'баскетбол':
          items.value = allItems.value.filter(item => 
            item.description?.toLowerCase().includes(urlCategory.toLowerCase())
          )
          return;
      }
      applyFilters(filterValues.value)
    }
  }
})

// Следим за изменениями параметров URL
watch(() => route.query, async (newQuery) => {
  if (newQuery.brand) {
    filterValues.value.brand = newQuery.brand
    applyFilters(filterValues.value)
  } else if (newQuery.category) {
    if (newQuery.category === 'all') {
      resetFilters()
    } else {
      switch (newQuery.category) {
        case 'зимние':
          filterValues.value = {
            ...filterValues.value,
            season: 'Зима'
          }
          break;
        case 'летние':
          filterValues.value = {
            ...filterValues.value,
            season: 'Лето'
          }
          break;
        case 'мужские':
          filterValues.value = {
            ...filterValues.value,
            gender: 'мужские'
          }
          break;
        case 'женские':
          filterValues.value = {
            ...filterValues.value,
            gender: 'женские'
          }
          break;
        case 'бег':
        case 'баскетбол':
          items.value = allItems.value.filter(item => 
            item.description?.toLowerCase().includes(newQuery.category.toLowerCase())
          )
          return;
      }
      applyFilters(filterValues.value)
    }
  } else {
    resetFilters()
  }
}, { deep: true })

watch(cart, () => {
  items.value = items.value.map(item => ({
    ...item,
    isAdded: cart.value.some(cartItem => cartItem.id === item.id)
  }))
}, { deep: true })

watch(favorites, () => {
  items.value = items.value.map(item => ({
    ...item,
    isFavorite: favorites.value.some(fav => fav.id === item.id)
  }))
}, { deep: true })

function handleAutocompleteSelect(item) {
  // Фильтруем по выбранному товару или бренду
  if (item.brand) {
    items.value = allItems.value.filter(i => i.brand === item.brand || i.id === item.id)
  } else {
    items.value = allItems.value.filter(i => i.id === item.id)
  }
}
</script>

<template>
  <FilterMenu
    :show="showFilters"
    :brands="brands"
    :sizes="sizes"
    :seasons="seasons"
    :genders="genders"
    :colors="colors"
    :model-value="filterValues"
    @close="showFilters = false"
    @apply="applyFilters"
    @reset="resetFilters"
  />
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-4 px-4 md:px-0">
    <h2 class="text-2xl md:text-3xl font-bold">Все кроссовки</h2>
    <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto">
      <AutocompleteSearch 
        class="w-full md:w-auto" 
        :items="allItems" 
        :onSelect="handleAutocompleteSelect" 
        @clear="updateItemsAndSort(allItems)" 
      />
      <div class="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
        <select v-model="sortType" class="col-span-2 md:col-span-1 border rounded-md p-2 min-w-[120px]">
          <option value="default">Без сортировки</option>
          <option value="price_asc">Сначала дешевые</option>
          <option value="price_desc">Сначала дорогие</option>
          <option value="newest">Сначала новые</option>
        </select>
        <button @click="showFilters = true" class="py-2 px-4 border rounded-md bg-lime-500 text-white hover:bg-lime-600 whitespace-nowrap">
          Фильтры
        </button>
        <button
          v-if="auth.user && auth.user.является_админом"
          @click="onAddSneaker"
          class="py-2 px-4 border rounded-md bg-blue-500 text-white hover:bg-blue-600 whitespace-nowrap"
        >
          Добавить
        </button>
      </div>
    </div>
  </div>
  <div class="mt-4">
    <CardList 
      :items="pagedItems" 
      @add-to-cart="onClickAddPlus" 
      :onDelete="handleDeleteSneaker"
      :onEdit="handleEditSneaker"
      :drawer-open="drawerOpen"
    />
  </div>
  <div class="flex justify-center mt-6 gap-2" v-if="totalPages > 1">
    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :class="['px-3 py-1 rounded text-sm', currentPage === page ? 'bg-lime-500 text-white' : 'bg-gray-200 hover:bg-lime-100']"
    >
      {{ page }}
    </button>
  </div>
  <AddSneakerModal v-if="showAddSneakerModal" @close="closeAddSneakerModal" @added="onSneakerAdded" />
  <EditSneakerModal 
    v-if="showEditSneakerModal" 
    :sneaker="selectedSneaker"
    @close="closeEditSneakerModal" 
    @edited="onSneakerEdited" 
  />
</template>
