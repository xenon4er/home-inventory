import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // === БАЗОВАЯ КОНФИГУРАЦИЯ ===
      registerType: "autoUpdate", // Автоматическое обновление Service Worker

      // === МАНИФЕСТ ПРИЛОЖЕНИЯ ===
      manifest: {
        // Основная информация
        name: "Home Inventory",
        short_name: "Inventory",
        description: "Где лежат мои вещи?",
        // Начальная страница и внешний вид
        start_url: "/home-inventory/",
        scope: "/",
        display: "standalone", // Полноэкранный режим как нативное приложение
        theme_color: "#3B82F6", // Цвет темы (синий)
        background_color: "#ffffff", // Цвет фона при загрузке
        orientation: "portrait", // Ориентация экрана

        // Иконки (все размеры для разных устройств)
        icons: [
          // {
          //   src: "/icons/icon-72x72.png",
          //   sizes: "72x72",
          //   type: "image/png",
          //   purpose: "any maskable",
          // },
          {
            src: "/home-inventory/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any maskable",
          },
          // {
          //   src: "/icons/icon-128x128.png",
          //   sizes: "128x128",
          //   type: "image/png",
          //   purpose: "any maskable",
          // },
          // {
          //   src: "/icons/icon-144x144.png",
          //   sizes: "144x144",
          //   type: "image/png",
          //   purpose: "any maskable",
          // },
          // {
          //   src: "/icons/icon-152x152.png",
          //   sizes: "152x152",
          //   type: "image/png",
          //   purpose: "any maskable",
          // },
          {
            src: "/home-inventory/icons/icon-192x192.jpg",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          // {
          //   src: "/icons/icon-384x384.png",
          //   sizes: "384x384",
          //   type: "image/png",
          //   purpose: "any maskable",
          // },
          {
            src: "/home-inventory/icons/icon-512x512.jpg",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],

        // Категория приложения
        categories: ["home", "inventory", "productivity"],

        // Язык приложения
        lang: "ru",
      },

      // === РАБОТА С SERVICE WORKER ===
      workbox: {
        // Стратегии кэширования
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"],

        // Игнорируемые файлы
        globIgnores: ["**/node_modules/**/*", "**/sw.js", "**/workbox-*.js"],

        // Максимальный размер кэша (в байтах)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

        // Настройки кэширования API запросов
        runtimeCaching: [
          // Кэширование API запросов (если используете внешнее API)
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 час
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Кэширование изображений
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
              },
            },
          },

          // Кэширование Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
              },
            },
          },

          // Кэширование иконок
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
              },
            },
          },
        ],

        // Настройки навигации
        navigateFallback: "index.html",
        navigateFallbackDenylist: [
          /^\/api\//, // Исключаем API запросы
          /^\/_/, // Исключаем внутренние пути
          /\/admin/, // Исключаем админку
        ],

        // Очистка старых кэшей
        cleanupOutdatedCaches: true,

        // Режим разработки
        sourcemap: true,
      },

      // === ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ ===
      // Включить в режиме разработки
      devOptions: {
        enabled: true, // Включает PWA в режиме разработки
        type: "module",
        navigateFallback: "index.html",
      },

      // Стратегия регистрации
      injectRegister: "auto",

      // Кастомный Service Worker (если нужен)
      filename: "sw.js",

      // Включить в production
      disable: false,

      // Self-destroying Service Worker при ошибках
      selfDestroying: false,
    }),
  ],

  // === НАСТРОЙКИ ДЛЯ GITHUB PAGES ===
  base: "/home-inventory/", // Замените на название вашего репозитория

  // Оптимизация сборки
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Разделяем vendor-код по категориям
          if (id.includes("node_modules")) {
            // React и ReactDOM
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            // Zustand
            if (id.includes("zustand")) {
              return "state-vendor";
            }
            // Dexie (IndexedDB)
            if (id.includes("dexie")) {
              return "db-vendor";
            }
            // Остальные зависимости
            return "vendor";
          }
          // Приложение
          return "app";
        },
      },
    },
  },
});
