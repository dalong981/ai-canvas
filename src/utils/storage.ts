/**
 * @file 本地存储工具
 * @description 通过本地 API 保存/加载画布到 ai-canvas/data/ 目录，同步到 Logseq
 */

import { Editor, getSnapshot, loadSnapshot } from 'tldraw'

// 保存结果类型
export interface SaveResult {
  success: boolean
  canvasId?: string
  logseqPath?: string
}

/**
 * 保存画布到本地（同时同步到 Logseq）
 */
export async function saveCanvasToLocal(
  editor: Editor, 
  name: string, 
  existingCanvasId?: string
): Promise<SaveResult> {
  try {
    // 使用 tldraw 的 getSnapshot 函数
    const snapshot = getSnapshot(editor.store)
    const markdown = generateMarkdown(editor, name)

    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        json: snapshot,
        markdown,
        canvasId: existingCanvasId
      })
    })

    const result = await response.json()
    return {
      success: result.success === true,
      canvasId: result.canvasId,
      logseqPath: result.logseqPath
    }
  } catch (e) {
    console.error('保存失败:', e)
    return { success: false }
  }
}

/**
 * 获取已保存的画布列表
 */
export async function listCanvases(): Promise<string[]> {
  try {
    const response = await fetch('/api/list')
    const result = await response.json()
    return result.canvases || []
  } catch (e) {
    console.error('获取列表失败:', e)
    return []
  }
}

// 加载结果类型
export interface LoadResult {
  success: boolean
  canvasId?: string
  name?: string
}

/**
 * 从本地加载画布
 */
export async function openCanvasFromLocal(editor: Editor, name: string): Promise<LoadResult> {
  try {
    const response = await fetch(`/api/open?name=${encodeURIComponent(name)}`)
    
    if (!response.ok) {
      return { success: false }
    }

    const result = await response.json()
    
    if (result.success && result.data) {
      // 提取 meta 信息
      const meta = result.data.meta
      
      // 使用 tldraw 的 loadSnapshot 函数
      loadSnapshot(editor.store, result.data)
      
      return { 
        success: true,
        canvasId: meta?.canvasId,
        name: meta?.name || name
      }
    }
    
    return { success: false }
  } catch (e) {
    console.error('加载失败:', e)
    return { success: false }
  }
}

/**
 * 从画布生成 Markdown 内容
 */
function generateMarkdown(editor: Editor, name: string): string {
  const shapes = editor.getCurrentPageShapes()
  
  const lines: string[] = [
    `# ${name}`,
    '',
    `> 保存时间: ${new Date().toLocaleString('zh-CN')}`,
    '',
  ]

  // 按类型分组
  const texts: string[] = []
  const embeds: string[] = []
  const images: string[] = []
  const notes: string[] = []

  for (const shape of shapes) {
    const type = shape.type
    const props = shape.props as Record<string, unknown>

    if (type === 'text') {
      // 处理富文本格式
      const text = extractTextFromRichText(props.richText) || (props.text as string)
      if (text) texts.push(`- ${text.replace(/\n/g, '\n  ')}`)
    } else if (type === 'embed') {
      const url = props.url as string
      if (url) embeds.push(`- [${url}](${url})`)
    } else if (type === 'image') {
      const imgName = (props.name || props.url || '(未命名)') as string
      images.push(`- 图片: ${imgName}`)
    } else if (type === 'note') {
      const text = extractTextFromRichText(props.richText) || (props.text as string)
      if (text) notes.push(`- 📝 ${text.replace(/\n/g, '\n  ')}`)
    } else if (type === 'geo') {
      const text = extractTextFromRichText(props.richText) || (props.text as string)
      if (text) notes.push(`- ${text.replace(/\n/g, '\n  ')}`)
    }
  }

  if (texts.length > 0) {
    lines.push('## 文本', '', ...texts, '')
  }
  if (embeds.length > 0) {
    lines.push('## 链接/视频', '', ...embeds, '')
  }
  if (images.length > 0) {
    lines.push('## 图片', '', ...images, '')
  }
  if (notes.length > 0) {
    lines.push('## 笔记', '', ...notes, '')
  }

  if (texts.length === 0 && embeds.length === 0 && images.length === 0 && notes.length === 0) {
    lines.push('(画布为空)')
  }

  return lines.join('\n')
}

/**
 * 从 tldraw 富文本格式中提取纯文本
 */
function extractTextFromRichText(richText: unknown): string | null {
  if (!richText || typeof richText !== 'object') return null
  
  const rt = richText as { content?: unknown[] }
  if (!rt.content || !Array.isArray(rt.content)) return null

  const extractFromNode = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const n = node as { type?: string; text?: string; content?: unknown[] }
    
    if (n.type === 'text' && n.text) {
      return n.text
    }
    
    if (n.content && Array.isArray(n.content)) {
      return n.content.map(extractFromNode).join('')
    }
    
    return ''
  }

  const result = rt.content.map(extractFromNode).join('\n')
  return result || null
}
