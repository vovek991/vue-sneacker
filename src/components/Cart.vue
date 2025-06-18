<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { cart, removeFromCart } = inject('cart')

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + Number(item.price), 0)
})

const handleCheckout = () => {
  router.push('/checkout')
}
</script>

<template>
  <div class="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl p-6 z-50">
    <div v-if="cart.length === 0" class="text-center py-8">
      <h3 class="text-xl font-bold mb-2">Корзина пустая</h3>
      <p class="text-gray-500 mb-6">Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ.</p>
      <img src="/empty-cart.jpg" alt="Empty cart" class="mx-auto mb-6" />
    </div>
    <template v-else>
      <div class="space-y-4 mb-6">
        <div v-for="item in cart" :key="item.id" class="flex items-center gap-4">
          <img :src="item.imageUrl" :alt="item.title" class="w-16 h-16 object-cover rounded-xl" />
          <div class="flex-1">
            <h3 class="font-medium">{{ item.title }}</h3>
            <p class="text-lime-500 font-bold">{{ item.price }} BYN</p>
          </div>
          <button @click="() => removeFromCart(item)" class="text-gray-400 hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div class="border-t border-gray-200 pt-4 mb-4">
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Итого:</span>
          <span class="font-bold">{{ totalPrice }} BYN</span>
        </div>
      </div>
      <button 
        @click="handleCheckout"
        class="block w-full bg-lime-500 text-white text-center py-3 rounded-xl font-medium hover:bg-lime-600 transition-colors"
      >
        Оформить заказ
      </button>
    </template>
  </div>
</template> 