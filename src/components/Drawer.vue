<script setup>
import axios from 'axios'
import { ref, computed, inject } from 'vue'
import DrawerHead from './DrawerHead.vue'
import CartItemList from './CartItemList.vue'
import InfoBlock from './InfoBlock.vue'

const props = defineProps({
  totalPrice: Number
})

const { cart } = inject('cart')

const isCreating = ref(false)
const orderId = ref(null)
const error = ref('')
const city = ref('')
const street = ref('')
const house = ref('')
const apartment = ref('')
const phoneNumber = ref('')

const displayPrice = computed(() => {
  return props.totalPrice ? props.totalPrice.toFixed(2) : '0.00'
})

function handlePhoneInput(e) {
  let value = e.target.value.replace(/[^\d]/g, '')
  // Оставляем только 9 цифр после 375
  if (value.startsWith('375')) {
    value = value.slice(3, 12)
  } else {
    value = value.slice(0, 9)
  }
  // Ограничение: не больше 9 цифр
  if (value.length > 9) {
    value = value.slice(0, 9)
  }
  phoneNumber.value = value
}

const phoneDisplay = computed(() => '+375' + phoneNumber.value)

const createOrder = async () => {
  try {
    // Проверка новых полей
    if (!city.value.trim() || !street.value.trim() || !house.value.trim()) {
      error.value = 'Пожалуйста, заполните город, улицу и дом'
      return
    }
    if (!phoneNumber.value.trim()) {
      error.value = 'Пожалуйста, укажите контактный телефон'
      return
    }
    isCreating.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Необходимо авторизоваться'
      return
    }
    // Проверяем, что у всех товаров есть выбранный размер
    const itemsWithoutSize = cart.value.filter(item => !item.selectedSize)
    if (itemsWithoutSize.length > 0) {
      error.value = 'Пожалуйста, выберите размер для всех товаров'
      return
    }
    // Собираем полный адрес
    const fullAddress = `г. ${city.value}, ул. ${street.value}, д. ${house.value}${apartment.value ? ', кв. ' + apartment.value : ''}`
    console.log('Отправляемые данные:', {
      items: cart.value.map(item => ({
        id_кроссовок: item.id,
        цена: item.price,
        размер: item.selectedSize
      })),
      totalPrice: props.totalPrice,
      deliveryAddress: fullAddress,
      phoneNumber: phoneNumber.value
    })
    const { data } = await axios.post(`http://127.0.0.1:3001/api/orders`, {
      items: cart.value.map(item => ({
        id_кроссовок: item.id,
        цена: item.price,
        размер: item.selectedSize
      })),
      totalPrice: props.totalPrice,
      deliveryAddress: fullAddress,
      phoneNumber: phoneNumber.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('Ответ сервера:', data)
    cart.value = []
    orderId.value = data.id
    error.value = ''
  } catch (err) {
    console.error('Ошибка при создании заказа:', err)
    error.value = err.response?.data?.error || 'Ошибка при создании заказа'
  } finally {
    isCreating.value = false
  }
}

const cartIsEmpty = computed(() => cart.value.length === 0)
const buttonDisabled = computed(() => isCreating.value || cartIsEmpty.value)
</script>

<template>
  <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>
  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <DrawerHead />

    <div v-if="!totalPrice || orderId" class="flex h-full items-center">
      <InfoBlock
        v-if="!totalPrice && !orderId"
        title="Корзина пустая"
        description="Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ."
        image-url="/package-icon.png"
      />
      <InfoBlock
        v-if="orderId"
        title="Заказ оформлен!"
        :description="`Ваш заказ #${orderId} скоро будет передан курьерской доставке`"
        image-url="/order-success-icon.png"
      />
    </div>

    <div v-else>
      <CartItemList />

      <div class="flex flex-col gap-4 mt-7">
        <div class="flex gap-2 items-center">
          <span class="text-lg">Итого:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <div class="flex flex-col items-end">
            <b class="text-xl">{{ displayPrice }} BYN</b>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <input
            v-model="city"
            type="text"
            placeholder="Город"
            class="w-full p-2 border rounded"
          />
          <input
            v-model="street"
            type="text"
            placeholder="Улица"
            class="w-full p-2 border rounded"
          />
          <input
            v-model="house"
            type="text"
            placeholder="Дом"
            class="w-full p-2 border rounded"
          />
          <input
            v-model="apartment"
            type="text"
            placeholder="Квартира (необязательно)"
            class="w-full p-2 border rounded"
          />
          <input
            :value="phoneDisplay"
            type="tel"
            placeholder="Контактный телефон"
            class="w-full p-2 border rounded"
            @input="handlePhoneInput"
            maxlength="13"
            @keydown="(e) => { if (e.target.selectionStart < 4 || phoneNumber.value.length >= 9 && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) e.preventDefault(); }"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>

        <button
          :disabled="buttonDisabled"
          @click="createOrder"
          class="mt-6 transition bg-lime-500 w-full rounded-xl py-3 text-white disabled:bg-slate-300 hover:bg-lime-600 active:bg-lime-700 cursor-pointer"
        >
          {{ isCreating ? 'Оформление...' : 'Оформить заказ' }}
        </button>
      </div>
    </div>
  </div>
</template>