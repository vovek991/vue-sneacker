<script setup>
import { inject, computed } from 'vue'
import CartItem from './CartItem.vue'

const { cart, removeFromCart } = inject('cart')
const { favorites } = inject('favorites')

const cartItemsWithFavorites = computed(() => {
  return cart.value.map(item => ({
    ...item,
    isFavorite: favorites.value.some(fav => fav.id === item.id)
  }))
})
</script>

<template>
  <div class="flex flex-col gap-4 flex-1 overflow-auto">
    <CartItem
      v-for="item in cartItemsWithFavorites"
      :key="item.id"
      v-bind="item"
      @onClickRemove="() => removeFromCart(item)"
    />
  </div>
</template>
