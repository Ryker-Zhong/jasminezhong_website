document.addEventListener('DOMContentLoaded', () => {
    // ────────── Settings ──────────
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isLightMode = false, isPlaying = false;
    bgMusic.volume = 0.3;

    settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); settingsMenu.classList.toggle('show'); });
    document.addEventListener('click', (e) => {
        if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target)) settingsMenu.classList.remove('show');
    });

    themeToggle.addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode', isLightMode);
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (isLightMode) { icon.className = 'fa-solid fa-moon'; text.textContent = '夜间模式'; }
        else { icon.className = 'fa-solid fa-sun'; text.textContent = '白天模式'; }
    });

    musicToggle.addEventListener('click', () => {
        if (isPlaying) { bgMusic.pause(); isPlaying = false; }
        else { bgMusic.play().catch(console.error); isPlaying = true; }
        const icon = musicToggle.querySelector('i');
        const text = musicToggle.querySelector('span');
        if (isPlaying) { icon.className = 'fa-solid fa-pause'; text.textContent = '暂停音乐'; musicToggle.style.color = '#10b981'; }
        else { icon.className = 'fa-solid fa-music'; text.textContent = '播放音乐'; musicToggle.style.color = ''; }
    });

    // ────────── Module Navigation ──────────
    const moduleItems = document.querySelectorAll('.module-item');
    const sections = {
        home: document.getElementById('home'),
        projects: document.getElementById('section-projects'),
        study: document.getElementById('section-study'),
        life: document.getElementById('section-life'),
        software: document.getElementById('section-software'),
        secret: document.getElementById('section-secret'),
    };

    moduleItems.forEach(item => {
        item.addEventListener('click', () => {
            const module = item.dataset.module;
            if (module === 'home') {
                moduleItems.forEach(m => m.classList.remove('active'));
                item.classList.add('active');
                showSection('home');
                return;
            }
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                moduleItems.forEach(m => m.dataset.module === 'home' && m.classList.add('active'));
                showSection('home');
                return;
            }
            moduleItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            showSection(module);
        });
    });
    // Activate home button by default
    document.querySelector('.module-item[data-module="home"]')?.classList.add('active');

    function showSection(name) {
        Object.values(sections).forEach(s => s.classList.remove('active'));
        if (sections[name]) sections[name].classList.add('active');
    }

    // ────────── Load Data ──────────
    async function loadJSON(url) {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch { return []; }
    }

    const bgColors = [
        'linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.6) 100%)',
        'linear-gradient(135deg, rgba(30,144,255,0.6) 0%, rgba(0,191,255,0.6) 100%)',
        'linear-gradient(135deg, rgba(34,197,94,0.6) 0%, rgba(16,185,129,0.6) 100%)',
        'linear-gradient(135deg, rgba(244,114,182,0.6) 0%, rgba(168,85,247,0.6) 100%)',
        'linear-gradient(135deg, rgba(251,146,60,0.6) 0%, rgba(249,115,22,0.6) 100%)',
        'linear-gradient(135deg, rgba(236,72,153,0.6) 0%, rgba(219,39,119,0.6) 100%)',
        'linear-gradient(135deg, rgba(52,211,153,0.6) 0%, rgba(5,150,105,0.6) 100%)',
    ];
    let colorIndex = 0;

    function nextColor() { return bgColors[colorIndex++ % bgColors.length]; }

    function renderProjects(items) {
        const grid = document.getElementById('projects-grid');
        items.forEach(item => {
            const card = document.createElement('a');
            card.href = item.url || '#';
            card.target = '_blank';
            card.className = 'content-card';
            const bg = item.bg || nextColor();
            card.innerHTML = `
                <div style="position:absolute;top:0;left:0;width:100%;height:4px;border-radius:16px 16px 0 0;background:${bg};opacity:0.6"></div>
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
            `;
            grid.appendChild(card);
        });
    }

    function renderStudyNotes(items) {
        const grid = document.getElementById('study-grid');
        items.forEach(item => {
            const card = document.createElement('a');
            card.href = item.noteUrl || '#';
            card.target = '_blank';
            card.className = 'content-card';
            const bg = item.bg || nextColor();
            card.innerHTML = `
                <div style="position:absolute;top:0;left:0;width:100%;height:4px;border-radius:16px 16px 0 0;background:${bg};opacity:0.6"></div>
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
            `;
            grid.appendChild(card);
        });
    }

    function renderSoftware(items) {
        const grid = document.getElementById('software-grid');
        items.forEach(item => {
            const card = document.createElement('a');
            card.href = item.downloadUrl || '#';
            card.target = '_blank';
            card.className = 'content-card';
            card.innerHTML = `
                <div style="position:absolute;top:0;left:0;width:100%;height:4px;border-radius:16px 16px 0 0;background:rgba(16,185,129,0.6);opacity:0.6"></div>
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
            `;
            grid.appendChild(card);
        });
    }

    async function initData() {
        const [projects, notes, software] = await Promise.all([
            loadJSON('data/projects.json'),
            loadJSON('data/notes.json'),
            loadJSON('data/software.json'),
        ]);
        renderProjects(projects);
        renderStudyNotes(notes);
        renderSoftware(software);
    }
    initData();

    // ────────── Particles ──────────
    const container = document.getElementById('particles-container');
    if (container) {
        for (let i = 0; i < 40; i++) createParticle();
        function createParticle() {
            const p = document.createElement('div');
            p.className = 'particle';
            const s = Math.random() * 3 + 2;
            p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}vw;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*12}s;transform:translateX(${(Math.random()-0.5)*60}px)`;
            container.appendChild(p);
            p.addEventListener('animationend', () => { p.remove(); createParticle(); });
        }
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
});
