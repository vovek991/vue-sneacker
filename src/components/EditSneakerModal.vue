<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'edited'])
const props = defineProps({
  sneaker: Object
})

const brands = ref([])
const sizesList = Array.from({ length: 46 - 34 + 1 }, (_, i) => 34 + i)
const seasonsList = ['Зима', 'Лето']
const colorsList = ['Белый', 'Черный', 'Синий', 'Красный', 'Зеленый', 'Желтый', 'Серый']

const editedSneaker = ref({
  brand: '',
  title: '',
  price: '',
  imageUrl: '',
  sizes: [],
  gender: '',
  description: '',
  season: '',
  color: ''
})

const error = ref('')
const success = ref('')
const warning = ref('')

const fetchBrands = async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:3001/api/brands')
    brands.value = data
    // Устанавливаем значение бренда после загрузки брендов
    const brand = brands.value.find(b => b.название === props.sneaker.brand)
    if (brand) {
      editedSneaker.value.brand = brand.id_бренда
    }
  } catch (e) {
    brands.value = []
  }
}

onMounted(() => {
  fetchBrands()
  // Заполняем форму данными кроссовка
  editedSneaker.value = {
    brand: '', // Заполняется после загрузки брендов
    title: props.sneaker.title,
    price: props.sneaker.price,
    imageUrl: props.sneaker.imageUrl,
    sizes: Array.isArray(props.sneaker.sizes) ? props.sneaker.sizes : props.sneaker.sizes?.split(',').map(s => Number(s.trim())) || [],
    gender: props.sneaker.gender,
    description: props.sneaker.description,
    season: props.sneaker.season,
    color: props.sneaker.color
  }
})

const submit = async () => {
  error.value = ''
  success.value = ''
  warning.value = ''
  let imgUrl = editedSneaker.value.imageUrl
  // Если пользователь ввёл только имя файла, добавляем /sneakers/
  if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
    imgUrl = '/sneakers/' + imgUrl
  }
  try {
    await axios.put(`http://127.0.0.1:3001/api/sneakers/${props.sneaker.id}`, {
      название: editedSneaker.value.title || null,
      цена: editedSneaker.value.price || null,
      описание: editedSneaker.value.description || null,
      id_бренда: editedSneaker.value.brand || null,
      id_категории: 1,
      пол: editedSneaker.value.gender || null,
      сезон: editedSneaker.value.season || null,
      цвет: editedSneaker.value.color || null,
      дата_выпуска: null,
      imageUrl: imgUrl || null,
      размеры: editedSneaker.value.sizes.join(',') || null,
      активен: 1
    })
    success.value = 'Кроссовки успешно обновлены!'
    emit('edited')
    setTimeout(() => emit('close'), 1000)
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка при обновлении'
    success.value = ''
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4">Редактировать кроссовки</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Бренд</label>
          <select v-model="editedSneaker.brand" class="w-full border p-2 rounded" required>
            <option value="">Выберите бренд</option>
            <option v-for="b in brands" :key="b.id_бренда" :value="b.id_бренда">{{ b.название }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Название</label>
          <input v-model="editedSneaker.title" class="w-full border p-2 rounded" placeholder="Название" required />
        </div>
        <input v-model="editedSneaker.price" type="number" class="w-full border p-2 rounded" placeholder="Цена" required />
        <input v-model="editedSneaker.imageUrl" class="w-full border p-2 rounded" placeholder="Ссылка на изображение" required />
        <div>
          <label class="block mb-1 font-medium">Размеры</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="size in sizesList" :key="size" class="flex items-center gap-1">
              <input type="checkbox" :value="size" v-model="editedSneaker.sizes" />
              <span>{{ size }}</span>
            </label>
          </div>
        </div>
        <select v-model="editedSneaker.gender" class="w-full border p-2 rounded" required>
          <option value="">Выберите пол</option>
          <option value="мужские">Мужские</option>
          <option value="женские">Женские</option>
          <option value="унисекс">Унисекс</option>
        </select>
        <select v-model="editedSneaker.season" class="w-full border p-2 rounded" required>
          <option value="">Выберите сезон</option>
          <option v-for="s in seasonsList" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="editedSneaker.color" class="w-full border p-2 rounded" required>
          <option value="">Выберите цвет</option>
          <option v-for="c in colorsList" :key="c" :value="c">{{ c }}</option>
        </select>
        <textarea v-model="editedSneaker.description" class="w-full border p-2 rounded" placeholder="Описание"></textarea>
        <div v-if="error" class="text-red-500">{{ error }}</div>
        <div v-if="success" class="text-green-500">{{ success }}</div>
        <div v-if="warning" class="text-yellow-500">{{ warning }}</div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">Отмена</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template> 