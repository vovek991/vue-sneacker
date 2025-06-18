const express = require('express')
const router = express.Router()
const db = require('../db/index')

// Получение всех кроссовок
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM кроссовки ORDER BY id_кроссовок'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при получении кроссовок:', error)
    res.status(500).json({ error: 'Ошибка при получении кроссовок' })
  }
})

// Получение одной пары кроссовок по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'SELECT * FROM кроссовки WHERE id_кроссовок = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Кроссовки не найдены' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при получении кроссовок:', error)
    res.status(500).json({ error: 'Ошибка при получении кроссовок' })
  }
})

// Добавление новых кроссовок
router.post('/', async (req, res) => {
  try {
    const { название, цена, imageUrl, размеры, пол, описание, бренд, сезон, цвет } = req.body
    
    const result = await db.query(
      'INSERT INTO кроссовки (название, цена, imageUrl, размеры, пол, описание, бренд, сезон, цвет) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [название, цена, imageUrl, размеры, пол, описание, бренд, сезон, цвет]
    )
    
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при добавлении кроссовок:', error)
    res.status(500).json({ error: 'Ошибка при добавлении кроссовок' })
  }
})

// Обновление кроссовок
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { название, цена, imageUrl, размеры, пол, описание, бренд, сезон, цвет } = req.body
    
    const result = await db.query(
      'UPDATE кроссовки SET название = $1, цена = $2, imageUrl = $3, размеры = $4, пол = $5, описание = $6, бренд = $7, сезон = $8, цвет = $9 WHERE id_кроссовок = $10 RETURNING *',
      [название, цена, imageUrl, размеры, пол, описание, бренд, сезон, цвет, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Кроссовки не найдены' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при обновлении кроссовок:', error)
    res.status(500).json({ error: 'Ошибка при обновлении кроссовок' })
  }
})

// Удаление кроссовок
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'DELETE FROM кроссовки WHERE id_кроссовок = $1 RETURNING *',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Кроссовки не найдены' })
    }
    
    res.json({ message: 'Кроссовки успешно удалены' })
  } catch (error) {
    console.error('Ошибка при удалении кроссовок:', error)
    res.status(500).json({ error: 'Ошибка при удалении кроссовок' })
  }
})

module.exports = router 