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

- ⚡ **增量缓存与极速跨角色扫描**：聊天状态签名缓存于 IndexedDB。无新聊天的角色直接命中本地缓存，**零网络开销**，数秒内即可扫描数百个角色。支持 2–16 并发工作线程，随时暂停/恢复/停止。
- 🛡️ **多层数据安全防护**：
  - **活跃聊天豁免**：当前在 SillyTavern 前台打开的聊天会被自动锁定 (`Active Chat`)，防止前端状态冲突。
  - **防损坏高优警告**：自动检测 **≤ 2 条消息但文件体积异常大**（默认 `≥ 15 KB`，可配置）的文件。这类文件可能是崩溃导致的损坏存档或包含大量世界书的问候，它们会被“一键选择正常”跳过，手动选择时需二次确认。
  - **分支、存档点与父节点保护**：自动构建父子依赖索引。带有依赖存档点的分支和父聊天会被保护，防止故事线被意外截断。
  - **删除前实时校验**：删除前会拉取最新的 `.jsonl` 负载，验证实际消息数是否与缓存一致。空数组或数量不匹配的文件将被自动跳过。
- 🗑️ **网络容错的原子化回收站**：元数据和聊天负载在物理删除前，会通过单次 IndexedDB 事务提交。如果浏览器存储空间不足，删除将自动中止；如果网络中断，备份也会被严格保留。回收站保留时间可配置（5分钟至7天，或永不过期）。
- 👁️ **逐层折叠预览与一键导出**：轻量级纯文本预览（无重型正则或 HTML 渲染）。长聊天自动折叠中间楼层，直达**最后楼层**，并支持一键导出 `.jsonl` 备份到本地。
- 👤 **多用户隔离**：自动根据 SillyTavern 的用户 Handle 隔离 IndexedDB 和设置，同一浏览器下的多账号不会互相看到对方的回收站。

### 📦 安装方法

1. 在 SillyTavern 中，点击顶栏的 **扩展 (Extensions)** 图标（魔方）。
2. 选择 **安装扩展 (Install Extension)**。
3. 粘贴本仓库 URL：`https://github.com/waignin/SillyTavern-ChatCleaner`
4. 点击 **安装 (Install)** 并刷新页面。

> **手动安装**：若使用 `git clone`，请将文件夹放置在 `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/` 下。需要 **SillyTavern 1.17.0+** (推荐)。  
> **锁定特定版本**：可在 URL 后追加标签，例如 `https://github.com/waignin/SillyTavern-ChatCleaner#v1.1.0`。

### 🚀 使用指南

1. 点击 SillyTavern 顶栏的 **🪄 魔法棒** 菜单，选择 **聊天记录管理 / Chat Cleaner**。
2. 使用过滤面板（默认展开），按 **消息数量**（如 `0 ~ 1`）、**文件大小 (KB)** 或 **未活跃天数** 进行筛选，或直接点击快捷预设（如 **≤ 1 条消息**）。
3. 点击任意行的 **预览** 检查内容，或点击 **导出** 将 `.jsonl` 备份下载到本地。
4. 点击 **清理选中项**。被删除的文件将保留在 **回收站** 标签页中（默认 60 分钟，可配置），你可随时还原、导出或将其锁定以防自动过期。

### ⚠️ 安全与注意事项

- **回收站位于浏览器本地**：删除的聊天会备份到 IndexedDB。**请勿在保留期内清除浏览器站点数据或使用无痕模式**，否则备份将丢失。
- **活跃聊天受保护**：当前在前台打开的聊天免于被删除。如需清理，请先切换到其他聊天。
- **永久删除不可逆**：若关闭“自动备份到回收站”或在回收站内点击“彻底销毁”，文件将从磁盘物理移除，本插件无法恢复。
- **外部文件修改**：若你通过操作系统文件管理器手动在 `chats/` 目录下增删了 `.jsonl` 文件，请点击插件内的 **“完整重新扫描”** 以同步缓存。
- **已删除角色的残留聊天**：本插件仅扫描当前角色列表中存在的聊天。已删除角色留下的残留聊天文件夹，请使用 SillyTavern 内置的 **清理菜单** (设置 → 数据清理) 处理。

---

<a id="en-us"></a>
## 🇺🇸 English Documentation

A visual, safety-first global chat file manager and zombie-chat cleaner for **SillyTavern**.  

Over time, SillyTavern users accumulate hundreds or thousands of 1-message "greeting-only" `.jsonl` chat files across dozens of characters. **Chat Cleaner & Manager** lets you scan, filter, preview, export, and batch-clean redundant chat files in seconds—backed by an atomic IndexedDB Trash Bin and multi-layered anti-misclick protections.

