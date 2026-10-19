import './style.css';

const base = import.meta.env.BASE_URL;
const asset = path => `${base}${path}`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const sourceUrl = 'https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081';
document.querySelector('#app').innerHTML = `
  <header class="header"><a class="brand" href="${base}" aria-label="echo 作品首页">echo<span> / DESIGN PORTFOLIO</span></a><a class="source-link" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Figma 原稿 ↗</a></header>
  <main>
    <section class="intro" aria-labelledby="project-title">
      <div class="eyebrow"><span class="dot"></span> 韶峰天工 · UI DESIGN</div>
      <h1 id="project-title">天枢<span>AI 助手界面设计</span></h1>
      <p class="summary">韶峰天工中 AI 助手天枢的聊天界面设计。<br>在这里浏览设计稿 9.30 版本的页面与界面细节。</p>
      <dl class="facts"><div><dt>设计师</dt><dd>echo</dd></div><div><dt>项目职责</dt><dd>独立完成</dd></div><div><dt>设计时间</dt><dd>2026.09 — 2026.10</dd></div><div><dt>设计版本</dt><dd>9.30</dd></div></dl>
    </section>
    <section class="gallery" aria-labelledby="gallery-title">
      <div class="gallery-heading"><div><div class="eyebrow muted">THE SCREENS</div><h2 id="gallery-title">页面设计 <span id="count"></span></h2></div><p id="status" class="status" role="status">正在载入页面…</p></div>
      <div class="toolbar" hidden><div id="categories" class="categories" role="group" aria-label="按模块筛选"></div><label class="search"><span>搜索</span><input type="search" id="search" placeholder="查找页面名称" aria-label="搜索页面名称或描述" autocomplete="off"></label></div>
      <div id="grid" class="grid" aria-live="polite"></div>
    </section>
  </main>
  <footer><span>echo · 韶峰天工 / 天枢</span><span>界面设计作品 · 2026</span></footer>
  <dialog id="viewer" aria-labelledby="viewer-title">
    <div class="viewer-header"><div class="viewer-info"><span id="viewer-category"></span><h2 id="viewer-title"></h2></div><button id="close" class="close" aria-label="关闭大图">关闭 ×</button></div>
    <div class="viewer-tools"><div class="tool-group"><button id="previous" aria-label="上一页">← 上一页</button><span id="position"></span><button id="next" aria-label="下一页">下一页 →</button></div><div class="tool-group"><button id="fit">适应窗口</button><button id="fit-width">适应宽度</button><button id="zoom-out" aria-label="缩小">−</button><output id="zoom-label"></output><button id="zoom-in" aria-label="放大">＋</button><button id="original">原尺寸</button><button id="share">复制链接</button><a id="download" download>下载 PNG ↗</a></div></div>
    <div id="viewport" class="viewport" tabindex="0" aria-label="设计大图，可滚动查看"><img id="full-image" alt=""></div>
    <div class="viewer-footer"><span id="dimensions"></span><span id="viewer-message" role="status"></span><span>← → 切换页面 · Esc 关闭</span></div>
  </dialog>`;

let pages = [], filtered = [], category = '全部', activeId = null, scale = 1, fitMode = true;
const $ = selector => document.querySelector(selector);
const dialog = $('#viewer');
let lastFocus;

function renderGallery() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  filtered = pages.filter(page => (category === '全部' || page.category === category) && `${page.title} ${page.description}`.toLocaleLowerCase().includes(query));
  $('#count').textContent = `${filtered.length} / ${pages.length}`;
  for (const button of document.querySelectorAll('[data-category]')) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  $('#grid').innerHTML = filtered.length ? filtered.map((page, index) => `
    <button class="card" data-page="${escape(page.id)}" aria-label="查看 ${escape(page.title)}">
      <div class="card-image"><img src="${asset(page.thumbnail)}" alt="${escape(page.title)}设计预览" loading="lazy" width="${page.width}" height="${page.height}">${page.height > page.width * 1.5 ? '<span class="long-tag">长图 · 点击展开</span>' : ''}<span class="expand">查看设计 ↗</span></div>
      <div class="card-meta"><span class="card-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${escape(page.title)}</h3><p>${escape(page.category)}</p></div><span class="card-arrow" aria-hidden="true">↗</span></div>
    </button>`).join('') : '<div class="empty"><h3>没有匹配的页面</h3><p>试试其他关键词，或选择“全部”模块。</p></div>';
}

