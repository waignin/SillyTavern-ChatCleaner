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

- ⚡ **极速扫描与沉浸式管理**：
  - 支持 2–16 并发工作线程扫描，随时暂停/恢复/终止。
  - **沉浸式全屏模式**：隐藏多余工具栏，最大化列表展示空间。
  - **智能悬浮导航**：右下角提供“↑顶 / ↕分界 / ↓底”悬浮按钮，一键精准跳转到“已勾选与未勾选”的交界处。
  - **选中自动置顶**：勾选的文件自动排到列表最前，方便在几百个文件中集中核对。
- 🔄 **智能三态全选（告别手酸）**：
  - 针对批量清理几百个“废档”的痛点，全选框采用三态循环：第 1 次点击全选普通项（显示半选横线），第 2 次点击全选含高危慎删项（显示打勾），第 3 次点击取消全选。
- 🛡️ **五重数据安全防线（防误删机制）**：
  - **活跃聊天豁免**：当前在酒馆前台打开的聊天被强制锁定，禁止删除。
  - **最新档保护**：自动识别每张角色卡最后互动且消息数达标（默认 ≥2 条）的进度，标记为「角色最新档(慎删)」，防误删当前主线。
  - **长篇存档保护**：消息数达到阈值（默认 ≥50 条）的长篇存档自动标记为「长篇存档(慎删)」。
  - **损坏档防误触**：自动检测体积异常大但消息极少的文件（如酒馆崩溃导致只剩开场白的废档），标记为「大体积少消息」。
  - **分支与主干保护**：自动识别 Checkpoint/分支/书签及其关联的父聊天，防止误删导致剧情树断链。
- 🗑️ **网络容错的原子化回收站**：
  - 删除前必须通过单次 IndexedDB 事务写入备份。如果浏览器存储空间不足或网络中断，**自动中止删除原文件**。
  - 保留时间支持自定义（5分钟 至 7天，或永不清理）。期间可随时还原、导出、加锁。关闭备份且回收站为空时，相关 UI 自动隐藏。
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
2. 利用**顶部仪表盘**和**角色侧边栏**快速定位。支持按消息数、体积、未互动天数筛选，或使用快捷预设。
3. 勾选文件时，被选中的项会自动置顶。利用右下角悬浮按钮可跳转到分界线。
4. 点击 **清理选中项**。高危文件会弹出二次确认，最终放入 **回收站**。

### ⚠️ 适用范围与注意事项

- **适用边界**：本插件专注于清理**角色卡对应的聊天记录**。**群聊记录**以及**已删除角色遗留的孤立聊天文件**，均不在本插件的扫描和管理范围内。
- **官方清理工具指引**：对于上述不在支持范围内的文件，请使用 SillyTavern 内置的官方清理工具：`用户设置` -> `杂项` -> `数据清理` (或 `清理`)，点击 `扫描` 后按需删除。
- **回收站位于浏览器本地**：删除的聊天备份在 IndexedDB 中。**请勿清除浏览器站点数据或使用无痕模式**，否则备份将丢失。
- **外部文件修改**：若你通过系统文件夹手动增删了 `.jsonl`，请点击插件内的 **“全量重扫”** 同步缓存。

---

<a id="en-us"></a>
## 🇺🇸 English Documentation

A visual, safety-first global chat file manager and zombie-chat cleaner for **SillyTavern**.  

Over time, SillyTavern users accumulate hundreds or thousands of 1-message "greeting-only" `.jsonl` chat files. **Chat Cleaner & Manager** lets you scan, filter, preview, export, and batch-clean redundant files in seconds—backed by an atomic IndexedDB Trash Bin and multi-layered anti-misclick protections.

### ✨ Key Features

- ⚡ **Fast Scan & Immersive Management**:
  - Supports 2–16 concurrent workers with pause/resume/stop.
  - **Fullscreen Mode**: Maximizes the chat list view.
  - **Floating Quick-Nav**: Top, Bottom, and a unique **Split** button to jump to the boundary between selected and unselected rows.
  - **Auto-Pin Selected**: Checked items automatically pin to the top of the list.
- 🔄 **Tri-State Select All**:
  - 1st click selects normal items (indeterminate state), 2nd click selects everything including high-risk items (checked), 3rd click clears all.
- 🛡️ **5-Layer Data Safety**:
  - **Active Chat Exemption**: The currently open chat is hard-locked.
  - **Latest Chat Protection**: Automatically identifies each character's most recent chat (≥2 msgs by default) and flags it as High-Risk.
  - **Long Chat Protection**: Flags chats with messages ≥ threshold (default 50) as High-Risk.
  - **Anti-Corruption Warning**: Detects files with ≤2 messages but huge file sizes.
  - **Branch & Parent Protection**: Builds a dependency index to prevent broken story trees.
- 🗑️ **Network-Resilient Atomic Trash Bin**: Metadata and payloads are committed in a single IndexedDB transaction. Aborts deletion if storage is full or network drops. Configurable retention.
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
2. Use the dashboard and sidebar to filter by **Message Count**, **File Size**, or **Inactive Days**.
3. Checked items auto-pin to top. Use the floating buttons to jump to Top, Bottom, or the **Selection Boundary**.
4. Click **Clean Selected**. Deleted files are kept in the **Trash Bin** for recovery.

### ⚠️ Scope & Limitations

- **Scope**: This extension focuses **exclusively on chat records belonging to existing characters**.
- **Unsupported Files**: **Group chats** and **orphaned chats from deleted characters** are **not** scanned or managed by this extension.
- **Official Cleanup Tool**: For these files, please use SillyTavern's built-in **Data Cleanup** tool: `User Settings` -> `Miscellaneous` -> `Data Cleanup` (or `Clean-Up`) -> `Scan` and delete as needed.
- **Trash Bin lives in your browser**: Backed up in IndexedDB. Do not clear site data or use Incognito.
- **External file edits**: If you manually add/modify `.jsonl` files, click **"Full Rescan"**.

---

### 🤖 AI Assistance Disclosure
This project's code was generated with the assistance of AI tools (Gemini and DeepSeek) and subsequently reviewed, refined, and tested by a human maintainer. The MIT License applies to the project as a whole. See LICENSE for details.

### 📄 License
This project is licensed under the **MIT License**. See LICENSE for details.

### 🐛 Support
Please open an Issue for bug reports or feature requests.
