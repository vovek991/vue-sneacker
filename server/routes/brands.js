const express = require('express')
const router = express.Router()
const db = require('../db/index')

// Получение всех брендов
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT бренд FROM кроссовки WHERE бренд IS NOT NULL ORDER BY бренд'
    )
    res.json(result.rows.map(row => row.бренд))
  } catch (error) {
    console.error('Ошибка при получении брендов:', error)
    res.status(500).json({ error: 'Ошибка при получении брендов' })
  }
})

module.exports = router 