### ✨ Key Features

- ⚡ **Incremental Cache & Fast Cross-Character Scan**: Character chat state signatures are cached in IndexedDB. Characters without new chats hit local cache with **0 network overhead**, scanning hundreds of characters in seconds. Supports 2–16 concurrent workers with pause/resume/stop at any time.
- 🛡️ **Multi-Layered Data Safety**:
  - **Active Chat Exemption**: The currently open chat in SillyTavern is automatically locked (`Active Chat`) to prevent frontend state conflicts.
  - **Anti-Corruption High-Risk Warning**: Automatically detects abnormal files with **≤ 2 messages but large file sizes** (default `≥ 15 KB`, configurable)—which may be crash-corrupted long saves or massive lorebook greetings. They are skipped by "Select Normal" presets and require explicit confirmation if manually selected.
  - **Branch, Checkpoint & Parent Protection**: Automatically builds a parent-child dependency index. Branches and parent chats with dependent checkpoints are protected, preventing broken story trees.
  - **Pre-Deletion Live Verification**: Fetches the live `.jsonl` payload before deletion to verify that the actual message count matches the cached count. Empty arrays and mismatched counts are skipped.
- 🗑️ **Network-Resilient Atomic Trash Bin**: Metadata and chat payloads are committed in a single IndexedDB transaction *before* physical deletion. If browser storage is full, deletion is automatically aborted. Trash retention is configurable (5 mins to 7 days, or never).
- 👁️ **Floor-by-Floor Collapsible Preview & Export**: Lightweight pure-text preview (no heavy regex or HTML execution). Automatically folds middle floors for long chats, jumps straight to the **last floor**, and supports one-click `.jsonl` export to your device.
- 👤 **Multi-User Isolation**: Automatically scopes IndexedDB and settings per SillyTavern user handle, so multiple accounts on the same browser do not see each other's Trash Bin.

### 📦 Installation

1. In SillyTavern, open **Extensions** (top bar cubes icon).
2. Select **Install Extension**.
3. Paste the repository URL: `https://github.com/waignin/SillyTavern-ChatCleaner`
4. Click **Install** and refresh the page.

> **Manual Installation**: If installing via `git clone`, place the folder under `SillyTavern/public/scripts/extensions/third-party/SillyTavern-ChatCleaner/`. Requires **SillyTavern 1.17.0+** (recommended).  
> **Pin a specific version**: Append a tag to the URL, e.g., `https://github.com/waignin/SillyTavern-ChatCleaner#v1.1.0`.

### 🚀 Usage

1. Click the **🪄 Magic Wand** menu on the SillyTavern top bar and select **Chat Cleaner**.
2. Use the filter drawer to filter by **Message Count** (e.g., `0 ~ 1`), **File Size (KB)**, or **Inactive Days**, or click a quick preset like **≤ 1 Msg**.
3. Click **Preview** on any row to inspect floors, or **Export** to download a `.jsonl` backup.
4. Click **Clean Selected**. Deleted files are kept in the **Trash Bin** tab (default 60 mins, configurable), where they can be restored, exported, or locked.

### ⚠️ Safety & Risks

- **Trash Bin lives in your browser**: Deleted chats are backed up to IndexedDB. **Do not clear browser site data** or use Incognito during the retention window, or the backups are lost.
- **Active Chat is protected**: The chat currently open in the foreground is exempt from deletion. Switch to another chat first if you want to clean it.
- **Permanent deletion is permanent**: If you disable "Auto Backup to Trash Bin" or click "Destroy" inside the Trash Bin, files are physically removed from disk and cannot be recovered by this extension.
- **External file edits**: If you manually add/modify `.jsonl` files inside `chats/` via OS file explorer, click **"Full Rescan"** to sync the plugin's cache.
- **Orphan chats from deleted characters**: This extension only scans chat records belonging to characters currently in your roster. Leftover chat folders from deleted characters should be handled by SillyTavern's built-in **Clean-Up Menu** (Settings → Data Cleanup).

---

### 🤖 AI Assistance Disclosure
This project's code was generated with the assistance of AI tools (Gemini and DeepSeek) and subsequently reviewed, refined, and tested by a human maintainer. The MIT License applies to the project as a whole. See LICENSE for details.

### 📄 License
This project is licensed under the **MIT License**. See LICENSE for details.

### 🐛 Support
Please open an Issue for bug reports or feature requests.
