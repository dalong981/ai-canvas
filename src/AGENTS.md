# src 目录

> 更新: 2026-02-01 - v0.0.6 Canvas → Logseq 同步

## 模块说明

| 目录/文件 | 用途 |
|-----------|------|
| main.tsx | 应用入口 |
| App.tsx | 根组件，画布 + 保存/打开按钮 + Logseq 同步 |
| index.css | 全局样式 |
| components/ | 通用 React 组件 |
| utils/ | 工具函数（存储、Logseq 同步等） |

## 当前状态

- [x] 基础入口文件
- [x] 画布组件（tldraw 内置）
- [x] 本地保存/加载（storage.ts）
- [x] Logseq 同步（双区分离，增量更新）
- [ ] AI 对话（改用浏览器扩展）