function activePage() { return pages.find(page => page.id === activeId); }
function navigationPages() { return filtered.some(page => page.id === activeId) ? filtered : pages; }
function setScale(nextScale) {
  const page = activePage();
  if (!page) return;
  scale = Math.max(0.05, Math.min(4, nextScale));
  $('#full-image').style.width = `${Math.round(page.width * scale)}px`;
  $('#zoom-label').textContent = `${Math.round(scale * 100)}%`;
}
function fit(mode = 'window') {
  const page = activePage();
  if (!page) return;
  fitMode = mode;
  const widthScale = ($('#viewport').clientWidth - 48) / page.width;
  setScale(mode === 'width' ? Math.min(1, widthScale) : Math.min(1, widthScale, ($('#viewport').clientHeight - 48) / page.height));
}
function updateViewer() {
  const page = activePage();
  const sequence = navigationPages();
  const index = sequence.findIndex(item => item.id === activeId);
  $('#viewer-title').textContent = page.title;
  $('#viewer-category').textContent = page.category;
  $('#position').textContent = `${index + 1} / ${sequence.length}`;
  $('#previous').disabled = index <= 0;
  $('#next').disabled = index >= sequence.length - 1;
  $('#dimensions').textContent = `${page.width} × ${page.height} px`;
  $('#viewer-message').textContent = '正在载入高清图…';
  const img = $('#full-image');
  img.onload = () => { $('#viewer-message').textContent = ''; };
  img.onerror = () => { $('#viewer-message').textContent = '图片加载失败，请稍后重新打开。'; };
  img.alt = `${page.title}完整设计稿`;
  img.src = asset(page.image);
  $('#download').href = asset(page.image);
  $('#download').download = `${page.title}.png`;
  $('#viewport').scrollTo(0, 0);
  document.title = `${page.title} | 天枢 · echo`;
  fit(page.height > page.width * 1.5 ? 'width' : 'window');
}
function openPage(id, updateHash = true) {
  if (!pages.some(page => page.id === id)) return;
  activeId = id;
  if (!dialog.open) {
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('viewing');
  }
  updateViewer();
  if (updateHash) window.location.hash = `page=${encodeURIComponent(id)}`;
}
function closeViewer(updateHash = true) {
  if (dialog.open) dialog.close();
  activeId = null;
  document.body.classList.remove('viewing');
  document.title = '天枢 · AI 助手界面设计 | echo';
  if (updateHash) history.replaceState(null, '', location.pathname + location.search);
  lastFocus?.focus();
}
function route() {
  const id = new URLSearchParams(location.hash.slice(1)).get('page');
  if (id && pages.some(page => page.id === id)) {
    if (id !== activeId || !dialog.open) openPage(id, false);
  } else if (dialog.open) closeViewer(false);
}
function navigate(direction) {
  const sequence = navigationPages();
  const index = sequence.findIndex(page => page.id === activeId);
  if (sequence[index + direction]) openPage(sequence[index + direction].id);
}
$('#grid').addEventListener('click', event => {
  const card = event.target.closest('[data-page]');
  if (card) openPage(card.dataset.page);
});
$('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) { category = button.dataset.category; renderGallery(); }
});
$('#search').addEventListener('input', renderGallery);
$('#close').addEventListener('click', () => closeViewer());
dialog.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
$('#previous').addEventListener('click', () => navigate(-1));
$('#next').addEventListener('click', () => navigate(1));
$('#fit').addEventListener('click', () => fit());
$('#fit-width').addEventListener('click', () => fit('width'));
$('#original').addEventListener('click', () => { fitMode = false; setScale(1); });
$('#zoom-in').addEventListener('click', () => { fitMode = false; setScale(scale * 1.25); });
$('#zoom-out').addEventListener('click', () => { fitMode = false; setScale(scale / 1.25); });
$('#share').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); $('#viewer-message').textContent = '页面链接已复制'; }
  catch { $('#viewer-message').textContent = '请复制浏览器地址栏中的链接'; }
});
document.addEventListener('keydown', event => {
  if (!dialog.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
});
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => { if (dialog.open && fitMode) fit(fitMode); });

async function initialize() {
  try {
    const response = await fetch(asset('pages.json'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    if (!Array.isArray(manifest.pages)) throw new Error('Invalid manifest');
    pages = manifest.pages;
    if (!pages.length) {
      $('#count').textContent = '0';
      $('#status').textContent = '设计素材待导入';
      $('#grid').innerHTML = `<div class="empty"><span class="empty-mark" aria-hidden="true">↗</span><h3>设计页面即将呈现</h3><p>项目介绍已就绪，页面设计将在素材导入后开放浏览。</p><a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">前往 Figma 查看原稿 ↗</a></div>`;
      return;
    }
    $('#status').textContent = `${pages.length} 个设计页面 · ${new Set(pages.map(page => page.category)).size} 个模块`;
    $('.toolbar').hidden = false;
    const categories = ['全部', ...new Set(pages.map(page => page.category).filter(name => name !== '全部'))];
    $('#categories').innerHTML = categories.map(name => `<button data-category="${escape(name)}" aria-pressed="${name === category}">${escape(name)}</button>`).join('');
    renderGallery();
    route();
  } catch (error) {
    console.error(error);
    $('#status').textContent = '页面目录加载失败';
    $('#grid').innerHTML = '<div class="empty"><h3>暂时无法载入设计页面</h3><p>请刷新页面重试。</p><button id="retry">重新加载</button></div>';
    $('#retry').addEventListener('click', initialize);
  }
}
initialize();
