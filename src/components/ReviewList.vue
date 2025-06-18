<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../store/auth'

const props = defineProps({
  sneakerId: [String, Number]
})

const auth = useAuthStore()
const userName = computed(() => auth.user?.имя || '')
const isAuth = computed(() => !!auth.user)

const reviewsKey = `reviews_${props.sneakerId}`
const reviews = ref(JSON.parse(localStorage.getItem(reviewsKey)) || [])

const newReview = ref({
  author: userName.value,
  text: '',
  rating: 0
})

watch(userName, (val) => {
  if (isAuth.value) newReview.value.author = val
})

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  return (
    reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length
  ).toFixed(1)
})

const addReview = () => {
  if (!newReview.value.author.trim() || !newReview.value.text.trim() || newReview.value.rating < 1 || newReview.value.rating > 5) return
  reviews.value.push({
    ...newReview.value,
    date: new Date().toLocaleString()
  })
  localStorage.setItem(reviewsKey, JSON.stringify(reviews.value))
  newReview.value = { author: isAuth.value ? userName.value : '', text: '', rating: 0 }
}

watch(reviews, (val) => {
  localStorage.setItem(reviewsKey, JSON.stringify(val))
}, { deep: true })
</script>

<template>
  <div class="mt-8">
    <h3 class="text-xl font-medium mb-2">Отзывы</h3>
    <div v-if="reviews.length" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="font-bold">Средняя оценка:</span>
        <span class="text-yellow-500 text-lg">{{ averageRating }}</span>
        <span class="text-yellow-400">
          <template v-for="n in 5">
            <span v-if="n <= Math.round(averageRating)" :key="'star-full-'+n">★</span>
            <span v-else :key="'star-empty-'+n">☆</span>
          </template>
        </span>
      </div>
      <div v-for="(review, idx) in reviews" :key="idx" class="border-b py-2">
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ review.author }}</span>
          <span class="text-yellow-400 text-sm">
            <template v-for="n in 5">
              <span v-if="n <= review.rating" :key="'star-'+n">★</span>
              <span v-else :key="'star-empty-'+n">☆</span>
            </template>
          </span>
          <span class="text-gray-400 text-xs">{{ review.date }}</span>
        </div>
        <div class="text-gray-700">{{ review.text }}</div>
      </div>
    </div>
    <form @submit.prevent="addReview" class="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
      <input v-if="!isAuth" v-model="newReview.author" type="text" placeholder="Ваше имя" class="border rounded p-2" required />
      <div v-else class="font-semibold text-gray-700 mb-1">{{ userName }}</div>
      <textarea v-model="newReview.text" placeholder="Ваш отзыв" class="border rounded p-2" required></textarea>
      <div class="flex items-center gap-2">
        <span>Оценка:</span>
        <span class="text-yellow-400 text-xl">
          <template v-for="n in 5" :key="n">
            <span
              class="cursor-pointer"
              @click="newReview.rating = n"
            >
              {{ n <= newReview.rating ? '★' : '☆' }}
            </span>
          </template>
        </span>
      </div>
      <button type="submit" class="bg-lime-500 text-white rounded px-4 py-2 mt-2 self-end hover:bg-lime-600" :disabled="!newReview.author || !newReview.text || newReview.rating < 1">Оставить отзыв</button>
    </form>
  </div>
</template> 