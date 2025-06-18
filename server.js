/* eslint-env node */
require('dotenv').config()
const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

const app = express()

// Логирование для отладки
console.log('Starting server...')
console.log('Connecting to database...')

const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'diplom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Проверка подключения к базе данных
db.getConnection()
  .then(async connection => {
    console.log('Successfully connected to MySQL')
    
    // Проверяем существование базы данных
    try {
      await connection.query('USE diplom')
      console.log('Database "diplom" selected')
    } catch (err) {
      console.error('Error selecting database:', err)
      process.exit(1)
    }
    
    connection.release()
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err)
    process.exit(1)
  })

const SECRET_KEY = process.env.SECRET_KEY || 'your-very-secure-secret-key'

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body) console.log('Request body:', req.body);
  next();
});

// Middleware для проверки JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err)
        return res.sendStatus(403)
      }

      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { email, password, имя, фамилия } = req.body
  try {
    // Проверка на существующего пользователя
    const [rows] = await db.execute('SELECT * FROM пользователи WHERE email = ?', [email])
    if (rows.length > 0) return res.status(400).json({ error: 'Пользователь с таким email уже существует' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date()
    await db.execute(
      `INSERT INTO пользователи (email, пароль, имя, фамилия, дата_регистрации) VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, имя, фамилия, now]
    )
    const [userRows] = await db.execute('SELECT * FROM пользователи WHERE email = ?', [email])
    const user = userRows[0]
    const token = jwt.sign({ id_пользователя: user.id_пользователя, email: user.email }, SECRET_KEY, { expiresIn: '24h' })
    res.json({ user, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Вход пользователя
app.post('/api/login', async (req, res) => {
  console.log('POST /api/login called');
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM пользователи WHERE email = ?', [email]);
    console.log('User rows:', rows);
    if (rows.length === 0) return res.status(401).json({ error: 'Неверный email или пароль' });
    const user = rows[0];
    console.log('User from DB:', user);
    if (!user.пароль) {
      console.error('Поле "пароль" отсутствует в объекте пользователя:', user);
      return res.status(500).json({ error: 'Ошибка на сервере: отсутствует поле "пароль"' });
    }
    const isMatch = await bcrypt.compare(password, user.пароль);
    if (!isMatch) return res.status(401).json({ error: 'Неверный email или пароль' });
    const token = jwt.sign({ id_пользователя: user.id_пользователя, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    await db.execute('UPDATE пользователи SET дата_последнего_входа = ? WHERE id_пользователя = ?', [new Date(), user.id_пользователя]);
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Получение информации о текущем пользователе
app.get('/api/me', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id_пользователя, email, имя, фамилия, телефон, дата_регистрации, является_админом FROM пользователи WHERE id_пользователя = ?', [req.user.id_пользователя])
    if (rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Запуск сервера
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})

db.getConnection()
  .then(async conn => {
    console.log('Успешное подключение к базе данных MySQL');
    try {
      // Добавляем колонки по одной
      try {
        await conn.execute('ALTER TABLE кроссовки ADD COLUMN сезон VARCHAR(50)');
        console.log('Колонка сезон добавлена');
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          throw e;
        }
      }

      try {
        await conn.execute('ALTER TABLE кроссовки ADD COLUMN цвет VARCHAR(50)');
        console.log('Колонка цвет добавлена');
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          throw e;
        }
      }

      console.log('Структура таблицы успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении структуры таблицы:', error);
    }
    conn.release();
  })
  .catch(err => {
    console.error('Ошибка подключения к базе данных MySQL:', err.message);
    process.exit(1);
  });

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error (global handler)' });
});

// Получить все кроссовки
app.get('/api/sneakers', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT кроссовки.*, бренды.название AS бренд
      FROM кроссовки
      JOIN бренды ON кроссовки.id_бренда = бренды.id_бренда
      WHERE кроссовки.активен = 1
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Добавить кроссовки
app.post('/api/sneakers', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const { название, описание, цена, id_бренда, id_категории, пол, дата_выпуска, imageUrl, размеры, активен, сезон, цвет } = req.body;
    const [result] = await connection.execute(
      'INSERT INTO кроссовки (название, описание, цена, id_бренда, id_категории, пол, дата_выпуска, imageUrl, размеры, активен, сезон, цвет) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [название, описание, цена, id_бренда, id_категории, пол, дата_выпуска, imageUrl, размеры, активен, сезон, цвет]
    );
    const sneakerId = result.insertId;
    if (размеры) {
      const sizes = размеры.split(',').map(s => s.trim());
      for (const size of sizes) {
        // Проверяем, есть ли уже такой размер для этой пары кроссовок
        const [existRows] = await connection.execute(
          'SELECT id_размера FROM размеры_наличие WHERE id_кроссовок = ? AND размер = ?',
          [sneakerId, parseFloat(size)]
        );
        if (existRows.length === 0) {
          await connection.execute(
            'INSERT INTO размеры_наличие (id_кроссовок, размер, количество) VALUES (?, ?, ?)',
            [sneakerId, parseFloat(size), 10]
          );
        }
      }
    }
    await connection.commit();
    res.json({ success: true, id: sneakerId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.log('CATCH ERROR');
    console.error('Ошибка при добавлении кроссовок:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Удалить кроссовки
app.delete('/api/sneakers/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM кроссовки WHERE id_кроссовок = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Получить все бренды
app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id_бренда, название FROM бренды')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Обновить кроссовки
app.put('/api/sneakers/:id', async (req, res) => {
  let connection;
  const sneakerId = req.params.id;
  console.log('=== UPDATE SNEAKER ===');
  console.log('Sneaker ID:', sneakerId);
  console.log('Request body:', req.body);
  const { название, описание, цена, id_бренда, id_категории, пол, дата_выпуска, imageUrl, размеры, активен, сезон, цвет } = req.body;
  if (!название || !цена || !id_бренда) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Не заполнены обязательные поля' });
  }
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      'SELECT id_кроссовок FROM кроссовки WHERE id_кроссовок = ?',
      [sneakerId]
    );
    console.log('Existing rows:', existingRows);
    if (!existingRows || existingRows.length === 0) {
      console.log('Sneaker not found');
      await connection.rollback();
      return res.status(404).json({ error: 'Кроссовки не найдены' });
    }
    const updateQuery = `
      UPDATE кроссовки 
      SET название = ?, 
          описание = ?, 
          цена = ?, 
          id_бренда = ?, 
          id_категории = ?, 
          пол = ?, 
          дата_выпуска = ?, 
          imageUrl = ?, 
          размеры = ?, 
          дата_обновления = NOW(),
          сезон = ?, 
          цвет = ?
      WHERE id_кроссовок = ?
    `;
    const updateParams = [
      название, 
      описание, 
      цена, 
      id_бренда, 
      id_категории, 
      пол, 
      дата_выпуска, 
      imageUrl, 
      размеры, 
      сезон, 
      цвет, 
      sneakerId
    ];
    const [result] = await connection.execute(updateQuery, updateParams);
    if (result.affectedRows === 0) {
      console.log('No rows affected');
      await connection.rollback();
      return res.status(404).json({ error: 'Не удалось обновить кроссовки' });
    }
    if (размеры) {
      // Получаем текущие размеры из БД
      const [currentSizesRows] = await connection.execute(
        'SELECT id_размера, размер FROM размеры_наличие WHERE id_кроссовок = ?',
        [sneakerId]
      );
      const currentSizes = currentSizesRows.map(row => ({ id: row.id_размера, size: String(row.размер) }));
      const newSizes = размеры.split(',').map(s => s.trim());
      // Определяем размеры для удаления и добавления
      const sizesToDelete = currentSizes.filter(cs => !newSizes.includes(String(cs.size)));
      const sizesToAdd = newSizes.filter(ns => !currentSizes.some(cs => String(cs.size) === ns));
      let notDeletedSizes = [];
      // Удаляем только те размеры, которые не используются в заказах
      for (const sizeObj of sizesToDelete) {
        const [orderRows] = await connection.execute(
          'SELECT 1 FROM товары_заказа WHERE id_размера = ? LIMIT 1',
          [sizeObj.id]
        );
        if (orderRows.length > 0) {
          notDeletedSizes.push(sizeObj.size);
          continue; // Не удаляем, если есть в заказах
        }
        await connection.execute(
          'DELETE FROM размеры_наличие WHERE id_размера = ?',
          [sizeObj.id]
        );
      }
      // Добавляем новые размеры
      for (const size of sizesToAdd) {
        // Проверяем, есть ли уже такой размер для этой пары кроссовок
        const [existRows] = await connection.execute(
          'SELECT id_размера FROM размеры_наличие WHERE id_кроссовок = ? AND размер = ?',
          [sneakerId, parseFloat(size)]
        );
        if (existRows.length === 0) {
          await connection.execute(
            'INSERT INTO размеры_наличие (id_кроссовок, размер, количество) VALUES (?, ?, ?)',
            [sneakerId, parseFloat(size), 10]
          );
        }
      }
      // Обновляем поле размеры в основной таблице
      await connection.execute(
        'UPDATE кроссовки SET размеры = ? WHERE id_кроссовок = ?',
        [размеры, sneakerId]
      );
      if (notDeletedSizes.length > 0) {
        await connection.commit();
        return res.status(200).json({
          success: true,
          warning: `Следующие размеры не были удалены, так как уже есть в заказах: ${notDeletedSizes.join(', ')}`
        });
      }
    }
    await connection.commit();
    console.log('Update successful');
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating sneaker:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Создание заказа (требует авторизации)
app.post('/api/orders', authenticateJWT, async (req, res) => {
  let connection;
  try {
    console.log('Creating order with data:', req.body);
    console.log('User from token:', req.user);

    const { items, totalPrice, deliveryAddress, phoneNumber } = req.body
    const userId = req.user.id_пользователя

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' })
    }

    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Не указан адрес доставки' })
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Не указан контактный телефон' })
    }

    // Получаем соединение из пула
    connection = await db.getConnection();

    // Начинаем транзакцию
    await connection.beginTransaction();

    try {
      // Проверяем наличие всех размеров перед созданием заказа
      for (const item of items) {
        const [sizeResult] = await connection.execute(
          'SELECT id_размера, количество FROM размеры_наличие WHERE id_кроссовок = ? AND размер = ?',
          [item.id_кроссовок, parseFloat(item.размер)]
        );

        if (!sizeResult || sizeResult.length === 0) {
          throw new Error(`Размер ${item.размер} для кроссовок ${item.id_кроссовок} не найден`);
        }

        if (sizeResult[0].количество < 1) {
          throw new Error(`Размер ${item.размер} для кроссовок ${item.id_кроссовок} закончился`);
        }
      }

      // Создаем заказ
      const [orderResult] = await connection.execute(
        'INSERT INTO заказы (id_пользователя, сумма_заказа, статус, дата_заказа, адрес_доставки, контактный_телефон) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, totalPrice, 'в обработке', new Date(), deliveryAddress, phoneNumber]
      );
      
      const orderId = orderResult.insertId;
      console.log('Created order with ID:', orderId);

      // Добавляем товары заказа и уменьшаем количество доступных размеров
      for (const item of items) {
        console.log('Adding item to order:', item);
        
        // Получаем id_размера и проверяем наличие
        const [sizeResult] = await connection.execute(
          'SELECT id_размера FROM размеры_наличие WHERE id_кроссовок = ? AND размер = ? AND количество > 0',
          [item.id_кроссовок, parseFloat(item.размер)]
        );

        if (!sizeResult || sizeResult.length === 0) {
          throw new Error(`Размер ${item.размер} для кроссовок ${item.id_кроссовок} не найден или закончился`);
        }

        const sizeId = sizeResult[0].id_размера;

        // Добавляем товар в заказ
        await connection.execute(
          'INSERT INTO товары_заказа (id_заказа, id_кроссовок, id_размера, количество, цена) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id_кроссовок, sizeId, 1, item.цена]
        );

        // Уменьшаем количество доступных размеров
        await connection.execute(
          'UPDATE размеры_наличие SET количество = количество - 1 WHERE id_размера = ? AND количество > 0',
          [sizeId]
        );

        // Удаляем товар из корзины
        await connection.execute(
          'DELETE FROM корзина WHERE id_пользователя = ? AND id_кроссовок = ? AND id_размера = ?',
          [userId, item.id_кроссовок, sizeId]
        );
      }

      // Подтверждаем транзакцию
      await connection.commit();

      // Формируем текст письма
      const orderList = items.map((item, idx) =>
        `${idx + 1}. ${item.title || item.название || 'Кроссовки'} (ID: ${item.id || item.id_кроссовок}), размер: ${item.size || item.размер || '-'}, цена: ${item.price || item.цена} BYN`
      ).join('\n')
      const mailText = `Новый заказ!\n\nСостав заказа:\n${orderList}\n\nИтого: ${totalPrice} BYN\n\nАдрес доставки: ${deliveryAddress}\nТелефон: ${phoneNumber}`

      // Настройки почты (заменить на свои данные)
      const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      })

      try {
        console.log('Email для отправки письма:', req.user.email)
        const mailResult = await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: req.user.email,
          subject: 'Новый заказ на сайте',
          text: mailText
        })
        console.log('Письмо успешно отправлено:', mailResult.response)
      } catch (mailError) {
        console.error('Ошибка при отправке письма:', mailError)
      }

      res.status(201).json({ id: orderId });
    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      if (connection) await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: error.message || 'Ошибка при создании заказа' });
  } finally {
    if (connection) connection.release();
  }
});

// Получить заказы текущего пользователя
app.get('/api/orders/my', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id_пользователя;
    // Получаем заказы пользователя
    const [orders] = await db.execute(
      'SELECT * FROM заказы WHERE id_пользователя = ? ORDER BY дата_заказа DESC',
      [userId]
    );
    // Для каждого заказа получаем состав
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
