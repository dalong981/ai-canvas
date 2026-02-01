# utils 目录

> 更新: 2026-02-01 - v0.0.6 增加 Logseq 同步支持

## 工具列表

| 文件 | 用途 |
|------|------|
| storage.ts | 画布保存/加载 + Logseq 同步（通过后端 API） |

## 接口说明

### SaveResult
```typescript
interface SaveResult {
  success: boolean
  canvasId?: string      // 画布唯一 ID
  logseqPath?: string    // Logseq 文件路径
}
```

### LoadResult
```typescript
interface LoadResult {
  success: boolean
  canvasId?: string
  name?: string
}
```
