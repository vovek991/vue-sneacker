<script setup>
import { computed, inject } from 'vue'

const { currency, currencyRate } = inject('currency')
const emit = defineEmits(['onClickRemove'])

const props = defineProps({
  id: Number,
  title: String,
  brand: String,
  imageUrl: String,
  price: Number,
  selectedSize: String
})

const displayPrice = computed(() => {
  const price = Number(props.price) || 0
  return price.toFixed(2)
})
</script>

<template>
  <div class="flex items-center border border-slate-200 p-4 rounded-xl gap-4 relative">
    <slot></slot>
    <img class="w-16 h-16" :src="imageUrl" :alt="title" />

    <div class="flex flex-col flex-1">
      <p>{{ brand }} {{ title }}</p>
      <p class="text-sm text-gray-500">Размер: {{ selectedSize }}</p>

      <div class="flex justify-between mt-2">
        <div class="flex flex-col">
          <b>{{ displayPrice }} BYN</b>
        </div>
        <img
          @click="emit('onClickRemove')"
          class="opacity-40 hover:opacity-100 cursor-pointer transition"
          src="/close.svg"
        />
      </div>
    </div>
  </div>
</template>