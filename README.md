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

- ⚡ **增量缓存与极速扫描**：
  - 支持 2–16 并发工作线程扫描，随时暂停/恢复/终止。
  - **增量签名缓存**：聊天状态签名缓存于 IndexedDB。未发生新聊天的角色直接命中缓存（零网络请求），秒级完成。
  - **沉浸式全屏模式**：隐藏多余工具栏，最大化列表展示空间。
  - **智能悬浮导航**：右下角提供“↑顶 / ↕分界 / ↓底”悬浮按钮，一键精准跳转到“已勾选与未勾选”的交界处。
  - **选中自动置顶**：勾选的文件自动排到列表最前，方便在几百个文件中集中核对。
- 🔄 **智能三态全选（告别手酸）**：
  - 针对批量清理几百个“废档”的痛点，全选框采用三态循环：第 1 次点击全选普通项（显示半选横线），第 2 次点击全选含高危慎删项（显示打勾），第 3 次点击取消全选。
- 🛡️ **六重数据安全防线（防误删机制）**：
  - **删除前实时核对（兜底防线）**：在执行清理前，插件会重新读取服务端的实际文件内容，校验实际消息数是否与缓存列表一致。若发现不符或读取异常，会执行拦截跳过机制，降低误删真实进展档案的风险。
  - **活跃聊天豁免**：当前在酒馆前台打开的聊天被强制锁定，禁止删除。
  - **最新档保护**：自动识别每张角色卡最后互动且消息数达标（默认 ≥2 条）的进度，标记为「角色最新档(慎删)」，防误删当前主线。
  - **长篇存档保护**：消息数达到阈值（默认 ≥50 条）的长篇存档自动标记为「长篇存档(慎删)」。
  - **损坏档防误触**：自动检测体积异常大但消息极少的文件（如酒馆崩溃导致只剩开场白的废档）。
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

> **⚠️ 重要安装路径提醒**：
> 本插件依赖酒馆标准的扩展加载层级，**请直接使用上述的 URL 链接进行安装**。
> 若你因网络原因必须手动安装，请务必将文件夹放在 `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/` 目录下。**请勿**放入 `data/default-user/extensions/` 目录，否则会导致插件加载失败（白屏）！

### 🚀 使用指南

1. 点击 SillyTavern **底部工具栏**的 **🪄 魔法棒** 菜单，选择 **聊天记录管理 / Chat Cleaner**。
2. 利用**顶部仪表盘**和**角色侧边栏**快速定位。支持按消息数、体积、未互动天数筛选，或使用快捷预设。
3. 勾选文件时，被选中的项会自动置顶。利用右下角悬浮按钮可跳转到分界线。
4. 点击 **清理选中项**。高危文件会弹出二次确认，在核对文件实际状态无误后，才会放入 **回收站**。

### ⚠️ 适用范围与致命安全警告

- **🔴 回收站不是云端备份**：回收站数据仅保存在你当前浏览器的 IndexedDB 中。**请勿在清理后的保留期内清除浏览器站点数据、使用无痕模式或更换浏览器/设备**，否则备份将永久丢失，无法找回！
- **🔄 增量缓存与全量重扫**：为了极速扫描，本插件依赖角色的状态签名缓存。如果你在电脑的 `chats` 文件夹里手动删/加过文件，或者使用了酒馆自带的清理菜单/其他插件，**强烈建议点击一次「全量重扫」同步缓存**，以确保列表数据准确无误。虽然插件内置了「删除前实时核对」作为最后的安全防线（会尽量拦截实际状态与缓存不符的文件），但这属于防呆兜底机制，**请勿以此代替正常的缓存同步操作**。
- **📌 适用边界（不支持的功能）**：本插件专注于清理**角色卡对应的聊天记录**。**群聊记录 (Group Chats)** 以及 **已删除角色遗留的孤儿文件** 均不在本插件的扫描和管理范围内。
- **🧹 官方清理工具指引**：对于上述不在支持范围内的文件，请使用 SillyTavern 内置的官方清理工具：`用户设置` -> `杂项` -> `数据清理` (或 `清理`)，点击 `扫描` 后按需删除。

---

<a id="en-us"></a>
## 🇺🇸 English Documentation

A visual, safety-first global chat file manager and zombie-chat cleaner for **SillyTavern**.  

Over time, SillyTavern users accumulate hundreds or thousands of 1-message "greeting-only" `.jsonl` chat files. **Chat Cleaner & Manager** lets you scan, filter, preview, export, and batch-clean redundant files in seconds—backed by an atomic IndexedDB Trash Bin and multi-layered anti-misclick protections.

