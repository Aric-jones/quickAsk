# Claude Code 超级详细使用教程

> 本文档将带你从零开始掌握 Claude Code，无论你是编程新手还是资深开发者，都能快速上手这款强大的 AI 编程助手。

---

## 目录

1. [什么是 Claude Code？](#1-什么是-claude-code)
2. [安装与初始化](#2-安装与初始化)
3. [首次启动与基础配置](#3-首次启动与基础配置)
4. [配置文件详解](#4-配置文件详解)
5. [核心概念与工作原理](#5-核心概念与工作原理)
6. [权限系统完全指南](#6-权限系统完全指南)
7. [Hooks 钩子函数](#7-hooks-钩子函数)
8. [自定义技能命令](#8-自定义技能命令)
9. [MCP 服务器配置](#9-mcp-服务器配置)
10. [快捷键大全](#10-快捷键大全)
11. [内置斜杠命令](#11-内置斜杠命令)
12. [CLAUDE.md 项目文档](#12-claudemd-项目文档)
13. [IDE 集成](#13-ide-集成)
14. [最佳实践与进阶技巧](#14-最佳实践与进阶技巧)
15. [常见问题与解决方案](#15-常见问题与解决方案)

---

## 1. 什么是 Claude Code？

Claude Code 是 Anthropic 公司开发的命令行 AI 编程助手，它直接在你的终端中运行，可以帮助你：

- **编写代码** - 从头创建新项目或添加新功能
- **调试修复** - 找出并修复 Bug
- **代码审查** - 检查代码质量和安全性
- **解释代码** - 理解陌生代码的作用
- **重构优化** - 改进现有代码结构
- **自动化任务** - 执行复杂的开发工作流

**核心特点：**
- 直接在终端中运行，无需切换窗口
- 支持多文件项目管理
- 强大的代码编辑和文件系统操作能力
- 可配置的权限系统保障安全
- 支持自定义技能和工作流

---

## 2. 安装与初始化

### 2.1 系统要求

- **操作系统**：macOS、Linux、Windows (通过 WSL 或 Git Bash)
- **Node.js**：v18.0.0 或更高版本
- **npm** 或 **yarn** 包管理器

### 2.2 安装步骤

**方式一：npm 全局安装（推荐）**

```bash
npm install -g @anthropic-ai/claude-code
```

**方式二：Homebrew 安装（macOS/Linux）**

```bash
brew install claude-code
```

**方式三：验证安装**

```bash
claude --version
```

如果输出版本号（如 `0.2.24`），说明安装成功。

### 2.3 卸载

```bash
npm uninstall -g @anthropic-ai/claude-code
```

---

## 3. 首次启动与基础配置

### 3.1 启动 Claude Code

在任意目录中运行：

```bash
claude
```

首次启动会看到欢迎界面，提示你进行初始配置。

### 3.2 API Key 配置

Claude Code 需要 Anthropic API Key 才能工作。有两种配置方式：

**方式一：通过环境变量**

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxx"
```

**方式二：在 settings.json 中配置**

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-xxxxxxxxxxxx"
  }
}
```

**获取 API Key：**
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 登录或注册账号
3. 进入 API Keys 页面
4. 创建新的 API Key

### 3.3 快速测试

配置好 API Key 后，运行：

```bash
claude
```

然后输入：

```
你好，请简单介绍一下你自己
```

如果 AI 正常回复，说明配置成功。

---

## 4. 配置文件详解

Claude Code 使用 JSON 格式的配置文件来控制各种行为。

### 4.2 配置文件优先级

Claude Code 会按以下顺序查找配置文件，后面的会覆盖前面的：

| 优先级 | 文件位置 | 作用域 |
|--------|----------|--------|
| 1 (最高) | `.claude/settings.local.json` | 当前项目本地 |
| 2 | `.claude/settings.json` | 当前项目 |
| 3 (最低) | `~/.claude/settings.json` | 全局用户 |

### 4.3 settings.json 完整示例

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-xxxxxxxxxxxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_MODEL": "sonnet",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-20250514",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-6-20251120",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5-20251001",
    "API_TIMEOUT_MS": 120000,
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": false
  },
  "permissions": {
    "allow": ["WebSearch", "WebFetch", "Bash", "Read", "Write", "Edit", "Grep", "Glob", "Notebook"],
    "deny": []
  },
  "hooks": {
    "pre-command": "",
    "post-command": "",
    "on-command-failure": ""
  },
  "includeCoAuthoredBy": true,
  "moderate": false,
  "outputKeybindings": true,
  "terminal": {
    "shell": "auto"
  },
  "ui": {
    "showHiddenFiles": false
  },
  "mcpServers": {}
}
```

### 4.4 配置项详细说明

#### env 环境变量

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | string | 你的 Anthropic API 密钥 |
| `ANTHROPIC_BASE_URL` | string | API 端点地址（用于代理或自定义后端） |
| `ANTHROPIC_MODEL` | string | 默认使用的模型：`haiku`、`sonnet` 或 `opus` |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | string | 默认 Sonnet 模型版本 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | string | 默认 Opus 模型版本 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | string | 默认 Haiku 模型版本 |
| `API_TIMEOUT_MS` | number | API 请求超时时间（毫秒），默认 120000 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | boolean | 禁用匿名使用统计 |

#### permissions 权限配置

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit"],
    "deny": ["Bash:rm -rf /", "Bash:sudo"]
  }
}
```

- `allow` - 允许的操作列表
- `deny` - 明令禁止的操作列表（支持精确命令匹配）

#### hooks 钩子配置

```json
{
  "hooks": {
    "pre-command": "echo '即将执行命令'",
    "post-command": "echo '命令执行完成'",
    "on-command-failure": "echo '命令执行失败'"
  }
}
```

#### 其他配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `includeCoAuthoredBy` | boolean | 在 git 提交中包含 Co-Authored-By 信息 |
| `moderate` | boolean | 启用内容审核 |
| `outputKeybindings` | boolean | 显示快捷键绑定 |
| `terminal.shell` | string | 指定终端 shell 类型 |
| `ui.showHiddenFiles` | boolean | 在文件列表中显示隐藏文件 |

---

## 5. 核心概念与工作原理

### 5.1 会话与上下文

Claude Code 基于会话（Session）工作，每个会话维护一个上下文窗口，可以记住对话历史。

```
┌─────────────────────────────────────┐
│         Claude Code 会话             │
├─────────────────────────────────────┤
│  用户: 帮我创建一个 React 组件      │
│  AI:  [创建 Button.jsx]             │
│  用户: 帮我添加点击事件              │
│  AI:  [修改 Button.jsx]             │
│  ...                                 │
└─────────────────────────────────────┘
```

### 5.2 工具系统

Claude Code 内置多种工具，可以执行各种操作：

| 工具 | 作用 | 示例操作 |
|------|------|----------|
| `Bash` | 执行命令行 | `npm install`, `git commit` |
| `Read` | 读取文件 | 查看源代码 |
| `Write` | 写入文件 | 创建新文件 |
| `Edit` | 编辑文件 | 修改代码 |
| `Grep` | 搜索内容 | 查找函数调用 |
| `Glob` | 查找文件 | 找所有 `.js` 文件 |
| `WebFetch` | 获取网页 | 抓取文档 |
| `WebSearch` | 网络搜索 | 查找解决方案 |

### 5.3 权限控制原理

权限系统通过"允许列表"和"拒绝列表"来控制工具的使用：

```
权限检查流程：

用户请求执行操作
       │
       ▼
  操作在 deny 列表？
     │是→ 拒绝
     │否
       ▼
  操作在 allow 列表？
     │否→ 拒绝（默认拒绝）
     │是
       ▼
   执行操作
```

**默认行为：**
- 如果 `allow` 为空，则允许所有操作
- 如果 `allow` 有内容，只允许列表中的操作
- `deny` 列表优先级最高，可以单独禁止特定命令

---

## 6. 权限系统完全指南

### 6.1 可用权限列表

| 权限名 | 说明 | 典型用途 |
|--------|------|----------|
| `Bash` | 执行 shell 命令 | 运行脚本、git 操作、构建 |
| `Read` | 读取文件 | 查看代码、配置文件 |
| `Write` | 创建/覆写文件 | 生成代码、保存文件 |
| `Edit` | 修改文件内容 | 修复 Bug、重构 |
| `Grep` | 搜索文件内容 | 查找函数、变量 |
| `Glob` | 模式匹配文件 | 批量操作相关文件 |
| `Notebook` | Jupyter 操作 | 数据分析、实验 |
| `WebFetch` | 获取网页内容 | 抓取文档、API |
| `WebSearch` | 搜索引擎 | 查找解决方案 |

### 6.2 权限配置示例

**示例一：仅允许读取和搜索（最安全）**

```json
{
  "permissions": {
    "allow": ["Read", "Grep", "Glob"],
    "deny": []
  }
}
```

**示例二：允许开发操作，但禁止危险命令**

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit", "Grep", "Glob"],
    "deny": [
      "Bash:rm -rf /",
      "Bash:rm -rf *",
      "Bash:sudo",
      "Bash:dd",
      "Bash:mkfs"
    ]
  }
}
```

**示例三：仅允许 Web 搜索和读取**

```json
{
  "permissions": {
    "allow": ["WebSearch", "WebFetch", "Read", "Grep", "Glob"],
    "deny": []
  }
}
```

### 6.3 权限粒度控制

deny 列表支持精确命令匹配：

```json
{
  "deny": [
    "Bash:rm -rf /",
    "Bash:git push --force",
    "Bash:npm publish"
  ]
}
```

### 6.4 生产环境建议

在生产环境中，建议使用最小权限原则：

```json
{
  "permissions": {
    "allow": ["Read", "Grep", "Glob"],
    "deny": []
  }
}
```

如果需要执行命令，可以临时提升权限或在命令前添加确认。

---

## 7. Hooks 钩子函数

Hooks 允许你在 Claude Code 执行命令前后运行自定义脚本。

### 7.1 可用钩子类型

| 钩子名 | 触发时机 | 用途 |
|--------|----------|------|
| `pre-command` | 命令执行前 | 验证、日志、权限检查 |
| `post-command` | 命令执行后 | 通知、统计、清理 |
| `on-command-failure` | 命令执行失败 | 错误处理、告警 |

### 7.2 钩子配置示例

**基本用法（直接写命令）：**

```json
{
  "hooks": {
    "pre-command": "echo 'Starting: {command}'",
    "post-command": "echo 'Finished: {command}'"
  }
}
```

**脚本文件用法（推荐）：**

```json
{
  "hooks": {
    "pre-command": "./scripts/pre-command.sh",
    "post-command": "./scripts/post-command.sh",
    "on-command-failure": "./scripts/on-failure.sh"
  }
}
```

### 7.3 脚本示例

**pre-command.sh：**

```bash
#!/bin/bash
echo "即将执行命令: $@"
# 可以在这里添加权限检查
if [[ "$@" == *"rm -rf"* ]]; then
  echo "警告：检测到危险命令！"
fi
```

**post-command.sh：**

```bash
#!/bin/bash
echo "命令执行完成"
# 可以发送通知
```

### 7.4 实用 Hook 场景

**场景一：自动格式化代码**

```json
{
  "hooks": {
    "post-command": "npx prettier --write {files}"
  }
}
```

**场景二：提交前运行测试**

```json
{
  "hooks": {
    "pre-command": "npm test"
  }
}
```

**场景三：操作审计日志**

```json
{
  "hooks": {
    "post-command": "echo '[$(date)] 用户执行: $@' >> audit.log"
  }
}
```

---

## 8. 自定义技能命令

自定义技能允许你创建可复用的工作流模板。

### 8.1 技能文件结构

在项目根目录创建 `.claude/commands/` 文件夹：

```
项目根目录/
├── .claude/
│   ├── commands/
│   │   ├── 代码审查.md      # /代码审查
│   │   ├── 修复bug.md       # /修复bug
│   │   └── 生成文档.md      # /生成文档
│   └── settings.json
└── src/
```

### 8.2 技能文件格式

**技能文件命名规则：**
- 文件名 = 斜杠命令名
- `.md` 扩展名
- 中划线分隔的单词会自动转换为驼峰

例如：`代码审查.md` → `/代码审查` 或 `/代码-审查`

**文件内容格式：**

```markdown
# /代码审查

对这个项目进行全面的代码审查。

## 审查范围
- 代码质量
- 潜在 Bug
- 安全隐患
- 性能问题
- 代码风格

## 输出格式
请按以下格式输出：

### 1. 代码质量问题
[列出发现的问题]

### 2. 安全隐患
[列出安全问题]

### 3. 改进建议
[提供具体改进方案]

## 注意事项
- 重点关注 src/ 目录下的文件
- 忽略 node_modules 和 build 目录
```

### 8.3 使用自定义技能

创建技能后，在 Claude Code 中直接调用：

```
/代码审查
```

```
/修复bug
```

### 8.4 内置技能

Claude Code 自带几个实用技能：

| 技能 | 调用命令 | 说明 |
|------|----------|------|
| 简化代码 | `/simplify` | 审查代码并进行简化优化 |
| 批量处理 | `/batch` | 并行执行大规模修改 |
| 循环执行 | `/loop` | 按时间间隔循环执行 |
| 配置更新 | `/update-config` | 修改配置文件 |

---

## 9. MCP 服务器配置

MCP（Model Context Protocol）服务器允许 Claude Code 连接外部工具和服务。

### 9.1 MCP 配置语法

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@some/mcp-server"],
      "env": {
        "API_KEY": "xxx"
      }
    }
  }
}
```

### 9.2 常用 MCP 服务器

**文件系统服务器：**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/workspace"]
    }
  }
}
```

**Git 服务器：**

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

### 9.3 MCP 服务器列表

官方 MCP 服务器：
- `@modelcontextprotocol/server-filesystem` - 文件系统操作
- `@modelcontextprotocol/server-github` - GitHub API
- `@modelcontextprotocol/server-memory` - 内存存储
- `@modelcontextprotocol/server-slack` - Slack 集成

---

## 10. 快捷键大全

### 10.1 基础操作

| 快捷键 | 操作 |
|--------|------|
| `Ctrl + C` | 取消当前操作 |
| `Ctrl + D` | 退出 Claude Code |
| `Ctrl + L` | 清屏 |
| `Tab` | 自动补全 |
| `↑ / ↓` | 浏览历史命令 |

### 10.2 特殊快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl + Shift + C` | 复制上次输出 |
| `Ctrl + Shift + V` | 粘贴到输入 |
| `Esc` | 退出多行输入模式 |

### 10.3 编辑操作

| 快捷键 | 操作 |
|--------|------|
| `Ctrl + A` | 光标移到行首 |
| `Ctrl + E` | 光标移到行尾 |
| `Ctrl + U` | 删除当前行 |
| `Ctrl + K` | 删除光标后内容 |

---

## 11. 内置斜杠命令

### 11.1 所有内置命令

| 命令 | 说明 |
|------|------|
| `/ask` | 快速提问 |
| `/batch` | 批量并行修改 |
| `/claude-api` | 使用 Claude API 构建应用 |
| `/clear` | 清屏 |
| `/debug` | 开启调试模式 |
| `/exit` | 退出 Claude Code |
| `/feedback` | 提交反馈或 Bug |
| `/help` | 显示帮助信息 |
| `/insights` | 分析会话洞察 |
| `/init` | 初始化新项目 |
| `/loop` | 循环执行任务 |
| `/linter` | 代码检查 |
| `/review` | 审查 PR |
| `/security-review` | 安全审查 |
| `/simplify` | 简化代码 |
| `/statusline` | 配置状态栏 |
| `/update-config` | 修改配置文件 |

### 11.2 常用命令详解

**`/init` - 初始化项目**

```
/init
```

会引导你创建一个新的 `CLAUDE.md` 文件和基本项目结构。

**`/review` - 审查 PR**

```
/review 123
```

审查编号为 123 的 Pull Request。

**`/security-review` - 安全审查**

```
/security-review
```

对代码变更进行安全审查。

**`/feedback` - 提交反馈**

```
/feedback
```

打开反馈表单，提交建议或报告 Bug。

---

## 12. CLAUDE.md 项目文档

`CLAUDE.md` 是项目的核心文档，Claude Code 启动时会自动读取。

### 12.1 基础结构

```markdown
# 项目名称

项目简短描述。

## 项目背景
[为什么要做这个项目]

## 技术栈
- 前端：React + TypeScript
- 后端：Node.js + Express
- 数据库：PostgreSQL

## 目录结构
```
src/
├── components/  # React 组件
├── pages/       # 页面组件
├── hooks/       # 自定义 Hooks
└── utils/       # 工具函数
```

## 开发命令
| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm test` | 运行测试 |
| `npm run build` | 构建生产版本 |

## 代码规范
- 使用 ESLint 进行代码检查
- 提交前运行 `npm test`
- 遵循 React Hooks 规则

## 注意事项
- API Key 不要提交到代码库
- 生产环境配置通过环境变量注入
```

### 12.2 高级用法

**指定 AI 行为：**

```markdown
## AI 行为指南

当你编写代码时：
1. 优先使用 TypeScript
2. 组件使用函数式组件 + Hooks
3. 样式优先使用 Tailwind CSS
4. 异步操作使用 async/await
```

**自定义工作流：**

```markdown
## Bug 修复流程

修复 Bug 时：
1. 先用 `/claude-code` 定位问题
2. 编写测试用例复现 Bug
3. 修复代码
4. 确保测试通过
5. 更新相关文档
```

### 12.3 多项目配置

如果你的工作区有多个独立项目，可以在每个项目中分别创建 `CLAUDE.md`。

---

## 13. IDE 集成

### 13.1 VS Code 集成

**安装扩展：**

1. 打开 VS Code
2. 进入扩展市场（`Ctrl + Shift + X`）
3. 搜索 "Claude Code"
4. 点击安装

**主要功能：**
- 内联代码建议
- 聊天面板
- PR 审查视图

### 13.2 JetBrains 集成

**安装插件：**

1. 打开 JetBrains IDE
2. 进入 `Preferences > Plugins`
3. 搜索 "Claude Code"
4. 安装并重启

**配置 API Key：**
1. `Preferences > Tools > Claude Code`
2. 填入你的 API Key
3. 保存设置

---

## 14. 最佳实践与进阶技巧

### 14.1 高效使用建议

**1. 清晰描述需求**
```
❌ 帮我改一下代码
✅ 帮我将 src/api/user.ts 中的 getUser 函数改为支持缓存，缓存时间 5 分钟
```

**2. 分步骤操作复杂任务**
```
❌ 创建一个完整的电商后台
✅ 第一步：帮我创建项目结构和 package.json
✅ 第二步：帮我创建 Express 服务器骨架
✅ ...逐步完成
```

**3. 提供上下文**
```
❌ 这个函数报错
✅ 这个函数在 src/utils/format.ts 第 23 行报错，错误信息是 "Cannot read property 'map' of undefined"
```

### 14.2 项目配置最佳实践

**1. 敏感信息管理**

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-xxx"
  }
}
```

使用环境变量，不要硬编码。

**2. 分环境配置**

```json
// .claude/settings.local.json（不提交到 git）
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-xxx"
  }
}
```

**3. .gitignore 配置**

```
# Claude Code 配置
.claude/settings.local.json
```

### 14.3 安全最佳实践

1. **最小权限原则** - 只开启必要的权限
2. **使用 deny 列表** - 禁止危险命令
3. **审查钩子脚本** - 确保脚本来源可靠
4. **定期轮换 API Key** - 保护账户安全

### 14.4 团队协作

**共享配置：**

```json
// .claude/settings.json（提交到 git）
{
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit", "Grep", "Glob"],
    "deny": ["Bash:rm -rf /", "Bash:sudo"]
  },
  "hooks": {
    "pre-command": "./scripts/pre-commit-check.sh"
  }
}
```

**本地覆盖：**

```json
// .claude/settings.local.json（不提交）
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-my-key"
  }
}
```

---

## 15. 常见问题与解决方案

### Q1: 提示 "Permission denied"

**原因：** 当前操作不在允许列表中。

**解决方案：**
```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit"]
  }
}
```

### Q2: 提示 "API Key not found"

**原因：** 没有配置 API Key 或配置错误。

**解决方案：**
1. 确认 API Key 正确
2. 检查配置文件格式
3. 使用环境变量：
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-xxx"
```

### Q3: 命令执行超时

**原因：** 默认超时 2 分钟，大型操作可能超时。

**解决方案：**
```json
{
  "env": {
    "API_TIMEOUT_MS": 300000
  }
}
```

### Q4: 如何禁用 Claude Code？

**临时禁用：** 关闭终端即可。

**永久禁用：**
```bash
npm uninstall -g @anthropic-ai/claude-code
```

### Q5: 如何查看版本？

```bash
claude --version
```

### Q6: 如何更新到最新版本？

```bash
npm update -g @anthropic-ai/claude-code
```

### Q7: 配置文件修改后需要重启吗？

**不需要**，Claude Code 会自动重新加载配置文件。

### Q8: 可以同时使用多个会话吗？

可以，在不同终端中分别运行 `claude` 命令即可。

### Q9: 如何导出聊天记录？

目前不支持自动导出，但可以使用 `Ctrl + L` 清屏前手动复制。

### Q10: 支持中文吗？

**支持**。Claude Code 支持多语言，包括中文。你可以用中文与它交流。

---

## 附录

### A. 配置检查清单

- [ ] 已安装 Claude Code
- [ ] 已配置 API Key
- [ ] 已设置适当的权限
- [ ] 已创建 CLAUDE.md
- [ ] 已测试基本功能

### B. 快速参考卡片

```
常用命令：
  claude              # 启动
  claaude --version   # 版本
  /help              # 帮助
  /exit              # 退出

快捷键：
  Ctrl+C  取消
  Ctrl+D  退出
  Ctrl+L  清屏

配置文件：
  .claude/settings.json        # 项目配置
  ~/.claude/settings.json      # 全局配置
  CLAUDE.md                    # 项目文档
```

### C. 资源链接

- [官方文档](https://code.claude.com/docs)
- [GitHub 仓库](https://github.com/anthropics/claude-code)
- [Anthropic Console](https://console.anthropic.com/)
- [API 文档](https://docs.anthropic.com/)

---

**祝你使用愉快！**
