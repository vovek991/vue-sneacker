[file name]: LoginForm.vue [file content begin]
<script setup>
import { ref } from 'vue'

const loginData = ref({
  email: '',
  password: ''
})

const emit = defineEmits(['close', 'showRegister'])

const error = ref('')

const submitForm = async () => {
  error.value = ''
  try {
    const res = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginData.value.email,
        password: loginData.value.password
      })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Ошибка входа'
      return
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('userName', data.user.имя)
    emit('close')
    window.location.href = '/'
  } catch (e) {
    error.value = 'Ошибка сети'
  }
}

// Исправлено с gofoRegister на goToRegister
const goToRegister = () => {
  emit('showRegister')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Вход в аккаунт</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="loginData.email"
            type="email"
            id="email"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            v-model="loginData.password"
            type="password"
            id="password"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-lime-500 text-white py-2 px-4 rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
        >
          Войти
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Нет аккаунта?
          <button @click="goToRegister" class="text-lime-600 hover:text-lime-700 font-medium">
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
[file content end]
