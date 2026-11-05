import './style.css';
import { createIcons, Info, X, ChevronLeft, ChevronRight, Scan, MoveHorizontal, MoveVertical, ZoomOut, ZoomIn, Maximize, Link2, Download } from 'lucide';

const base = import.meta.env.BASE_URL;
const asset = path => `${base}${path}`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const sourceUrl = 'https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081';
document.querySelector('#app').innerHTML = `
  <header class="header"><a class="brand" href="${base}" aria-label="echo 作品首页">echo<span> / DESIGN PORTFOLIO</span></a><a id="source-link" class="source-link" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Figma 原稿 ↗</a></header>
  <main>
    <section class="intro" aria-labelledby="project-title">
      <div class="eyebrow"><span class="dot"></span> 韶峰天工 · UI DESIGN</div>
      <h1 id="project-title">天枢<span>AI 助手界面设计</span></h1>
      <p class="summary">韶峰天工中 AI 助手天枢的聊天界面设计。<br>在这里浏览不同版本的页面与界面细节。</p>
      <dl class="facts"><div><dt>设计师</dt><dd>echo</dd></div><div><dt>项目职责</dt><dd>独立完成</dd></div><div><dt>设计时间</dt><dd>2026.09 起</dd></div><div><dt>设计版本</dt><dd>9.30 / 新版</dd></div></dl>
    </section>
    <section class="gallery" aria-labelledby="gallery-title">
      <div class="gallery-heading"><div><div class="eyebrow muted">THE SCREENS</div><h2 id="gallery-title">页面设计 <span id="count"></span></h2></div><p id="status" class="status" role="status">正在载入页面…</p></div>
      <div id="versions" class="versions" role="group" aria-label="选择设计版本" hidden></div>
      <div class="toolbar" hidden><div id="categories" class="categories" role="group" aria-label="按模块筛选"></div><label class="search"><span>搜索</span><input type="search" id="search" placeholder="查找页面名称" aria-label="搜索页面名称或描述" autocomplete="off"></label></div>
      <div id="grid" class="grid" aria-live="polite"></div>
    </section>
  </main>
  <footer><span>echo · 韶峰天工 / 天枢</span><span>界面设计作品 · 2026</span></footer>
  <dialog id="viewer" aria-labelledby="viewer-title">
    <div id="viewport" class="viewport" tabindex="0" aria-label="设计大图，可滚动查看"><div class="image-wrap"><img id="full-image" alt=""></div></div>
    <aside id="viewer-drawer" class="viewer-drawer" aria-label="页面信息与操作" hidden>
      <div class="drawer-heading"><span>页面信息</span><button id="drawer-close" class="icon-button" type="button" aria-label="收起页面信息" title="收起页面信息"><i data-lucide="x"></i></button></div>
      <div class="drawer-body">
        <span id="viewer-category" class="drawer-category"></span>
        <h2 id="viewer-title"></h2>
        <p id="dimensions" class="drawer-dimensions"></p>
        <p class="drawer-position">第 <span id="position"></span> 页</p>
        <div class="drawer-modes" role="group" aria-label="图片显示方式">
          <button type="button" data-fit="window"><i data-lucide="scan"></i>适应窗口</button>
          <button type="button" data-fit="width"><i data-lucide="move-horizontal"></i>适应宽度</button>
          <button type="button" data-fit="height"><i data-lucide="move-vertical"></i>适应高度</button>
          <button type="button" data-fit="original"><i data-lucide="maximize"></i>原尺寸</button>
        </div>
        <div class="drawer-actions">
          <button id="share" type="button"><i data-lucide="link-2"></i>复制链接</button>
          <a id="download" download><i data-lucide="download"></i>下载 PNG</a>
        </div>
        <p id="viewer-message" class="viewer-message" role="status"></p>
      </div>
    </aside>
    <nav class="viewer-rail" aria-label="设计图操作">
      <button id="details" class="icon-button" type="button" aria-label="页面信息与更多操作" title="页面信息与更多操作" aria-controls="viewer-drawer" aria-expanded="false"><i data-lucide="info"></i></button>
      <span class="rail-separator"></span>
      <button id="previous" class="icon-button" type="button" aria-label="上一页" title="上一页"><i data-lucide="chevron-left"></i></button>
      <span id="rail-position" class="rail-position"></span>
      <button id="next" class="icon-button" type="button" aria-label="下一页" title="下一页"><i data-lucide="chevron-right"></i></button>
      <span class="rail-separator"></span>
      <button id="fit" class="icon-button" type="button" aria-label="适应窗口" title="适应窗口"><i data-lucide="scan"></i></button>
      <button id="fit-width" class="icon-button" type="button" aria-label="适应宽度" title="适应宽度"><i data-lucide="move-horizontal"></i></button>
      <button id="fit-height" class="icon-button" type="button" aria-label="适应高度" title="适应高度"><i data-lucide="move-vertical"></i></button>
      <button id="zoom-out" class="icon-button" type="button" aria-label="缩小" title="缩小"><i data-lucide="zoom-out"></i></button>
      <output id="zoom-label" class="zoom-label" aria-label="当前缩放比例"></output>
      <button id="zoom-in" class="icon-button" type="button" aria-label="放大" title="放大"><i data-lucide="zoom-in"></i></button>
      <button id="original" class="icon-button" type="button" aria-label="原尺寸" title="原尺寸"><i data-lucide="maximize"></i></button>
      <span class="rail-spacer"></span>
      <button id="rail-share" class="icon-button" type="button" aria-label="复制链接" title="复制链接"><i data-lucide="link-2"></i></button>
      <a id="rail-download" class="icon-button" download aria-label="下载 PNG" title="下载 PNG"><i data-lucide="download"></i></a>
      <button id="close" class="icon-button" type="button" aria-label="关闭大图" title="关闭大图"><i data-lucide="x"></i></button>
    </nav>
  </dialog>`;

