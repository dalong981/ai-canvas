# AI Canvas

> 版本: v0.0.2
> 更新: 2026-02-01 - 添加本地自动保存功能

## 项目概述

自由画布 + AI 原生集成的研究工具。让你像在桌面上摊开资料一样研究任何主题，AI 能纵观全局进行对话。

## 技术栈

- **画布引擎**: tldraw (React)
- **前端**: React + TypeScript + Vite
- **AI**: Claude API (Anthropic)
- **样式**: Tailwind CSS

## 目录结构

```
ai-canvas/
├── AGENTS.md          ← 项目说明（你在这里）
├── PRD.md             ← 产品需求文档
├── src/
│   ├── AGENTS.md      ← 源码模块说明
│   ├── components/    ← React 组件
│   ├── canvas/        ← 画布相关逻辑
│   └── ai/            ← AI 集成逻辑
├── public/            ← 静态资源
└── package.json
```

## 开发命令

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
```

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.0.1 | 2026-02-01 | 项目初始化，tldraw 画布跑起来 |
| v0.0.2 | 2026-02-01 | 添加本地自动保存功能 |

## 开发约定

1. 每个目录下有 `AGENTS.md` 说明该目录内容
2. 每个文件头部注释说明用途（更新时覆盖，不累加）
3. 每完成一个最小功能 → git commit + tag + 版本号递增
