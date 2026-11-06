import { characters, this_chid, getRequestHeaders } from '../../../../script.js';

const DB_NAME = 'SillyTavern_ChatCleaner_DB_V1';
const DB_VERSION = 1;
const STORE_CACHE = 'scan_cache';         // 角色聊天列表缓存
const STORE_TRASH_META = 'trash_meta';    // 回收站轻量元数据
const STORE_TRASH_DATA = 'trash_payload'; // 回收站聊天正文数据

const SETTINGS_KEY = 'cmp_settings_v1';
const DISCLAIMER_KEY = 'cmp_disclaimer_v1';

const DEFAULT_SETTINGS = {
    lang: 'zh',                // 默认中文 ('zh' | 'en')
    theme: 'dark',
    fontSize: 14,
    safeBackupMode: true,
    verifyBeforeDelete: true,
    largeZombieWarn: true,     // 异常大体积少消息警告开关
    largeZombieSizeKB: 15,     // 触发异常大体积警告的阈值 (KB)
    concurrency: 8
};

// ============================================================================
// 0. 零依赖内置中/英双语字典 (I18N)
// ============================================================================
const I18N = {
    zh: {
        menuBtn: '聊天记录管理',
        menuTitle: '打开聊天记录管理器',
        appTitle: '聊天记录管理器 v1.0',
        helpTip: '实现原理、防误触机制与风险提示',
        resetUiBtn: '恢复默认外观',
        resetUiTip: '仅恢复默认深色配色与14px标准字号，不影响安全设置',
        closeBtn: '✕ 关闭',
        tabManager: '聊天列表',
        tabTrash: '回收站 (60分钟)',
        tabSettings: '设置',
        statusReady: '就绪',
        pauseBtn: '暂停',
        resumeBtn: '继续',
        stopBtn: '停止',
        searchPlaceholder: '搜索角色卡名称 / 聊天文件名...',
        sortMsgAsc: '条数 ↑ (少→多)',
        sortMsgDesc: '条数 ↓ (多→少)',
        sortSizeDesc: '大小 ↓ (大→小)',
        sortSizeAsc: '大小 ↑ (小→大)',
        sortTimeDesc: '最后对话 ↓ (最新)',
        sortTimeAsc: '最后对话 ↑ (最旧)',
        sortNameAsc: '角色名 (A→Z)',
        drawerHide: '收起筛选',
        drawerShow: '展开筛选',
        scanFast: '快速扫描',
        scanFastTip: '仅扫描有新变动或未缓存的角色卡',
        scanFull: '全量重扫',
        scanFullTip: '重新扫描所有角色卡并刷新缓存',
        lblMsgCount: '消息数:',
        lblSizeKB: '大小(KB):',
        lblInactiveDays: '未对话≥:',
        lblDays: '天',
        lblIncludeUnknown: '含未知时间',
        tipIncludeUnknown: '勾选后，按天数筛选时也会包含因手动改名而无法识别时间的记录',
        lblPresets: '快捷筛选并勾选 (自动跳过慎删项):',
        presetZombie: '≤ 1 条消息 (废档)',
        presetShort: '≤ 5 条消息 (短档)',
        presetAll: '显示全部 (清空勾选)',
        thAvatar: '头像',
        thChar: '角色卡',
        thFile: '记录文件名 / 状态标签',
        thMsg: '消息数',
        thSize: '大小',
        thTime: '最后对话时间',
        thActions: '操作',
        thScale: '规模',
        thStatus: '状态',
        selectAllNormal: '全选普通项',
        selectAllTip: '仅全选或取消普通记录，不会影响您手动勾选的慎删项',
        waitingScan: '等待扫描...',
        deleteSelectedBtn: '清理选中项',
        trashSearchPlaceholder: '搜索回收站内的角色名 / 文件名...',
        restoreAllBtn: '全部恢复',
        clearUnlockedBtn: '清空未加锁',
        emptyManagerList: '没有找到符合当前筛选条件的聊天记录',
        emptyTrashList: '没有匹配的回收站记录',
        unknownTime: '未知时间',
        unitItems: '条',
        btnPreview: '预览',
        btnExport: '导出',
        btnRestore: '恢复',
        btnLock: '加锁',
        btnUnlock: '解锁',
        btnDestroy: '销毁',
        tagLocked: '已加锁',
        tagExpireIn: '{min} 分钟后销毁',
        tagActive: '当前打开',
        tipActive: '当前正在前台打开的活跃聊天，请先在酒馆切换到其他聊天后再清理',
        tagLargeZombie: '大体积少消息(慎删)',
        tipLargeZombie: '文件达 {size} 但仅显示 {count} 条消息，可能是酒馆崩溃导致的坏档或含巨型元数据。全选默认跳过，可手动勾选强制清理。',
        tagBackup: '备份文件',
        tipBackup: '识别为备份存档文件，全选默认跳过，可手动勾选清理',
        tagCheckpoint: '分支/书签',
        tipCheckpoint: '依据文件名或元数据特征识别为分支/书签节点（手动改名可能无法识别）',
        footerStat: '已选 <b style="color:var(--cmp-accent);">{sel}</b>/{selectable} 可选项 (<b>{size}</b>){extra}',
        footerExtraRisk: ' <span style="color:#fca5a5 !important; font-weight:600;">[含慎删 {n} 项]</span>',
        footerExtraExempt: ' <span style="opacity:0.75;">[已豁免 {n} 项]</span>',
        setLangTitle: '界面语言 / Language',
        setLangDesc: '切换插件界面与提示弹窗的显示语言。',
        setResetTitle: '恢复默认外观预设',
        setResetDesc: '仅重置配色方案与 14px 标准字号，不会改动下方的安全与并发设置。',
        setThemeTitle: '界面配色风格',
        setThemeDesc: '选择插件界面的配色方案。',
        themeDark: '深空灰蓝 (默认)',
        themeOled: '纯黑底色 (OLED)',
        themeForest: '暗青护眼',
        themeNative: '跟随酒馆当前主题',
        setFontTitle: '字体大小',
        setFontDesc: '调整插件界面的文字显示比例。',
        setLargeWarnTitle: '异常大体积少消息防误触警告 (防误删坏档)',
        setLargeWarnDesc: '当消息数 ≤2 条但体积达到设定阈值时标为「慎删」，全选时默认跳过，手动勾选删除时弹出高危确认。',
        setLargeKBLabel: '阈值(KB):',
        setVerifyTitle: '删除前核对文件状态 (安全锁)',
        setVerifyDesc: '执行删除时读取文件实际消息数，若与缓存列表不一致则跳过删除并在后台触发刷新。',
        setBackupTitle: '删除前自动备份至回收站 (安全锁)',
        setBackupDesc: '开启后被删文件将在回收站保留 60 分钟，期间可恢复、导出或加锁。关闭且回收站为空时将隐藏回收站入口。',
        setConcurrencyTitle: '扫描并发请求数',
        setConcurrencyDesc: '同时请求的角色卡数量（建议 6 ~ 12）。'
    },
    en: {
        menuBtn: 'Chat Cleaner',
        menuTitle: 'Open Chat Cleaner & Manager',
        appTitle: 'Chat Cleaner & Manager v1.0',
        helpTip: 'How it works, Safety Mechanisms & Risk Notice',
        resetUiBtn: 'Reset Appearance',
        resetUiTip: 'Reset theme and 14px font size only (keeps safety settings)',
        closeBtn: '✕ Close',
        tabManager: 'Chat List',
        tabTrash: 'Trash Bin (60m)',
        tabSettings: 'Settings',
        statusReady: 'Ready',
        pauseBtn: 'Pause',
        resumeBtn: 'Resume',
        stopBtn: 'Stop',
        searchPlaceholder: 'Search character name / chat file name...',
        sortMsgAsc: 'Messages ↑ (Low→High)',
        sortMsgDesc: 'Messages ↓ (High→Low)',
        sortSizeDesc: 'Size ↓ (Large→Small)',
        sortSizeAsc: 'Size ↑ (Small→Large)',
        sortTimeDesc: 'Last Chat ↓ (Newest)',
        sortTimeAsc: 'Last Chat ↑ (Oldest)',
        sortNameAsc: 'Character (A→Z)',
        drawerHide: 'Hide Filters',
        drawerShow: 'Show Filters',
        scanFast: 'Quick Scan',
        scanFastTip: 'Scan only modified or uncached characters',
        scanFull: 'Full Rescan',
        scanFullTip: 'Rescan all characters and rebuild cache',
        lblMsgCount: 'Msgs:',
        lblSizeKB: 'Size(KB):',
        lblInactiveDays: 'Inactive≥:',
        lblDays: 'd',
        lblIncludeUnknown: 'Include Unknown Time',
        tipIncludeUnknown: 'Include renamed files without recognizable timestamps when filtering by days',
        lblPresets: 'Quick Presets (Skips High-Risk Items):',
        presetZombie: '≤ 1 Msg (Empty/Greeting)',
        presetShort: '≤ 5 Msgs (Short)',
        presetAll: 'Show All (Clear Selection)',
        thAvatar: 'Avatar',
        thChar: 'Character',
        thFile: 'Chat File Name / Status Tags',
        thMsg: 'Msgs',
        thSize: 'Size',
        thTime: 'Last Chat Time',
        thActions: 'Actions',
        thScale: 'Scale',
        thStatus: 'Status',
        selectAllNormal: 'Select Normal',
        selectAllTip: 'Select/Deselect normal items only (preserves manually checked high-risk items)',
        waitingScan: 'Waiting for scan...',
        deleteSelectedBtn: 'Clean Selected',
        trashSearchPlaceholder: 'Search character / file name in Trash...',
        restoreAllBtn: 'Restore All',
        clearUnlockedBtn: 'Empty Unlocked',
        emptyManagerList: 'No chat records match the current filter criteria',
        emptyTrashList: 'No matching records in the Trash Bin',
        unknownTime: 'Unknown Time',
        unitItems: 'msg(s)',
        btnPreview: 'Preview',
        btnExport: 'Export',
        btnRestore: 'Restore',
        btnLock: 'Lock',
        btnUnlock: 'Unlock',
        btnDestroy: 'Destroy',
        tagLocked: 'Locked',
        tagExpireIn: 'Expires in {min}m',
        tagActive: 'Active Chat',
        tipActive: 'Currently open in SillyTavern. Switch to another chat before cleaning.',
        tagLargeZombie: 'Large File / Few Msgs',
        tipLargeZombie: 'Size is {size} with only {count} msg(s). Might be a crash-corrupted save or huge lorebook greeting. Skipped by Select All; check manually to force clean.',
        tagBackup: 'Backup File',
        tipBackup: 'Identified as a backup file. Skipped by Select All; check manually to clean.',
        tagCheckpoint: 'Checkpoint/Branch',
        tipCheckpoint: 'Identified as a branch/checkpoint via filename or metadata (renamed branches may not be detected).',
        footerStat: 'Selected <b style="color:var(--cmp-accent);">{sel}</b>/{selectable} selectable (<b>{size}</b>){extra}',
        footerExtraRisk: ' <span style="color:#fca5a5 !important; font-weight:600;">[{n} High-Risk]</span>',
        footerExtraExempt: ' <span style="opacity:0.75;">[{n} Exempt]</span>',
        setLangTitle: 'Language / 界面语言',
        setLangDesc: 'Switch display language for UI and confirmation dialogs.',
        setResetTitle: 'Reset Default Appearance',
        setResetDesc: 'Resets color theme and 14px font size only. Safety settings remain untouched.',
        setThemeTitle: 'Color Theme',
        setThemeDesc: 'Choose color palette for the manager window.',
        themeDark: 'Deep Slate Blue (Default)',
        themeOled: 'Pure Black (OLED)',
        themeForest: 'Dark Teal (Eye Care)',
        themeNative: 'Follow SillyTavern Theme',
        setFontTitle: 'Font Size',
        setFontDesc: 'Adjust text scale inside the manager.',
        setLargeWarnTitle: 'Large-Size & Few-Messages Warning (Anti-Corruption)',
        setLargeWarnDesc: 'Flags files with ≤2 msgs but size ≥ threshold as High-Risk. Skipped by Select All; requires confirmation to delete.',
        setLargeKBLabel: 'Threshold(KB):',
        setVerifyTitle: 'Verify File State Before Delete (Safety Lock)',
        setVerifyDesc: 'Checks live message count before deleting. Skips if count differs from cache and triggers resync.',
        setBackupTitle: 'Auto Backup to Trash Bin Before Delete (Safety Lock)',
        setBackupDesc: 'Keeps deleted chats in local IndexedDB for 60 mins (restorable & lockable). Hides Trash tab when off and empty.',
        setConcurrencyTitle: 'Scan Concurrency',
        setConcurrencyDesc: 'Number of simultaneous character requests during scan (Recommended: 6 ~ 12).'
    }
};

function t(key, vars = {}) {
    const lang = State?.settings?.lang === 'en' ? 'en' : 'zh';
    let str = I18N[lang][key] ?? I18N.zh[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
    }
    return str;
}

function isEn() {
    return State?.settings?.lang === 'en';
}

function sanitizeSettings(rawObj) {
    const merged = { ...DEFAULT_SETTINGS, ...(rawObj || {}) };
    merged.lang = merged.lang === 'en' ? 'en' : 'zh';
    const validThemes = ['dark', 'oled', 'forest', 'st-native'];
    merged.theme = validThemes.includes(merged.theme) ? merged.theme : 'dark';
    merged.fontSize = Math.min(18, Math.max(12, Number(merged.fontSize) || 14));
    merged.concurrency = Math.min(16, Math.max(2, Number(merged.concurrency) || 8));
    merged.safeBackupMode = Boolean(merged.safeBackupMode);
    merged.verifyBeforeDelete = Boolean(merged.verifyBeforeDelete);
    merged.largeZombieWarn = Boolean(merged.largeZombieWarn);
    merged.largeZombieSizeKB = Math.min(10240, Math.max(5, Number(merged.largeZombieSizeKB) || 15));
    return merged;
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return sanitizeSettings(raw ? JSON.parse(raw) : null);
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

const State = {
    settings: loadSettings(),
    allRecords: [],
    filteredRecords: [],
    selectedIds: new Set(),
    manualHighRiskIds: new Set(),
    trashMetaList: [],
    taskStatus: 'idle',
    prevStatus: null,
    abortFlag: false,
    pausePromise: null,
    pauseResolve: null,
    activeTab: 'manager',
    drawerOpen: true,
    hasInitialLoaded: false,
    modalOpening: false,
    previewLoading: false
};

function saveSettings(cfg) {
    State.settings = sanitizeSettings(cfg);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(State.settings));
    applyAppearance();
    updateTrashTabVisibility();
}

