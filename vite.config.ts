/**
 * @file Vite 配置文件
 * @description 开发服务器、构建配置、本地 API 路由、Logseq 同步
 */

import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

// 数据目录路径
const DATA_DIR = path.resolve(__dirname, 'data')

// Logseq 页面目录
const LOGSEQ_PAGES_DIR = path.join(
  os.homedir(),
  'Library/Mobile Documents/iCloud~com~logseq~logseq/Documents/pages'
)

// 生成 UUID
function generateUUID(): string {
  return crypto.randomUUID()
}

// 清理文件名（移除特殊字符）
function sanitizeFileName(name: string): string {
  return name.replace(/[\/\\:*?"<>|]/g, '_')
}

// 生成 Logseq 页面内容
function generateLogseqContent(name: string, canvasId: string, markdown: string): string {
  const today = new Date().toISOString().split('T')[0]
  return `type:: canvas
canvas-id:: ${canvasId}
updated:: [[${today}]]
source:: [[AI Canvas]]

## Canvas 内容
<!-- CANVAS-START -->
${markdown}
<!-- CANVAS-END -->

## 我的笔记
`
}

// 更新 Logseq 文件（保留"我的笔记"区块）
function updateLogseqFile(filePath: string, canvasId: string, markdown: string): void {
  const content = fs.readFileSync(filePath, 'utf-8')
  const today = new Date().toISOString().split('T')[0]
  
  // 更新 updated 属性
  let updated = content.replace(
    /updated:: \[\[[^\]]+\]\]/,
    `updated:: [[${today}]]`
  )
  
  // 替换 CANVAS-START 到 CANVAS-END 之间的内容
  const startMarker = '<!-- CANVAS-START -->'
  const endMarker = '<!-- CANVAS-END -->'
  
  const startIdx = updated.indexOf(startMarker)
  const endIdx = updated.indexOf(endMarker)
  
  if (startIdx !== -1 && endIdx !== -1) {
    const before = updated.substring(0, startIdx + startMarker.length)
    const after = updated.substring(endIdx)
    updated = `${before}\n${markdown}\n${after}`
  }
  
  fs.writeFileSync(filePath, updated, 'utf-8')
}

// 同步到 Logseq
function syncToLogseq(name: string, canvasId: string, markdown: string): string | null {
  try {
    if (!fs.existsSync(LOGSEQ_PAGES_DIR)) {
      console.warn('Logseq pages 目录不存在:', LOGSEQ_PAGES_DIR)
      return null
    }
    
    const safeName = sanitizeFileName(name)
    const logseqFileName = `canvas___${safeName}.md`
    const logseqFilePath = path.join(LOGSEQ_PAGES_DIR, logseqFileName)
    
    if (fs.existsSync(logseqFilePath)) {
      // 更新现有文件
      updateLogseqFile(logseqFilePath, canvasId, markdown)
    } else {
      // 创建新文件
      const content = generateLogseqContent(name, canvasId, markdown)
      fs.writeFileSync(logseqFilePath, content, 'utf-8')
    }
    
    return logseqFilePath
  } catch (e) {
    console.error('Logseq 同步失败:', e)
    return null
  }
}

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
            const { name, json, markdown, canvasId: inputCanvasId } = JSON.parse(body)
            const canvasDir = path.join(DATA_DIR, name)
            
            // 生成或使用现有 canvasId
            const canvasId = inputCanvasId || generateUUID()
            
            // 创建目录
            if (!fs.existsSync(canvasDir)) {
              fs.mkdirSync(canvasDir, { recursive: true })
            }
            
            // 在 json 中添加 meta 信息
            const jsonWithMeta = {
              ...json,
              meta: {
                canvasId,
                name,
                updatedAt: new Date().toISOString()
              }
            }
            
            // 保存 JSON
            fs.writeFileSync(
              path.join(canvasDir, 'canvas.json'),
              JSON.stringify(jsonWithMeta, null, 2),
              'utf-8'
            )
            
            // 保存 Markdown
            fs.writeFileSync(
              path.join(canvasDir, 'content.md'),
              markdown,
              'utf-8'
            )
            
            // 同步到 Logseq
            const logseqPath = syncToLogseq(name, canvasId, markdown)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              success: true, 
              path: canvasDir,
              canvasId,
              logseqPath
            }))
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
