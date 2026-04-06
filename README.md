# Quick Ask

Quick Ask 是一个 Chrome/Edge 浏览器扩展，用来解决 AI 对话中的“小问题打断主线”痛点：

- 在网页右下角提供悬浮球入口
- 打开迷你对话框，快速提问不理解的内容
- 子对话与主对话上下文隔离，避免“上下文污染”
- 回复风格默认精简，适合即时理解与继续阅读

## 项目结构

- `quick-ask-extension/`：扩展主代码（Manifest V3）
- `quick-ask-extension/content.js`：悬浮球与对话面板逻辑
- `quick-ask-extension/content.css`：面板与悬浮球样式
- `quick-ask-extension/background.js`：AI 请求转发与多模型适配
- `quick-ask-extension/options.*`：模型/API Key 配置页
- `quick-ask-extension/popup.*`：扩展图标弹窗页

## 核心特性

- 悬浮球边缘吸附（露出 1/4）
- 面板支持顶部拖动
- 面板支持右下角拖拽调整大小
- 支持多家 AI 服务（OpenAI 兼容与 Claude）
- 处理 `Extension context invalidated` 异常，提升稳定性

## 本地加载与调试

1. 打开 Chrome/Edge 扩展管理页（开发者模式）
2. 选择“加载已解压的扩展程序”
3. 选择目录：`quick-ask-extension/`
4. 打开任意网页验证悬浮球与面板

## 配置说明

1. 点击扩展图标进入设置页
2. 选择 AI 提供商
3. 填写 API Key 与模型
4. 保存后即可在页面中使用 Quick Ask