function applyAppearance() {
    const $ov = $('#cmp-overlay');
    if (!$ov.length) return;
    $ov.attr('data-theme', State.settings.theme);
    $ov.css('--cmp-font-size', `${State.settings.fontSize}px`);
}

function updateTrashTabVisibility() {
    const $trashTab = $('.cmp-tab[data-tab="trash"]');
    if (!$trashTab.length) return;
    if (!State.settings.safeBackupMode && State.trashMetaList.length === 0) {
        $trashTab.hide();
        if (State.activeTab === 'trash') {
            $('.cmp-tab[data-tab="manager"]').trigger('click');
        }
    } else {
        $trashTab.show();
    }
}

// ============================================================================
// 1. IndexedDB 存储层（支持多表原子事务、异常区分与断线重连）
// ============================================================================
let dbPromise = null;
function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_CACHE)) {
                db.createObjectStore(STORE_CACHE, { keyPath: 'avatar' });
            }
            if (!db.objectStoreNames.contains(STORE_TRASH_META)) {
                db.createObjectStore(STORE_TRASH_META, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_TRASH_DATA)) {
                db.createObjectStore(STORE_TRASH_DATA, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => {
            const db = req.result;
            db.onclose = () => { dbPromise = null; };
            resolve(db);
        };
        req.onerror = () => {
            dbPromise = null;
            reject(req.error);
        };
    });
    return dbPromise;
}

async function dbGet(store, key) {
    try {
        const db = await getDB();
        return await new Promise((r) => {
            const req = db.transaction(store, 'readonly').objectStore(store).get(key);
            req.onsuccess = () => r(req.result || null);
            req.onerror = () => r(null);
        });
    } catch {
        return null;
    }
}

async function dbPut(store, val) {
    try {
        const db = await getDB();
        return await new Promise((r) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).put(val);
            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
            tx.onabort = () => r(false);
        });
    } catch {
        return false;
    }
}

async function dbDelete(store, key) {
    try {
        const db = await getDB();
        return await new Promise((r) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).delete(key);
            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
            tx.onabort = () => r(false);
        });
    } catch {
        return false;
    }
}

async function dbGetAll(store) {
    try {
        const db = await getDB();
        return await new Promise((r) => {
            const req = db.transaction(store, 'readonly').objectStore(store).getAll();
            req.onsuccess = () => r(Array.isArray(req.result) ? req.result : []);
            req.onerror = () => r(null);
        });
    } catch {
        return null;
    }
}

async function dbSaveTrashPair(metaObj, payloadObj) {
    try {
        const db = await getDB();
        return await new Promise((r) => {
            const tx = db.transaction([STORE_TRASH_META, STORE_TRASH_DATA], 'readwrite');
            tx.objectStore(STORE_TRASH_META).put(metaObj);
            tx.objectStore(STORE_TRASH_DATA).put(payloadObj);
            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
            tx.onabort = () => r(false);
        });
    } catch {
        return false;
    }
}

async function dbDeleteTrashBatch(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return true;
    try {
        const db = await getDB();
        const CHUNK_SIZE = 50;
        for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
            const slice = ids.slice(i, i + CHUNK_SIZE);
            const ok = await new Promise((r) => {
                const tx = db.transaction([STORE_TRASH_META, STORE_TRASH_DATA], 'readwrite');
                const metaStore = tx.objectStore(STORE_TRASH_META);
                const dataStore = tx.objectStore(STORE_TRASH_DATA);
                for (const id of slice) {
                    metaStore.delete(id);
                    dataStore.delete(id);
                }
                tx.oncomplete = () => r(true);
                tx.onerror = () => r(false);
                tx.onabort = () => r(false);
            });
            if (!ok) return false;
        }
        return true;
    } catch {
        return false;
    }
}

async function removeTrashRecord(id) {
    const ok = await dbDeleteTrashBatch([id]);
    if (ok) {
        State.trashMetaList = State.trashMetaList.filter((item) => item.id !== id);
        $('#cmp-trash-badge').text(State.trashMetaList.length);
        updateTrashTabVisibility();
    }
    return ok;
}

async function purgeExpiredTrash() {
    try {
        const metas = await dbGetAll(STORE_TRASH_META);
        if (!Array.isArray(metas)) return;

        const now = Date.now();
        const expiredIds = metas.filter((m) => !m.locked && now >= m.expiresAt).map((m) => m.id);

        let changed = false;
        if (expiredIds.length > 0) {
            changed = await dbDeleteTrashBatch(expiredIds);
        }

        if (changed || State.trashMetaList.length !== metas.length - (changed ? expiredIds.length : 0)) {
            const freshMetas = await dbGetAll(STORE_TRASH_META);
            if (!Array.isArray(freshMetas)) return;
            State.trashMetaList = freshMetas.sort((a, b) => b.deletedAt - a.deletedAt);
            $('#cmp-trash-badge').text(State.trashMetaList.length);
            updateTrashTabVisibility();
            if (changed && State.activeTab === 'trash' && $('#cmp-overlay').is(':visible')) {
                renderTrashTable();
            }
        }
    } catch (e) {
        console.warn('[ChatCleaner] Trash expiration check error:', e);
    }
}

if (window.__cmp_purge_interval) clearInterval(window.__cmp_purge_interval);
window.__cmp_purge_interval = setInterval(purgeExpiredTrash, 60000);

// ============================================================================
// 2. 工具函数、时间解析与风险标记评估
// ============================================================================
function debounce(fn, wait = 120) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

function parseSizeKB(val) {
    if (typeof val === 'number') return val;
    if (!val) return 1.0;
    const s = String(val).trim().toUpperCase();
    const n = parseFloat(s);
    if (isNaN(n)) return 1.0;
    if (s.includes('GB')) return +(n * 1024 * 1024).toFixed(1);
    if (s.includes('MB')) return +(n * 1024).toFixed(1);
    if (s.includes('B') && !s.includes('KB')) return +(n / 1024).toFixed(1);
    return +n.toFixed(1);
}

function isReasonableTimestamp(ts) {
    const minValid = 946684800000; // 2000-01-01
    const maxValid = Date.now() + 86400000 * 2;
    return typeof ts === 'number' && !isNaN(ts) && ts >= minValid && ts <= maxValid;
}

