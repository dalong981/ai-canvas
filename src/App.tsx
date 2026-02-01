/**
 * @file 根组件
 * @description 集成 tldraw 画布，v0.0.1 只显示空白画布
 */

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}
