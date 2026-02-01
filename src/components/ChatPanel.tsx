/**
 * @file AI 对话面板
 * @description 右侧固定对话栏，包含消息列表和输入框
 */

import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    
    // TODO: v0.0.5 接入 Claude API
    // 目前只是模拟回复
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '我是 AI 助手，暂时还没接入 Claude API。下个版本见！' 
      }])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fafafa',
      borderLeft: '1px solid #e0e0e0'
    }}>
      {/* 标题栏 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        fontWeight: 600,
        fontSize: '14px',
        color: '#333'
      }}>
        AI 对话
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 && (
          <div style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
            在下方输入问题，AI 会理解你画布上的所有内容
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: msg.role === 'user' ? '#007AFF' : '#fff',
            color: msg.role === 'user' ? '#fff' : '#333',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            fontSize: '14px',
            lineHeight: '1.5',
            boxShadow: msg.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
          }}>
            {msg.content}
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '8px'
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问点什么..."
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px',
            resize: 'none',
            height: '44px',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '0 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#007AFF',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