function parseTimestamp(info, fileName) {
    if (info && typeof info === 'object') {
        const raw = info.last_mes || info.last_chat || info.date || info.create_date;
        if (typeof raw === 'number' && isReasonableTimestamp(raw)) {
            return raw;
        }
        if (typeof raw === 'string' && raw.trim()) {
            const trimmed = raw.trim();
            const stMatch = trimmed.match(
                /(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s*@?\s*(\d{1,2})h\s*(\d{1,2})m(?:\s*(\d{1,2})s)?/i
            );
            if (stMatch) {
                const t = new Date(
                    Number(stMatch[1]),
                    Number(stMatch[2]) - 1,
                    Number(stMatch[3]),
                    Number(stMatch[4]),
                    Number(stMatch[5]),
                    Number(stMatch[6] || 0)
                ).getTime();
                if (isReasonableTimestamp(t)) return t;
            }
            const normalized = trimmed.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
            const parsed = Date.parse(normalized);
            if (isReasonableTimestamp(parsed)) return parsed;
        }
    }
    const m = String(fileName).match(/(\d{4})[-_](\d{1,2})[-_](\d{1,2})/);
    if (m) {
        const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
        if (isReasonableTimestamp(t)) return t;
    }
    return 0;
}

function formatTime(ts) {
    if (!ts || ts <= 0) return t('unknownTime');
    const d = new Date(ts);
    if (isNaN(d.getTime())) return t('unknownTime');
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function formatSize(kb) {
    return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
}

const HTML_ESCAPE_MAP = {
    '&': '\x26amp;',
    '<': '\x26lt;',
    '>': '\x26gt;',
    '"': '\x26quot;',
    "'": '\x26#39;'
};

function escapeHtml(val) {
    if (val === 0) return '0';
    return String(val || '').replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

function buildSafeAvatarUrl(avatarFile) {
    return `/characters/${encodeURIComponent(avatarFile || '')}`;
}

function evaluateProtection(avatarFile, cleanFile, rawFile, msgCount, sizeKB, infoObj) {
    try {
        if (this_chid !== undefined && Array.isArray(characters) && characters[this_chid]) {
            const activeChar = characters[this_chid];
            const activeChat = String(activeChar.chat || '').replace(/\.jsonl$/i, '');
            if (activeChar.avatar === avatarFile && activeChat === cleanFile) {
                return {
                    exempt: true,
                    highRisk: false,
                    reason: 'active',
                    label: t('tagActive'),
                    tip: t('tipActive')
                };
            }
        }

        const warnEnabled = State.settings.largeZombieWarn;
        const warnThresholdKB = Number(State.settings.largeZombieSizeKB) || 15;
        if (warnEnabled && msgCount <= 2 && sizeKB >= warnThresholdKB) {
            return {
                exempt: false,
                highRisk: true,
                reason: 'corrupted_large',
                label: t('tagLargeZombie'),
                tip: t('tipLargeZombie', { size: formatSize(sizeKB), count: msgCount })
            };
        }

        const lowerRaw = String(rawFile).toLowerCase();
        const lowerClean = String(cleanFile).toLowerCase();
        if (
            lowerRaw.includes('.bak') ||
            /^chat_\d+/i.test(lowerClean) ||
            /(?:^|[_\-\s])(backup|bak|auto_backup|restore)(?:$|[_\-\s\d])/i.test(lowerClean)
        ) {
            return {
                exempt: false,
                highRisk: true,
                reason: 'backup',
                label: t('tagBackup'),
                tip: t('tipBackup')
            };
        }

        const hasParentChat = Boolean(infoObj && typeof infoObj.main_chat === 'string' && infoObj.main_chat.trim().length > 0);
        const isCheckpoint =
            hasParentChat ||
            lowerClean.includes('checkpoint') ||
            lowerClean.includes('branch') ||
            lowerClean.includes('书签') ||
            lowerClean.includes('分支');

        if (isCheckpoint) {
            return {
                exempt: false,
                highRisk: false,
                reason: 'checkpoint',
                label: t('tagCheckpoint'),
                tip: t('tipCheckpoint')
            };
        }
    } catch (e) {
        console.warn('[ChatCleaner] Protection eval error:', e);
    }

    return { exempt: false, highRisk: false, reason: null, label: '', tip: '' };
}

function refreshAllRecordsProtection() {
    for (const r of State.allRecords) {
        const prot = evaluateProtection(r.avatarFile, r.chatFile, r.rawFileName, r.msgCount, r.sizeKB, {
            main_chat: r.parentChat
        });
        r.exempt = prot.exempt;
        r.highRisk = prot.highRisk;
        r.reason = prot.reason;
        r.label = prot.label;
        r.tip = prot.tip;

        if (!r.highRisk) {
            // 若当前已不再是 highRisk（如关闭了警告开关或调高了阈值），从手动高危集合中移除，保持状态自洽
            State.manualHighRiskIds.delete(r.id);
        }

        if (r.exempt) {
            State.selectedIds.delete(r.id);
            State.manualHighRiskIds.delete(r.id);
        } else if (r.highRisk && State.selectedIds.has(r.id) && !State.manualHighRiskIds.has(r.id)) {
            State.selectedIds.delete(r.id);
        }
    }
}

function setStatusUI(pct, htmlText) {
    $('#cmp-progress-fill').css('width', `${pct}%`);
    $('#cmp-status-text').html(htmlText);
}

// ============================================================================
// 3. 并发安全的暂停/恢复/终止控制器
// ============================================================================
function pauseTask() {
    if (State.taskStatus !== 'scanning' && State.taskStatus !== 'deleting') return;
    if (State.pausePromise) return;
    State.prevStatus = State.taskStatus;
    State.taskStatus = 'paused';
    State.pausePromise = new Promise((resolve) => {
        State.pauseResolve = resolve;
    });
    updateControlButtons();
    setStatusUI(50, isEn() ? 'Task paused. Click "Resume" to continue.' : '任务已暂停，点击“继续”恢复执行');
}

function resumeTask() {
    if (State.taskStatus !== 'paused') return;
    State.taskStatus = State.prevStatus || 'scanning';
    const resolve = State.pauseResolve;
    State.pausePromise = null;
    State.pauseResolve = null;
    if (resolve) resolve();
    updateControlButtons();
}

function stopTask() {
    State.abortFlag = true;
    if (State.taskStatus === 'paused') {
        const resolve = State.pauseResolve;
        State.pausePromise = null;
        State.pauseResolve = null;
        if (resolve) resolve();
    }
}

async function checkPauseAndAbort() {
    if (State.abortFlag) return false;
    if (State.pausePromise) {
        await State.pausePromise;
    }
    return !State.abortFlag;
}

function getCharSignature(char) {
    return `${char.date_last_chat || 0}__${char.chat || ''}__${char.chat_size || 0}`;
}

function isCharacterEmpty(char) {
    return !char.chat && (!char.date_last_chat || Number(char.date_last_chat) === 0);
}

// ============================================================================
// 4. 增量缓存扫描引擎
// ============================================================================
async function runIncrementalOrFullScan(forceFull = false) {
    if (State.taskStatus !== 'idle') return;

    State.taskStatus = 'scanning';
    State.abortFlag = false;
    updateControlButtons();

    try {
        const cachedGroups = (await dbGetAll(STORE_CACHE)) || [];
        const cacheMap = new Map();
        for (const g of cachedGroups) {
            cacheMap.set(g.avatar, g);
        }

        const totalChars = characters.length;
        const activeAvatars = new Set();
        const collected = [];
        let done = 0;
        let skippedEmpty = 0;
        let cacheHits = 0;
        let networkFetched = 0;
        let errorCount = 0;

        const threads = Math.max(2, Math.min(16, Number(State.settings.concurrency) || 8));
        let cursor = 0;

        setStatusUI(0, isEn() ? `Scanning characters (${totalChars})...` : `正在检索角色卡 (${totalChars} 张)...`);

        async function worker() {
            while (cursor < totalChars) {
                if (!(await checkPauseAndAbort())) return;

                const idx = cursor++;
                if (idx >= totalChars) return;

                const char = characters[idx];
                if (!char || !char.avatar) {
                    done++;
                    continue;
                }

                const avatar = char.avatar;
                activeAvatars.add(avatar);
                const name = char.name || avatar.replace(/\.[^/.]+$/, '');
                const sig = getCharSignature(char);
                const cached = cacheMap.get(avatar);

                if (!forceFull && isCharacterEmpty(char) && !cached) {
                    skippedEmpty++;
                    done++;
                    continue;
                }

                if (!forceFull && cached && cached.signature === sig && Array.isArray(cached.records)) {
                    cacheHits++;
                    for (const rec of cached.records) {
                        const prot = evaluateProtection(rec.avatarFile, rec.chatFile, rec.rawFileName, rec.msgCount, rec.sizeKB, {
                            main_chat: rec.parentChat
                        });
                        collected.push({ ...rec, ...prot });
                    }
                    done++;
                    if (done % 20 === 0 || done === totalChars) {
                        const pct = Math.round((done / totalChars) * 100);
                        setStatusUI(
                            pct,
                            isEn()
                                ? `Scanning (${done}/${totalChars}) | Cache: ${cacheHits} | Empty: ${skippedEmpty} | Fetched: ${networkFetched}`
                                : `检索中 (${done}/${totalChars}) | 缓存: ${cacheHits} | 跳过空卡: ${skippedEmpty} | 请求: ${networkFetched}`
                        );
                    }
                    continue;
                }

                try {
                    networkFetched++;
                    const res = await fetch('/api/characters/chats', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({ avatar_url: avatar })
                    });

                    if (res.ok) {
                        const chatData = await res.json();
                        const entries = Array.isArray(chatData) ? chatData : Object.values(chatData);
                        const charRecords = [];

                        for (const info of entries) {
                            if (!info) continue;
                            const rawFile = typeof info === 'string' ? info : info.file_name;
                            if (!rawFile) continue;

                            const cleanFile = rawFile.replace(/\.jsonl$/i, '');
                            const fullFileName = rawFile.endsWith('.jsonl') ? rawFile : `${cleanFile}.jsonl`;
                            const msgCount = (typeof info === 'object' && info.chat_items !== undefined)
                                ? Number(info.chat_items)
                                : 1;
                            const sizeKB = (typeof info === 'object' && info.file_size !== undefined)
                                ? parseSizeKB(info.file_size)
                                : 1.2;
                            const lastTime = parseTimestamp(info, cleanFile);
                            const parentChat = (typeof info === 'object' && typeof info.main_chat === 'string') ? info.main_chat : '';
                            const prot = evaluateProtection(avatar, cleanFile, fullFileName, msgCount, sizeKB, info);

                            charRecords.push({
                                id: `${avatar}::${cleanFile}`,
                                charName: name,
                                avatarFile: avatar,
                                avatarUrl: buildSafeAvatarUrl(avatar),
                                chatFile: cleanFile,
                                rawFileName: fullFileName,
                                msgCount,
                                sizeKB,
                                lastTime,
                                parentChat,
                                ...prot
                            });
                        }

                        for (const r of charRecords) {
                            collected.push(r);
                        }
                        await dbPut(STORE_CACHE, { avatar, signature: sig, records: charRecords });
                    } else {
                        errorCount++;
                        if (cached && Array.isArray(cached.records)) {
                            for (const r of cached.records) collected.push(r);
                        }
                    }
                } catch (e) {
                    errorCount++;
                    console.warn(`[ChatCleaner] Failed to fetch chats for ${name}, falling back to cache:`, e);
                    if (cached && Array.isArray(cached.records)) {
                        for (const r of cached.records) collected.push(r);
                    }
                }

                done++;
                const pct = Math.round((done / totalChars) * 100);
                setStatusUI(
                    pct,
                    isEn()
                        ? `Scanning (${done}/${totalChars}) | Cache: ${cacheHits} | Empty: ${skippedEmpty} | Fetched: ${networkFetched}`
                        : `检索中 (${done}/${totalChars}) | 缓存: ${cacheHits} | 跳过空卡: ${skippedEmpty} | 请求: ${networkFetched}`
                );
            }
        }

        await Promise.all(Array.from({ length: Math.min(threads, Math.max(1, totalChars)) }, () => worker()));

        if (State.abortFlag) {
            if (State.allRecords.length > 0) {
                setStatusUI(
                    0,
                    isEn()
                        ? `Scan stopped. Retained existing ${State.allRecords.length} records.`
                        : `扫描已手动终止，已保留原有的 ${State.allRecords.length} 份完整列表。`
                );
                toastr.info(isEn() ? 'Scan aborted. Existing list retained.' : '扫描已终止，保留原有列表数据');
            } else {
                State.allRecords = collected;
                setStatusUI(
                    0,
                    isEn()
                        ? `Scan stopped (${collected.length} partial records loaded).`
                        : `扫描已手动停止（已加载部分记录 ${collected.length} 份）。`
                );
                applyFiltersAndRender(false);
            }
        } else {
            for (const cachedAvatar of cacheMap.keys()) {
                if (!activeAvatars.has(cachedAvatar)) {
                    await dbDelete(STORE_CACHE, cachedAvatar);
                }
            }

            State.allRecords = collected;
            State.hasInitialLoaded = true;
            setStatusUI(
                100,
                isEn()
                    ? `Done: <b>${collected.length}</b> chats (Cache: ${cacheHits}, Empty: ${skippedEmpty}, Fetched: ${networkFetched}${errorCount ? `, Fallback: ${errorCount}` : ''})`
                    : `完成：共 <b>${collected.length}</b> 份记录（缓存命中 ${cacheHits}，跳过空卡 ${skippedEmpty}，请求 ${networkFetched}${errorCount ? `，失败回退 ${errorCount}` : ''}）`
            );
            applyFiltersAndRender(false);
        }
    } catch (err) {
        console.error('[ChatCleaner] Scan error:', err);
        toastr.error((isEn() ? 'Scan error: ' : '扫描出现异常: ') + escapeHtml(err.message));
    } finally {
        State.taskStatus = 'idle';
        State.pausePromise = null;
        State.pauseResolve = null;
        updateControlButtons();
    }
}

// ============================================================================
// 5. 列表筛选、排序与渲染
// ============================================================================
function applyFiltersAndRender(resetSelection = false) {
    const kw = ($('#cmp-search-input').val() || '').trim().toLowerCase();
    const minMsg = $('#cmp-min-msg').val() === '' ? 0 : Number($('#cmp-min-msg').val());
    const maxMsg = $('#cmp-max-msg').val() === '' ? Infinity : Number($('#cmp-max-msg').val());
    const minSize = $('#cmp-min-size').val() === '' ? 0 : Number($('#cmp-min-size').val());
    const maxSize = $('#cmp-max-size').val() === '' ? Infinity : Number($('#cmp-max-size').val());
    const minDays = $('#cmp-min-days').val() === '' ? 0 : Number($('#cmp-min-days').val());
    const includeUnknownTime = $('#cmp-include-unknown-time').is(':checked');
    const sortBy = $('#cmp-sort-select').val() || 'msg_asc';
    const now = Date.now();

    if (resetSelection) {
        State.selectedIds.clear();
        State.manualHighRiskIds.clear();
    }

    refreshAllRecordsProtection();

    State.filteredRecords = State.allRecords.filter((r) => {
        if (kw && !r.charName.toLowerCase().includes(kw) && !r.chatFile.toLowerCase().includes(kw)) {
            return false;
        }
        if (r.msgCount < minMsg || r.msgCount > maxMsg) return false;
        if (r.sizeKB < minSize || r.sizeKB > maxSize) return false;
        if (minDays > 0) {
            if (!r.lastTime || r.lastTime <= 0) {
                if (!includeUnknownTime) return false;
            } else {
                const daysDiff = (now - r.lastTime) / 86400000;
                if (daysDiff < minDays) return false;
            }
        }
        return true;
    });

    State.filteredRecords.sort((a, b) => {
        switch (sortBy) {
            case 'msg_asc': return a.msgCount - b.msgCount || b.sizeKB - a.sizeKB;
            case 'msg_desc': return b.msgCount - a.msgCount;
            case 'size_desc': return b.sizeKB - a.sizeKB;
            case 'size_asc': return a.sizeKB - b.sizeKB;
            case 'time_desc': return (b.lastTime || 0) - (a.lastTime || 0);
            case 'time_asc': return (a.lastTime || Infinity) - (b.lastTime || Infinity);
            case 'name_asc': return a.charName.localeCompare(b.charName, 'zh-CN');
            default: return 0;
        }
    });

    renderManagerTable();
}

function renderManagerTable() {
    const $tbody = $('#cmp-tbody');
    if (State.filteredRecords.length === 0) {
        $tbody.html(`<tr><td colspan="8" style="text-align:center; padding:40px 15px; color:var(--cmp-text-sub) !important;">${escapeHtml(t('emptyManagerList'))}</td></tr>`);
        syncSelectAllCheckbox();
        updateFooterSummary();
        return;
    }

    let html = '';
    for (const r of State.filteredRecords) {
        const isExempt = Boolean(r.exempt);
        const checked = !isExempt && State.selectedIds.has(r.id) ? 'checked' : '';
        const disabledAttr = isExempt ? `disabled title="${escapeHtml(r.tip)}"` : '';
        const msgBadgeCls = r.msgCount <= 1 ? 'cmp-tag-zombie' : 'cmp-tag-normal';
        const safeAvatar = buildSafeAvatarUrl(r.avatarFile);

        let protTagHtml = '';
        if (r.label) {
            let tagClass = 'cmp-tag-warn';
            if (r.exempt) tagClass = 'cmp-tag-exempt';
            else if (r.highRisk) tagClass = 'cmp-tag-danger';
            protTagHtml = `<span class="cmp-tag ${tagClass}" title="${escapeHtml(r.tip)}">${escapeHtml(r.label)}</span> `;
        }

        html += `
            <tr class="cmp-row ${isExempt ? 'cmp-row-exempt' : (r.highRisk ? 'cmp-row-highrisk' : '')}" data-id="${encodeURIComponent(r.id)}">
                <td class="cmp-col-check">
                    <input type="checkbox" class="cmp-row-check" data-id="${encodeURIComponent(r.id)}" ${checked} ${disabledAttr}>
                </td>
                <td class="cmp-col-avatar">
                    <img class="cmp-avatar" src="${safeAvatar}" loading="lazy" onerror="this.src='/img/ai4.png'">
                </td>
                <td style="font-weight:700;">${escapeHtml(r.charName)}</td>
                <td style="font-size:0.84em; opacity:0.92; word-break:break-all;">
                    ${protTagHtml}${escapeHtml(r.chatFile)}
                </td>
                <td class="cmp-col-meta"><span class="cmp-tag ${msgBadgeCls}">${r.msgCount} ${escapeHtml(t('unitItems'))}</span></td>
                <td class="cmp-col-meta">${formatSize(r.sizeKB)}</td>
                <td class="cmp-col-meta">${formatTime(r.lastTime)}</td>
                <td class="cmp-col-actions">
                    <div style="display:flex; gap:4px;">
                        <button class="cmp-btn cmp-btn-xs cmp-preview-btn" data-id="${encodeURIComponent(r.id)}">${escapeHtml(t('btnPreview'))}</button>
                        <button class="cmp-btn cmp-btn-xs cmp-export-btn" data-id="${encodeURIComponent(r.id)}">${escapeHtml(t('btnExport'))}</button>
                    </div>
                </td>
            </tr>
        `;
    }

    $tbody.html(html);
    syncSelectAllCheckbox();
    updateFooterSummary();
}

function syncSelectAllCheckbox() {
    const safeSelectable = State.filteredRecords.filter((r) => !r.exempt && !r.highRisk);
    const allSafeSelected = safeSelectable.length > 0 && safeSelectable.every((r) => State.selectedIds.has(r.id));
    $('#cmp-select-all, #cmp-select-all-bottom').prop('checked', allSafeSelected);
}

function updateFooterSummary() {
    let selCount = 0;
    let selKB = 0;
    let highRiskSelCount = 0;
    let normalSelectableCount = 0;
    let exemptCount = 0;

    for (const r of State.filteredRecords) {
        if (r.exempt) {
            exemptCount++;
            continue;
        }
        if (!r.highRisk) {
            normalSelectableCount++;
        }
        if (State.selectedIds.has(r.id)) {
            selCount++;
            selKB += r.sizeKB;
            if (r.highRisk) highRiskSelCount++;
        }
    }

    const selectableDenominator = normalSelectableCount + highRiskSelCount;
    let extraHtml = '';
    if (highRiskSelCount > 0) {
        extraHtml += t('footerExtraRisk', { n: highRiskSelCount });
    }
    if (exemptCount > 0) {
        extraHtml += t('footerExtraExempt', { n: exemptCount });
    }

    $('#cmp-footer-stat').html(
        t('footerStat', {
            sel: selCount,
            selectable: selectableDenominator,
            size: formatSize(selKB),
            extra: extraHtml
        })
    );
}

// ============================================================================
// 6. 按楼层可折叠轻量预览
// ============================================================================
async function fetchChatMessages(charName, chatFile, avatarFile) {
    const res = await fetch('/api/chats/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            ch_name: charName,
            file_name: chatFile,
            avatar_url: avatarFile
        })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid response array');
    return data;
}

async function openLightweightPreview(recordId) {
    if (State.previewLoading) return;
    const rec = State.allRecords.find((r) => r.id === recordId);
    if (!rec) return;

    State.previewLoading = true;
    showSubModal(
        isEn() ? `Chat Preview: ${rec.charName}` : `对话楼层预览：${rec.charName}`,
        `<div style="text-align:center; padding:24px;">${isEn() ? 'Loading' : '正在读取'} <b>${escapeHtml(rec.chatFile)}</b> ...</div>`,
        [
            {
                text: isEn() ? 'Export .jsonl' : '导出 .jsonl',
                className: 'cmp-btn',
                onClick: () => exportRecordToJsonl(recordId, false)
            },
            { text: isEn() ? 'Close' : '关闭', className: 'cmp-btn cmp-btn-primary', onClick: closeSubModal }
        ]
    );

    try {
        const rawList = await fetchChatMessages(rec.charName, rec.chatFile, rec.avatarFile);
        const messages = rawList.filter((m) => m && (m.mes !== undefined || m.is_user !== undefined));

        if (!$('#cmp-submodal-backdrop').length) return;

        if (messages.length === 0) {
            $('#cmp-submodal-backdrop .cmp-submodal-body').html(
                `<div style="padding:16px; color:#fca5a5 !important;">
                    ${isEn()
                        ? `No valid messages parsed (File size: ${formatSize(rec.sizeKB)}). If the file size is large, it may be corrupted by an unexpected crash or contain only metadata.`
                        : `该文件未解析出任何有效对话消息（文件大小：${formatSize(rec.sizeKB)}）。<br>若文件体积较大却无消息，说明该文件可能因酒馆异常中断而损坏，或仅包含元数据。`}
                </div>`
            );
            return;
        }

        const renderSlice = (showAllMiddle, scrollBehavior = 'bottom') => {
            const headCount = 4;
            const tailCount = 6;
            let listToRender = [];

            if (!showAllMiddle && messages.length > headCount + tailCount) {
                const omitted = messages.length - (headCount + tailCount);
                listToRender = [
                    ...messages.slice(0, headCount).map((m, i) => ({ m, idx: i + 1 })),
                    { omittedCount: omitted },
                    ...messages.slice(-tailCount).map((m, i) => ({ m, idx: messages.length - tailCount + i + 1 }))
                ];
            } else {
                listToRender = messages.map((m, i) => ({ m, idx: i + 1 }));
            }

            let html = `
                <div class="cmp-preview-toolbar">
                    <div style="font-size:0.84em; color:var(--cmp-text-sub) !important; word-break:break-all;">
                        ${isEn()
                            ? `Total <b>${messages.length}</b> floors | Size <b>${formatSize(rec.sizeKB)}</b>`
                            : `共 <b>${messages.length}</b> 楼 | 大小 <b>${formatSize(rec.sizeKB)}</b>`}
                    </div>
                    <div style="display:flex; gap:5px; flex-wrap:wrap;">
                        <button id="cmp-pv-expand-all" class="cmp-btn cmp-btn-xs">${isEn() ? 'Expand All' : '全部展开'}</button>
                        <button id="cmp-pv-collapse-all" class="cmp-btn cmp-btn-xs">${isEn() ? 'Collapse All' : '全部折叠'}</button>
                        <button id="cmp-pv-jump-top" class="cmp-btn cmp-btn-xs">${isEn() ? '↑ First' : '↑ 第一楼'}</button>
                        <button id="cmp-pv-jump-bottom" class="cmp-btn cmp-btn-xs cmp-btn-primary">${isEn() ? '↓ Last' : '↓ 最后一楼'}</button>
                    </div>
                </div>
                <div class="cmp-preview-list">
            `;

            for (const entry of listToRender) {
                if (entry.omittedCount) {
                    html += `
                        <div style="text-align:center; padding:8px;">
                            <button id="cmp-preview-load-all" class="cmp-btn cmp-btn-primary">
                                ${isEn()
                                    ? `↕ ${entry.omittedCount} middle floors folded. Click to load all`
                                    : `↕ 中间已折叠 ${entry.omittedCount} 个楼层，点击加载全部楼层`}
                            </button>
                        </div>
                    `;
                    continue;
                }

                const msg = entry.m;
                const isUser = Boolean(msg.is_user);
                const sender = escapeHtml(msg.name || (isUser ? 'User' : rec.charName));
                const timeStr = escapeHtml(msg.send_date || '');
                const rawText = String(msg.mes || '');
                const cleanSnippet = escapeHtml(rawText.replace(/\s+/g, ' ').trim().slice(0, 65));
                const fullTextHtml = escapeHtml(rawText).replace(/\n/g, '<br>');

                const isLastThree = entry.idx > messages.length - 3;
                const defaultOpenAttr = (isLastThree || rawText.length <= 300) ? 'open' : '';

                html += `
                    <details class="cmp-preview-item ${isUser ? 'cmp-preview-user' : 'cmp-preview-char'}" ${defaultOpenAttr} data-floor="${entry.idx}">
                        <summary class="cmp-preview-summary">
                            <div class="cmp-preview-meta">
                                <span><b>#${entry.idx} ${sender}</b> <span style="opacity:0.65;">(${rawText.length}${isEn() ? ' chars' : '字'})</span></span>
                                <span>${timeStr}</span>
                            </div>
                            <div class="cmp-preview-snippet">${cleanSnippet || '(Empty)'}${rawText.length > 65 ? '...' : ''}</div>
                        </summary>
                        <div class="cmp-preview-text">${fullTextHtml || '<i style="opacity:0.5;">(Empty)</i>'}</div>
                    </details>
                `;
            }
            html += `</div>`;

            const $body = $('#cmp-submodal-backdrop .cmp-submodal-body');
            $body.html(html);

            $('#cmp-preview-load-all').on('click', () => renderSlice(true, 'keep'));
            $('#cmp-pv-expand-all').on('click', () => $body.find('details.cmp-preview-item').prop('open', true));
            $('#cmp-pv-collapse-all').on('click', () => $body.find('details.cmp-preview-item').prop('open', false));
            $('#cmp-pv-jump-top').on('click', () => $body.scrollTop(0));
            $('#cmp-pv-jump-bottom').on('click', () => $body.scrollTop($body[0].scrollHeight));

            if (scrollBehavior === 'bottom') {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if ($body[0]) $body.scrollTop($body[0].scrollHeight);
                    });
                });
                setTimeout(() => {
                    if ($body[0]) $body.scrollTop($body[0].scrollHeight);
                }, 60);
            }
        };

        renderSlice(false, 'bottom');
    } catch (e) {
        if ($('#cmp-submodal-backdrop').length) {
            $('#cmp-submodal-backdrop .cmp-submodal-body').html(
                `<div style="padding:16px; color:#fca5a5 !important;">${isEn() ? 'Failed to load chat: ' : '读取聊天文件失败：'}${escapeHtml(e.message)}</div>`
            );
        }
    } finally {
        State.previewLoading = false;
    }
}

