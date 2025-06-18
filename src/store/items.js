import { defineStore } from 'pinia'
import axios from 'axios'

export const useItemsStore = defineStore('items', {
  state: () => ({
    allItems: [],
    brands: []
  }),
  actions: {
    async fetchItems() {
      const { data } = await axios.get('http://127.0.0.1:3001/api/sneakers')
      const mapped = data.map(item => ({
        id: item.id_кроссовок,
        title: item.название,
        price: Number(item.цена),
        imageUrl: item.imageUrl,
        sizes: item.размеры ? item.размеры.split(',').map(s => String(s).trim()) : [],
        gender: item.пол,
        description: item.описание,
        brand: item.бренд,
        season: item.сезон,
        color: item.цвет,
        isFavorite: false
      }))
      this.allItems = mapped
      this.brands = [...new Set(this.allItems.map(item => item.brand))].filter(Boolean)
    }
  }
})