createIcons({ icons: { Info, X, ChevronLeft, ChevronRight, Scan, MoveHorizontal, MoveVertical, ZoomOut, ZoomIn, Maximize, Link2, Download }, attrs: { 'stroke-width': 1.8 } });

let pages = [], versions = [], filtered = [], category = '全部', version = '9.30', activeId = null, scale = 1, fitMode = 'window';
const $ = selector => document.querySelector(selector);
const dialog = $('#viewer');
let lastFocus;

function renderGallery() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  filtered = pages.filter(page => page.version === version && (category === '全部' || page.category === category) && `${page.title} ${page.description}`.toLocaleLowerCase().includes(query));
  const readyCount = filtered.filter(page => !page.pending).length;
  $('#count').textContent = `${filtered.length} 页${readyCount < filtered.length ? ` · ${readyCount} 张原稿` : ''}`;
  const selected = versions.find(item => item.id === version);
  $('#status').textContent = selected?.readyCount < selected?.count
    ? `${selected.count} 页设计 · ${selected.count - selected.readyCount} 张原稿待导入`
    : `${selected?.count ?? 0} 个设计页面 · ${new Set(pages.filter(page => page.version === version).map(page => page.category)).size} 个模块`;
  $('#source-link').href = selected?.source ?? sourceUrl;
  for (const button of document.querySelectorAll('[data-version]')) button.setAttribute('aria-pressed', String(button.dataset.version === version));
  for (const button of document.querySelectorAll('[data-category]')) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  $('#grid').innerHTML = filtered.length ? filtered.map((page, index) => `
    ${page.pending ? `<a class="card card-pending" href="${escape(page.source)}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${escape(page.title)} 所在的 Figma 画布">
      <div class="card-image pending-image"><span class="pending-symbol" aria-hidden="true">↗</span><span>原稿待导入</span><span class="expand">打开 Figma 画布 ↗</span></div>` : `<button class="card" data-page="${escape(page.id)}" aria-label="查看 ${escape(page.title)}">
      <div class="card-image"><img src="${asset(page.thumbnail)}" alt="${escape(page.title)}设计预览" loading="lazy" width="${page.width}" height="${page.height}">${page.height > page.width * 1.5 ? '<span class="long-tag">长图 · 点击展开</span>' : ''}<span class="expand">查看设计 ↗</span></div>`}
      <div class="card-meta"><span class="card-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${escape(page.title)}</h3><p>${escape(page.category)}</p></div><span class="card-arrow" aria-hidden="true">↗</span></div>
    ${page.pending ? '</a>' : '</button>'}`).join('') : '<div class="empty"><h3>没有匹配的页面</h3><p>试试其他关键词，或选择“全部”模块。</p></div>';
}