async function exportRecordToJsonl(recordId, isTrash = false) {
    try {
        let rawArray = null;
        let fileName = 'chat_export.jsonl';

        if (isTrash) {
            const meta = State.trashMetaList.find((m) => m.id === recordId);
            const payload = await dbGet(STORE_TRASH_DATA, recordId);
            if (!meta || !payload || !Array.isArray(payload.messages)) {
                toastr.error(isEn() ? 'Trash backup data not found' : '找不到回收站备份数据');
                return;
            }
            rawArray = payload.messages;
            fileName = `${meta.charName}_${meta.rawFileName}`;
        } else {
            const rec = State.allRecords.find((r) => r.id === recordId);
            if (!rec) return;
            rawArray = await fetchChatMessages(rec.charName, rec.chatFile, rec.avatarFile);
            fileName = `${rec.charName}_${rec.rawFileName}`;
        }

        const jsonlContent = rawArray.map((line) => JSON.stringify(line)).join('\n');
        const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeDownloadName = fileName.replace(/[\\/:*?"<>|]/g, '_');
        a.download = safeDownloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toastr.success(`${isEn() ? 'Exported: ' : '已导出: '}${escapeHtml(safeDownloadName)}`);
    } catch (e) {
        toastr.error((isEn() ? 'Export failed: ' : '导出失败: ') + escapeHtml(e.message));
    }
}

// ============================================================================
// 7. 批量删除与高危文件防误触警告
// ============================================================================
function confirmAndDelete() {
    if (State.taskStatus !== 'idle') {
        toastr.warning(isEn() ? 'Please wait for current task to finish or stop it.' : '请等待当前任务完成或手动停止');
        return;
    }

    const targets = State.filteredRecords.filter((r) => !r.exempt && State.selectedIds.has(r.id));
    if (targets.length === 0) {
        toastr.warning(isEn() ? 'Please select chat files to clean first.' : '请先勾选需要清理的聊天文件');
        return;
    }

    const totalKB = targets.reduce((s, r) => s + r.sizeKB, 0);
    const maxMsg = Math.max(...targets.map((r) => r.msgCount));
    const corruptedLargeItems = targets.filter((r) => r.reason === 'corrupted_large');
    const backupItems = targets.filter((r) => r.reason === 'backup');
    const checkpointItems = targets.filter((r) => r.reason === 'checkpoint');

    let warningBoxesHtml = '';

    if (corruptedLargeItems.length > 0) {
        const sampleNames = corruptedLargeItems.slice(0, 3).map((r) => `${escapeHtml(r.charName)} (${formatSize(r.sizeKB)} / ${r.msgCount})`).join(', ');
        warningBoxesHtml += `
            <div style="padding:10px; margin-bottom:8px; background:rgba(239,68,68,0.22); border:1.5px solid #ef4444; border-radius:6px; color:#fca5a5 !important;">
                <b>🚨 ${isEn()
                    ? `CRITICAL WARNING: You selected ${corruptedLargeItems.length} "Large-Size & Few-Messages" file(s)!`
                    : `严重警告：您勾选了 ${corruptedLargeItems.length} 个「大体积但极少消息」的异常文件！`}</b><br>
                <span style="font-size:0.88em;">${isEn()
                    ? `Examples: ${sampleNames}. These files are ≥${State.settings.largeZombieSizeKB}KB with ≤2 messages, which may indicate crash-corrupted long chats or huge lorebook greetings. Click confirm below to force delete.`
                    : `例如：${sampleNames}${corruptedLargeItems.length > 3 ? ' 等' : ''}。<br>此类文件体积较大（≥${State.settings.largeZombieSizeKB}KB）但仅显示 0~2 条消息，<b>极可能是酒馆崩溃造成的损坏存档，或包含巨型世界书/开场白设定</b>。若确认是废档，点击下方确认即可强制删除。`}</span>
            </div>
        `;
    }

    if (backupItems.length > 0) {
        warningBoxesHtml += `
            <div style="padding:8px; margin-bottom:6px; background:rgba(239,68,68,0.16); border:1px solid #ef4444; border-radius:6px; color:#fca5a5 !important;">
                ⚠️ ${isEn()
                    ? `Note: Selection includes <b>${backupItems.length}</b> backup file(s) (backup/bak).`
                    : `注意：所选项中包含 <b>${backupItems.length}</b> 个名称带有备份特征 (backup/bak) 的文件。`}
            </div>
        `;
    }

    if (maxMsg > 1) {
        warningBoxesHtml += `
            <div style="padding:8px; margin-bottom:6px; background:rgba(245,158,11,0.16); border:1px solid #f59e0b; border-radius:6px; color:#fcd34d !important;">
                ${isEn()
                    ? `Reminder: Selected chats contain up to <b>${maxMsg} messages</b>.`
                    : `提醒：勾选列表中包含消息数最高为 <b>${maxMsg} 条</b> 的记录。`}
            </div>
        `;
    }

    if (checkpointItems.length > 0) {
        warningBoxesHtml += `
            <div style="padding:8px; background:rgba(59,130,246,0.16); border:1px solid #3b82f6; border-radius:6px; color:#93c5fd !important;">
                ${isEn()
                    ? `Tip: Selection includes <b>${checkpointItems.length}</b> branch/checkpoint file(s).`
                    : `提示：所选项中包含 <b>${checkpointItems.length}</b> 个分支/书签文件。`}
            </div>
        `;
    }

    const isHighRiskConfirm = corruptedLargeItems.length > 0 || backupItems.length > 0;
    const confirmBtnText = isEn()
        ? (isHighRiskConfirm ? `Force Clean (${targets.length})` : `Confirm Clean (${targets.length})`)
        : (isHighRiskConfirm ? `已知晓风险，强制清理 (${targets.length} 项)` : `确认清理 (${targets.length} 项)`);

    showSubModal(
        isEn() ? 'Confirm Batch Chat Cleanup' : '确认批量清理聊天记录',
        `<div>
            <p style="margin:0 0 8px 0;">${isEn()
                ? `About to clean <b>${targets.length}</b> chat file(s), freeing ~<b>${formatSize(totalKB)}</b>.`
                : `即将清理 <b>${targets.length}</b> 份聊天文件，预计释放 <b>${formatSize(totalKB)}</b>。`}</p>
            <p style="margin:0 0 8px 0; color:var(--cmp-text-sub) !important; font-size:0.9em;">
                • ${isEn() ? 'Verify Before Delete' : '删除前核对状态'}: <b>${State.settings.verifyBeforeDelete ? (isEn() ? 'ON (Skips mismatched files)' : '已开启（若实际消息数与列表缓存不符将自动跳过）') : (isEn() ? 'OFF' : '已关闭')}</b><br>
                • ${isEn() ? 'Trash Bin Backup' : '回收站自动备份'}: <b>${State.settings.safeBackupMode ? (isEn() ? 'ON (Kept for 60 mins)' : '已开启（备份写入成功后才执行删除，保留 60 分钟）') : (isEn() ? 'OFF (Permanent deletion!)' : '已关闭（直接从磁盘永久粉碎！）')}</b>
            </p>
            ${warningBoxesHtml}
        </div>`,
        [
            { text: isEn() ? 'Cancel' : '取消', className: 'cmp-btn', onClick: closeSubModal },
            {
                text: confirmBtnText,
                className: 'cmp-btn cmp-btn-danger',
                onClick: () => {
                    closeSubModal();
                    executeBatchDelete(targets);
                }
            }
        ]
    );
}

async function executeBatchDelete(targets) {
    if (State.taskStatus !== 'idle') return;

    const taskSettings = { ...State.settings };

    State.taskStatus = 'deleting';
    State.abortFlag = false;
    updateControlButtons();

    const total = targets.length;
    let done = 0;
    let deletedCount = 0;
    let skippedActive = 0;
    let skippedCountDiff = 0;
    let skippedReadError = 0;
    let skippedDeleteFail = 0;
    let skippedBackupFail = 0;
    let freedKB = 0;

    const affectedAvatars = new Set();
    const CONCURRENCY = 4;
    let cursor = 0;

    try {
        async function delWorker() {
            while (cursor < total) {
                if (!(await checkPauseAndAbort())) return;

                const idx = cursor++;
                if (idx >= total) return;
                const item = targets[idx];
                if (!item) {
                    done++;
                    continue;
                }

                const liveProt = evaluateProtection(item.avatarFile, item.chatFile, item.rawFileName, item.msgCount, item.sizeKB, null);
                if (liveProt.exempt) {
                    skippedActive++;
                    done++;
                    continue;
                }

                let myTrashId = null;

                try {
                    let liveMessages = null;
                    let liveCount = item.msgCount;

                    if (taskSettings.verifyBeforeDelete || taskSettings.safeBackupMode) {
                        const getRes = await fetch('/api/chats/get', {
                            method: 'POST',
                            headers: getRequestHeaders(),
                            body: JSON.stringify({
                                ch_name: item.charName,
                                file_name: item.chatFile,
                                avatar_url: item.avatarFile
                            })
                        });

                        if (!getRes.ok) {
                            skippedReadError++;
                            done++;
                            continue;
                        }

                        liveMessages = await getRes.json();
                        if (!Array.isArray(liveMessages)) {
                            skippedReadError++;
                            done++;
                            continue;
                        }

                        const realMsgs = liveMessages.filter((m) => m && (m.mes !== undefined || m.is_user !== undefined));
                        liveCount = realMsgs.length;

                        if (liveMessages.length === 0 && item.msgCount > 0) {
                            skippedReadError++;
                            done++;
                            continue;
                        }

                        if (taskSettings.verifyBeforeDelete && liveCount !== item.msgCount) {
                            skippedCountDiff++;
                            done++;
                            continue;
                        }
                    }

                    if (taskSettings.safeBackupMode) {
                        if (!liveMessages) {
                            skippedBackupFail++;
                            done++;
                            continue;
                        }
                        const now = Date.now();
                        const trashId = `${item.id}::${now}::${Math.random().toString(36).slice(2, 6)}`;
                        const metaObj = {
                            id: trashId,
                            originId: item.id,
                            charName: item.charName,
                            avatarFile: item.avatarFile,
                            chatFile: item.chatFile,
                            rawFileName: item.rawFileName,
                            msgCount: liveCount,
                            sizeKB: item.sizeKB,
                            lastTime: item.lastTime > 0 ? item.lastTime : 0,
                            deletedAt: now,
                            expiresAt: now + 3600000,
                            locked: false
                        };
                        const savedOk = await dbSaveTrashPair(metaObj, { id: trashId, messages: liveMessages });
                        if (!savedOk) {
                            skippedBackupFail++;
                            done++;
                            continue;
                        }
                        myTrashId = trashId;
                        State.trashMetaList.unshift(metaObj);
                    }

                    const delRes = await fetch('/api/chats/delete', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            chatfile: item.rawFileName,
                            avatar_url: item.avatarFile
                        })
                    });

                    if (delRes.ok) {
                        myTrashId = null;
                        deletedCount++;
                        freedKB += item.sizeKB;
                        affectedAvatars.add(item.avatarFile);

                        State.selectedIds.delete(item.id);
                        State.manualHighRiskIds.delete(item.id);
                        State.allRecords = State.allRecords.filter((r) => r.id !== item.id);
                        State.filteredRecords = State.filteredRecords.filter((r) => r.id !== item.id);

                        try {
                            const $row = $(`.cmp-row[data-id="${encodeURIComponent(item.id)}"]`);
                            if ($row.length) {
                                $row.addClass('cmp-deleting');
                                setTimeout(() => $row.remove(), 240);
                            }
                        } catch { /* 忽略纯 DOM 动画异常 */ }
                    } else {
                        if (taskSettings.safeBackupMode && myTrashId) {
                            await removeTrashRecord(myTrashId);
                            myTrashId = null;
                        }
                        skippedDeleteFail++;
                    }
                } catch (e) {
                    if (taskSettings.safeBackupMode && myTrashId) {
                        await removeTrashRecord(myTrashId);
                        myTrashId = null;
                    }
                    skippedReadError++;
                    console.error(`[ChatCleaner] Delete error: ${item.chatFile}`, e);
                }

                done++;
                const pct = Math.round((done / total) * 100);
                setStatusUI(pct, `${isEn() ? 'Cleaning' : '正在清理'} (${done}/${total}): ${escapeHtml(item.charName)}`);
            }
        }

        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, Math.max(1, total)) }, () => delWorker()));

        for (const avatar of affectedAvatars) {
            const cached = await dbGet(STORE_CACHE, avatar);
            if (cached && Array.isArray(cached.records)) {
                const remainIds = new Set(State.allRecords.filter((r) => r.avatarFile === avatar).map((r) => r.id));
                cached.records = cached.records.filter((r) => remainIds.has(r.id));
                await dbPut(STORE_CACHE, cached);
            }
        }
    } finally {
        State.taskStatus = 'idle';
        State.pausePromise = null;
        State.pauseResolve = null;
        $('#cmp-trash-badge').text(State.trashMetaList.length);
        updateTrashTabVisibility();
        updateControlButtons();
        syncSelectAllCheckbox();
        updateFooterSummary();
    }

    const freedStr = formatSize(freedKB);
    const totalSkipped = skippedActive + skippedCountDiff + skippedReadError + skippedDeleteFail + skippedBackupFail;

    if (skippedBackupFail > 0) {
        toastr.error(isEn()
            ? `${skippedBackupFail} file(s) failed to backup due to browser storage limit. Deletion aborted to protect files!`
            : `${skippedBackupFail} 份文件因浏览器存储空间不足备份失败，已自动中止删除原文件！`);
    }
    if (skippedActive > 0) {
        toastr.warning(isEn() ? `Skipped ${skippedActive} currently active chat(s)` : `跳过 ${skippedActive} 份当前正在打开的活跃聊天`);
    }
    if (skippedReadError > 0) {
        toastr.warning(isEn() ? `Skipped ${skippedReadError} unreadable or empty file(s)` : `跳过 ${skippedReadError} 份读取异常或内容为空的文件`);
    }
    if (skippedDeleteFail > 0) {
        toastr.warning(isEn() ? `${skippedDeleteFail} file(s) failed to delete via API` : `${skippedDeleteFail} 份文件调用删除接口未成功，已保留原文件`);
    }
    if (skippedCountDiff > 0) {
        toastr.warning(isEn()
            ? `${skippedCountDiff} file(s) differed from cached message count. Skipped & resyncing...`
            : `发现 ${skippedCountDiff} 份文件实际消息数与缓存不符，已跳过并同步最新状态`);
        runIncrementalOrFullScan(true);
    }

    setStatusUI(
        100,
        isEn()
            ? `Cleanup complete: Deleted <b>${deletedCount}</b> (${freedStr})${totalSkipped > 0 ? `, Safely skipped <b>${totalSkipped}</b>` : ''}`
            : `清理完成：已删除 <b>${deletedCount}</b> 项 (${freedStr})${totalSkipped > 0 ? `，安全跳过 <b>${totalSkipped}</b> 项` : ''}`
    );
    if (deletedCount > 0) {
        toastr.success(isEn() ? `Cleaned ${deletedCount} chats, freed ${freedStr}` : `已清理 ${deletedCount} 份记录，释放 ${freedStr}`);
    }
}

