document.addEventListener('DOMContentLoaded', () => {
    // ────────── Dialog System ──────────
    const dialogModal = document.getElementById('dialog-modal');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMessage = document.getElementById('dialog-message');
    const dialogInput = document.getElementById('dialog-input');
    const btnDialogCancel = document.getElementById('dialog-cancel');
    const btnDialogConfirm = document.getElementById('dialog-confirm');

    function showDialog(options) {
        return new Promise((resolve) => {
            dialogTitle.innerHTML = options.title || '<i class="fa-solid fa-circle-info"></i> 提示';
            dialogMessage.innerHTML = options.message || '';
            dialogInput.style.display = options.type === 'prompt' ? 'block' : 'none';
            dialogInput.value = '';
            btnDialogCancel.style.display = options.hideCancel ? 'none' : 'block';
            dialogModal.classList.add('show');
            if (options.type === 'prompt') setTimeout(() => dialogInput.focus(), 100);

            const cleanup = (result) => {
                dialogModal.classList.remove('show');
                btnDialogConfirm.removeEventListener('click', onConfirm);
                btnDialogCancel.removeEventListener('click', onCancel);
                resolve(result);
            };
            const onConfirm = () => cleanup(options.type === 'prompt' ? dialogInput.value.trim() : true);
            const onCancel = () => cleanup(null);
            btnDialogConfirm.addEventListener('click', onConfirm);
            btnDialogCancel.addEventListener('click', onCancel);
            if (options.type === 'prompt') dialogInput.onkeydown = (e) => { if (e.key === 'Enter') onConfirm(); };
        });
    }

    // ────────── Settings ──────────
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isLightMode = false, isPlaying = false;
    bgMusic.volume = 0.3;

    settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); settingsMenu.classList.toggle('show'); });
    document.addEventListener('click', (e) => { if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target)) settingsMenu.classList.remove('show'); });

    themeToggle.addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode', isLightMode);
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (isLightMode) { icon.classList.replace('fa-moon', 'fa-sun'); text.textContent = '白天模式'; }
        else { icon.classList.replace('fa-sun', 'fa-moon'); text.textContent = '夜间模式'; }
    });

    musicToggle.addEventListener('click', () => {
        if (isPlaying) { bgMusic.pause(); isPlaying = false; }
        else { bgMusic.play().catch(console.error); isPlaying = true; }
        const icon = musicToggle.querySelector('i');
        const text = musicToggle.querySelector('span');
        if (isPlaying) { icon.classList.replace('fa-music', 'fa-pause'); text.textContent = '暂停音乐'; musicToggle.style.color = '#10b981'; }
        else { icon.classList.replace('fa-pause', 'fa-music'); text.textContent = '播放音乐'; musicToggle.style.color = ''; }
    });

    // ────────── Particles ──────────
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        for (let i = 0; i < 40; i++) createParticle();
        function createParticle() {
            const p = document.createElement('div');
            p.classList.add('particle');
            const s = Math.random() * 3 + 2;
            p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}vw;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*12}s;transform:translateX(${(Math.random()-0.5)*60}px)`;
            particlesContainer.appendChild(p);
            p.addEventListener('animationend', () => { p.remove(); createParticle(); });
        }
    }

    // ────────── Navigation ──────────
    const navLinks = document.querySelectorAll('#nav-tabs a');
    const navSections = document.querySelectorAll('.nav-section');
    let isSecretUnlocked = false;

    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            if (targetId === 'secret' && !isSecretUnlocked) {
                const pwd = await showDialog({ title: '<i class="fa-solid fa-lock"></i> 私密空间', message: '进入秘密小屋需要通行黑卡。<br><span style="font-size:0.85rem; color: rgba(255,255,255,0.5);">(提示：一种酸甜可口的水果拼音)</span>', type: 'prompt' });
                if (pwd === "youzi") { isSecretUnlocked = true; await showDialog({ title: '✅ 认证成功', message: '权限已解禁，欢迎踏入属于你的绝对安全屋片段。', hideCancel: true }); }
                else { if (pwd !== null) await showDialog({ title: '❌ 认证被拒', message: '口令错误，已被拦截机制阻挡在外。', hideCancel: true }); return; }
            }

            document.querySelectorAll('#nav-tabs li').forEach(li => li.classList.remove('active'));
            link.parentElement.classList.add('active');
            navSections.forEach(s => s.classList.remove('active'));
            const ts = document.getElementById(targetId);
            if (ts) ts.classList.add('active');
        });
    });

    // ────────── Data Layer ──────────
    const VERSION = '3.0';
    const API = {
        projects: 'data/projects.json',
        notes: 'data/notes.json',
        software: 'data/software.json'
    };

    let serverData = { projects: [], notes: [], software: [] };

    async function fetchJSON(url) {
        const r = await fetch(url + '?v=' + Date.now());
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        return Array.isArray(d) ? d : [];
    }

    async function loadServerData() {
        const results = await Promise.allSettled([
            fetchJSON(API.projects).then(d => serverData.projects = d),
            fetchJSON(API.notes).then(d => serverData.notes = d),
            fetchJSON(API.software).then(d => serverData.software = d)
        ]);
    }

    function loadFromStorage(key) {
        try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }
        catch { return []; }
    }

    function saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getAllItems(type) {
        const server = [...serverData[type]];
        const user = loadFromStorage('user_' + type);
        return [...server, ...user];
    }

    // Track which items belong to user vs server
    function isUserItem(type, index) {
        const serverLen = serverData[type].length;
        return index >= serverLen;
    }

    function getItemSource(type, index) {
        const serverLen = serverData[type].length;
        if (index < serverLen) return { source: 'server', localIndex: index };
        return { source: 'user', localIndex: index - serverLen };
    }

    function removeItem(type, combinedIndex) {
        const info = getItemSource(type, combinedIndex);
        if (info.source === 'user') {
            const items = loadFromStorage('user_' + type);
            items.splice(info.localIndex, 1);
            saveToStorage('user_' + type, items);
        } else if (info.source === 'server') {
            let hidden = loadFromStorage('hidden_' + type);
            if (!hidden.includes(info.localIndex)) hidden.push(info.localIndex);
            saveToStorage('hidden_' + type, hidden);
        }
    }

    function updateItem(type, combinedIndex, payload) {
        const info = getItemSource(type, combinedIndex);
        if (info.source === 'user') {
            const items = loadFromStorage('user_' + type);
            items[info.localIndex] = payload;
            saveToStorage('user_' + type, items);
        } else if (info.source === 'server') {
            let overrides = loadFromStorage('override_' + type);
            overrides[info.localIndex] = payload;
            saveToStorage('override_' + type, overrides);
        }
    }

    function getEffectiveItems(type) {
        const server = serverData[type];
        const hidden = loadFromStorage('hidden_' + type);
        const overrides = loadFromStorage('override_' + type);
        const user = loadFromStorage('user_' + type);
        const result = [];
        server.forEach((item, i) => {
            if (hidden.includes(i)) return;
            result.push(overrides[i] || item);
        });
        result.push(...user);
        return result;
    }

    // ────────── Render ──────────
    const grids = {
        projects: document.getElementById('projects-grid'),
        notes: document.getElementById('notes-grid'),
        diary: document.getElementById('diary-grid'),
        software: document.getElementById('software-grid'),
        secret: document.getElementById('secret-grid')
    };

    function renderGrid(grid, items, type, label) {
        if (!grid) return;
        grid.innerHTML = '';
        if (!items || items.length === 0) {
            grid.innerHTML = '<div class="empty-card"><p>当前暂无内容，点击右上角"+"按钮添加新条目。</p></div>';
            return;
        }
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('item-card');
            if (item.bg) {
                card.classList.add('has-bg');
                if (item.bg.includes('url(') || item.bg.includes('http')) card.style.backgroundImage = `url(${item.bg})`;
                else card.style.background = item.bg;
            }
            const stars = item.rating ? parseInt(item.rating) || 5 : 5;
            const ratingHtml = `<div class="rating-stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>`;
            let extra = '';
            if (type === 'software' && item.downloadUrl) extra += `<a href="${item.downloadUrl}" class="download-btn" title="下载" download><i class="fa-solid fa-download"></i> 下载</a>`;
            if (type === 'note' && item.noteUrl) extra += `<a href="${item.noteUrl}" class="view-btn" title="查看笔记" target="_blank"><i class="fa-solid fa-book-open"></i> 查看</a>`;
            card.innerHTML = `<h3>${item.title}</h3>${ratingHtml}<p>${item.desc || ''}</p>${extra}<button class="edit-btn" data-index="${index}" title="编辑"><i class="fa-solid fa-pen"></i></button><button class="delete-btn" data-index="${index}" title="删除"><i class="fa-solid fa-trash"></i></button>`;

            card.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const ok = await showDialog({ title: '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> 删除操作', message: `您确定要永久删除 ${label} <br><b>"${item.title}"</b> 吗？此举不可逆！`, type: 'confirm' });
                if (ok) { removeItem(type, index); renderAll(); }
            });
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(type, true, index, item);
            });
            grid.appendChild(card);
        });
    }

    function renderAll() {
        renderGrid(grids.projects, getEffectiveItems('projects'), 'projects', '项目');
        renderGrid(grids.notes, getEffectiveItems('notes'), 'notes', '笔记');
        renderGrid(grids.diary, loadFromStorage('user_diary'), 'diary', '日记');
        renderGrid(grids.software, getEffectiveItems('software'), 'software', '点评');
        renderGrid(grids.secret, loadFromStorage('user_secret'), 'secret', '密信');
    }

    // ────────── Modal ──────────
    const addBtns = document.querySelectorAll('.add-btn');
    const modal = document.getElementById('add-modal');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm');
    const inputTitle = document.getElementById('modal-input-title');
    const inputDesc = document.getElementById('modal-input-desc');
    const inputBg = document.getElementById('modal-input-bg');
    const inputDownload = document.getElementById('modal-input-download');
    const inputNote = document.getElementById('modal-input-note');
    const inputRating = document.getElementById('modal-input-rating');
    const modalTitle = document.getElementById('modal-title');
    const previewArea = document.getElementById('modal-preview-area');

    let currentType = '', editingIndex = -1, editPayload = null;

    function openModal(type, editing = false, index = -1, item = null) {
        currentType = type; editingIndex = editing ? index : -1; editPayload = editing && editingIndex !== -1 ? { ...item } : null;
        inputDesc.style.display = 'block';
        inputRating.style.display = 'block';
        inputDownload.style.display = type === 'software' ? 'block' : 'none';
        inputNote.style.display = type === 'note' ? 'block' : 'none';

        const titles = { project: '项目作品', diary: '生活日记', software: '工具点评', note: '学习笔记', secret: '加密档案' };
        modalTitle.textContent = editing ? '编辑' + titles[type] : '发布新' + (titles[type] || '');

        if (editing && item) {
            inputTitle.value = item.title || '';
            inputDesc.value = item.desc || '';
            if (inputBg) inputBg.value = item.bg || '';
            if (inputDownload) inputDownload.value = item.downloadUrl || '';
            if (inputNote) inputNote.value = item.noteUrl || '';
            if (inputRating) inputRating.value = item.rating || '5';
        } else {
            [inputTitle, inputDesc, inputBg, inputDownload, inputNote].forEach(el => { if (el) el.value = ''; });
            if (inputRating) inputRating.value = '5';
        }
        modal.classList.add('show');
        updatePreview();
    }

    function closeModal() { modal.classList.remove('show'); }

    function updatePreview() {
        if (!previewArea) return;
        const title = inputTitle.value.trim() || '在此实时预览标题...';
        const desc = inputDesc.value.trim() || '在这里显示具体的描述和点评内容...';
        const bg = inputBg ? inputBg.value.trim() : '';
        const rating = (inputRating && inputRating.style.display !== 'none') ? parseInt(inputRating.value) || 5 : 5;
        previewArea.innerHTML = '';
        const card = document.createElement('div');
        card.classList.add('item-card');
        if (bg) {
            card.classList.add('has-bg');
            if (bg.includes('url(') || bg.includes('http')) card.style.backgroundImage = `url(${bg})`;
            else card.style.background = bg;
        }
        card.innerHTML = `<h3>${title}</h3><div class="rating-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div><p>${desc}</p>`;
        previewArea.appendChild(card);
    }

    [inputTitle, inputDesc, inputBg, inputRating].forEach(el => { if (el) { el.addEventListener('input', updatePreview); el.addEventListener('change', updatePreview); } });
    addBtns.forEach(btn => btn.addEventListener('click', () => openModal(btn.getAttribute('data-type'))));
    btnCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    btnConfirm.addEventListener('click', () => {
        const title = inputTitle.value.trim();
        if (!title) { showDialog({ title: '⚠️ 无法发布', message: '卡片的名称或核心标题必须填写！', hideCancel: true }); return; }
        const payload = {
            title,
            desc: inputDesc.value.trim(),
            bg: inputBg ? inputBg.value.trim() : '',
            rating: (inputRating && inputRating.style.display !== 'none') ? inputRating.value : '5'
        };
        if (currentType === 'software' && inputDownload) payload.downloadUrl = inputDownload.value.trim();
        if (currentType === 'note' && inputNote) payload.noteUrl = inputNote.value.trim();

        if (editingIndex !== -1) {
            updateItem(currentType, editingIndex, payload);
        } else {
            const userKey = 'user_' + currentType;
            const items = loadFromStorage(userKey);
            items.push(payload);
            saveToStorage(userKey, items);
        }
        renderAll();
        closeModal();
    });

    // ────────── Admin Mode ──────────
    const avatar = document.querySelector('.avatar');
    let clickCount = 0, clickTimer;
    if (avatar) {
        avatar.addEventListener('click', async () => {
            clickCount++; clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 1200);
            if (clickCount === 5) {
                clickCount = 0;
                const pwd = await showDialog({ title: '<i class="fa-solid fa-user-shield"></i> 站长系统', message: '检测到特权触碰，请输入最高权限密匙。<br><span style="font-size:0.85rem; color: rgba(255,255,255,0.5);">(提示：代表系统管理员的5个英文字母)</span>', type: 'prompt' });
                if (pwd === "admin") {
                    document.body.classList.toggle('admin-mode');
                    await showDialog({ title: document.body.classList.contains('admin-mode') ? '🎉 终极权限已激活' : '🔒 潜行模式', message: document.body.classList.contains('admin-mode') ? '「全部四大板块」的内部管控台现已解锁开放！' : '已彻底退出站长模式，重新归隐并锁定所有修改后台。', hideCancel: true });
                } else if (pwd !== null) await showDialog({ title: '⚠️ 非法操作', message: '指纹或密匙无匹配信息，只有真正的主人才有权触碰。', hideCancel: true });
            }
        });
    }

    // ────────── Email Modal ──────────
    const emailIconLink = document.getElementById('email-icon-link');
    const emailModal = document.getElementById('email-modal');
    const closeEmailBtn = document.getElementById('close-email-btn');
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');
    if (emailIconLink && emailModal) {
        emailIconLink.addEventListener('click', (e) => { e.preventDefault(); emailModal.classList.add('show'); });
        closeEmailBtn.addEventListener('click', () => emailModal.classList.remove('show'));
        emailModal.addEventListener('click', (e) => { if (e.target === emailModal) emailModal.classList.remove('show'); });
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailText.innerText).then(() => {
                const orig = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
                copyEmailBtn.style.cssText = 'background:rgba(16,185,129,0.2);border-color:rgba(16,185,129,0.5);color:#10b981';
                setTimeout(() => { copyEmailBtn.innerHTML = orig; copyEmailBtn.style.cssText = ''; }, 2000);
            }).catch(() => alert('复制失败，请手动选择复制。'));
        });
    }

    // ────────── Debug Panel ──────────
    function createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.innerHTML = `
<div class="debug-header"><span>🔧 Debug Panel</span><button id="debug-close">×</button></div>
<div class="debug-body">
<div class="debug-section"><div class="debug-label">版本</div><div class="debug-value">${VERSION}</div></div>
<div class="debug-section"><div class="debug-label">服务器数据</div><div class="debug-value" id="dbg-server">加载中...</div></div>
<div class="debug-section"><div class="debug-label">存储</div><div class="debug-value" id="dbg-storage">加载中...</div></div>
<div class="debug-actions">
<button id="dbg-refresh" class="debug-btn">🔄 刷新服务器数据</button>
<button id="dbg-reset" class="debug-btn debug-btn-danger">🗑️ 重置全部数据</button>
</div>
<div id="dbg-toast" class="debug-toast"></div>
</div>`;
        document.body.appendChild(panel);
        document.getElementById('debug-close').onclick = () => panel.classList.remove('show');
        document.getElementById('dbg-refresh').onclick = async () => { showToast('正在刷新...'); await loadServerData(); renderAll(); updateDebug(); showToast('✅ 已刷新'); };
        document.getElementById('dbg-reset').onclick = () => { localStorage.clear(); showToast('已重置，即将刷新...'); setTimeout(() => location.reload(), 500); };
    }

    function updateDebug() {
        const se = document.getElementById('dbg-server');
        const ste = document.getElementById('dbg-storage');
        if (se) se.innerHTML = `projects: ${serverData.projects.length} 条<br>notes: ${serverData.notes.length} 条<br>software: ${serverData.software.length} 条`;
        if (ste) {
            const keys = ['user_projects', 'user_notes', 'user_diary', 'user_software', 'user_secret', 'hidden_projects', 'hidden_notes', 'hidden_software', 'override_projects', 'override_notes', 'override_software'];
            ste.innerHTML = keys.map(k => {
                const d = loadFromStorage(k);
                return `${k}: ${Array.isArray(d) ? d.length : 0} 条`;
            }).join('<br>');
        }
    }

    let toastTimer;

    function showToast(msg) {
        const el = document.getElementById('dbg-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            const p = document.getElementById('debug-panel');
            if (p) { p.classList.toggle('show'); if (p.classList.contains('show')) updateDebug(); }
        }
    });

    // ────────── Init ──────────
    (async () => {
        const v = localStorage.getItem('_ver');
        if (v !== VERSION) {
            localStorage.clear();
            localStorage.setItem('_ver', VERSION);
        }
        await loadServerData();
        renderAll();
        createDebugPanel();
    })();
});
