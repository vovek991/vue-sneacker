const express = require('express')
const cors = require('cors')
const db = require('./db/index')

const app = express()
const PORT = process.env.PORT || 3001

const sneakersRouter = require('./routes/sneakers')
const ordersRouter = require('./routes/orders')
const brandsRouter = require('./routes/brands')

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

app.use(cors())
app.use(express.json())

app.use('/api/sneakers', sneakersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/brands', brandsRouter)

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Что-то пошло не так!')
})

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.')
  shutdown()
})

process.on('SIGINT', () => {
  console.info('SIGINT signal received.')
  shutdown()
})

// Функция корректного завершения
const shutdown = () => {
  console.log('Завершение работы сервера...')
  server.close(async () => {
    console.log('Закрытие соединения с базой данных...')
    await db.end()
    console.log('Сервер остановлен')
    process.exit(0)
  })

  // Принудительное завершение через 10 секунд
  setTimeout(() => {
    console.error('Принудительное завершение')
    process.exit(1)
  }, 10000)
} 