// ============================================================================
// 8. 回收站管理
// ============================================================================
function renderTrashTable() {
    const kw = ($('#cmp-trash-search').val() || '').trim().toLowerCase();
    const list = State.trashMetaList.filter((item) => {
        if (!kw) return true;
        return item.charName.toLowerCase().includes(kw) || item.chatFile.toLowerCase().includes(kw);
    });

    $('#cmp-trash-badge').text(State.trashMetaList.length);
    const $tbody = $('#cmp-trash-tbody');

    if (list.length === 0) {
        $tbody.html(`<tr><td colspan="6" style="text-align:center; padding:40px 15px; color:var(--cmp-text-sub) !important;">${escapeHtml(t('emptyTrashList'))}</td></tr>`);
        return;
    }

    const now = Date.now();
    let html = '';
    for (const item of list) {
        const leftMin = Math.max(0, Math.ceil((item.expiresAt - now) / 60000));
        const badge = item.locked
            ? `<span class="cmp-tag" style="background:rgba(245,158,11,0.2); color:#fcd34d !important;">${escapeHtml(t('tagLocked'))}</span>`
            : `<span class="cmp-tag cmp-tag-normal">${escapeHtml(t('tagExpireIn', { min: leftMin }))}</span>`;
        const safeAvatar = buildSafeAvatarUrl(item.avatarFile);

        html += `
            <tr class="cmp-row cmp-trash-row" data-trash-id="${encodeURIComponent(item.id)}">
                <td class="cmp-col-avatar"><img class="cmp-avatar" src="${safeAvatar}" loading="lazy" onerror="this.src='/img/ai4.png'"></td>
                <td style="font-weight:700;">${escapeHtml(item.charName)}</td>
                <td style="font-size:0.84em; word-break:break-all;">${escapeHtml(item.chatFile)}</td>
                <td class="cmp-col-meta">${item.msgCount} ${escapeHtml(t('unitItems'))} (${formatSize(item.sizeKB)})</td>
                <td class="cmp-col-meta">${badge}</td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button class="cmp-btn cmp-btn-xs cmp-btn-success cmp-trash-restore" data-id="${encodeURIComponent(item.id)}">${escapeHtml(t('btnRestore'))}</button>
                        <button class="cmp-btn cmp-btn-xs cmp-trash-export" data-id="${encodeURIComponent(item.id)}">${escapeHtml(t('btnExport'))}</button>
                        <button class="cmp-btn cmp-btn-xs ${item.locked ? 'cmp-btn-warning' : ''} cmp-trash-lock" data-id="${encodeURIComponent(item.id)}">${escapeHtml(item.locked ? t('btnUnlock') : t('btnLock'))}</button>
                        <button class="cmp-btn cmp-btn-xs cmp-btn-danger cmp-trash-del" data-id="${encodeURIComponent(item.id)}">${escapeHtml(t('btnDestroy'))}</button>
                    </div>
                </td>
            </tr>
        `;
    }
    $tbody.html(html);
}

function buildRestoredFileName(baseChatFile) {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const localTimePart = `${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
    const randPart = Math.random().toString(36).slice(2, 6);
    return `${baseChatFile}_restored_${localTimePart}_${randPart}`;
}

async function restoreFromTrash(trashId, forceRename = false, batchMode = false) {
    const meta = State.trashMetaList.find((m) => m.id === trashId);
    const payload = await dbGet(STORE_TRASH_DATA, trashId);
    if (!meta || !payload || !Array.isArray(payload.messages)) {
        if (!batchMode) toastr.error(isEn() ? 'Backup payload not found or corrupted' : '找不到备份内容或数据已损坏');
        return false;
    }

    let targetChatFile = meta.chatFile;

    if (!forceRename) {
        try {
            const checkRes = await fetch('/api/characters/chats', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({ avatar_url: meta.avatarFile })
            });
            if (!checkRes.ok) throw new Error(`HTTP ${checkRes.status}`);
            const existing = await checkRes.json();
            const entries = Array.isArray(existing) ? existing : Object.values(existing);
            const exists = entries.some((info) => {
                const rf = typeof info === 'string' ? info : info?.file_name;
                return rf && rf.replace(/\.jsonl$/i, '') === targetChatFile;
            });

            if (exists) {
                if (batchMode) {
                    targetChatFile = buildRestoredFileName(meta.chatFile);
                } else {
                    showSubModal(
                        isEn() ? 'Filename Conflict Detected' : '检测到同名聊天文件冲突',
                        isEn()
                            ? `<p>Character <b>${escapeHtml(meta.charName)}</b> already has a chat named <code>${escapeHtml(targetChatFile)}</code>.</p><p>To prevent overwriting existing chats, please choose:</p>`
                            : `<p>角色 <b>${escapeHtml(meta.charName)}</b> 下已存在名为 <code>${escapeHtml(targetChatFile)}</code> 的文件。</p><p>为防止静默覆盖现有对话，请选择恢复方式：</p>`,
                        [
                            { text: isEn() ? 'Cancel' : '取消', className: 'cmp-btn', onClick: closeSubModal },
                            {
                                text: isEn() ? 'Auto Rename & Restore (Recommended)' : '自动重命名并恢复 (推荐)',
                                className: 'cmp-btn cmp-btn-primary',
                                onClick: () => {
                                    closeSubModal();
                                    restoreFromTrash(trashId, true, false);
                                }
                            }
                        ]
                    );
                    return false;
                }
            }
        } catch (e) {
            console.warn('[ChatCleaner] Conflict check failed, auto-renaming:', e);
            targetChatFile = buildRestoredFileName(meta.chatFile);
            if (!batchMode) {
                toastr.info(isEn() ? 'Conflict check timed out; restored with safe suffix.' : '因文件列表检查响应超时，已自动为您添加重命名后缀安全恢复');
            }
        }
    } else {
        targetChatFile = buildRestoredFileName(meta.chatFile);
    }

    try {
        const res = await fetch('/api/chats/save', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                ch_name: meta.charName,
                file_name: targetChatFile,
                chat: payload.messages,
                avatar_url: meta.avatarFile
            })
        });

        if (res.ok) {
            await removeTrashRecord(trashId);
            if (!batchMode) renderTrashTable();

            const rawFileName = `${targetChatFile}.jsonl`;
            const prot = evaluateProtection(meta.avatarFile, targetChatFile, rawFileName, meta.msgCount, meta.sizeKB, null);
            const restoredItem = {
                id: `${meta.avatarFile}::${targetChatFile}`,
                charName: meta.charName,
                avatarFile: meta.avatarFile,
                avatarUrl: buildSafeAvatarUrl(meta.avatarFile),
                chatFile: targetChatFile,
                rawFileName,
                msgCount: meta.msgCount,
                sizeKB: meta.sizeKB,
                lastTime: meta.lastTime > 0 ? meta.lastTime : 0,
                parentChat: '',
                ...prot
            };

            State.allRecords = State.allRecords.filter((r) => r.id !== restoredItem.id);
            State.allRecords.push(restoredItem);

            const cached = await dbGet(STORE_CACHE, meta.avatarFile);
            if (cached && Array.isArray(cached.records)) {
                cached.records = cached.records.filter((r) => r.id !== restoredItem.id);
                cached.records.push(restoredItem);
                await dbPut(STORE_CACHE, cached);
            }

            if (!batchMode) {
                applyFiltersAndRender(false);
                toastr.success(`${isEn() ? 'Restored: ' : '已恢复: '}${escapeHtml(meta.charName)} - ${escapeHtml(targetChatFile)}`);
            }
            return true;
        } else {
            if (!batchMode) toastr.error(isEn() ? 'Save API failed' : '保存接口返回失败');
            return false;
        }
    } catch (e) {
        if (!batchMode) toastr.error((isEn() ? 'Restore error: ' : '恢复出错: ') + escapeHtml(e.message));
        return false;
    }
}

// ============================================================================
// 9. 弹窗组件、双语帮助文档与首次使用强风险提示
// ============================================================================
function showSubModal(title, bodyHtml, buttons = []) {
    $('#cmp-submodal-backdrop').remove();
    const btns = buttons.map((b, i) => `<button class="${escapeHtml(b.className || 'cmp-btn')}" data-idx="${i}">${escapeHtml(b.text)}</button>`).join('');
    $('#cmp-modal').append(`
        <div id="cmp-submodal-backdrop" class="cmp-submodal-backdrop">
            <div class="cmp-submodal">
                <div class="cmp-submodal-header">${escapeHtml(title)}</div>
                <div class="cmp-submodal-body">${bodyHtml}</div>
                <div class="cmp-submodal-footer">${btns}</div>
            </div>
        </div>
    `);
    buttons.forEach((b, i) => $(`#cmp-submodal-backdrop button[data-idx="${i}"]`).on('click', b.onClick));
}

