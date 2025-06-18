// src/store/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const error = ref('')

  const login = async (email, password) => {
    error.value = ''
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/login', {
        email,
        password
      })
      if (response.data && response.data.token) {
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userName', response.data.user.имя)
        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return true
      } else {
        error.value = response.data.error || 'Ошибка входа'
        return false
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        error.value = err.response.data.error
      } else {
        error.value = 'Ошибка сети или сервера'
      }
      return false
    }
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get('http://localhost:3001/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        user.value = response.data
        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        logout()
      }
    } else {
      // Если нет токена, пробуем взять пользователя из localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('user')
  }

  // Вызов checkAuth при инициализации стора
  checkAuth()

  return { user, isAuthenticated, login, logout, checkAuth, error }
})