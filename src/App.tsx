/**
 * @file 根组件
 * @description 全屏画布 + 顶部工具栏（保存/打开）
 */

import { Tldraw, Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { useState, useCallback } from 'react'
import { saveCanvasToLocal, openCanvasFromLocal, listCanvases } from './utils/storage'

export default function App() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [canvasList, setCanvasList] = useState<string[]>([])

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor)
  }, [])

  const handleSave = async () => {
    if (!editor) return
    const name = prompt('画布名称：', '未命名研究')
    if (!name) return
    
    const success = await saveCanvasToLocal(editor, name)
    if (success) {
      alert(`✅ 已保存到 ai-canvas/data/${name}/`)
    } else {
      alert('❌ 保存失败，请查看控制台')
    }
  }

  const handleOpenClick = async () => {
    const list = await listCanvases()
    if (list.length === 0) {
      alert('暂无已保存的画布')
      return
    }
    setCanvasList(list)
    setShowOpenDialog(true)
  }

  const handleSelectCanvas = async (name: string) => {
    if (!editor) return
    setShowOpenDialog(false)
    
    const success = await openCanvasFromLocal(editor, name)
    if (success) {
      alert(`✅ 已加载：${name}`)
    } else {
      alert(`❌ 加载失败：${name}`)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 顶部工具栏 */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button onClick={handleSave} style={buttonStyle}>
          💾 保存
        </button>
        <button onClick={handleOpenClick} style={buttonStyle}>
          📂 打开
        </button>
      </div>

      {/* 打开对话框 */}
      {showOpenDialog && (
        <div style={overlayStyle} onClick={() => setShowOpenDialog(false)}>
          <div style={dialogStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0' }}>选择画布</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {canvasList.map(name => (
                <button
                  key={name}
                  onClick={() => handleSelectCanvas(name)}
                  style={listItemStyle}
                >
                  📄 {name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowOpenDialog(false)} 
              style={{ ...buttonStyle, marginTop: '16px', width: '100%' }}
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      <Tldraw 
        persistenceKey="ai-canvas-main" 
        onMount={handleMount}
      />
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
}

const dialogStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '12px',
  minWidth: '300px',
  maxHeight: '400px',
  overflow: 'auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
}

const listItemStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #eee',
  backgroundColor: '#fafafa',
  fontSize: '14px',
  cursor: 'pointer',
  textAlign: 'left'
}
