<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const { cart, clearCart } = inject('cart')

const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const cardName = ref('')
const saveCard = ref(false)

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + Number(item.price), 0)
})

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

const handleCardNumberInput = (e) => {
  let value = e.target.value
  cardNumber.value = formatCardNumber(value)
}

const handleExpiryDate = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  expiryDate.value = value
}

const handleSubmit = async () => {
  try {
    const orderData = {
      items: cart.value,
      totalPrice: totalPrice.value,
      paymentDetails: {
        cardNumber: cardNumber.value.replace(/\s/g, ''),
        expiryDate: expiryDate.value,
        cardName: cardName.value,
        saveCard: saveCard.value
      }
    }

    await axios.post('http://127.0.0.1:3001/api/orders', orderData)
    clearCart()
    router.push('/')
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error)
    alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.')
  }
}

console.log('allItems', allItems.value)
console.log('curBrand', curBrand, 'curColor', curColor, 'curSizes', curSizes)
allItems.value.forEach(item => {
  console.log('item', item.id, item.brand, item.color, item.sizes)
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Оформление заказа</h1>
    
    <!-- Состав заказа -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Состав заказа</h2>
      <div class="space-y-4">
        <div v-for="item in cart" :key="item.id" class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img :src="item.imageUrl" :alt="item.title" class="w-16 h-16 object-cover rounded" />
            <div>
              <h3 class="font-medium">{{ item.title }}</h3>
              <p class="text-sm text-gray-500">{{ item.brand }}</p>
            </div>
          </div>
          <p class="font-medium">{{ item.price }} BYN</p>
        </div>
      </div>
      <div class="border-t mt-4 pt-4">
        <div class="flex justify-between items-center">
          <span class="font-semibold">Итого:</span>
          <span class="font-semibold text-xl">{{ totalPrice }} BYN</span>
        </div>
      </div>
    </div>
    
    <!-- Форма оплаты -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Оплата заказа</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Номер банковской карты</label>
          <input
            type="text"
            v-model="cardNumber"
            @input="handleCardNumberInput"
            placeholder="5536 0039 8192 0214"
            maxlength="19"
            class="w-full border rounded-md p-2"
            required
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Срок действия</label>
            <input
              type="text"
              v-model="expiryDate"
              @input="handleExpiryDate"
              placeholder="MM/YY"
              maxlength="5"
              class="w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="password"
              v-model="cvv"
              placeholder="333"
              maxlength="3"
              class="w-full border rounded-md p-2"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия и имя на карте</label>
          <input
            type="text"
            v-model="cardName"
            placeholder="IVAN IVANOV"
            class="w-full border rounded-md p-2 uppercase"
            required
          />
        </div>
        
        <div class="flex items-center">
          <input
            type="checkbox"
            id="saveCard"
            v-model="saveCard"
            class="rounded border-gray-300 text-lime-500 focus:ring-lime-500"
          />
          <label for="saveCard" class="ml-2 text-sm text-gray-700">Запомнить карту</label>
        </div>
        
        <button
          type="submit"
          class="w-full bg-lime-500 text-white py-3 rounded-md font-medium hover:bg-lime-600 transition-colors"
        >
          Оплатить {{ totalPrice }} BYN
        </button>
      </form>
    </div>

    <div v-if="Array.isArray(similarSneakers) && similarSneakers.length > 0" class="mt-10">
      ...
    </div>
  </div>
</template> 