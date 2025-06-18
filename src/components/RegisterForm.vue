[file name]: RegisterForm.vue [file content begin]
<script setup>
import { ref } from 'vue'

const registerData = ref({
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const emit = defineEmits(['close', 'showLogin'])

const error = ref('')

const submitForm = async () => {
  error.value = ''
  if (registerData.value.password !== registerData.value.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }
  try {
    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.value.email,
        password: registerData.value.password,
        имя: registerData.value.name,
        фамилия: registerData.value.surname
      })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Ошибка регистрации'
      return
    }
    emit('close')
    emit('showLogin')
  } catch (e) {
    error.value = 'Ошибка сети'
  }
}

// Здесь также убедитесь, что используется goToLogin, а не gofoLogin
const goToLogin = () => {
  emit('showLogin')
}
</script>

<!-- Остальная часть компонента без изменений -->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Регистрация</h2>
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
          <label for="name" class="block text-sm font-medium text-gray-700">Имя</label>
          <input
            v-model="registerData.name"
            type="text"
            id="name"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div>
          <label for="surname" class="block text-sm font-medium text-gray-700">Фамилия</label>
          <input
            v-model="registerData.surname"
            type="text"
            id="surname"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="registerData.email"
            type="email"
            id="email"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            v-model="registerData.password"
            type="password"
            id="password"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700"
            >Подтвердите пароль</label
          >
          <input
            v-model="registerData.confirmPassword"
            type="password"
            id="confirmPassword"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button
          type="submit"
          class="w-full bg-lime-500 text-white py-2 px-4 rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
        >
          Зарегистрироваться
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Уже есть аккаунт?
          <button @click="goToLogin" class="text-lime-600 hover:text-lime-700 font-medium">
            Войти
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
[file content end]