### ✨ Key Features

- ⚡ **Incremental Cache & Fast Scan**:
  - Supports 2–16 concurrent workers with pause/resume/stop.
  - **Signature Cache**: Chat state signatures are cached in IndexedDB. Characters without new chats hit local cache (0 network overhead).
  - **Fullscreen Mode**: Maximizes the chat list view.
  - **Floating Quick-Nav**: Top, Bottom, and a unique **Split** button to jump to the boundary between selected and unselected rows.
  - **Auto-Pin Selected**: Checked items automatically pin to the top of the list.
- 🔄 **Tri-State Select All**:
  - 1st click selects normal items (indeterminate state), 2nd click selects everything including high-risk items (checked), 3rd click clears all.
- 🛡️ **6-Layer Data Safety**:
  - **Pre-Deletion Live Verification (Fail-safe)**: Fetches the live `.jsonl` payload before deletion to verify that the actual message count matches the cached count. Empty arrays, corrupted files, or mismatched counts are intercepted to prevent accidental deletion.
  - **Active Chat Exemption**: The currently open chat is hard-locked.
  - **Latest Chat Protection**: Automatically identifies each character's most recent chat (≥2 msgs by default) and flags it as High-Risk.
  - **Long Chat Protection**: Flags chats with messages ≥ threshold (default 50) as High-Risk.
  - **Anti-Corruption Warning**: Detects files with ≤2 messages but huge file sizes.
  - **Branch & Parent Protection**: Builds a dependency index to prevent broken story trees.
- 🗑️ **Network-Resilient Atomic Trash Bin**:
  - Metadata and payloads are committed in a single IndexedDB transaction. Aborts deletion if storage is full or network drops.
  - Configurable retention (5 mins to 7 days, or never). Restorable, exportable, and lockable.
- 👁️ **Collapsible Floor Preview & Export**: Lightweight text preview with middle floors collapsed. One-click `.jsonl` export.
- 👤 **Multi-User Isolation**: IndexedDB and settings are scoped per ST user handle.

### 📦 Installation

1. In SillyTavern, open **Extensions** (top toolbar cubes icon).
2. Select **Install Extension**.
3. Paste the repository URL: `https://github.com/waignin/SillyTavern-ChatCleaner`
4. Click **Install** and refresh the page.

> **⚠️ Important Installation Path Note**:
> Please use the URL installation method above. If you must install manually, the folder **must** be placed under `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/`. **Do not** place it in `data/default-user/extensions/`, as it will fail to load due to path resolution issues.

### 🚀 Usage

1. Click the **🪄 Magic Wand** menu in the **bottom toolbar** and select **Chat Cleaner**.
2. Use the dashboard and sidebar to filter by **Message Count**, **File Size**, or **Inactive Days**.
3. Checked items auto-pin to top. Use the floating buttons to jump to Top, Bottom, or the **Selection Boundary**.
4. Click **Clean Selected**. High-risk files require a second confirmation before being moved to the **Trash Bin**.

### ⚠️ Scope & Critical Safety Warnings

- **🔴 Trash Bin is NOT a Cloud Backup**: Backups are stored locally in your browser's IndexedDB. **Do not clear browser site data, use Incognito mode, or switch browsers/devices** during the retention period, or backups will be permanently lost.
- **🔄 Incremental Cache & Full Rescan**: This plugin relies on chat state signatures for fast scanning. If you manually add/delete `.jsonl` files in the `chats` folder, or use SillyTavern's built-in cleanup tool or other extensions, **you must click "Full Rescan"** to sync the cache. While the plugin includes "Pre-Deletion Live Verification" as a final safety net to intercept mismatched files, this is a fail-safe mechanism and **should not be used as a substitute for proper cache synchronization**.
- **📌 Scope & Limitations**: This extension focuses **exclusively on chat records belonging to existing characters**. **Group chats** and **orphaned chats from deleted characters** are **not** scanned.
- **🧹 Official Cleanup Tool**: For unsupported files, please use SillyTavern's built-in tool: `User Settings` -> `Miscellaneous` -> `Data Cleanup` -> `Scan`.

---

### 🤖 AI Assistance Disclosure
This project's code was generated with the assistance of AI tools (Gemini and DeepSeek) and subsequently reviewed, refined, and tested by a human maintainer. The MIT License applies to the project as a whole. See LICENSE for details.

### 📄 License
This project is licensed under the **MIT License**. See LICENSE for details.

### 🐛 Support
Please open an Issue for bug reports or feature requests.
