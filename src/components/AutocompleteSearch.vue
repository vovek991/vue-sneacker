<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  items: Array,
  onSelect: Function
})

const query = ref('')
const showDropdown = ref(false)
const emit = defineEmits(['clear'])

const suggestions = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return props.items.filter(item =>
    item.title.toLowerCase().includes(q) ||
    (item.brand && item.brand.toLowerCase().includes(q))
  ).slice(0, 8)
})

function handleInput() {
  showDropdown.value = !!query.value.trim() && suggestions.value.length > 0
}

function selectSuggestion(item) {
  query.value = item.title
  showDropdown.value = false
  props.onSelect && props.onSelect(item)
}

watch(query, (val) => {
  handleInput()
  if (!val.trim()) emit('clear')
})
</script>

<template>
  <div class="relative w-full max-w-xs">
    <input
      v-model="query"
      @focus="handleInput"
      @blur="() => setTimeout(() => showDropdown = false, 150)"
      type="text"
      placeholder="Поиск..."
      class="pl-4 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
    />
    <ul v-if="showDropdown" class="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-60 overflow-auto">
      <li
        v-for="item in suggestions"
        :key="item.id"
        @mousedown.prevent="selectSuggestion(item)"
        class="px-4 py-2 cursor-pointer hover:bg-lime-100"
      >
        <span class="font-medium">{{ item.title }}</span>
        <span class="text-gray-400 text-xs ml-2">{{ item.brand }}</span>
      </li>
      <li v-if="suggestions.length === 0" class="px-4 py-2 text-gray-400">Нет совпадений</li>
    </ul>
  </div>
</template> 