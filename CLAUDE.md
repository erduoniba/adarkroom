# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

A Dark Room — 极简主义浏览器文字冒险游戏。此 Fork 版本默认语言设为中文（`zh_cn`），并适配了移动端。

## 开发命令

```bash
npm install          # 安装 Node.js 依赖（Express）
npm start            # 启动开发服务器，端口 8080
npm run build:zip    # 打包离线 zip 到 dist/ 目录
npm run translate    # 将所有 .po 文件编译为 .js（依赖 polib）
npm run update_pot   # 更新翻译模板 POT 文件（依赖 pybabel）
```

Python 翻译工具依赖：
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

## 技术架构

纯前端游戏，无构建工具，所有 JS 通过 `<script>` 标签直接加载。使用 jQuery 处理 DOM 和动画。

### 模块系统（按游戏解锁顺序）

游戏通过 `Engine.travelTo(module)` 在水平滑动的面板间切换。每个模块文件在 `window` 上注册一个全局对象：

| 文件 | 全局对象 | 功能 |
|------|---------|------|
| `script/engine.js` | `Engine` | 核心引擎：初始化、模块切换、定时器、存档管理 |
| `script/state_manager.js` | `$SM` / `StateManager` | 状态管理器：get/set/add 状态到 `window.State`，自动持久化到 `localStorage` |
| `script/Button.js` | `Button` | 按钮组件：带冷却计时和消耗提示 |
| `script/header.js` | `Header` | 顶部标签导航 |
| `script/notifications.js` | `Notifications` | 通知系统：屏幕日志 + 居中 toast |
| `script/events.js` | `Events` | 随机事件系统：故事场景、战斗、战利品、分支对话 |
| `script/room.js` | `Room` | 初始房间：生火、建造者、制作、交易 |
| `script/outside.js` | `Outside` | 村庄：建筑和村民分配 |
| `script/path.js` | `Path` | 远征准备：选择装备和补给 |
| `script/world.js` | `World` | 世界地图探索、战斗、地点 |
| `script/ship.js` | `Ship` | 飞船建造 |
| `script/space.js` | `Space` | 太空旅行（终局） |
| `script/fabricator.js` | `Fabricator` | 外星科技制造 |
| `script/prestige.js` | `Prestige` | 二周目继承机制 |
| `script/scoring.js` | `Score` | 分数统计 |
| `script/audio.js` | `AudioEngine` | 音频引擎：背景音乐 + 音效 |
| `script/audioLibrary.js` | `AudioLibrary` | 音频资源路径映射 |
| `script/localization.js` | — | 翻译字符串提取（供 poedit 使用） |

### 事件子模块

`script/events/` 下的文件定义各种随机事件，在 `Events.init()` 时合并到事件池：

- `global.js` — 全局事件（盗贼、乞丐等）
- `room.js` — 房间事件
- `outside.js` — 村庄事件
- `encounters.js` — 战斗遭遇定义
- `setpieces.js` — 特殊剧情事件
- `marketing.js` — 推广事件

### 状态管理关键约定

- 所有持久化数据通过 `$SM.set()` / `$SM.get()` 读写，自动保存到 `localStorage.gameState`
- 状态路径使用带引号的键：`$SM.get('stores["wood"]', true)`（第二个参数 `true` 表示不存在时返回 0）
- 状态分类：`features`、`stores`、`character`、`income`、`timers`、`game`、`playStats`、`previous`、`outfit`、`config`、`wait`、`cooldown`
- 状态变更通过 `$.Dispatch('stateUpdate').publish()` 发布事件，各模块订阅后更新 UI

### 事件系统关键约定

每个事件是一个对象，包含：
- `title` — 弹窗标题
- `scenes` — 场景集合（至少包含 `start`），每个场景有 `text`、`buttons`、可选的 `combat`、`loot`
- `isAvailable()` — 判断事件是否可触发
- 按钮可通过 `nextScene` 跳转场景，通过 `onChoose` 执行副作用
- 战斗场景定义 `chara`、`health`、`damage`、`attackDelay`、`deathMessage`、`loot`

### 模块必须实现的接口

每个可导航的模块需要：
- `name` — 显示名称（已翻译）
- `init(options)` — 创建面板、标签、初始化按钮
- `onArrival(transition_diff)` — 切换到此模块时调用
- `tab` — Header 创建的标签元素引用
- `panel` — 面板 DOM 元素引用

### 移动端适配

此 Fork 进行了移动端优化：
- `index.html` 中 viewport 设为 `width=700px`
- 弹窗事件中禁止背景页面滚动（`overflow: hidden`）
- 通知使用居中 toast 显示在屏幕 70% 位置
- 支持触摸滑动手势切换模块（jquery.event.swipe）

### CSS 组织

- `css/main.css` — 全局样式
- 每个模块有对应 CSS 文件（`room.css`、`outside.css` 等）
- `css/dark.css` — 关灯模式样式
- `lang/<code>/main.css` — 各语言的样式覆盖

### 翻译流程

1. 在 JS 代码中使用 `_("string")` 包裹需翻译的文本
2. `npm run update_pot` 提取翻译字符串到 `lang/adarkroom.pot`
3. 各语言目录下编辑 `strings.po` 文件
4. `npm run translate` 运行 `tools/po2js.py` 将 `.po` 编译为 `strings.js`
5. `lang/langs.js` 列出所有可用语言

### 离线包构建

`npm run build:zip` 运行 `tools/zip-game.js`，将 `index.html`、`css/`、`script/`、`lib/`、`lang/`、`audio/` 打包为带日期的 zip 文件输出到 `dist/` 目录。
