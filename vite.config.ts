/**
 * @file Vite 配置文件
 * @description 开发服务器、构建配置、本地 API 路由
 */

import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// 数据目录路径
const DATA_DIR = path.resolve(__dirname, 'data')

// 自定义插件：处理本地 API 路由
function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      // POST /api/save - 保存画布
      server.middlewares.use('/api/save', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { name, json, markdown } = JSON.parse(body)
            const canvasDir = path.join(DATA_DIR, name)
            
            // 创建目录
            if (!fs.existsSync(canvasDir)) {
              fs.mkdirSync(canvasDir, { recursive: true })
            }
            
            // 保存 JSON
            fs.writeFileSync(
              path.join(canvasDir, 'canvas.json'),
              JSON.stringify(json, null, 2),
              'utf-8'
            )
            
            // 保存 Markdown
            fs.writeFileSync(
              path.join(canvasDir, 'content.md'),
              markdown,
              'utf-8'
            )

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, path: canvasDir }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(e) }))
          }
        })
      })

      // GET /api/list - 列出所有画布
      server.middlewares.use('/api/list', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        try {
          if (!fs.existsSync(DATA_DIR)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ canvases: [] }))
            return
          }

          const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true })
          const canvases = entries
            .filter(e => e.isDirectory() && !e.name.startsWith('.'))
            .map(e => e.name)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ canvases }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })

      // GET /api/open/:name - 加载指定画布
      server.middlewares.use('/api/open', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        try {
          // 从 URL 获取画布名称
          const url = new URL(req.url!, `http://${req.headers.host}`)
          const name = url.searchParams.get('name')
          
          if (!name) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing name parameter' }))
            return
          }

          const canvasDir = path.join(DATA_DIR, name)
          const jsonPath = path.join(canvasDir, 'canvas.json')

          if (!fs.existsSync(jsonPath)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Canvas not found' }))
            return
          }

          const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, data: json }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
})
