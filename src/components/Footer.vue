<template>
  <footer class="bg-white text-slate-500 rounded-b-xl mt-10 border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-8 py-10">
      <div class="flex flex-wrap gap-8 justify-between">
        <!-- Бренды -->
        <div>
          <h3 class="font-bold uppercase mb-3 text-black text-sm">Бренды</h3>
          <ul class="space-y-1 text-sm">
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Nike')" class="hover:text-black">Nike</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Puma')" class="hover:text-black">Puma</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Adidas')" class="hover:text-black">Adidas</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Fila')" class="hover:text-black">Fila</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Reebok')" class="hover:text-black">Reebok</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Jordan')" class="hover:text-black">Jordan</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Caterpillar')" class="hover:text-black">Caterpillar</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Skechers')" class="hover:text-black">Skechers</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Dr. Martens')" class="hover:text-black">Dr. Martens</button>
            </li>
            <li class="inline-block mr-4">
              <button @click="filterByBrand('Vans')" class="hover:text-black">Vans</button>
            </li>
            <li class="inline-block">
              <button @click="filterByBrand('New Balance')" class="hover:text-black">New Balance</button>
            </li>
          </ul>
        </div>
        <!-- Категории -->
        <div>
          <h3 class="font-bold uppercase mb-3 text-black text-sm">Категории</h3>
          <ul class="space-y-1 text-sm">
            <li>
              <button @click="filterByCategory('all')" class="hover:text-black">Все кроссовки</button>
            </li>
            <li>
              <button @click="filterByCategory('мужские')" class="hover:text-black">Мужские кроссовки</button>
            </li>
            <li>
              <button @click="filterByCategory('женские')" class="hover:text-black">Женские кроссовки</button>
            </li>
            <li>
              <button @click="filterByCategory('зимние')" class="hover:text-black">Зимние кроссовки</button>
            </li>
            <li>
              <button @click="filterByCategory('летние')" class="hover:text-black">Летние кроссовки</button>
            </li>
            <li>
              <button @click="filterByCategory('бег')" class="hover:text-black">Кроссовки для бега</button>
            </li>
            <li>
              <button @click="filterByCategory('баскетбол')" class="hover:text-black">Баскетбольные кроссовки</button>
            </li>
          </ul>
        </div>
        <!-- Полезно -->
        <div>
          <h3 class="font-bold uppercase mb-3 text-black text-sm">Полезно</h3>
          <ul class="space-y-1 text-sm">
            <li>Возврат товара</li>
            <li>Доставка</li>
            <li>Размеры</li>
            <li>Уход за обувью и гарантия</li>
            <li>Оплата</li>
            <li>Подарочные карты</li>
          </ul>
        </div>
        <!-- Информация -->
        <div>
          <h3 class="font-bold uppercase mb-3 text-black text-sm">Информация</h3>
          <ul class="space-y-1 text-sm">
            <li>Контакты</li>
            <li>Партнёры</li>
            <li>Товары со скидкой</li>
            <li>Личный кабинет</li>
            <li>Рассылка новостей</li>
            <li>Отзывы</li>
            <li>О персональных данных</li>
          </ul>
        </div>
        <!-- Контакты и соцсети -->
        <div>
          <h3 class="font-bold uppercase mb-3 text-black text-sm">Связаться с нами</h3>
          <ul class="space-y-1 text-sm">
            <li>+375 33 633 33 01</li>
            <li>+375 33 633 33 02</li>
            <li>+375 33 633 33 05</li>
            <li>vue.sneakers@yandex.ru</li>
          </ul>
          <div class="flex gap-3 mt-3">
            <a href="#" class="hover:text-black"><i class="fa-brands fa-vk"></i></a>
            <a href="#" class="hover:text-black"><i class="fa-brands fa-telegram"></i></a>
            <a href="#" class="hover:text-black"><i class="fa-brands fa-youtube"></i></a>
            <a href="#" class="hover:text-black"><i class="fa-brands fa-facebook"></i></a>
            <a href="#" class="hover:text-black"><i class="fa-brands fa-instagram"></i></a>
          </div>
        </div>
        <!-- О магазине -->
        <div class="min-w-[220px]">
          <h3 class="font-bold uppercase mb-3 text-black text-sm">О магазине</h3>
          <p class="text-xs leading-5 mb-2">Vue Sneakers — магазин лучших кроссовок. Быстрая доставка по всей Беларуси. Только оригинальные бренды.</p>
        </div>
      </div>
      <!-- Логотип и платежные системы -->
      <div class="flex flex-wrap items-center justify-between border-t border-slate-200 mt-10 pt-6 gap-4">
        <div class="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" class="w-8" />
          <span class="font-bold uppercase text-base text-black">Vue Sneakers</span>
        </div>
        <div class="flex gap-2 items-center">
          <img src="/visa.svg" alt="Visa" class="h-6" />
          <img src="/mastercard.svg" alt="Mastercard" class="h-6" />
          <img src="/webpay.svg" alt="Webpay" class="h-6" />
        </div>
      </div>
      <!-- Копирайт -->
      <div class="text-xs text-slate-400 mt-4 text-center">
        &copy; {{ year }} Vue Sneakers — магазин оригинальных кроссовок. Все права защищены.
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()

const filterByBrand = async (brand) => {
  await router.push({
    path: '/',
    query: { brand }
  })
  // Прокручиваем страницу вверх
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const filterByCategory = async (category) => {
  await router.push({
    path: '/',
    query: { category }
  })
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script> 