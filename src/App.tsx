/**
 * @file 根组件
 * @description 集成 tldraw 画布，支持本地自动保存
 */

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw persistenceKey="ai-canvas-main" />
    </div>
  )
}
