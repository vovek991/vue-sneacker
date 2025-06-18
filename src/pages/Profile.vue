<script setup>
import { useAuthStore } from '../store/auth'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const auth = useAuthStore()
const router = useRouter()
const user = ref(null)
const orders = ref([])

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/')
    return
  }
  user.value = auth.user
  // Загружаем заказы пользователя
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://127.0.0.1:3001/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    orders.value = data
  } catch (e) {
    orders.value = []
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-8">Личный кабинет</h1>
    
    <div v-if="user" class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Имя</h3>
            <p class="mt-1">{{ user.имя }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Фамилия</h3>
            <p class="mt-1">{{ user.фамилия }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p class="mt-1">{{ user.email }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Телефон</h3>
            <p class="mt-1">{{ user.телефон || 'Не указан' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Дата регистрации</h3>
            <p class="mt-1">{{ new Date(user.дата_регистрации).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="orders.length" class="mt-8">
      <h2 class="text-xl font-bold mb-4">Мои заказы</h2>
      <div v-for="order in orders" :key="order.id_заказа" class="mb-8 p-4 border rounded-lg bg-gray-50">
        <div class="mb-2 flex flex-wrap gap-6 items-center order-details">
          <span><b>Дата:</b> {{ new Date(order.дата_заказа).toLocaleString() }}</span>
          <span><b>Сумма:</b> {{ order.сумма_заказа }} BYN</span>
          <span><b>Статус:</b> {{ order.статус }}</span>
          <span><b>Адрес:</b> {{ order.адрес_доставки }}</span>
        </div>
        <div>
          <b>Состав заказа:</b>
          <ul class="mt-2 order-items-list">
            <li v-for="item in order.items" :key="item.id_кроссовок + '-' + item.размер" class="flex items-center gap-4 mb-1 order-item-row">
              <img :src="item.imageUrl" alt="img" class="w-12 h-8 object-contain rounded" />
              <span>{{ item.название }}</span>
              <span>размер: {{ item.размер }}</span>
              <span>кол-во: {{ item.количество }}</span>
              <span>цена: {{ item.цена }} BYN</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .order-details {
    flex-direction: column;
    gap: 8px !important;
    align-items: flex-start !important;
  }
  .order-items-list {
    overflow-x: auto;
    display: block;
    padding-bottom: 4px;
  }
  .order-item-row {
    min-width: 350px;
    flex-wrap: wrap;
    gap: 8px !important;
  }
}
</style> 