function closeSubModal() {
    $('#cmp-submodal-backdrop').remove();
}

function getRiskNoticeHtml() {
    if (isEn()) {
        return `
            <div style="padding:10px 12px; background:rgba(239,68,68,0.14); border:1px solid rgba(239,68,68,0.45); border-radius:8px; margin-bottom:10px;">
                <b style="color:#fca5a5 !important;">⚠️ Key Risks & Data Safety Notice (Must Read):</b>
                <ul style="margin:6px 0 0 0; padding-left:18px; color:var(--cmp-text-main) !important;">
                    <li><b>External File Edits</b>: If you manually add/modify files inside <code>chats/</code> via OS file explorer, click <b>"Full Rescan"</b> to sync cache.</li>
                    <li><b>Browser Data Clearing</b>: The 60-minute Trash Bin is stored in your browser's IndexedDB. Clearing site data or using Incognito mode will erase Trash backups.</li>
                    <li><b>Permanent Deletion</b>: Disabling "Auto Backup to Trash Bin" or clicking "Destroy" in the Trash Bin permanently removes files from disk.</li>
                </ul>
            </div>
        `;
    }
    return `
        <div style="padding:10px 12px; background:rgba(239,68,68,0.14); border:1px solid rgba(239,68,68,0.45); border-radius:8px; margin-bottom:10px;">
            <b style="color:#fca5a5 !important;">⚠️ 核心使用风险与数据安全须知（必读）：</b>
            <ul style="margin:6px 0 0 0; padding-left:18px; color:var(--cmp-text-main) !important;">
                <li><b>外部手动改文件风险</b>：若您在操作系统文件夹中直接修改或新增了 <code>chats/</code> 下的文件，酒馆前端内存签名不会自动变更，请务必点击一次<b>“全量重扫”</b>同步最新状态。</li>
                <li><b>浏览器缓存清理风险</b>：60 分钟回收站数据保存在当前浏览器的 IndexedDB 中。若清除浏览器站点数据、无痕模式关闭或更换浏览器，回收站内的备份将丢失。</li>
                <li><b>物理删除不可逆风险</b>：若关闭“删除前自动备份至回收站”或在回收站中执行“销毁”，文件将从硬盘物理移除，无法通过软件途径找回。</li>
            </ul>
        </div>
    `;
}

function showDisclaimerModal() {
    const bodyHtml = isEn()
        ? `<p style="margin-top:0;">Welcome to <b>Chat Cleaner & Manager</b>. Please review the safety notice before proceeding:</p>
           ${getRiskNoticeHtml()}
           <p style="margin-bottom:0;">By default, <b>Verify Before Delete</b>, <b>60-Min Trash Bin Backup</b>, and <b>Large-Size Few-Messages Warning</b> are enabled. Backing up your SillyTavern data folder before massive cleanup is always recommended.</p>`
        : `<p style="margin-top:0;">欢迎使用聊天记录管理器。在开始清理前，请仔细阅读以下说明（点击左下角可切换 English / 中文）：</p>
           ${getRiskNoticeHtml()}
           <p style="margin-bottom:0;">插件默认已开启<b>“删除前核对文件状态”</b>、<b>“60分钟回收站备份”</b>以及<b>“大体积少消息防误触警告”</b>，但仍建议在大批量清理前备份您的酒馆数据目录。</p>`;

    showSubModal(
        isEn() ? 'Disclaimer & Safety Notice' : '免责声明与安全使用须知',
        bodyHtml,
        [
            {
                text: isEn() ? '🌐 切换中文' : '🌐 English',
                className: 'cmp-btn',
                onClick: () => {
                    toggleLanguage();
                    showDisclaimerModal();
                }
            },
            {
                text: isEn() ? 'I Understand & Agree' : '我已阅读并知晓风险，继续使用',
                className: 'cmp-btn cmp-btn-primary',
                onClick: () => {
                    localStorage.setItem(DISCLAIMER_KEY, 'true');
                    closeSubModal();
                }
            }
        ]
    );
}

function openHelpModal() {
    const docHtml = isEn()
        ? `
            ${getRiskNoticeHtml()}
            <h4>1. Anti-Misclick Protection & Management Control</h4>
            <ul>
                <li><b>SillyTavern Native Backups Untouched</b>: ST 1.17+ automatic crash backups in <code>backups/</code> are never touched by this extension.</li>
                <li><b>Large-Size Few-Messages Warning (Configurable)</b>: Files with ≤2 msgs but size ≥ threshold (default 15KB) are flagged as <b>Large File / Few Msgs</b>. "Select Normal" and presets skip them automatically, while you can still manually check them to force clean.</li>
                <li><b>Active Chat Protection</b>: The currently open chat is marked <b>Active Chat</b> and locked until you switch chats.</li>
                <li><b>Branch / Checkpoint Detection</b>: Identified via filename patterns (checkpoint/branch) and metadata (manually renamed branches may not be detected).</li>
            </ul>
            <h4>2. How It Works</h4>
            <ul>
                <li><b>Last Chat Timestamp</b>: Parses <code>last_mes</code> from ST API (compatible with <code>@15h 42m</code> & English dates). Falls back to filename date only if metadata is missing.</li>
                <li><b>Atomic Trash Backup</b>: Metadata and message payload are saved in a single IndexedDB transaction before calling delete API.</li>
            </ul>
        `
        : `
            ${getRiskNoticeHtml()}
            <h4>一、 防误触保护与管理权限说明</h4>
            <ul>
                <li><b>酒馆原生备份不受影响</b>：SillyTavern 1.17+ 的防崩溃自动备份存放在独立的 <code>backups/</code> 目录下，本插件不会触碰该目录。</li>
                <li><b>异常大体积少消息警告（可配置/可强制清理）</b>：当文件消息数 ≤2 条但体积达到设定阈值（默认 ≥15KB）时，可能是酒馆崩溃造成的坏档或含巨型世界书设定。插件会将其标为<b>大体积少消息(慎删)</b>，「全选普通项」与「预设按钮」会自动跳过它们防止误触；但您仍可手动勾选并在确认警告后强制清理，也可在设置中调整体积阈值或关闭该检测。</li>
                <li><b>当前活跃对话保护</b>：当前正在前台打开的聊天标为<b>当前打开</b>，需先在酒馆切换到其他聊天后方可清理。</li>
                <li><b>分支/书签识别说明</b>：依据文件名特征（checkpoint/branch/书签/分支）及元数据特征识别，若手动修改过分支文件名可能不会被标记。</li>
            </ul>
            <h4>二、 实现原理与时间读取说明</h4>
            <ul>
                <li><b>最后对话时间解析</b>：优先解析酒馆接口返回的 <code>last_mes</code> 最后互动时间（兼容 <code>@15h 42m</code> 格式与英文日期）；仅在缺失元数据时从文件名提取。手动改名且无内部时间戳的文件显示为“未知时间”。</li>
                <li><b>状态核对与原子备份</b>：清理时先拉取完整数组核对真实消息数；开启回收站时，必须等待元数据与正文在同一事务中写入成功后，才执行物理删除。大量恢复后建议点一次“快速扫描”。</li>
            </ul>
        `;

    showSubModal(
        isEn() ? 'About Chat Cleaner & Manager v1.0.0' : '关于聊天记录管理器 v1.0.0',
        docHtml,
        [{ text: isEn() ? 'Close' : '关闭', className: 'cmp-btn cmp-btn-primary', onClick: closeSubModal }]
    );
}

// ============================================================================
// 10. 界面构建、动态语言刷新与事件绑定
// ============================================================================
function applyLanguageToDOM() {
    $('#cmp_open_btn span').text(t('menuBtn'));
    $('#cmp_open_btn').attr('title', t('menuTitle'));

    if (!$('#cmp-overlay').length) return;

    $('#cmp-app-title').text(t('appTitle'));
    $('#cmp-help-btn').attr('title', t('helpTip'));
    $('#cmp-lang-toggle-top').text(isEn() ? '🌐 中文' : '🌐 EN');
    $('#cmp-reset-ui-top, #cmp-reset-ui-settings').text(t('resetUiBtn')).attr('title', t('resetUiTip'));
    $('#cmp-close-btn').text(t('closeBtn'));

    $('.cmp-tab[data-tab="manager"]').text(t('tabManager'));
    $('#cmp-tab-trash-label').text(t('tabTrash'));
    $('.cmp-tab[data-tab="settings"]').text(t('tabSettings'));

    updateControlButtons();
    if (State.taskStatus === 'idle') {
        $('#cmp-status-text').text(t('statusReady'));
    }

    $('#cmp-search-input').attr('placeholder', t('searchPlaceholder'));
    $('#cmp-sort-select option[value="msg_asc"]').text(t('sortMsgAsc'));
    $('#cmp-sort-select option[value="msg_desc"]').text(t('sortMsgDesc'));
    $('#cmp-sort-select option[value="size_desc"]').text(t('sortSizeDesc'));
    $('#cmp-sort-select option[value="size_asc"]').text(t('sortSizeAsc'));
    $('#cmp-sort-select option[value="time_desc"]').text(t('sortTimeDesc'));
    $('#cmp-sort-select option[value="time_asc"]').text(t('sortTimeAsc'));
    $('#cmp-sort-select option[value="name_asc"]').text(t('sortNameAsc'));

    $('#cmp-toggle-drawer-btn').text(State.drawerOpen ? t('drawerHide') : t('drawerShow'));
    $('#cmp-scan-inc-btn').text(t('scanFast')).attr('title', t('scanFastTip'));
    $('#cmp-scan-full-btn').text(t('scanFull')).attr('title', t('scanFullTip'));

    $('#cmp-lbl-msg').text(t('lblMsgCount'));
    $('#cmp-lbl-size').text(t('lblSizeKB'));
    $('#cmp-lbl-days').text(t('lblInactiveDays'));
    $('#cmp-lbl-days-unit').text(t('lblDays'));
    $('#cmp-lbl-unknown-wrap, #cmp-include-unknown-time').attr('title', t('tipIncludeUnknown'));
    $('#cmp-lbl-unknown-txt').text(t('lblIncludeUnknown'));

    $('#cmp-lbl-presets').text(t('lblPresets'));
    $('.cmp-preset-btn[data-preset="zombie"]').text(t('presetZombie'));
    $('.cmp-preset-btn[data-preset="short"]').text(t('presetShort'));
    $('.cmp-preset-btn[data-preset="all"]').text(t('presetAll'));

    $('#cmp-th-avatar').text(t('thAvatar'));
    $('#cmp-th-char').text(t('thChar'));
    $('#cmp-th-file').text(t('thFile'));
    $('#cmp-th-msg').text(t('thMsg'));
    $('#cmp-th-size').text(t('thSize'));
    $('#cmp-th-time').text(t('thTime'));
    $('#cmp-th-actions').text(t('thActions'));

    $('#cmp-select-all, #cmp-select-all-bottom').attr('title', t('selectAllTip'));
    $('#cmp-select-all-label').text(t('selectAllNormal'));
    $('#cmp-delete-btn').text(t('deleteSelectedBtn'));

    $('#cmp-trash-search').attr('placeholder', t('trashSearchPlaceholder'));
    $('#cmp-trash-restore-all').text(t('restoreAllBtn'));
    $('#cmp-trash-clear-btn').text(t('clearUnlockedBtn'));
    $('#cmp-th-trash-avatar').text(t('thAvatar'));
    $('#cmp-th-trash-char').text(t('thChar'));
    $('#cmp-th-trash-file').text(t('thFile'));
    $('#cmp-th-trash-scale').text(t('thScale'));
    $('#cmp-th-trash-status').text(t('thStatus'));
    $('#cmp-th-trash-actions').text(t('thActions'));

    $('#cmp-set-lang-title').text(t('setLangTitle'));
    $('#cmp-set-lang-desc').text(t('setLangDesc'));
    $('#cmp-set-reset-title').text(t('setResetTitle'));
    $('#cmp-set-reset-desc').text(t('setResetDesc'));
    $('#cmp-set-theme-title').text(t('setThemeTitle'));
    $('#cmp-set-theme-desc').text(t('setThemeDesc'));
    $('#cmp-set-theme option[value="dark"]').text(t('themeDark'));
    $('#cmp-set-theme option[value="oled"]').text(t('themeOled'));
    $('#cmp-set-theme option[value="forest"]').text(t('themeForest'));
    $('#cmp-set-theme option[value="st-native"]').text(t('themeNative'));
    $('#cmp-set-font-title-prefix').text(t('setFontTitle'));
    $('#cmp-set-font-desc').text(t('setFontDesc'));
    $('#cmp-set-large-title').text(t('setLargeWarnTitle'));
    $('#cmp-set-large-desc').text(t('setLargeWarnDesc'));
    $('#cmp-set-large-kb-lbl').text(t('setLargeKBLabel'));
    $('#cmp-set-verify-title').text(t('setVerifyTitle'));
    $('#cmp-set-verify-desc').text(t('setVerifyDesc'));
    $('#cmp-set-backup-title').text(t('setBackupTitle'));
    $('#cmp-set-backup-desc').text(t('setBackupDesc'));
    $('#cmp-set-conc-title').text(t('setConcurrencyTitle'));
    $('#cmp-set-conc-desc').text(t('setConcurrencyDesc'));

    $('#cmp-set-lang').val(State.settings.lang);

    applyFiltersAndRender(false);
    if (State.activeTab === 'trash') renderTrashTable();
}

function toggleLanguage() {
    const nextLang = State.settings.lang === 'en' ? 'zh' : 'en';
    saveSettings({ ...State.settings, lang: nextLang });
    applyLanguageToDOM();
}