function renderCategories() {
  const categories = ['全部', ...new Set(pages.filter(page => page.version === version).map(page => page.category).filter(name => name !== '全部'))];
  if (!categories.includes(category)) category = '全部';
  $('#categories').innerHTML = categories.map(name => `<button data-category="${escape(name)}" aria-pressed="${name === category}">${escape(name)}</button>`).join('');
}

function activePage() { return pages.find(page => page.id === activeId); }
function navigationPages() {
  const current = pages.find(page => page.id === activeId);
  const visible = filtered.filter(page => !page.pending);
  return visible.some(page => page.id === activeId) ? visible : pages.filter(page => page.version === current?.version && !page.pending);
}
function updateModeButtons() {
  for (const button of document.querySelectorAll('[data-fit]')) button.setAttribute('aria-pressed', String(button.dataset.fit === fitMode));
  for (const [selector, mode] of [['#fit', 'window'], ['#fit-width', 'width'], ['#fit-height', 'height'], ['#original', 'original']]) {
    $(selector).setAttribute('aria-pressed', String(mode === fitMode));
  }
}
function setScale(nextScale) {
  const page = activePage();
  if (!page) return;
  scale = Math.max(0.05, Math.min(4, nextScale));
  $('#full-image').style.width = `${Math.round(page.width * scale)}px`;
  $('#zoom-label').textContent = `${Math.round(scale * 100)}%`;
  updateModeButtons();
}
function fit(mode = 'window') {
  const page = activePage();
  if (!page) return;
  fitMode = mode;
  if (mode === 'original') { setScale(1); return; }
  const viewport = $('#viewport');
  const style = getComputedStyle(viewport);
  const availableWidth = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const availableHeight = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const widthScale = availableWidth / page.width;
  const heightScale = availableHeight / page.height;
  setScale(mode === 'width' ? widthScale : mode === 'height' ? heightScale : Math.min(widthScale, heightScale));
  viewport.scrollTo(mode === 'height' ? (viewport.scrollWidth - viewport.clientWidth) / 2 : 0, 0);
}
function toggleDetails(open = $('#viewer-drawer').hidden) {
  $('#viewer-drawer').hidden = !open;
  $('#details').setAttribute('aria-expanded', String(open));
  if (dialog.open && fitMode) fit(fitMode);
}
function updateViewer() {
  const page = activePage();
  const sequence = navigationPages();
  const index = sequence.findIndex(item => item.id === activeId);
  $('#viewer-title').textContent = page.title;
  $('#viewer-category').textContent = page.category;
  $('#position').textContent = `${index + 1} / ${sequence.length}`;
  $('#rail-position').textContent = `${index + 1}/${sequence.length}`;
  $('#previous').disabled = index <= 0;
  $('#next').disabled = index >= sequence.length - 1;
  $('#dimensions').textContent = `${page.width} × ${page.height} px`;
  $('#viewer-message').textContent = '正在载入高清图…';
  const img = $('#full-image');
  img.onload = () => { $('#viewer-message').textContent = ''; };
  img.onerror = () => { $('#viewer-message').textContent = '图片加载失败，请稍后重新打开。'; toggleDetails(true); };
  img.alt = `${page.title}完整设计稿`;
  img.src = asset(page.image);
  $('#download').href = asset(page.image);
  $('#download').download = `${page.title}.png`;
  $('#rail-download').href = asset(page.image);
  $('#rail-download').download = `${page.title}.png`;
  $('#viewport').scrollTo(0, 0);
  document.title = `${page.title} | 天枢 · echo`;
  const compact = matchMedia('(max-width: 640px), (max-width: 950px) and (max-height: 600px)').matches;
  fit(page.height > page.width * 1.5 ? 'width' : compact && page.width > page.height ? 'height' : 'window');
}
function openPage(id, updateHash = true) {
  if (!pages.some(page => page.id === id && !page.pending)) return;
  activeId = id;
  if (!dialog.open) {
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('viewing');
    toggleDetails(false);
  }
  updateViewer();
  if (updateHash) window.location.hash = `page=${encodeURIComponent(id)}`;
}
function closeViewer(updateHash = true) {
  if (dialog.open) dialog.close();
  toggleDetails(false);
  activeId = null;
  document.body.classList.remove('viewing');
  document.title = '天枢 · AI 助手界面设计 | echo';
  if (updateHash) history.replaceState(null, '', location.pathname + location.search);
  lastFocus?.focus();
}
function route() {
  const id = new URLSearchParams(location.hash.slice(1)).get('page');
  const page = pages.find(item => item.id === id && !item.pending);
  if (page) {
    if (version !== page.version) {
      version = page.version;
      renderCategories();
      renderGallery();
    }
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
$('#versions').addEventListener('click', event => {
  const button = event.target.closest('[data-version]');
  if (button) { version = button.dataset.version; category = '全部'; renderCategories(); renderGallery(); }
});
$('#search').addEventListener('input', renderGallery);
$('#details').addEventListener('click', () => toggleDetails());
$('#drawer-close').addEventListener('click', () => toggleDetails(false));
$('#viewer-drawer').addEventListener('click', event => {
  const button = event.target.closest('[data-fit]');
  if (button) fit(button.dataset.fit);
});
$('#close').addEventListener('click', () => closeViewer());
dialog.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
$('#previous').addEventListener('click', () => navigate(-1));
$('#next').addEventListener('click', () => navigate(1));
$('#fit').addEventListener('click', () => fit());
$('#fit-width').addEventListener('click', () => fit('width'));
$('#fit-height').addEventListener('click', () => fit('height'));
$('#original').addEventListener('click', () => fit('original'));
$('#zoom-in').addEventListener('click', () => { fitMode = false; setScale(scale * 1.25); });
$('#zoom-out').addEventListener('click', () => { fitMode = false; setScale(scale / 1.25); });
async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href);
    $('#viewer-message').textContent = '页面链接已复制';
    $('#rail-share').title = '链接已复制';
    setTimeout(() => { $('#rail-share').title = '复制链接'; }, 2000);
  } catch { $('#viewer-message').textContent = '请复制浏览器地址栏中的链接'; toggleDetails(true); }
}
$('#share').addEventListener('click', copyLink);
$('#rail-share').addEventListener('click', copyLink);
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
    versions = manifest.versions ?? [{ id: '9.30', label: '9.30', source: sourceUrl, count: pages.length, readyCount: pages.length }];
    if (!pages.length) {
      $('#count').textContent = '0';
      $('#status').textContent = '设计素材待导入';
      $('#grid').innerHTML = `<div class="empty"><span class="empty-mark" aria-hidden="true">↗</span><h3>设计页面即将呈现</h3><p>项目介绍已就绪，页面设计将在素材导入后开放浏览。</p><a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">前往 Figma 查看原稿 ↗</a></div>`;
      return;
    }
    version = versions.find(item => item.id === 'new' && item.readyCount > 0)?.id ?? versions[0].id;
    $('#versions').hidden = false;
    $('#versions').innerHTML = versions.map(item => `<button data-version="${escape(item.id)}" aria-pressed="${item.id === version}">${escape(item.label)} <span>${item.count}</span></button>`).join('');
    $('.toolbar').hidden = false;
    renderCategories();
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
