import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true
    })
  ],
  
  // 构建配置 - 输出到后端的 Public 目录
  build: {
    outDir: '../Public',
    emptyOutDir: false, // 不清空目录，保留后端文件
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name].[hash].css'
          }
          return 'assets/[name].[hash].[ext]'
        }
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    proxy: {
      // 代理 API 请求到 Vapor 后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/signin': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/signout': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
