document.addEventListener('DOMContentLoaded', () => {
    // --- Custom UI Dialog System (Replaces alert/prompt/confirm) ---
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
            
            if (options.type === 'prompt') {
                dialogInput.style.display = 'block';
                dialogInput.value = '';
                dialogInput.onkeydown = (e) => { if (e.key === 'Enter') handleConfirm(); };
            } else {
                dialogInput.style.display = 'none';
                dialogInput.onkeydown = null;
            }

            if (options.hideCancel) {
                btnDialogCancel.style.display = 'none';
            } else {
                btnDialogCancel.style.display = 'block';
            }

            dialogModal.classList.add('show');
            if (options.type === 'prompt') setTimeout(() => dialogInput.focus(), 100);

            const handleConfirm = () => {
                cleanup();
                resolve(options.type === 'prompt' ? dialogInput.value.trim() : true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(null);
            };

            const cleanup = () => {
                dialogModal.classList.remove('show');
                btnDialogConfirm.removeEventListener('click', handleConfirm);
                btnDialogCancel.removeEventListener('click', handleCancel);
            };

            btnDialogConfirm.addEventListener('click', handleConfirm);
            btnDialogCancel.addEventListener('click', handleCancel);
        });
    }

    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');

    // Toggle Settings Menu
    settingsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.remove('show');
        }
    });

    // Theme Toggle Logic
    let isLightMode = false;
    themeToggle.addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode', isLightMode);
        
        // Update Icon and Text
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (isLightMode) {
            icon.classList.replace('fa-moon', 'fa-sun');
            text.textContent = '白天模式';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            text.textContent = '夜间模式';
        }
    });

    // Music Toggle Logic
    let isPlaying = false;
    
    // Set volume to reasonable level
    bgMusic.volume = 0.3;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
        } else {
            // Browsers may block autoplay without user interaction, but since this is tied to a click event it will work
            bgMusic.play().catch(error => {
                console.error('Audio play failed:', error);
            });
            isPlaying = true;
        }
        
        const icon = musicToggle.querySelector('i');
        const text = musicToggle.querySelector('span');
        
        if (isPlaying) {
            icon.classList.replace('fa-music', 'fa-pause');
            text.textContent = '暂停音乐';
            // Optional: highlight the text/icon
            musicToggle.style.color = '#10b981';
        } else {
            icon.classList.replace('fa-pause', 'fa-music');
            text.textContent = '播放音乐';
            musicToggle.style.color = '';
        }
    });

    // --- Dynamic Background Particles ---
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }

        function createParticle() {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Randomize size between 2px and 5px
            const size = Math.random() * 3 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Randomize horizontal position (0 to 100%)
            particle.style.left = `${Math.random() * 100}vw`;
            
            // Randomize animation duration (8s to 20s)
            const duration = Math.random() * 12 + 8;
            particle.style.animationDuration = `${duration}s`;
            
            // Randomize animation delay (0s to 12s)
            particle.style.animationDelay = `${Math.random() * 12}s`;
            
            // Add horizontal drift
            const drift = (Math.random() - 0.5) * 60;
            particle.style.transform = `translateX(${drift}px)`;
            
            particlesContainer.appendChild(particle);
            
            // Allow particle to respawn when animation finishes
            particle.addEventListener('animationend', () => {
                particle.remove();
                createParticle();
            });
        }
    }

    // --- Navigation Tabs Logic ---
    const navLinks = document.querySelectorAll('#nav-tabs a');
    const navSections = document.querySelectorAll('.nav-section');
    
    let isSecretUnlocked = false;

    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            if (targetId === 'secret' && !isSecretUnlocked) {
                const pwd = await showDialog({
                    title: '<i class="fa-solid fa-lock"></i> 私密空间',
                    message: '进入秘密小屋需要通行黑卡。<br><span style="font-size:0.85rem; color: rgba(255,255,255,0.5);">(提示：一种酸甜可口的水果拼音)</span>',
                    type: 'prompt'
                });
                if (pwd === "youzi") {
                    isSecretUnlocked = true;
                    await showDialog({ title: '✅ 认证成功', message: '权限已解禁，欢迎踏入属于你的绝对安全屋片段。', hideCancel: true });
                } else {
                    if (pwd !== null) await showDialog({ title: '❌ 认证被拒', message: '口令错误，已被拦截机制阻挡在外。', hideCancel: true });
                    return; // Abort tab switch
                }
            }

            // Remove active class from all nav items
            document.querySelectorAll('#nav-tabs li').forEach(li => li.classList.remove('active'));
            // Add active class to clicked item
            link.parentElement.classList.add('active');

            // Hide all sections
            navSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // --- Custom Add/Edit (Mini-CMS) Logic ---
    const addBtns = document.querySelectorAll('.add-btn');
    const modal = document.getElementById('add-modal');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm');
    const inputTitle = document.getElementById('modal-input-title');
    const inputDesc = document.getElementById('modal-input-desc');
    const inputRating = document.getElementById('modal-input-rating');
    const modalTitle = document.getElementById('modal-title');
    const projectsGrid = document.getElementById('projects-grid');
    const notesGrid = document.getElementById('notes-grid');
    const diaryGrid = document.getElementById('diary-grid');
    const softwareGrid = document.getElementById('software-grid');
    const secretGrid = document.getElementById('secret-grid');
    const previewArea = document.getElementById('modal-preview-area');

    let currentAddType = '';
    let isEditing = false;
    let editIndex = -1;

    const defaultProjects = [
        {
            title: '🌐 Jasmine 个人网站',
            desc: '现代化个人网站，采用玻璃毛玻璃设计，支持深色/浅色主题切换、内容管理系统、粒子背景动画等功能。',
            bg: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)',
            rating: 5
        },
        {
            title: '📘 JXUT-BST 官网',
            desc: '蓝色技术工作室官网，使用 VitePress 构建。采用 Vue + TypeScript 技术栈，提供完整的文档和项目展示平台。',
            bg: 'linear-gradient(135deg, rgba(30,144,255,0.8) 0%, rgba(0,191,255,0.8) 100%)',
            rating: 5
        },
        {
            title: '📝 心流笔记 App',
            desc: '兼具记笔记和复盘功能的应用。帮助用户记录学习过程中的心流状态，支持知识复盘和回顾功能。',
            bg: 'linear-gradient(135deg, rgba(34,197,94,0.8) 0%, rgba(16,185,129,0.8) 100%)',
            rating: 4
        },
        {
            title: '🤖 Raicom Intelli Scout',
            desc: '智能侦查系统项目，结合机器人技术和AI算法，用于数据分析和智能决策支持。',
            bg: 'linear-gradient(135deg, rgba(244,114,182,0.8) 0%, rgba(168,85,247,0.8) 100%)',
            rating: 5
        },
        {
            title: '👨‍💻 Ryker-Zhong 个人档案',
            desc: '个人档案库，展示技术栈和开源贡献。专注于机器人技术、嵌入式系统和前端可视化开发。',
            bg: 'linear-gradient(135deg, rgba(251,146,60,0.8) 0%, rgba(249,115,22,0.8) 100%)',
            rating: 5
        }
    ];

    const defaultNotes = [];

    const defaultDiary = [];

    const defaultSoftware = [
        {
            title: '🧠 Obsidian - 知识管理工具',
            desc: '强大的笔记和知识管理应用，支持双向链接、图谱视图、插件系统。完美用于个人知识库、研究笔记、文献管理等场景。',
            downloadUrl: 'https://obsidian.md/download',
            rating: 5
        },
        {
            title: '🛠️ HiBit Uninstaller - 卸载工具',
            desc: '专业软件卸载工具，可彻底删除程序残留文件和注册表项。比Windows自带卸载工具更深度和有效。',
            downloadUrl: 'downloads/HiBitUninstaller-setup-3.2.55.exe',
            rating: 5
        },
        {
            title: '🖥️ NoMachine - 远程桌面',
            desc: '免费高效的远程桌面软件，支持远程访问和控制。适合远程办公、技术支持、文件传输等场景。',
            downloadUrl: 'downloads/nomachine_9.2.18_1_x64.exe',
            rating: 5
        },
        {
            title: '🎨 PixPin - 截图工具',
            desc: '现代化的截图和标注工具，支持滚动截图、贴图、标记等功能。界面美观，操作快速高效。',
            downloadUrl: 'downloads/PixPin_cn_zh-cn_2.2.4.1.exe',
            rating: 5
        },
        {
            title: '⚡ PowerToys - 系统增强工具',
            desc: 'Microsoft官方出品的Windows系统增强工具集。包含快速查看、文件批量重命名、窗口管理等功能。',
            downloadUrl: 'https://github.com/microsoft/PowerToys/releases',
            rating: 5
        },
        {
            title: '📦 WinRAR - 压缩工具',
            desc: '业界标准的压缩和解压软件，支持RAR、ZIP等多种格式。稳定可靠，功能全面强大。',
            downloadUrl: 'downloads/winrar-x64-700scp.exe',
            rating: 5
        },
        {
            title: '📡 Xftp - 文件传输',
            desc: '专业的SFTP/FTP文件传输工具，安全高效。适合与远程服务器传输文件。',
            downloadUrl: 'downloads/Xftp-8.0.0082p.exe',
            rating: 5
        }
    ];

    const defaultSecret = [];

    function getStoredData(key, defaultData) {
        const data = localStorage.getItem(key);
        if (!data) {
            localStorage.setItem(key, JSON.stringify(defaultData));
            return defaultData;
        }
        return JSON.parse(data);
    }

    function renderCards(gridElement, dataKey, itemsArray, typeLabel, typeString) {
        if (!gridElement) return;
        gridElement.innerHTML = '';
        itemsArray.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('item-card');
            
            if (item.bg) {
                card.classList.add('has-bg');
                // 支持 URL 和 gradient
                if (item.bg.includes('url(') || item.bg.includes('http')) {
                    card.style.backgroundImage = `url(${item.bg})`;
                } else {
                    card.style.background = item.bg;
                }
            }
            
            let ratingHtml = '';
            if (item.rating) {
                const num = parseInt(item.rating) || 5;
                ratingHtml = `<div class="rating-stars">${'★'.repeat(num)}${'☆'.repeat(5-num)}</div>`;
            }
            
            let downloadBtnHtml = '';
            if (typeString === 'software' && item.downloadUrl) {
                downloadBtnHtml = `<a href="${item.downloadUrl}" class="download-btn" title="下载" download><i class="fa-solid fa-download"></i> 下载</a>`;
            }
            
            card.innerHTML = `
                <h3>${item.title}</h3>
                ${ratingHtml}
                <p>${item.desc}</p>
                ${downloadBtnHtml}
                <button class="edit-btn" data-index="${index}" title="编辑"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" data-index="${index}" title="删除"><i class="fa-solid fa-trash"></i></button>
            `;
            
            card.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const isConfirmed = await showDialog({
                    title: '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> 删除操作',
                    message: `您确定要永久删除 ${typeLabel} <br><b>"${item.title}"</b> 吗？此举不可逆！`,
                    type: 'confirm'
                });
                
                if (isConfirmed) {
                    itemsArray.splice(index, 1);
                    localStorage.setItem(dataKey, JSON.stringify(itemsArray));
                    renderAll();
                }
            });
            
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(typeString, true, index, item);
            });
            
            gridElement.appendChild(card);
        });
    }

    function renderAll() {
        renderCards(projectsGrid, 'customProjects', getStoredData('customProjects', defaultProjects), '项目', 'project');
        renderCards(diaryGrid, 'customDiary', getStoredData('customDiary', defaultDiary), '日记', 'diary');
        renderCards(softwareGrid, 'customSoftware', getStoredData('customSoftware', defaultSoftware), '点评', 'software');
        renderCards(notesGrid, 'customNotes', getStoredData('customNotes', defaultNotes), '笔记', 'note');
        renderCards(secretGrid, 'customSecret', getStoredData('customSecret', defaultSecret), '密信', 'secret');
    }

    // 在渲染前清除本地存储中与这五类内容相关的键，彻底删除已保存的条目
    ['customProjects','customNotes','customDiary','customSoftware','customSecret'].forEach(key => {
        try { localStorage.removeItem(key); } catch(e) { console.warn('localStorage remove failed', e); }
    });

    // Initialize loaded items（空数据）
    renderAll();

    // --- Admin Mode Easter Egg ---
    const avatar = document.querySelector('.avatar');
    let clickCount = 0;
    let clickTimer;

    if (avatar) {
        avatar.addEventListener('click', async () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 1200);

            if (clickCount === 5) {
                clickCount = 0;
                const pwd = await showDialog({
                    title: '<i class="fa-solid fa-user-shield"></i> 站长系统',
                    message: '检测到特权触碰，请输入最高权限密匙。<br><span style="font-size:0.85rem; color: rgba(255,255,255,0.5);">(提示：代表系统管理员的5个英文字母)</span>',
                    type: 'prompt'
                });
                if (pwd === "admin") {
                    document.body.classList.toggle('admin-mode');
                    if (document.body.classList.contains('admin-mode')) {
                        await showDialog({ title: '🎉 终极权限已激活', message: '「全部四大板块」的内部管控台现已解锁开放！', hideCancel: true });
                    } else {
                        await showDialog({ title: '🔒 潜行模式', message: '已彻底退出站长模式，重新归隐并锁定所有修改后台。', hideCancel: true });
                    }
                } else if (pwd !== null) {
                    await showDialog({ title: '⚠️ 非法操作', message: '指纹或密匙无匹配信息，只有真正的主人才有权触碰。', hideCancel: true });
                }
            }
        });
    }

    // Open Modal Function
    function openModal(type, editing = false, index = -1, itemData = null) {
        currentAddType = type;
        isEditing = editing;
        editIndex = index;
        
        const inputBg = document.getElementById('modal-input-bg');
        const inputDownload = document.getElementById('modal-input-download');

        inputDesc.style.display = 'block';
        if (inputRating) inputRating.style.display = 'block';
        if (inputDownload) inputDownload.style.display = 'none';

        if (type === 'project') {
            modalTitle.textContent = editing ? '编辑项目作品' : '发布新项目作品';
        } else if (type === 'diary') {
            modalTitle.textContent = editing ? '编辑生活日记' : '写下新日记';
        } else if (type === 'software') {
            modalTitle.textContent = editing ? '编辑工具点评' : '发布新点评';
            if (inputDownload) inputDownload.style.display = 'block';
        } else if (type === 'note') {
            modalTitle.textContent = editing ? '编辑学习笔记' : '发布新笔记';
        } else if (type === 'secret') {
            modalTitle.textContent = editing ? '翻阅私密档案' : '封装加密档案';
        }
        
        if (editing && itemData) {
            inputTitle.value = itemData.title || '';
            inputDesc.value = itemData.desc || '';
            if (inputBg) inputBg.value = itemData.bg || '';
            if (inputDownload) inputDownload.value = itemData.downloadUrl || '';
            if (inputRating && itemData.rating) inputRating.value = itemData.rating; else if (inputRating) inputRating.value = '5';
        } else {
            inputTitle.value = '';
            inputDesc.value = '';
            if (inputBg) inputBg.value = '';
            if (inputDownload) inputDownload.value = '';
            if (inputRating) inputRating.value = '5';
        }
        
        modal.classList.add('show');
        updatePreview(); // Trigger first preview render
    }

    // --- Live Preview Logic ---
    function updatePreview() {
        if (!previewArea) return;
        const title = inputTitle.value.trim() || '在此实时预览标题...';
        const desc = inputDesc.value.trim() || '在这里显示具体的描述和点评内容...';
        const inputBg = document.getElementById('modal-input-bg');
        const bg = inputBg ? inputBg.value.trim() : '';
        const rating = (inputRating && inputRating.style.display !== 'none') ? parseInt(inputRating.value) || 5 : 5;

        previewArea.innerHTML = '';

        const card = document.createElement('div');
        card.classList.add('item-card');
        if (bg) {
            card.classList.add('has-bg');
            // 支持 URL 和 gradient
            if (bg.includes('url(') || bg.includes('http')) {
                card.style.backgroundImage = `url(${bg})`;
            } else {
                card.style.background = bg;
            }
        }
        
        const ratingHtml = `<div class="rating-stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>`;
        
        card.innerHTML = `
            <h3>${title}</h3>
            ${ratingHtml}
            <p>${desc}</p>
        `;
        previewArea.appendChild(card);
    }

    // Attach listeners for live preview updates
    [inputTitle, inputDesc, document.getElementById('modal-input-bg'), inputRating].forEach(el => {
        if (el) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    // Attach Add Button Listeners
    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.getAttribute('data-type'), false);
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('show');
    }

    btnCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Confirm Add / Update
    btnConfirm.addEventListener('click', () => {
        const title = inputTitle.value.trim();
        const desc = inputDesc.value.trim();
        const inputBg = document.getElementById('modal-input-bg');
        const inputDownload = document.getElementById('modal-input-download');
        const bg = inputBg ? inputBg.value.trim() : '';
        const downloadUrl = inputDownload ? inputDownload.value.trim() : '';
        const rating = (inputRating && inputRating.style.display !== 'none') ? inputRating.value : '5';

        if (!title) {
            showDialog({ title: '⚠️ 无法发布', message: '卡片的名称或核心标题必须填写！', hideCancel: true });
            return;
        }

        let storeKey = '';
        let defaultData = [];
        const itemPayload = { title, desc, bg, rating };
        
        // 软件类型添加下载链接
        if (currentAddType === 'software' && downloadUrl) {
            itemPayload.downloadUrl = downloadUrl;
        }

        if (currentAddType === 'project') {
            storeKey = 'customProjects';
            defaultData = defaultProjects;
        } else if (currentAddType === 'diary') {
            storeKey = 'customDiary';
            defaultData = defaultDiary;
        } else if (currentAddType === 'software') {
            storeKey = 'customSoftware';
            defaultData = defaultSoftware;
        } else if (currentAddType === 'note') {
            storeKey = 'customNotes';
            defaultData = defaultNotes;
        } else if (currentAddType === 'secret') {
            storeKey = 'customSecret';
            defaultData = defaultSecret;
        }

        const items = getStoredData(storeKey, defaultData);
        if (isEditing && editIndex > -1) {
            items[editIndex] = itemPayload;
        } else {
            items.push(itemPayload);
        }
        localStorage.setItem(storeKey, JSON.stringify(items));
        
        renderAll();
        closeModal();
    });

    // --- Email Modal Logic ---
    const emailIconLink = document.getElementById('email-icon-link');
    const emailModal = document.getElementById('email-modal');
    const closeEmailBtn = document.getElementById('close-email-btn');
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');

    if (emailIconLink && emailModal) {
        emailIconLink.addEventListener('click', (e) => {
            e.preventDefault();
            emailModal.classList.add('show');
        });

        closeEmailBtn.addEventListener('click', () => {
            emailModal.classList.remove('show');
        });

        emailModal.addEventListener('click', (e) => {
            if (e.target === emailModal) {
                emailModal.classList.remove('show');
            }
        });

        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailText.innerText).then(() => {
                const originalHtml = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
                copyEmailBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                copyEmailBtn.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                copyEmailBtn.style.color = '#10b981';
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHtml;
                    copyEmailBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                    copyEmailBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    copyEmailBtn.style.color = 'white';
                }, 2000);
            }).catch(err => {
                alert('复制失败，请手动选择复制。');
            });
        });
    }
});
