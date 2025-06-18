<script setup>
import { ref, computed, inject } from 'vue'
import CardList from '../components/CardList.vue' // Исправленный путь

const { favorites } = inject('favorites')
const drawerOpen = inject('drawerOpen')

const sortType = ref('default')

const sortedFavorites = computed(() => {
  if (sortType.value === 'title_asc') {
    return [...favorites.value].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortType.value === 'title_desc') {
    return [...favorites.value].sort((a, b) => b.title.localeCompare(a.title))
  }
  return favorites.value
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-8">Мои закладки</h1>
    <div class="flex items-center gap-4 mb-6">
      <label class="text-gray-600">Сортировка:</label>
      <select v-model="sortType" class="border rounded-md p-2">
        <option value="default">Без сортировки</option>
        <option value="title_asc">По названию (А-Я)</option>
        <option value="title_desc">По названию (Я-А)</option>
      </select>
    </div>
    <div v-if="sortedFavorites.length === 0" class="text-gray-400 text-lg text-center py-20">
      У вас нет избранных товаров.
    </div>
    <CardList 
      v-else
      :items="sortedFavorites" 
      :is-favorites="true" 
      :drawer-open="drawerOpen"
    />
  </div>
</template>