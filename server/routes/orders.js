const express = require('express')
const router = express.Router()
const db = require('../db/index')
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY || 'your-very-secure-secret-key'

// Middleware для проверки JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

// Создание нового заказа
router.post('/', async (req, res) => {
  try {
    const { items, totalPrice, paymentDetails } = req.body

    // Создаем заказ в базе данных
    const orderResult = await db.query(
      'INSERT INTO заказы (общая_сумма, статус, дата_создания) VALUES ($1, $2, $3) RETURNING id_заказа',
      [totalPrice, 'новый', new Date()]
    )
    
    const orderId = orderResult.rows[0].id_заказа

    // Добавляем товары заказа
    for (const item of items) {
      await db.query(
        'INSERT INTO товары_заказа (id_заказа, id_кроссовок, количество, цена) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, 1, item.price]
      )
    }

    // Сохраняем данные оплаты
    await db.query(
      'INSERT INTO данные_оплаты (id_заказа, номер_карты, срок_действия, имя_владельца, сохранить_карту) VALUES ($1, $2, $3, $4, $5)',
      [
        orderId,
        paymentDetails.cardNumber,
        paymentDetails.expiryDate,
        paymentDetails.cardName,
        paymentDetails.saveCard
      ]
    )

    res.status(201).json({ orderId })
  } catch (error) {
    console.error('Ошибка при создании заказа:', error)
    res.status(500).json({ error: 'Ошибка при создании заказа' })
  }
})

// Получить заказы текущего пользователя
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id_пользователя;
    const [orders] = await db.execute(
      'SELECT * FROM заказы WHERE id_пользователя = ? ORDER BY дата_заказа DESC',
      [userId]
    );
    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT t.id_кроссовок, t.количество, t.цена, r.размер, k.название, k.imageUrl
         FROM товары_заказа t
         JOIN размеры_наличие r ON t.id_размера = r.id_размера
         JOIN кроссовки k ON t.id_кроссовок = k.id_кроссовок
         WHERE t.id_заказа = ?`,
        [order.id_заказа]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router 