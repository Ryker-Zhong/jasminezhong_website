document.addEventListener('DOMContentLoaded', () => {

  // ────────── Settings ──────────
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsMenu = document.getElementById('settingsMenu');
  const themeToggle = document.getElementById('themeToggle');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  let isPlaying = false;
  bgMusic.volume = 0.3;

  settingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target))
      settingsMenu.classList.remove('show');
  });

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('bg-starry');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    if (document.body.classList.contains('bg-starry')) {
      icon.className = 'fa-solid fa-star'; text.textContent = '星空银河';
    } else {
      icon.className = 'fa-solid fa-tree'; text.textContent = '森林湖畔';
    }
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
  const pContainer = document.getElementById('particles-container');
  if (pContainer) {
    for (let i = 0; i < 30; i++) createParticle();
    function createParticle() {
      const p = document.createElement('div');
      p.className = 'particle';
      const s = Math.random() * 3 + 2;
      p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}vw;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*12}s;transform:translateX(${(Math.random()-0.5)*60}px)`;
      pContainer.appendChild(p);
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

  // ────────── Navigation ──────────
  function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.nav-section');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle?.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.section;
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        const section = document.getElementById(target);
        if (section) section.classList.add('active');
        navLinks?.classList.remove('open');
      });
    });
  }
  initNavigation();

  // ────────── Fetch JSON ──────────
  async function loadJSON(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.error('Failed to load', url, e);
      return [];
    }
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ────────── Render Stars ──────────
  function renderStars(rating) {
    const r = Math.min(5, Math.max(0, parseInt(rating, 10) || 0));
    return '<span style="color:#fbbf24">' + '★'.repeat(r) + '☆'.repeat(5 - r) + '</span>';
  }

  // ────────── Projects ──────────
  async function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const data = await loadJSON('data/projects.json');
    grid.innerHTML = data.map(p => `
      <div class="card-item">
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-desc">${esc(p.desc)}</div>
        <div class="card-footer">
          <div class="card-rating">${renderStars(p.rating)}</div>
          <a href="${esc(p.url || '#')}" target="_blank" class="card-link-btn"><i class="fa-brands fa-github"></i> 查看</a>
        </div>
      </div>
    `).join('');
  }
  renderProjects();

  // ────────── Notes ──────────
  let notesData = [];
  let notesFilter = 'all';
  let likeCounts = {};
  let myLikes = new Set(JSON.parse(localStorage.getItem('myNoteLikes') || '[]'));

  function getNoteLikes(id) { return likeCounts[id] || 0; }

  function saveMyLikes() {
    localStorage.setItem('myNoteLikes', JSON.stringify([...myLikes]));
  }

  async function fetchLikeCounts() {
    try {
      const res = await fetch('api/likes.php?type=notes');
      const data = await res.json();
      if (data.ok) {
        likeCounts = data.counts || {};
        renderNotesGrid();
        updateReadingLikeUI();
      }
    } catch (e) {
      console.error('Failed to load like counts', e);
    }
  }

  async function toggleNoteLike(id) {
    id = String(id);
    const action = myLikes.has(id) ? 'unlike' : 'like';
    try {
      const res = await fetch('api/likes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'notes', id: id, action: action })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'request failed');
      likeCounts[id] = data.count;
    } catch (e) {
      console.error('Like request failed', e);
      likeCounts[id] = Math.max(0, (likeCounts[id] || 0) + (action === 'like' ? 1 : -1));
    }
    if (action === 'like') myLikes.add(id); else myLikes.delete(id);
    saveMyLikes();
    renderNotesGrid();
    updateReadingLikeUI();
  }

  function renderNotesGrid() {
    const grid = document.getElementById('notesGrid');
    const searchVal = (document.getElementById('notesSearch')?.value || '').toLowerCase();
    if (!grid) return;

    let filtered = notesData;
    if (notesFilter !== 'all') filtered = filtered.filter(n => n.category === notesFilter);
    if (searchVal) filtered = filtered.filter(n =>
      (n.title || '').toLowerCase().includes(searchVal) || (n.desc || '').toLowerCase().includes(searchVal)
    );

    grid.innerHTML = filtered.map(n => `
      <div class="card-item note-card" data-id="${n.id}">
        <div class="card-title">${esc(n.title)}</div>
        <div class="card-desc">${esc(n.desc)}</div>
        <div class="card-footer">
          <button class="btn-like ${myLikes.has(String(n.id)) ? 'liked' : ''}" data-id="${n.id}">
            <i class="fa-${myLikes.has(String(n.id)) ? 'solid' : 'regular'} fa-heart"></i> <span>${getNoteLikes(n.id)}</span>
          </button>
          <button class="btn-read" data-id="${n.id}"><i class="fa-regular fa-eye"></i> 阅读</button>
        </div>
      </div>
    `).join('');

    // Like buttons
    grid.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNoteLike(btn.dataset.id);
      });
    });

    // Read buttons
    grid.querySelectorAll('.btn-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const note = notesData.find(n => String(n.id) === btn.dataset.id);
        if (note) openReadingModal(note);
      });
    });
  }

  async function renderNotes() {
    notesData = (await loadJSON('data/notes.json')).map((n, i) => ({ ...n, id: n.id ?? i + 1 }));
    if (!document.getElementById('notesGrid')) return;

    // Build filter tags from data
    const cats = [...new Set(notesData.map(n => n.category).filter(Boolean))];
    const filterEl = document.getElementById('notesFilter');
    filterEl.innerHTML = '<button class="filter-tag active" data-cat="all">全部</button>' +
      cats.map(c => `<button class="filter-tag" data-cat="${c}">${c}</button>`).join('');

    filterEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tag');
      if (!btn) return;
      filterEl.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      notesFilter = btn.dataset.cat;
      renderNotesGrid();
    });

    document.getElementById('notesSearch')?.addEventListener('input', renderNotesGrid);
    renderNotesGrid();
    fetchLikeCounts();
  }
  renderNotes();

  // ────────── Reading Modal ──────────
  const readingModal = document.getElementById('reading-modal');
  const readingTitle = document.getElementById('readingTitle');
  const readingContent = document.getElementById('readingContent');
  const readingLike = document.getElementById('readingLike');
  const readingLikeCount = document.getElementById('readingLikeCount');
  const readingClose = document.getElementById('readingClose');
  let currentNoteId = null;

  function updateReadingLikeUI() {
    if (currentNoteId === null || !readingLike) return;
    const id = String(currentNoteId);
    const liked = myLikes.has(id);
    readingLikeCount.textContent = getNoteLikes(id);
    readingLike.classList.toggle('liked', liked);
    readingLike.querySelector('i').className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }

  async function openReadingModal(note) {
    currentNoteId = note.id;
    readingTitle.textContent = note.title;
    const sourceLink = document.getElementById('readingSource');
    if (sourceLink) {
      if (note.url) { sourceLink.href = note.url; sourceLink.style.display = ''; }
      else sourceLink.style.display = 'none';
    }
    let html = '';
    if (note.url && window.marked) {
      try {
        const res = await fetch(note.url);
        if (res.ok) html = marked.parse(await res.text());
      } catch (e) {
        console.error('Failed to load note source', e);
      }
    }
    if (!html) html = (note.content || note.desc || '').split('\n').filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
    readingContent.innerHTML = html;
    updateReadingLikeUI();
    readingModal.classList.add('show');
  }

  if (readingModal) {
    readingClose?.addEventListener('click', () => readingModal.classList.remove('show'));
    readingModal.addEventListener('click', (e) => { if (e.target === readingModal) readingModal.classList.remove('show'); });
    readingLike?.addEventListener('click', () => {
      if (currentNoteId === null) return;
      toggleNoteLike(currentNoteId);
    });
  }

  // ────────── Diary ──────────
  async function renderDiary() {
    const timeline = document.getElementById('diaryTimeline');
    if (!timeline) return;
    const data = await loadJSON('data/diary.json');
    timeline.innerHTML = data.map(e => {
      const tagsHtml = [];
      if (e.weather) tagsHtml.push(`<span class="timeline-tag weather"><i class="fa-solid fa-cloud-sun"></i> ${esc(e.weather)}</span>`);
      if (e.mood) tagsHtml.push(`<span class="timeline-tag mood"><i class="fa-regular fa-face-smile"></i> ${esc(e.mood)}</span>`);
      const imgsHtml = (e.images || []).map(img => `<img src="${esc(img)}" class="timeline-img" alt="diary">`).join('');
      return `
        <div class="timeline-item">
          <div class="timeline-date"><i class="fa-regular fa-calendar"></i> ${esc(e.date)}</div>
          <div class="timeline-content">
            <h4>${esc(e.title)}</h4>
            <p>${esc(e.content)}</p>
            ${tagsHtml.length ? `<div class="timeline-tags">${tagsHtml.join('')}</div>` : ''}
            ${imgsHtml ? `<div class="timeline-images">${imgsHtml}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Lightbox for diary images
    timeline.querySelectorAll('.timeline-img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src));
    });
  }
  renderDiary();

  // ────────── Lightbox ──────────
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('show');
  }

  if (lightbox) {
    lightboxClose?.addEventListener('click', () => lightbox.classList.remove('show'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('show'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('show'); });
  }

  // ────────── Software ──────────
  async function renderSoftware() {
    const grid = document.getElementById('softwareGrid');
    if (!grid) return;
    const data = await loadJSON('data/software.json');
    grid.innerHTML = data.map(s => {
      const url = s.downloadUrl || s.url || '#';
      const isExternal = url.startsWith('http');
      return `
        <div class="card-item">
          <div class="card-title">${esc(s.title)}</div>
          <div class="card-desc">${esc(s.desc)}</div>
          <div class="card-footer">
            <div class="card-rating">${renderStars(s.rating)}</div>
            <a href="${esc(url)}" target="${isExternal ? '_blank' : '_self'}" class="card-link-btn"><i class="fa-solid fa-download"></i> 下载</a>
          </div>
        </div>
      `;
    }).join('');
  }
  renderSoftware();

  // ────────── Debug (Ctrl+Shift+D) ──────────
  let debugLogs = [];
  const _origError = console.error;
  console.error = (...args) => { debugLogs.push(args.join(' ')); _origError.apply(console, args); };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleDebugPanel();
    }
  });

  function toggleDebugPanel() {
    let panel = document.getElementById('debugPanel');
    if (panel) { panel.remove(); return; }

    panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong style="font-size:13px">⚙ Debug</strong>
        <span id="debugClose" style="cursor:pointer;font-size:16px;opacity:.6">&times;</span>
      </div>
      <div id="debugBody"></div>
    `;
    Object.assign(panel.style, {
      position:'fixed', bottom:'16px', right:'16px', zIndex:9999,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)',
      border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px',
      padding:'12px 16px', maxWidth:'380px', maxHeight:'50vh',
      overflow:'auto', fontFamily:'monospace', fontSize:'12px',
      color:'rgba(255,255,255,0.85)', lineHeight:'1.6'
    });
    document.body.appendChild(panel);
    document.getElementById('debugClose').onclick = () => panel.remove();

    refreshDebugBody();
    panel.addEventListener('click', (e) => {
      if (e.target.id === 'debugRefresh') refreshDebugBody();
    });
  }

  async function refreshDebugBody() {
    const body = document.getElementById('debugBody');
    if (!body) return;
    const likes = likeCounts;
    let projectsCount = '?', notesCount = '?', diaryCount = '?', softwareCount = '?';
    try {
      const [p, n, d, s] = await Promise.all([
        fetch('data/projects.json').then(r => r.json()),
        fetch('data/notes.json').then(r => r.json()),
        fetch('data/diary.json').then(r => r.json()),
        fetch('data/software.json').then(r => r.json())
      ]);
      projectsCount = p.length; notesCount = n.length; diaryCount = d.length; softwareCount = s.length;
    } catch {}
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;margin-bottom:8px">
        <span>projects.json</span><span style="text-align:right;color:#60a5fa">${projectsCount} items</span>
        <span>notes.json</span><span style="text-align:right;color:#60a5fa">${notesCount} items</span>
        <span>diary.json</span><span style="text-align:right;color:#60a5fa">${diaryCount} items</span>
        <span>software.json</span><span style="text-align:right;color:#60a5fa">${softwareCount} items</span>
        <span>likes (server)</span><span style="text-align:right;color:#f472b6">${Object.keys(likes).length} items</span>
        <span>console errors</span><span style="text-align:right;color:#f87171">${debugLogs.length}</span>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;display:flex;gap:6px">
        <button id="debugRefresh" style="flex:1;padding:4px;border:1px solid rgba(255,255,255,0.15);border-radius:6px;background:transparent;color:rgba(255,255,255,0.6);cursor:pointer;font-size:11px;font-family:inherit">⟳ Refresh</button>
        <button id="debugClearLikes" style="flex:1;padding:4px;border:1px solid rgba(255,255,255,0.15);border-radius:6px;background:transparent;color:#f87171;cursor:pointer;font-size:11px;font-family:inherit">✕ Clear Likes</button>
      </div>
    `;
    document.getElementById('debugClearLikes')?.addEventListener('click', () => {
      if (confirm('Clear my local like records?')) { localStorage.removeItem('myNoteLikes'); myLikes = new Set(); refreshDebugBody(); renderNotesGrid(); updateReadingLikeUI(); }
    });
  }
});
