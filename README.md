# 🧹 SillyTavern Chat Cleaner & Manager  
**酒馆聊天记录清理与全局管理器**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![SillyTavern Version](https://img.shields.io/badge/SillyTavern-1.17.0+-blue)](https://github.com/SillyTavern/SillyTavern)

[🇨🇳 中文说明](#zh-cn) | [🇺🇸 English Documentation](#en-us)

---

<a id="zh-cn"></a>
## 🇨🇳 中文说明

专为 SillyTavern 设计的**可视化、安全优先**的全局聊天文件 (`.jsonl`) 管理器。  
随着时间推移，你的 `chats/` 目录下可能积累了成百上千个仅包含一句问候的“僵尸聊天”文件。**Chat Cleaner & Manager** 让你能在几秒钟内跨角色扫描、多维度筛选、预览、导出并批量清理这些冗余文件，且全程由原子化的浏览器本地回收站和多级防误删机制保驾护航。

### ✨ 核心特性

- ⚡ **极速扫描与沉浸式管理**：支持 2–16 并发扫描，随时暂停/恢复。支持**全屏沉浸模式**与**右下角悬浮导航**，批量勾选数百个文件时不再迷路；勾选的文件自动置顶，方便集中核对。
- 🛡️ **五重数据安全防线（防误删机制）**：
  - **最新档保护**：自动识别每个角色卡下时间最新的聊天记录（可设置最小消息数），标记为「慎删」，防止把当前正在推的主线误删。
  - **长篇剧情保护**：消息数大于设定阈值（默认 50 条）的长篇存档自动标记为「慎删」。
  - **损坏存档防误触**：自动检测体积异常大但消息极少的文件（如崩溃导致只剩开场白的坏档）。
  - **分支与主干关联保护**：识别 Checkpoint/分支/书签，保护父子节点，防止误删断链。
  - **前台活跃强制豁免**：当前正打开的角色聊天被强制锁定，不可勾选。
- 🔄 **智能三态全选**：告别几百条慎删项一个个点的折磨。第一次点击全选「普通项」，第二次点击全选「含慎删项」，第三次点击取消全选，且复选框有极其清晰的“半选/全选”视觉反馈。
- 🗑️ **原子级断网容错回收站**：删除前必须通过 IndexedDB 事务写入回收站备份。如果网络中断或存储空间不足，自动中止删除并保留文件。支持自定义保留时间（5分钟至永久），随时还原、导出或加锁。
- 👁️ **楼层折叠预览与一键导出**：轻量级纯文本预览（无 HTML 渲染卡顿）。自动折叠中间楼层，直达最后一楼，支持直接导出 `.jsonl`。
- 👤 **多用户隔离**：按酒馆用户 Handle 自动隔离数据库，多账号互不干扰。

### 📦 安装方法

1. 在 SillyTavern 中，点击**顶部工具栏**的 **扩展 (Extensions)** 图标（立方体）。
2. 选择 **安装扩展 (Install Extension)**。
3. 粘贴本仓库 URL：`https://github.com/waignin/SillyTavern-ChatCleaner`
4. 点击 **安装 (Install)** 并刷新页面。

> **手动安装**：若使用 `git clone`，请将文件夹放置在 `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/` 下。需要 **SillyTavern 1.17.0+** (推荐)。  

### 🚀 使用指南

1. 点击 SillyTavern **底部工具栏**的 **🪄 魔法棒** 菜单，选择 **聊天记录管理 / Chat Cleaner**。
2. 利用**顶部仪表盘**和**角色侧边栏**快速定位。支持按**消息数、体积、未互动天数**筛选，或使用快捷预设。
3. 选中文件时，被选中的文件会自动置顶。利用右下角的悬浮按钮可一键回到**顶部/底部**，或精准跳转到**已选与未选的分界线**。
4. 点击 **清理选中项**。高危被删文件会弹出二次确认，最终放入 **回收站**（默认保留 60 分钟，可恢复）。

### ⚠️ 安全与注意事项

- **回收站位于浏览器本地**：删除的聊天备份在 IndexedDB 中。**请勿清除浏览器站点数据或使用无痕模式**，否则备份将丢失。
- **外部文件修改**：若你通过系统文件夹手动增删了 `.jsonl`，请点击插件内的 **“全量重扫”** 同步缓存。
- **已删除角色的残留聊天**：本插件仅扫描当前角色列表中存在的聊天，已删除角色的孤儿文件请用 SillyTavern 内置清理菜单处理。

---

<a id="en-us"></a>
## 🇺🇸 English Documentation

A visual, safety-first global chat file manager and zombie-chat cleaner for **SillyTavern**.  

Over time, SillyTavern users accumulate hundreds or thousands of 1-message "greeting-only" `.jsonl` chat files. **Chat Cleaner & Manager** lets you scan, filter, preview, export, and batch-clean redundant files in seconds—backed by an atomic IndexedDB Trash Bin and multi-layered anti-misclick protections.

### ✨ Key Features

- ⚡ **Fast Scan & Immersive Management**: Supports 2–16 concurrent workers. Features a **Fullscreen Mode** and **Floating Quick-Nav** (Top/Split/Bottom) to handle hundreds of files effortlessly. Selected items can be auto-pinned to the top.
- 🛡️ **5-Layer Data Safety**:
  - **Latest Chat Protection**: Automatically identifies each character's most recent chat (with a minimum message threshold) and flags it as High-Risk.
  - **Long Chat Protection**: Chats with messages ≥ threshold (default 50) are flagged as High-Risk.
  - **Anti-Corruption Warning**: Detects files with ≤2 messages but huge file sizes (crash-corrupted saves).
  - **Branch & Parent Protection**: Builds a dependency index to prevent broken story trees.
  - **Active Chat Exemption**: The currently open chat is hard-locked.
- 🔄 **Tri-State Select All**: No more clicking 500 checkboxes one by one. 1st click selects normal items (indeterminate state), 2nd click selects everything including high-risk items (checked), 3rd click clears all.
- 🗑️ **Network-Resilient Atomic Trash Bin**: Metadata and payloads are committed in a single IndexedDB transaction. Aborts deletion if storage is full or network drops. Configurable retention (5 mins to never).
- 👁️ **Collapsible Floor Preview & Export**: Lightweight text preview with middle floors collapsed. One-click `.jsonl` export.
- 👤 **Multi-User Isolation**: IndexedDB and settings are scoped per ST user handle.

### 📦 Installation

1. In SillyTavern, open **Extensions** (top toolbar cubes icon).
2. Select **Install Extension**.
3. Paste the repository URL: `https://github.com/waignin/SillyTavern-ChatCleaner`
4. Click **Install** and refresh the page.

> **Manual Installation**: Place the folder under `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/`. Requires **SillyTavern 1.17.0+**.

### 🚀 Usage

1. Click the **🪄 Magic Wand** menu in the **bottom toolbar** and select **Chat Cleaner**.
2. Use the dashboard and sidebar to filter by **Message Count**, **File Size**, or **Inactive Days**, or use quick presets.
3. Checked items are auto-pinned. Use the floating buttons to jump to Top, Bottom, or the **Selection Boundary**.
4. Click **Clean Selected**. Deleted files are kept in the **Trash Bin** (default 60 mins) for recovery.

### ⚠️ Safety & Risks

- **Trash Bin lives in your browser**: Backed up in IndexedDB. Do not clear site data or use Incognito.
- **External file edits**: If you manually add/modify `.jsonl` files, click **"Full Rescan"**.
- **Orphan chats**: Use SillyTavern's built-in **Clean-Up Menu** for chats from deleted characters.

---

### 🤖 AI Assistance Disclosure
This project's code was generated with the assistance of AI tools (Gemini and DeepSeek) and subsequently reviewed, refined, and tested by a human maintainer. The MIT License applies to the project as a whole. See LICENSE for details.

### 📄 License
This project is licensed under the **MIT License**. See LICENSE for details.

### 🐛 Support
Please open an Issue for bug reports or feature requests.
