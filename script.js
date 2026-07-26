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