function updateControlButtons() {
    const st = State.taskStatus;
    const isBusy = st !== 'idle';

    $('#cmp-set-verify, #cmp-set-backup, #cmp-set-large-warn, #cmp-set-large-kb, #cmp-set-concurrency, #cmp-reset-ui-top, #cmp-reset-ui-settings').prop('disabled', isBusy);

    if (st === 'idle') {
        $('#cmp-pause-btn, #cmp-stop-btn').hide();
        $('#cmp-scan-inc-btn, #cmp-scan-full-btn, #cmp-delete-btn').prop('disabled', false);
    } else if (st === 'scanning' || st === 'deleting') {
        $('#cmp-pause-btn').show().text(t('pauseBtn'));
        $('#cmp-stop-btn').show().text(t('stopBtn'));
        $('#cmp-scan-inc-btn, #cmp-scan-full-btn, #cmp-delete-btn').prop('disabled', true);
    } else if (st === 'paused') {
        $('#cmp-pause-btn').show().text(t('resumeBtn'));
        $('#cmp-stop-btn').show().text(t('stopBtn'));
        $('#cmp-scan-inc-btn, #cmp-scan-full-btn, #cmp-delete-btn').prop('disabled', true);
    }
}

async function openManagerModal() {
    if (State.modalOpening) return;
    if ($('#cmp-overlay').length) {
        $('#cmp-overlay').css('display', 'flex');
        applyAppearance();
        updateTrashTabVisibility();
        if (!State.hasInitialLoaded && State.taskStatus === 'idle') {
            runIncrementalOrFullScan(false);
        } else if (State.taskStatus === 'idle') {
            applyFiltersAndRender(false);
        }
        return;
    }

    State.modalOpening = true;
    try {
        const initialTrash = await dbGetAll(STORE_TRASH_META);
        State.trashMetaList = Array.isArray(initialTrash) ? initialTrash.sort((a, b) => b.deletedAt - a.deletedAt) : [];

        if ($('#cmp-overlay').length) return;

        const html = `
            <div id="cmp-overlay">
                <div id="cmp-modal">
                    <!-- 顶栏 -->
                    <div class="cmp-header">
                        <div class="cmp-title-group">
                            <i class="fa-solid fa-broom" style="color:var(--cmp-accent);"></i>
                            <span id="cmp-app-title"></span>
                            <span id="cmp-help-btn" class="cmp-help-circle">?</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <button id="cmp-lang-toggle-top" class="cmp-btn cmp-btn-xs" title="Switch Language / 切换中英文">🌐 EN</button>
                            <button id="cmp-reset-ui-top" class="cmp-reset-ui-btn"></button>
                            <button id="cmp-close-btn" class="cmp-btn"></button>
                        </div>
                    </div>

                    <!-- 导航标签页 -->
                    <div class="cmp-tabs">
                        <div class="cmp-tab active" data-tab="manager"></div>
                        <div class="cmp-tab" data-tab="trash"><span id="cmp-tab-trash-label"></span> <span id="cmp-trash-badge" class="cmp-badge">0</span></div>
                        <div class="cmp-tab" data-tab="settings"></div>
                    </div>

                    <!-- 状态与进度条 -->
                    <div class="cmp-status-bar">
                        <div class="cmp-status-top">
                            <span id="cmp-status-text">${escapeHtml(t('statusReady'))}</span>
                            <div style="display:flex; gap:5px; flex-shrink:0;">
                                <button id="cmp-pause-btn" class="cmp-btn cmp-btn-warning" style="display:none; padding:2px 8px;"></button>
                                <button id="cmp-stop-btn" class="cmp-btn cmp-btn-danger" style="display:none; padding:2px 8px;"></button>
                            </div>
                        </div>
                        <div class="cmp-progress-track">
                            <div id="cmp-progress-fill" class="cmp-progress-fill"></div>
                        </div>
                    </div>

                    <!-- 面板 1：聊天文件管理 -->
                    <div id="cmp-view-manager" class="cmp-view-panel">
                        <div class="cmp-toolbar">
                            <div class="cmp-toolbar-main">
                                <input type="text" id="cmp-search-input" class="cmp-input cmp-input-search">
                                <select id="cmp-sort-select" class="cmp-select">
                                    <option value="msg_asc"></option>
                                    <option value="msg_desc"></option>
                                    <option value="size_desc"></option>
                                    <option value="size_asc"></option>
                                    <option value="time_desc"></option>
                                    <option value="time_asc"></option>
                                    <option value="name_asc"></option>
                                </select>
                                <button id="cmp-toggle-drawer-btn" class="cmp-btn"></button>
                                <button id="cmp-scan-inc-btn" class="cmp-btn cmp-btn-primary"></button>
                                <button id="cmp-scan-full-btn" class="cmp-btn"></button>
                            </div>

                            <div id="cmp-toolbar-drawer" class="cmp-toolbar-drawer open">
                                <div class="cmp-filter-row">
                                    <span id="cmp-lbl-msg"></span>
                                    <input type="number" id="cmp-min-msg" class="cmp-input cmp-input-num" value="0" min="0">
                                    <span>~</span>
                                    <input type="number" id="cmp-max-msg" class="cmp-input cmp-input-num" value="1" min="0" placeholder="∞">
                                    <span id="cmp-lbl-size"></span>
                                    <input type="number" id="cmp-min-size" class="cmp-input cmp-input-num" placeholder="0" min="0">
                                    <span>~</span>
                                    <input type="number" id="cmp-max-size" class="cmp-input cmp-input-num" placeholder="∞" min="0">
                                    <span id="cmp-lbl-days"></span>
                                    <input type="number" id="cmp-min-days" class="cmp-input cmp-input-num" placeholder="0" min="0">
                                    <span id="cmp-lbl-days-unit"></span>
                                    <label id="cmp-lbl-unknown-wrap" style="display:inline-flex; align-items:center; gap:3px; cursor:pointer; margin-left:4px;">
                                        <input type="checkbox" id="cmp-include-unknown-time"> <span id="cmp-lbl-unknown-txt"></span>
                                    </label>
                                </div>
                                <div class="cmp-filter-row">
                                    <span id="cmp-lbl-presets"></span>
                                    <button class="cmp-btn cmp-preset-btn" data-preset="zombie"></button>
                                    <button class="cmp-btn cmp-preset-btn" data-preset="short"></button>
                                    <button class="cmp-btn cmp-preset-btn" data-preset="all"></button>
                                </div>
                            </div>
                        </div>

                        <div class="cmp-body">
                            <table class="cmp-table">
                                <thead>
                                    <tr>
                                        <th style="width:32px;"><input type="checkbox" id="cmp-select-all"></th>
                                        <th id="cmp-th-avatar" style="width:46px;"></th>
                                        <th id="cmp-th-char" style="width:140px;"></th>
                                        <th id="cmp-th-file"></th>
                                        <th id="cmp-th-msg" style="width:80px;"></th>
                                        <th id="cmp-th-size" style="width:80px;"></th>
                                        <th id="cmp-th-time" style="width:130px;"></th>
                                        <th id="cmp-th-actions" style="width:105px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="cmp-tbody"></tbody>
                            </table>
                        </div>

                        <div class="cmp-footer">
                            <div class="cmp-footer-info">
                                <label style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                    <input type="checkbox" id="cmp-select-all-bottom">
                                    <span id="cmp-select-all-label"></span>
                                </label>
                                <span id="cmp-footer-stat">${escapeHtml(t('waitingScan'))}</span>
                            </div>
                            <button id="cmp-delete-btn" class="cmp-btn cmp-btn-danger"></button>
                        </div>
                    </div>

                    <!-- 面板 2：回收站 -->
                    <div id="cmp-view-trash" class="cmp-view-panel" style="display:none;">
                        <div class="cmp-toolbar">
                            <div class="cmp-toolbar-main">
                                <input type="text" id="cmp-trash-search" class="cmp-input cmp-input-search">
                                <button id="cmp-trash-restore-all" class="cmp-btn cmp-btn-success"></button>
                                <button id="cmp-trash-clear-btn" class="cmp-btn cmp-btn-danger"></button>
                            </div>
                        </div>
                        <div class="cmp-body">
                            <table class="cmp-table">
                                <thead>
                                    <tr>
                                        <th id="cmp-th-trash-avatar" style="width:46px;"></th>
                                        <th id="cmp-th-trash-char" style="width:140px;"></th>
                                        <th id="cmp-th-trash-file"></th>
                                        <th id="cmp-th-trash-scale" style="width:105px;"></th>
                                        <th id="cmp-th-trash-status" style="width:125px;"></th>
                                        <th id="cmp-th-trash-actions" style="width:210px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="cmp-trash-tbody"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 面板 3：设置 -->
                    <div id="cmp-view-settings" class="cmp-view-panel" style="display:none;">
                        <div class="cmp-body">
                            <div class="cmp-settings-container">
                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-lang-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-lang-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <select id="cmp-set-lang" class="cmp-select">
                                        <option value="zh">简体中文 (默认)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-reset-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-reset-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <button id="cmp-reset-ui-settings" class="cmp-reset-ui-btn"></button>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-theme-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-theme-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <select id="cmp-set-theme" class="cmp-select">
                                        <option value="dark"></option>
                                        <option value="oled"></option>
                                        <option value="forest"></option>
                                        <option value="st-native"></option>
                                    </select>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div class="cmp-setting-title"><span id="cmp-set-font-title-prefix"></span> (<span id="cmp-fontsize-val">14</span>px)</div>
                                        <div id="cmp-set-font-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <input type="range" id="cmp-set-fontsize" min="12" max="18" step="1" value="14" style="width:140px;">
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-large-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-large-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span id="cmp-set-large-kb-lbl" style="font-size:0.84em; color:var(--cmp-text-sub);"></span>
                                        <input type="number" id="cmp-set-large-kb" class="cmp-input cmp-input-num" min="5" max="10240" value="15">
                                        <input type="checkbox" id="cmp-set-large-warn" checked>
                                    </div>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-verify-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-verify-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <input type="checkbox" id="cmp-set-verify" checked>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-backup-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-backup-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <input type="checkbox" id="cmp-set-backup" checked>
                                </div>

                                <div class="cmp-setting-card">
                                    <div>
                                        <div id="cmp-set-conc-title" class="cmp-setting-title"></div>
                                        <div id="cmp-set-conc-desc" class="cmp-setting-desc"></div>
                                    </div>
                                    <input type="number" id="cmp-set-concurrency" class="cmp-input cmp-input-num" min="2" max="16" value="8">
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        $('body').append(html);
        $('#cmp-trash-badge').text(State.trashMetaList.length);

        applyAppearance();
        syncSettingsToInputs();
        applyLanguageToDOM();
        updateTrashTabVisibility();
        bindModalEvents();

        if (localStorage.getItem(DISCLAIMER_KEY) !== 'true') {
            showDisclaimerModal();
        }

        runIncrementalOrFullScan(false);
    } finally {
        State.modalOpening = false;
    }
}

function syncSettingsToInputs() {
    $('#cmp-set-lang').val(State.settings.lang);
    $('#cmp-set-theme').val(State.settings.theme);
    $('#cmp-set-fontsize').val(State.settings.fontSize);
    $('#cmp-fontsize-val').text(State.settings.fontSize);
    $('#cmp-set-large-warn').prop('checked', State.settings.largeZombieWarn);
    $('#cmp-set-large-kb').val(State.settings.largeZombieSizeKB);
    $('#cmp-set-verify').prop('checked', State.settings.verifyBeforeDelete);
    $('#cmp-set-backup').prop('checked', State.settings.safeBackupMode);
    $('#cmp-set-concurrency').val(State.settings.concurrency);
}

function bindModalEvents() {
    const $modal = $('#cmp-modal');

    $('#cmp-help-btn').on('click', openHelpModal);
    $('#cmp-close-btn').on('click', () => $('#cmp-overlay').hide());
    $('#cmp-lang-toggle-top').on('click', toggleLanguage);

    $('#cmp-reset-ui-top, #cmp-reset-ui-settings').on('click', () => {
        saveSettings({
            ...State.settings,
            theme: DEFAULT_SETTINGS.theme,
            fontSize: DEFAULT_SETTINGS.fontSize
        });
        syncSettingsToInputs();
        toastr.success(isEn() ? 'Default appearance restored' : '已恢复默认外观配色与字号');
    });

    $('.cmp-tab').on('click', function () {
        $('.cmp-tab').removeClass('active');
        $(this).addClass('active');
        const tab = $(this).data('tab');
        State.activeTab = tab;
        $('.cmp-view-panel').hide();
        $(`#cmp-view-${tab}`).css('display', 'flex');
        if (tab === 'trash') renderTrashTable();
    });

    $('#cmp-toggle-drawer-btn').on('click', function () {
        State.drawerOpen = !State.drawerOpen;
        $('#cmp-toolbar-drawer').toggleClass('open', State.drawerOpen);
        $(this).text(State.drawerOpen ? t('drawerHide') : t('drawerShow'));
    });

    $('#cmp-pause-btn').on('click', () => {
        if (State.taskStatus === 'scanning' || State.taskStatus === 'deleting') {
            pauseTask();
        } else if (State.taskStatus === 'paused') {
            resumeTask();
        }
    });

    $('#cmp-stop-btn').on('click', stopTask);

    $('#cmp-scan-inc-btn').on('click', () => runIncrementalOrFullScan(false));
    $('#cmp-scan-full-btn').on('click', () => runIncrementalOrFullScan(true));

    const debouncedFilter = debounce(() => applyFiltersAndRender(false), 120);
    $('#cmp-search-input, #cmp-min-msg, #cmp-max-msg, #cmp-min-size, #cmp-max-size, #cmp-min-days').on('input', debouncedFilter);
    $('#cmp-include-unknown-time, #cmp-sort-select').on('change', () => applyFiltersAndRender(false));

    $('.cmp-preset-btn').on('click', function () {
        const p = $(this).data('preset');
        if (p === 'zombie') {
            $('#cmp-min-msg').val(0);
            $('#cmp-max-msg').val(1);
            applyFiltersAndRender(true);
            State.filteredRecords.forEach((r) => { if (!r.exempt && !r.highRisk) State.selectedIds.add(r.id); });
            renderManagerTable();
        } else if (p === 'short') {
            $('#cmp-min-msg').val(0);
            $('#cmp-max-msg').val(5);
            applyFiltersAndRender(true);
            State.filteredRecords.forEach((r) => { if (!r.exempt && !r.highRisk) State.selectedIds.add(r.id); });
            renderManagerTable();
        } else if (p === 'all') {
            $('#cmp-min-msg').val(0);
            $('#cmp-max-msg').val('');
            $('#cmp-min-size').val('');
            $('#cmp-max-size').val('');
            $('#cmp-min-days').val('');
            applyFiltersAndRender(true);
        }
    });

    $('#cmp-select-all, #cmp-select-all-bottom').on('change', function () {
        const ck = this.checked;
        for (const r of State.filteredRecords) {
            if (r.exempt || r.highRisk) continue;
            if (ck) {
                State.selectedIds.add(r.id);
            } else {
                State.selectedIds.delete(r.id);
            }
        }
        renderManagerTable();
    });

    $modal.on('change', '.cmp-row-check', function () {
        const id = decodeURIComponent($(this).data('id'));
        const rec = State.allRecords.find((r) => r.id === id);
        if (this.checked) {
            State.selectedIds.add(id);
            if (rec && rec.highRisk) State.manualHighRiskIds.add(id);
        } else {
            State.selectedIds.delete(id);
            State.manualHighRiskIds.delete(id);
        }
        syncSelectAllCheckbox();
        updateFooterSummary();
    });

    $modal.on('click', '.cmp-preview-btn', function () {
        openLightweightPreview(decodeURIComponent($(this).data('id')));
    });

    $modal.on('click', '.cmp-export-btn', function () {
        exportRecordToJsonl(decodeURIComponent($(this).data('id')), false);
    });

    $('#cmp-delete-btn').on('click', confirmAndDelete);

    const debouncedTrashSearch = debounce(() => renderTrashTable(), 100);
    $('#cmp-trash-search').on('input', debouncedTrashSearch);

    $modal.on('click', '.cmp-trash-restore', function () {
        restoreFromTrash(decodeURIComponent($(this).data('id')), false, false);
    });

    $modal.on('click', '.cmp-trash-export', function () {
        exportRecordToJsonl(decodeURIComponent($(this).data('id')), true);
    });

    $modal.on('click', '.cmp-trash-lock', async function () {
        const id = decodeURIComponent($(this).data('id'));
        const item = State.trashMetaList.find((m) => m.id === id);
        if (!item) return;
        const nextLocked = !item.locked;
        const nextExpires = nextLocked ? item.expiresAt : Date.now() + 3600000;
        const updated = { ...item, locked: nextLocked, expiresAt: nextExpires };
        const ok = await dbPut(STORE_TRASH_META, updated);
        if (ok) {
            item.locked = nextLocked;
            item.expiresAt = nextExpires;
            renderTrashTable();
        } else {
            toastr.error(isEn() ? 'Failed to update lock state' : '更新加锁状态失败');
        }
    });

    $modal.on('click', '.cmp-trash-del', function () {
        const id = decodeURIComponent($(this).data('id'));
        const item = State.trashMetaList.find((m) => m.id === id);
        if (!item) return;

        showSubModal(
            isEn() ? 'Confirm Permanent Destruction' : '确认永久销毁备份',
            isEn()
                ? `<p>Permanently destroy backup <code>${escapeHtml(item.chatFile)}</code> for <b>${escapeHtml(item.charName)}</b>?</p><p style="color:#fca5a5 !important; margin-bottom:0;">This action is irreversible!</p>`
                : `<p>确定要从回收站彻底销毁 <b>${escapeHtml(item.charName)}</b> 的聊天记录 <code>${escapeHtml(item.chatFile)}</code> 吗？</p><p style="color:#fca5a5 !important; margin-bottom:0;">销毁后数据将永久丢失，无法找回！</p>`,
            [
                { text: isEn() ? 'Cancel' : '取消', className: 'cmp-btn', onClick: closeSubModal },
                {
                    text: isEn() ? 'Destroy Permanently' : '确认永久销毁',
                    className: 'cmp-btn cmp-btn-danger',
                    onClick: async () => {
                        closeSubModal();
                        const ok = await removeTrashRecord(id);
                        if (!ok) {
                            toastr.error(isEn() ? 'Destroy failed: IndexedDB error' : '销毁失败：本地数据库事务异常');
                            return;
                        }
                        renderTrashTable();
                    }
                }
            ]
        );
    });

    $('#cmp-trash-restore-all').on('click', async () => {
        const snapshot = [...State.trashMetaList];
        if (snapshot.length === 0) return;
        let restored = 0;
        for (let i = 0; i < snapshot.length; i++) {
            setStatusUI(
                Math.round(((i + 1) / snapshot.length) * 100),
                isEn() ? `Restoring (${i + 1}/${snapshot.length})...` : `正在批量恢复回收站记录 (${i + 1}/${snapshot.length})...`
            );
            const ok = await restoreFromTrash(snapshot[i].id, false, true);
            if (ok) restored++;
        }
        renderTrashTable();
        applyFiltersAndRender(false);
        const failed = snapshot.length - restored;
        setStatusUI(
            100,
            isEn()
                ? `Batch restore done: <b>${restored}</b>/${snapshot.length} restored`
                : `批量恢复完成：已成功恢复 <b>${restored}</b>/${snapshot.length} 份记录`
        );
        if (failed > 0) {
            toastr.warning(
                isEn()
                    ? `Restored ${restored} chats, ${failed} failed (check console for details)`
                    : `已恢复 ${restored} 份记录，${failed} 份恢复失败（请检查控制台）`
            );
        } else {
            toastr.success(
                isEn()
                    ? `Successfully restored all ${restored} chats (conflicting files auto-renamed)`
                    : `已成功批量恢复全部 ${restored} 份记录（同名冲突项已自动添加后缀）`
            );
        }
    });

    $('#cmp-trash-clear-btn').on('click', () => {
        const unlocked = State.trashMetaList.filter((m) => !m.locked);
        if (unlocked.length === 0) {
            toastr.info(isEn() ? 'No unlocked records to clear' : '没有可清空的未加锁记录');
            return;
        }
        const totalKB = unlocked.reduce((s, m) => s + m.sizeKB, 0);

        showSubModal(
            isEn() ? 'Confirm Empty Trash Bin' : '确认清空回收站',
            isEn()
                ? `<p>About to permanently destroy <b>${unlocked.length}</b> unlocked backup(s) (${formatSize(totalKB)}).</p><p style="color:#fca5a5 !important; margin-bottom:0;">This action is irreversible!</p>`
                : `<p>即将永久销毁回收站中 <b>${unlocked.length}</b> 份未加锁的备份记录（共 ${formatSize(totalKB)}）。</p><p style="color:#fca5a5 !important; margin-bottom:0;">该操作不可逆，销毁后无法恢复！</p>`,
            [
                { text: isEn() ? 'Cancel' : '取消', className: 'cmp-btn', onClick: closeSubModal },
                {
                    text: isEn() ? `Destroy (${unlocked.length})` : `确认销毁 (${unlocked.length} 项)`,
                    className: 'cmp-btn cmp-btn-danger',
                    onClick: async () => {
                        closeSubModal();
                        const ids = unlocked.map((u) => u.id);
                        const ok = await dbDeleteTrashBatch(ids);
                        if (!ok) {
                            toastr.error(isEn() ? 'Failed to clear Trash: Storage error' : '销毁失败：浏览器存储事务异常，请稍后重试');
                            return;
                        }
                        State.trashMetaList = State.trashMetaList.filter((m) => m.locked);
                        $('#cmp-trash-badge').text(State.trashMetaList.length);
                        updateTrashTabVisibility();
                        renderTrashTable();
                        toastr.success(isEn() ? `Destroyed ${unlocked.length} unlocked backups` : `已永久销毁 ${unlocked.length} 条未加锁记录`);
                    }
                }
            ]
        );
    });

    // 设置项变更
    $('#cmp-set-lang').on('change', function () {
        saveSettings({ ...State.settings, lang: $(this).val() });
        applyLanguageToDOM();
    });
    $('#cmp-set-theme').on('change', function () {
        saveSettings({ ...State.settings, theme: $(this).val() });
    });
    $('#cmp-set-fontsize').on('input', function () {
        const v = Number($(this).val());
        $('#cmp-fontsize-val').text(v);
        saveSettings({ ...State.settings, fontSize: v });
    });
    $('#cmp-set-concurrency').on('change', function () {
        const v = Math.min(16, Math.max(2, Number($(this).val()) || 8));
        $(this).val(v);
        saveSettings({ ...State.settings, concurrency: v });
    });
    $('#cmp-set-large-kb').on('change', function () {
        const v = Math.min(10240, Math.max(5, Number($(this).val()) || 15));
        $(this).val(v);
        saveSettings({ ...State.settings, largeZombieSizeKB: v });
        applyFiltersAndRender(false);
    });

    $('#cmp-set-large-warn').on('change', function () {
        if (this.checked) {
            saveSettings({ ...State.settings, largeZombieWarn: true });
            applyFiltersAndRender(false);
            return;
        }
        this.checked = true;
        showSubModal(
            isEn() ? '⚠️ Disable Large-Size Few-Messages Warning?' : '⚠️ 确认关闭“异常大体积少消息警告”？',
            isEn()
                ? `<p>If disabled, files with <b>size ≥${State.settings.largeZombieSizeKB}KB but ≤2 messages</b> will no longer be flagged as High-Risk, and "Select Normal" or presets will select them automatically.</p><p style="color:#fca5a5 !important;">Risk: Crash-corrupted long chats (where only the greeting remains) might be accidentally deleted!</p>`
                : `<p>关闭后，当遇到<b>体积很大（≥${State.settings.largeZombieSizeKB}KB）但仅显示 0~2 条消息</b>的文件时，插件将不再标注「慎删」，且「全选」与「≤1条消息预设」会直接将它们一并勾选。</p><p style="color:#fca5a5 !important;">利害关系：若您的酒馆曾因崩溃导致几百 KB 的长篇聊天文件末尾损坏（仅剩开场白），关闭此警告后极易在清理 1 条消息废档时将其顺手误删！</p>`,
            [
                { text: isEn() ? 'Keep Enabled (Recommended)' : '保留开启 (推荐)', className: 'cmp-btn cmp-btn-primary', onClick: closeSubModal },
                {
                    text: isEn() ? 'Confirm Disable' : '确认关闭检测',
                    className: 'cmp-btn cmp-btn-danger',
                    onClick: () => {
                        closeSubModal();
                        $('#cmp-set-large-warn').prop('checked', false);
                        saveSettings({ ...State.settings, largeZombieWarn: false });
                        applyFiltersAndRender(false);
                    }
                }
            ]
        );
    });

    $('#cmp-set-verify').on('change', function () {
        if (this.checked) {
            saveSettings({ ...State.settings, verifyBeforeDelete: true });
            return;
        }
        this.checked = true;
        showSubModal(
            isEn() ? '⚠️ Disable Verify Before Delete?' : '⚠️ 警告：确认关闭“删除前核对文件状态”？',
            isEn()
                ? `<p>If disabled, the cleaner will delete files based solely on cached counts without checking live message counts.</p><p style="color:#fca5a5 !important;">Risk: Out-of-sync cache could lead to deleting chats that have new messages!</p>`
                : `<p>关闭此功能后，插件在执行批量删除时<b>将不再读取文件核对实际消息数</b>，直接按缓存列表发起物理删除。</p><p style="color:#fca5a5 !important;">利害关系：若您在插件外部新增了对话或缓存尚未同步，关闭核对可能导致已有新进展的聊天文件被直接误删！</p>`,
            [
                { text: isEn() ? 'Keep Enabled (Recommended)' : '保留开启 (推荐)', className: 'cmp-btn cmp-btn-primary', onClick: closeSubModal },
                {
                    text: isEn() ? 'Confirm Disable' : '已知晓风险，确认关闭',
                    className: 'cmp-btn cmp-btn-danger',
                    onClick: () => {
                        closeSubModal();
                        $('#cmp-set-verify').prop('checked', false);
                        saveSettings({ ...State.settings, verifyBeforeDelete: false });
                    }
                }
            ]
        );
    });

    $('#cmp-set-backup').on('change', function () {
        if (this.checked) {
            saveSettings({ ...State.settings, safeBackupMode: true });
            return;
        }
        this.checked = true;
        showSubModal(
            isEn() ? '⚠️ CRITICAL: Disable Auto Backup to Trash Bin?' : '⚠️ 严重警告：确认关闭“删除前自动备份至回收站”？',
            isEn()
                ? `<p>If disabled, cleaned chat files will be <b>permanently deleted from disk immediately</b> without going to the 60-minute Trash Bin!</p><p style="color:#fca5a5 !important;">Risk: Any accidental deletion will be completely unrecoverable.</p>`
                : `<p>关闭此功能后，执行清理的聊天文件将<b>直接从硬盘永久粉碎，不再进入 60 分钟回收站</b>！</p><p style="color:#fca5a5 !important;">利害关系：一旦误删任何聊天记录，您将无法通过本插件恢复。且关闭后（当回收站为空时）回收站入口将自动隐藏。</p>`,
            [
                { text: isEn() ? 'Keep Enabled (Strongly Recommended)' : '保留开启 (强烈推荐)', className: 'cmp-btn cmp-btn-primary', onClick: closeSubModal },
                {
                    text: isEn() ? 'Confirm Disable Backup' : '已知晓后果，确认关闭备份',
                    className: 'cmp-btn cmp-btn-danger',
                    onClick: () => {
                        closeSubModal();
                        $('#cmp-set-backup').prop('checked', false);
                        saveSettings({ ...State.settings, safeBackupMode: false });
                    }
                }
            ]
        );
    });
}

// ============================================================================
// 11. 挂载顶栏魔法棒菜单入口
// ============================================================================
jQuery(() => {
    const btnHtml = `
        <div id="cmp_open_btn" class="list-group-item flex-container flexGap5 interactable" title="${escapeHtml(t('menuTitle'))}">
            <i class="fa-solid fa-broom"></i>
            <span>${escapeHtml(t('menuBtn'))}</span>
        </div>
    `;
    if ($('#extensionsMenu').length && !$('#cmp_open_btn').length) {
        $('#extensionsMenu').append(btnHtml);
    }

    $(document).off('click.cmpOpen', '#cmp_open_btn').on('click.cmpOpen', '#cmp_open_btn', openManagerModal);
    purgeExpiredTrash();
});