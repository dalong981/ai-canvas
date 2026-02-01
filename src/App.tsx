/**
 * @file 根组件
 * @description 左侧画布 70% + 右侧对话面板 30%
 */

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import ChatPanel from './components/ChatPanel'

export default function App() {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      display: 'flex' 
    }}>
      {/* 左侧画布 */}
      <div style={{ flex: 7, position: 'relative' }}>
        <Tldraw persistenceKey="ai-canvas-main" />
      </div>
      
      {/* 右侧对话面板 */}
      <div style={{ flex: 3, minWidth: '300px', maxWidth: '400px' }}>
        <ChatPanel />
      </div>
    </div>
  )
}
