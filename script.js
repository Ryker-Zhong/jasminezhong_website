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

  // ────────── Render Stars ──────────
  function renderStars(rating) {
    return '<span style="color:#fbbf24">' + '★'.repeat(rating) + '☆'.repeat(5 - rating) + '</span>';
  }

  // ────────── Projects ──────────
  async function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const data = await loadJSON('data/projects.json');
    grid.innerHTML = data.map(p => `
      <div class="card-item">
        <div class="card-title">${p.title}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <div class="card-rating">${renderStars(p.rating)}</div>
          <a href="${p.url || '#'}" target="_blank" class="card-link-btn"><i class="fa-brands fa-github"></i> 查看</a>
        </div>
      </div>
    `).join('');
  }
  renderProjects();

  // ────────── Notes ──────────
  let notesData = [];
  let notesLikes = JSON.parse(localStorage.getItem('notesLikes') || '{}');
  let notesFilter = 'all';

  function getNoteLikes(id) { return notesLikes[id] || 0; }

  function renderNotesGrid() {
    const grid = document.getElementById('notesGrid');
    const searchVal = (document.getElementById('notesSearch')?.value || '').toLowerCase();
    if (!grid) return;

    let filtered = notesData;
    if (notesFilter !== 'all') filtered = filtered.filter(n => n.category === notesFilter);
    if (searchVal) filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(searchVal) || n.desc.toLowerCase().includes(searchVal)
    );

    grid.innerHTML = filtered.map(n => `
      <div class="card-item note-card" data-id="${n.id}">
        <div class="card-title">${n.title}</div>
        <div class="card-desc">${n.desc}</div>
        <div class="card-footer">
          <button class="btn-like ${notesLikes[n.id] > 0 ? 'liked' : ''}" data-id="${n.id}">
            <i class="fa-${notesLikes[n.id] > 0 ? 'solid' : 'regular'} fa-heart"></i> <span>${getNoteLikes(n.id)}</span>
          </button>
          <button class="btn-read" data-id="${n.id}"><i class="fa-regular fa-eye"></i> 阅读</button>
        </div>
      </div>
    `).join('');

    // Like buttons
    grid.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        notesLikes[id] = (notesLikes[id] || 0) + 1;
        localStorage.setItem('notesLikes', JSON.stringify(notesLikes));
        renderNotesGrid();
      });
    });

    // Read buttons
    grid.querySelectorAll('.btn-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const note = notesData.find(n => n.id === id);
        if (note) openReadingModal(note);
      });
    });
  }

  async function renderNotes() {
    notesData = await loadJSON('data/notes.json');
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

  function openReadingModal(note) {
    currentNoteId = note.id;
    readingTitle.textContent = note.title;
    readingContent.innerHTML = (note.content || note.desc || '').split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');
    const likes = getNoteLikes(note.id);
    readingLikeCount.textContent = likes;
    readingLike.classList.toggle('liked', likes > 0);
    readingLike.querySelector('i').className = likes > 0 ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    readingModal.classList.add('show');
  }

  if (readingModal) {
    readingClose?.addEventListener('click', () => readingModal.classList.remove('show'));
    readingModal.addEventListener('click', (e) => { if (e.target === readingModal) readingModal.classList.remove('show'); });
    readingLike?.addEventListener('click', () => {
      if (currentNoteId === null) return;
      notesLikes[currentNoteId] = (notesLikes[currentNoteId] || 0) + 1;
      localStorage.setItem('notesLikes', JSON.stringify(notesLikes));
      const likes = notesLikes[currentNoteId];
      readingLikeCount.textContent = likes;
      readingLike.classList.toggle('liked', likes > 0);
      readingLike.querySelector('i').className = likes > 0 ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      renderNotesGrid();
    });
  }

  // ────────── Diary ──────────
  async function renderDiary() {
    const timeline = document.getElementById('diaryTimeline');
    if (!timeline) return;
    const data = await loadJSON('data/diary.json');
    timeline.innerHTML = data.map(e => {
      const tagsHtml = [];
      if (e.weather) tagsHtml.push(`<span class="timeline-tag weather"><i class="fa-solid fa-cloud-sun"></i> ${e.weather}</span>`);
      if (e.mood) tagsHtml.push(`<span class="timeline-tag mood"><i class="fa-regular fa-face-smile"></i> ${e.mood}</span>`);
      const imgsHtml = (e.images || []).map(img => `<img src="${img}" class="timeline-img" alt="diary">`).join('');
      return `
        <div class="timeline-item">
          <div class="timeline-date"><i class="fa-regular fa-calendar"></i> ${e.date}</div>
          <div class="timeline-content">
            <h4>${e.title}</h4>
            <p>${e.content}</p>
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
          <div class="card-title">${s.title}</div>
          <div class="card-desc">${s.desc}</div>
          <div class="card-footer">
            <div class="card-rating">${renderStars(s.rating)}</div>
            <a href="${url}" target="${isExternal ? '_blank' : '_self'}" class="card-link-btn"><i class="fa-solid fa-download"></i> 下载</a>
          </div>
        </div>
      `;
    }).join('');
  }
  renderSoftware();
});
