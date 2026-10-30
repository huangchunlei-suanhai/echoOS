import { REPOSITORIES as DEMO_REPOSITORIES, SNAPSHOT_DIFFS, SNAPSHOT_SOURCE_VARIANTS } from "./mock-data.js";
import { REAL_REPOSITORY } from "./real-data.js";

const REPOSITORIES = [REAL_REPOSITORY, DEMO_REPOSITORIES[0]];

const state = {
  page: "flow",
  repositoryId: REPOSITORIES[0].id,
  snapshotId: REPOSITORIES[0].snapshots[0].id,
  scenarioId: REPOSITORIES[0].scenarios[0].id,
  stepIndex: 0,
  runId: REPOSITORIES[0].scenarios[0].runs[0].id,
  selectedCardId: REPOSITORIES[0].cards[0].id,
  flowCardId: null,
  libraryQuery: "",
  libraryType: "全部类型",
  libraryReviewStatus: "全部状态",
  editingCardId: null,
};

const pageNames = { overview: "学习总览", flow: "流程复盘", library: "代码卡片库", compare: "版本对比", notes: "学习笔记" };
const byId = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const repo = () => REPOSITORIES.find((item) => item.id === state.repositoryId) || REPOSITORIES[0];
const isReal = () => repo().kind === "real";
const snapshot = () => repo().snapshots.find((item) => item.id === state.snapshotId) || repo().snapshots[0];
const scenario = () => repo().scenarios.find((item) => item.id === state.scenarioId) || repo().scenarios[0];
const runsForSnapshot = () => scenario().runs.filter((item) => item.snapshotId === state.snapshotId);
const currentRun = () => runsForSnapshot().find((item) => item.id === state.runId) || runsForSnapshot()[0];
const activeSteps = () => scenario().steps.slice(0, currentRun().stepCount ?? scenario().steps.length);
const selectedStep = () => activeSteps()[Math.min(state.stepIndex, activeSteps().length - 1)];
const flowCard = () => cardFor((selectedStep().cardIds || [selectedStep().cardId]).includes(state.flowCardId) ? state.flowCardId : selectedStep().cardId);
const reviewStorageKey = () => `cfo-card-reviews-v1-${repo().id}-${snapshot().id}`;
const reviewFields = ["purpose", "input", "output", "calls", "note"];
function reviewRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(reviewStorageKey()) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function reviewFor(id) {
  const raw = reviewRecords()[id];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const fields = Object.fromEntries(reviewFields.filter((field) => typeof raw[field] === "string").map((field) => [field, raw[field]]));
  return {
    ...fields,
    status: raw.status === "reviewed" ? "reviewed" : "pending",
    revision: Number.isSafeInteger(raw.revision) && raw.revision >= 0 ? raw.revision : 0,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    reviewedAt: typeof raw.reviewedAt === "string" ? raw.reviewedAt : null,
  };
}
function saveReview(id, changes) {
  const records = reviewRecords();
  records[id] = { ...reviewFor(id), ...changes };
  try {
    localStorage.setItem(reviewStorageKey(), JSON.stringify(records));
    return true;
  } catch {
    toast("保存失败：当前浏览器无法写入本地数据");
    return false;
  }
}
const cardFor = (id) => {
  const base = repo().cards.find((item) => item.id === id) || repo().cards[0];
  const source = SNAPSHOT_SOURCE_VARIANTS[repo().id]?.[snapshot().id]?.[base.id];
  const review = reviewFor(base.id);
  const explanation = Object.fromEntries(reviewFields.filter((field) => typeof review[field] === "string").map((field) => [field, review[field]]));
  return { ...base, ...(source ? { source } : {}), ...explanation };
};
const cardsForSnapshot = () => repo().cards.map((item) => cardFor(item.id));
const bookmarks = () => new Set(JSON.parse(localStorage.getItem(`cfo-bookmarks-${repo().id}`) || "[]"));

function syntaxLine(line) {
  const token = /(#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:async|await|def|class|return|if|else|elif|try|except|finally|for|in|from|import|as|None|True|False|and|or|not|is|export|function|const|let|throw|new)\b|\b(?:str|int|bool|dict|list|object|Any|self)\b|\b\d+\b|\b[A-Za-z_$][\w$]*(?=\s*\())/g;
  let html = "";
  let cursor = 0;
  for (const match of line.matchAll(token)) {
    const start = match.index;
    const text = match[0];
    html += escapeHtml(line.slice(cursor, start));
    let kind = "token-function";
    if (text.startsWith("#")) kind = "token-comment";
    else if (text.startsWith("\"") || text.startsWith("'")) kind = "token-string";
    else if (/^\d+$/.test(text)) kind = "token-number";
    else if (/^(?:str|int|bool|dict|list|object|Any|self)$/.test(text)) kind = "token-type";
    else if (/^(?:async|await|def|class|return|if|else|elif|try|except|finally|for|in|from|import|as|None|True|False|and|or|not|is|export|function|const|let|throw|new)$/.test(text)) kind = "token-keyword";
    html += `<span class="${kind}">${escapeHtml(text)}</span>`;
    cursor = start + text.length;
  }
  return html + escapeHtml(line.slice(cursor));
}

function renderSource(item, compact = false) {
  const lines = item.source.split("\n");
  const start = Number(item.lineStart) || 1;
  return `<div class="code-scroll ${compact ? "compact" : ""}"><pre class="code-block" aria-label="${isReal() ? "固定提交源码片段" : "演示源码"}">${lines.map((line, index) => { const number = start + index; const boundary = isReal() && item.id === "context-boundary" && number === 52; return `<span class="code-line ${number === (item.focusLine || start) ? "line-focus" : ""} ${boundary ? "line-breakpoint" : ""}"><span class="line-number">${number}</span><code>${syntaxLine(line) || " "}</code>${boundary ? '<span class="code-boundary-label">执行前停止</span>' : ""}</span>`; }).join("")}</pre></div>`;
}

function syncHeader() {
  const repositorySelect = byId("repositorySelect");
  repositorySelect.innerHTML = REPOSITORIES.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  repositorySelect.value = state.repositoryId;
  byId("snapshotSelect").innerHTML = repo().snapshots.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${item.commit}</option>`).join("");
  byId("snapshotSelect").value = snapshot().id;
  byId("sidebarRepoName").textContent = repo().shortName;
  document.querySelector(".repo-mini-copy small").textContent = isReal() ? "真实仓库 · 局部链路" : "演示仓库";
  document.querySelector(".sidebar-footer").innerHTML = `<span class="footer-pulse"></span>${isReal() ? "固定提交采集记录" : "本地演示环境"} <span class="footer-version">prototype 0.2</span>`;
  const banner = document.querySelector(".demo-banner");
  banner.classList.toggle("real-banner", isReal());
  banner.querySelector("strong").textContent = isReal() ? "真实仓库 · 8094 断点前采集" : "原型演示 · 页面内容均为假数据";
  banner.querySelector(".demo-banner-detail").textContent = isReal()
    ? "固定提交 37467f4；本次请求在 pipeline.py:52 执行前停止。说明待人工审核，收录范围仅此局部链路。"
    : "源码、运行步骤和统计仅用于展示交互，不代表任何真实仓库或运行记录。";
  byId("breadcrumbCurrent").textContent = pageNames[state.page];
  document.querySelector(".nav-count").textContent = String(repo().scenarios.length).padStart(2, "0");
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.page === state.page));
}

function render() {
  syncHeader();
  const page = {
    overview: renderOverview,
    flow: renderFlow,
    library: renderLibrary,
    compare: renderCompare,
    notes: renderNotes,
  }[state.page] || renderFlow;
  byId("pageContent").innerHTML = page();
  const codeScroll = byId("pageContent").querySelector(".code-scroll");
  const focusedLine = codeScroll?.querySelector(".line-focus");
  if (focusedLine && codeScroll.clientHeight) codeScroll.scrollTop = Math.max(0, focusedLine.offsetTop - codeScroll.offsetTop - codeScroll.clientHeight / 2);
  if (state.page === "library" && !filteredCards().length) {
    document.querySelector(".card-detail-panel").innerHTML = `<div class="empty-state"><span>⌕</span><strong>没有可显示的卡片</strong><small>调整搜索词或卡片类型后再试。</small></div>`;
  }
  document.querySelectorAll("[data-action='focus-search']").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function renderOverview() {
  const allSteps = repo().scenarios.reduce((sum, item) => sum + item.steps.length, 0);
  const reviewed = repo().cards.filter((item) => reviewFor(item.id).status === "reviewed").length;
  const focusScenario = repo().scenarios[0];
  const resumeStepIndex = isReal() ? 0 : 4;
  const progress = Math.round(((resumeStepIndex + 1) / focusScenario.steps.length) * 100);
  const focusLabels = isReal() ? ["握手", "ACK", "记忆", "L52"] : ["入口", "校验", "协调", "Agent"];
  return `
    <div class="page-heading overview-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>YOUR LEARNING SPACE</div><h1>嗨，今天想读哪条链路？ <span class="heading-wave">✦</span></h1><p class="page-lede">从一次运行开始，把分散在仓库里的代码慢慢串起来。</p></div><button class="button-primary" data-page="flow"><span>⌁</span> 继续流程复盘</button></div>
    <div class="metric-grid">
      <article class="metric-card metric-cyan"><span class="metric-icon">⌘</span><span class="metric-label">当前仓库</span><strong>${escapeHtml(repo().shortName)}</strong><small>${repo().language} · ${repo().snapshots.length} 个代码快照</small><span class="metric-orb"></span></article>
      <article class="metric-card metric-lilac"><span class="metric-icon">▤</span><span class="metric-label">${isReal() ? "断点前源码卡片" : "演示解释卡片"}</span><strong>${repo().cards.length}<small> 张</small></strong><small>${isReal() ? "固定提交源码，说明待人工核对" : "待人工确认的假数据"}</small><span class="metric-orb"></span></article>
      <article class="metric-card metric-peach"><span class="metric-icon">⌁</span><span class="metric-label">学习场景</span><strong>${repo().scenarios.length}<small> 条</small></strong><small>共 ${allSteps} 个${isReal() ? "采集步骤" : "演示步骤"}</small><span class="metric-orb"></span></article>
      <article class="metric-card metric-green"><span class="metric-icon">✓</span><span class="metric-label">说明已审核</span><strong>${reviewed}<small> / ${repo().cards.length}</small></strong><small>当前浏览器的${isReal() ? "人工审核记录" : "演示审核记录"}</small><span class="metric-orb"></span></article>
    </div>
    <div class="overview-grid">
      <section class="panel recent-panel"><div class="panel-title-row"><div><span class="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>最近学习的场景</h2></div><button class="text-button" data-page="flow">查看全部 <span>→</span></button></div>
        <div class="scenario-list">${repo().scenarios.map((item, index) => { const activeRun = item.runs.find((run) => run.snapshotId === state.snapshotId); return `<button class="scenario-row" data-page="flow" data-scenario="${item.id}"><span class="scenario-index index-${index}">0${index + 1}</span><span class="scenario-row-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.kind)} · ${item.steps.length} 个步骤 · ${escapeHtml(activeRun.date)}</small></span><span class="status-chip status-${activeRun.status}">${escapeHtml(activeRun.state)}</span><span class="row-arrow">↗</span></button>`; }).join("")}</div>
      </section>
      <section class="panel focus-panel"><div class="panel-title-row"><div><span class="section-kicker">LEARNING FOCUS</span><h2>这条链路的${isReal() ? "阅读进度" : "演示阅读进度"}</h2></div><span class="focus-emoji">✦</span></div>
        <div class="focus-flow">${focusLabels.map((label, index) => `${index ? "<i></i>" : ""}<span class="focus-node ${isReal() ? (index === 0 ? "current" : "") : (index < 2 ? "done" : index === 2 ? "current" : "")}">${label}</span>`).join("")}</div>
        <div class="progress-label"><span>${escapeHtml(focusScenario.name)}</span><strong>${progress}%</strong></div><div class="progress-track"><span style="width:${progress}%"></span></div><p class="focus-note">继续查看 <b>${escapeHtml(focusScenario.steps[resumeStepIndex].label)}</b>。</p><button class="button-soft" data-page="flow" data-scenario="${focusScenario.id}" data-step-target="${resumeStepIndex}">接着读 <span>→</span></button>
      </section>
    </div>
    <section class="panel quick-library"><div class="panel-title-row"><div><span class="section-kicker">RECENT CARDS</span><h2>最近打开的代码卡片</h2></div><button class="text-button" data-page="library">进入卡片库 <span>→</span></button></div><div class="mini-card-grid">${repo().cards.slice(0, 3).map((item) => `<button class="mini-code-card ${item.color}" data-card="${item.id}"><span class="mini-card-type">${escapeHtml(item.type)}</span><strong>${escapeHtml(item.symbol)}</strong><small>${escapeHtml(item.file.split("/").slice(-1)[0])}</small><span class="mini-card-arrow">↗</span></button>`).join("")}</div></section>`;
}

function renderFlow() {
  const activeScenario = scenario();
  const run = currentRun();
  const steps = activeSteps();
  const active = selectedStep();
  const activeCard = flowCard();
  const activeCardReviewed = reviewFor(activeCard.id).status === "reviewed";
  const selectedRunId = run.id;
  return `
    <div class="page-heading flow-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>TRACE PLAYGROUND <span class="eyebrow-pill">${isReal() ? "8094 实测 · 局部链路" : "演示链路"}</span></div><h1>${escapeHtml(activeScenario.name)} <span class="heading-spark">✦</span></h1><p class="page-lede">${isReal() ? "从 WebSocket 入口复盘到 pipeline.py:52 执行前；每一步可切换关联源码卡片。" : "沿着演示链路的阅读节奏，一步步看见代码做了什么。"}</p></div><div class="heading-actions"><button class="button-secondary" data-action="export"><span>↓</span> 导出记录</button><button class="button-primary" data-action="presentation"><span>↗</span> 演示模式</button></div></div>
    <div class="flow-toolbar"><div class="scenario-tabs">${repo().scenarios.map((item) => `<button class="scenario-tab ${item.id === activeScenario.id ? "selected" : ""}" data-scenario="${item.id}"><span class="tab-dot"></span>${escapeHtml(item.name)}</button>`).join("")}</div><label class="run-picker"><span>运行记录</span><select id="runSelect">${runsForSnapshot().map((item) => `<option value="${item.id}" ${item.id === selectedRunId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select><span class="select-chevron">⌄</span></label></div>
    <section class="run-context panel"><div class="context-prompt"><span class="prompt-avatar">你</span><div><span class="context-label">用户输入 <i>·</i> ${escapeHtml(run.date)}</span><p>“${escapeHtml(activeScenario.prompt)}”</p></div></div><div class="context-divider"></div><div class="context-result"><span class="result-icon">✦</span><div><span class="context-label">${isReal() || run.status === "partial" ? "采集结果" : "最终结果"} <i>·</i> ${escapeHtml(run.state)}</span><p>${isReal() ? escapeHtml(run.result) : run.status === "partial" ? "客户端连接中断，未采集到最终回复；不能据此判断后端请求失败。" : escapeHtml(run.response ?? activeScenario.response)}</p></div></div><div class="run-summary-meta"><span class="status-chip status-${run.status}"><i></i>${escapeHtml(run.state)}</span><span>◷ ${escapeHtml(run.duration)}</span><span>⌘ ${escapeHtml(snapshot().commit.slice(0, 7))}</span></div></section>
    ${isReal() ? `<div class="capture-facts panel"><strong>本次采集范围</strong><span>请求 ${escapeHtml(run.requestId)} · 会话 ${escapeHtml(run.sessionId)} · 用户 ${escapeHtml(run.userId)}</span><span>${escapeHtml(run.uiContext)}</span><span>临时服务仅本次关闭鉴权；Python 函数追踪不等于逐行覆盖。<a href="./${escapeHtml(run.traceFile)}" target="_blank" rel="noopener">查看原始采集记录 ↗</a></span></div>` : ""}
    <div class="workspace-label-row"><div><span class="workspace-overline">EXECUTION MAP</span><strong>运行链路</strong><span class="workspace-count">${steps.length} 步</span></div><div class="evidence-legend"><span><i class="legend-dot dynamic"></i>${isReal() ? "函数追踪 / WS 消息" : "运行事件"}</span><span><i class="legend-dot static"></i>源码关联</span></div></div>
    <section class="learning-workspace">
      <aside class="panel timeline-panel"><div class="pane-header"><div><span class="pane-label">FLOW STEPS</span><h2>执行步骤</h2></div><span class="pane-counter">${String(state.stepIndex + 1).padStart(2, "0")} <i>/ ${String(steps.length).padStart(2, "0")}</i></span></div>
        <div class="timeline-list">${steps.map((item, index) => `<button class="timeline-step ${index === state.stepIndex ? "is-active" : ""} ${item.evidence.startsWith("源码") ? "is-static" : ""}" data-step="${index}"><span class="timeline-rail"><i class="timeline-node">${index === state.stepIndex ? "✦" : String(index + 1).padStart(2, "0")}</i>${index < steps.length - 1 ? "<b></b>" : ""}</span><span class="timeline-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.event)}</small><span class="step-tags"><em class="${item.evidence.startsWith("源码") ? "tag-static" : "tag-dynamic"}">${escapeHtml(item.evidence)}</em><em>${escapeHtml(item.duration)}</em></span></span><span class="timeline-chevron">›</span></button>`).join("")}</div>
        <div class="timeline-footer"><span class="tiny-check">✓</span><span>${isReal() ? `展示 <b>${steps.length}</b> 个归并步骤，停在 L52 执行前` : `展示 <b>${steps.length}</b> 步，其中 <b>${steps.filter((step) => step.evidence.startsWith("运行")).length}</b> 条演示事件`}</span><button title="运行证据说明" data-action="evidence-info">ⓘ</button></div>
      </aside>
      <section class="panel source-panel"><div class="pane-header source-pane-header"><div><span class="pane-label">SOURCE VIEW</span><h2>对应源码</h2></div><button class="source-open-button" data-page="library" data-card="${activeCard.id}">打开卡片 <span>↗</span></button></div>
        <div class="file-tab-row"><span class="file-language-icon">${repo().language === "Python" ? "Py" : "TS"}</span><span class="file-name">${escapeHtml(activeCard.file.split("/").slice(-1)[0])}</span><span class="file-path">${escapeHtml(activeCard.file)}</span><button class="copy-button" data-action="copy-source" title="复制源码">▢ 复制</button></div>
        <div class="symbol-path"><span>⌂</span>${escapeHtml(activeCard.file.split("/").slice(-2, -1)[0] || "src")}<span>/</span><b>${escapeHtml(activeCard.symbol)}</b><span class="symbol-lines">L${activeCard.lineStart}–L${activeCard.lineStart + activeCard.source.split("\n").length - 1}</span></div>
        ${isReal() && (active.cardIds || []).length > 1 ? `<div class="flow-related-cards" aria-label="此步骤关联的源码卡片">${active.cardIds.map((id) => { const item = cardFor(id); return `<button class="flow-card-chip ${activeCard.id === id ? "selected" : ""}" data-flow-card="${escapeHtml(id)}">${escapeHtml(item.symbol)}</button>`; }).join("")}</div>` : ""}
        ${renderSource(activeCard)}
        <div class="source-caption"><span class="caption-lock">◈</span>固定快照 <b>${escapeHtml(snapshot().commit.slice(0, 7))}</b><span class="caption-dot">·</span>${isReal() ? `真实源码片段 · SHA-256 ${escapeHtml(activeCard.sourceHash.slice(0, 12))} · 高亮行为源码定位` : "演示源码，仅作界面占位"}</div>
      </section>
      <aside class="panel explanation-panel"><div class="pane-header explain-header"><div><span class="pane-label">EXPLAINED</span><h2>这一步在做什么？</h2></div><span class="explain-spark">✦</span></div>
        <div class="explain-content"><div class="explain-step-index">STEP ${String(state.stepIndex + 1).padStart(2, "0")} <span>OF ${String(steps.length).padStart(2, "0")}</span><em class="flow-review-status ${activeCardReviewed ? "is-reviewed" : ""}">${activeCardReviewed ? `说明已审核${isReal() ? "" : "（演示）"}` : "说明待审核"}</em></div><h3>${escapeHtml(active.label)}</h3><div class="explain-symbol"><span class="symbol-cube">ƒ</span><span><strong>${escapeHtml(activeCard.symbol)}</strong><small>${escapeHtml(activeCard.type)} · <b>${escapeHtml(activeCard.file.split("/").slice(-1)[0])}</b></small></span></div>
          <div class="explain-section"><h4><span>✦</span> 核心作用</h4><p class="key-purpose">${escapeHtml(activeCard.purpose)}</p></div>
          <div class="explain-io"><div><span class="io-label">输入</span><p>${escapeHtml(activeCard.input)}</p></div><div><span class="io-label output">输出</span><p>${escapeHtml(activeCard.output)}</p></div></div>
          <div class="explain-section relation-section"><h4><span>↗</span> 调用关系</h4><p class="relation-text">${escapeHtml(activeCard.calls)}</p></div>
          <div class="evidence-note ${active.evidence.startsWith("源码") ? "static-note" : "dynamic-note"}"><span>${active.evidence.startsWith("源码") ? "◇" : "●"}</span><div><strong>${escapeHtml(active.evidence)}</strong><small>${escapeHtml(active.evidenceDetail || activeCard.note)}</small></div></div>
          ${isReal() ? `<div class="card-warning flow-note"><span>ⓘ</span>${escapeHtml(activeCard.note)}</div>` : ""}
          <button class="next-step-button" data-action="next-step" ${state.stepIndex >= steps.length - 1 ? "disabled" : ""}>下一步 <span>→</span></button>
        </div>
      </aside>
    </section>
    <div class="flow-bottom-hint"><span>⌘</span> ${isReal() ? "已保存 8094 的一次断点前采集。第 52 行及后续 Agent 流程均未执行；当前仅覆盖这条局部链路。" : "当前为离线演示链路，接入真实仓库后将由运行记录关联对应版本源码。"} <button data-page="library">查看卡片库 <b>→</b></button></div>`;
}

function filteredCards() {
  const query = state.libraryQuery.trim().toLowerCase();
  return cardsForSnapshot().filter((item) => {
    const matchesType = state.libraryType === "全部类型" || item.type === state.libraryType;
    const isReviewed = reviewFor(item.id).status === "reviewed";
    const matchesReview = state.libraryReviewStatus === "全部状态" || (state.libraryReviewStatus === "已审核" ? isReviewed : !isReviewed);
    const haystack = `${item.title} ${item.type} ${item.file} ${item.symbol} ${item.purpose} ${item.source}`.toLowerCase();
    return matchesType && matchesReview && (!query || haystack.includes(query));
  });
}

function renderCardRows(cards) {
  if (!cards.length) return `<div class="empty-state"><span>⌕</span><strong>没有找到匹配的卡片</strong><small>试试搜索函数名、文件名或解释内容。</small></div>`;
  return cards.map((item) => { const reviewed = reviewFor(item.id).status === "reviewed"; return `<button class="library-card-row ${item.id === state.selectedCardId ? "selected" : ""}" data-card="${item.id}"><span class="card-kind-icon ${item.color}">${item.type.includes("函数") || item.type.includes("方法") ? "ƒ" : "◇"}</span><span class="library-card-copy"><strong>${escapeHtml(item.symbol)}</strong><small>${escapeHtml(item.file.split("/").slice(-1)[0])} · L${item.lineStart}</small><span>${escapeHtml(item.purpose)}</span></span><span class="review-badge ${reviewed ? "is-reviewed" : ""}">${reviewed ? "已审核" : "待审核"}</span></button>`; }).join("");
}

function renderReviewEditor(item) {
  const labels = { purpose: "一句话作用", input: "输入", output: "输出", calls: "关联关系", note: "核对提醒 / 备注" };
  return `<div class="card-review-editor"><p>只修改卡片说明；上方源码来自${isReal() ? "固定提交" : "只读演示快照"}，不可编辑。</p>${reviewFields.map((field) => `<label><span>${labels[field]}</span><textarea id="review-${field}" rows="${field === "purpose" || field === "note" ? 3 : 2}" maxlength="6000">${escapeHtml(item[field])}</textarea></label>`).join("")}</div>`;
}

function finishCardReview({ fromEditor = false, approved = false } = {}) {
  const id = state.selectedCardId;
  const previous = reviewFor(id);
  const changes = {};
  if (fromEditor) {
    for (const field of reviewFields) changes[field] = byId(`review-${field}`)?.value.trim() ?? "";
    if (!changes.purpose) {
      toast("请先填写这段代码的作用");
      byId("review-purpose")?.focus();
      return;
    }
  }
  const now = new Date().toISOString();
  if (!saveReview(id, {
    ...changes,
    status: approved ? "reviewed" : "pending",
    revision: (previous.revision || 0) + (fromEditor ? 1 : 0),
    updatedAt: now,
    reviewedAt: approved ? now : null,
  })) return;
  state.editingCardId = null;
  if ((approved && state.libraryReviewStatus === "待审核") || (!approved && state.libraryReviewStatus === "已审核")) state.libraryReviewStatus = "全部状态";
  render();
  toast(approved ? "这张卡片的说明已标记为审核通过" : "说明草稿已保存，状态为待审核");
}

function renderLibrary() {
  const activeCard = cardFor(state.selectedCardId);
  const activeReview = reviewFor(activeCard.id);
  const isReviewed = activeReview.status === "reviewed";
  const isEditing = state.editingCardId === activeCard.id;
  const reviewedCount = repo().cards.filter((item) => reviewFor(item.id).status === "reviewed").length;
  const reviewedAt = isReviewed && activeReview.reviewedAt ? new Date(activeReview.reviewedAt).toLocaleString("zh-CN", { hour12: false }) : "";
  const isBookmarked = bookmarks().has(activeCard.id);
  const linkedScenario = repo().scenarios.find((item) => item.steps.some((step) => (step.cardIds || [step.cardId]).includes(activeCard.id)));
  const linkedStepIndex = linkedScenario?.steps.findIndex((step) => (step.cardIds || [step.cardId]).includes(activeCard.id)) ?? 0;
  const types = ["全部类型", ...new Set(repo().cards.map((item) => item.type))];
  const resultCards = filteredCards();
  const fileCount = new Set(repo().cards.map((item) => item.file)).size;
  return `
    <div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>CODE KNOWLEDGE BASE</div><h1>代码解释卡片库 <span class="heading-spark">✦</span></h1><p class="page-lede">从文件、符号和解释出发，建立仓库自己的代码地图。</p></div><button class="button-secondary" data-action="export-cards"><span>↓</span> 导出卡片清单</button></div>
    <div class="library-stats"><span><b>${repo().cards.length}</b> 张${isReal() ? "断点前" : "演示"}卡片</span><i></i><span><b>${fileCount}</b> 个${isReal() ? "真实" : "演示"}文件</span><i></i><span class="review-stat"><b>${reviewedCount}</b> 张已审核 · <b>${repo().cards.length - reviewedCount}</b> 张待审核</span><span class="library-snapshot">⌘ ${snapshot().name}</span></div>
    ${isReal() ? `<div class="library-scope panel"><strong>当前收录范围</strong><span>${escapeHtml(repo().scope)}。卡片为固定提交的源码片段；文件数量与卡片数量均不代表全仓覆盖率。</span></div>` : ""}
    <div class="library-toolbar panel"><label class="library-search"><span>⌕</span><input id="librarySearch" type="search" value="${escapeHtml(state.libraryQuery)}" placeholder="搜索源码、符号名或说明…" /><kbd>⌘ K</kbd></label><label class="filter-select"><span>卡片类型</span><select id="libraryType">${types.map((type) => `<option ${type === state.libraryType ? "selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select><span class="select-chevron">⌄</span></label><label class="filter-select review-select"><span>审核状态</span><select id="libraryReviewStatus">${["全部状态", "待审核", "已审核"].map((status) => `<option ${status === state.libraryReviewStatus ? "selected" : ""}>${status}</option>`).join("")}</select><span class="select-chevron">⌄</span></label><button class="filter-button" data-action="clear-filters">↺ <span>重置</span></button></div>
    <div class="library-layout"><section class="panel library-list-panel"><div class="library-list-head"><div><strong>源码卡片</strong><small id="cardCount">${resultCards.length} 项</small></div><span aria-hidden="true">☷</span></div><div class="library-card-list" id="libraryCardResults">${renderCardRows(resultCards)}</div><div class="library-list-foot">已显示当前范围内的${isReal() ? "源码" : "演示"}卡片 <span>✦</span></div></section>
      <section class="panel card-detail-panel"><div class="card-detail-top"><div><span class="pane-label">SOURCE CARD</span><h2>${escapeHtml(activeCard.title)}</h2></div><button class="bookmark-button" data-action="bookmark" aria-label="${isBookmarked ? "取消收藏" : "收藏卡片"}" aria-pressed="${isBookmarked}" title="${isBookmarked ? "取消收藏" : "收藏卡片"}">${isBookmarked ? "★" : "☆"}</button></div><div class="card-meta-line"><span class="type-chip type-${activeCard.color}">${escapeHtml(activeCard.type)}</span><span class="review-status ${isReviewed ? "is-reviewed" : ""}">${isReviewed ? `已审核${isReal() ? "" : "（演示）"}` : "待人工审核"}</span><span>说明修订 ${activeReview.revision || 0} 次</span><span class="meta-spacer"></span><button data-action="bookmark">${isBookmarked ? "♥ 已收藏" : "♡ 收藏"}</button></div>
        <div class="card-file-line"><span class="file-language-icon">${repo().language === "Python" ? "Py" : "TS"}</span><span>${escapeHtml(activeCard.file)}</span><span class="file-line-number">L${activeCard.lineStart}–${activeCard.lineStart + activeCard.source.split("\n").length - 1}</span></div>
        ${renderSource(activeCard, true)}
        ${isReal() ? `<div class="card-source-proof">固定提交 ${escapeHtml(snapshot().commit.slice(0, 7))} · 文件 SHA-256 ${escapeHtml(activeCard.fileHash.slice(0, 12))} · 片段 SHA-256 ${escapeHtml(activeCard.sourceHash.slice(0, 12))}</div>` : ""}
        <div class="card-explanation"><div class="explanation-heading"><span class="explanation-flower">✦</span><div><span class="pane-label">${isReviewed ? "REVIEWED EXPLANATION" : "EXPLANATION DRAFT"}</span><h3>这段代码的作用</h3></div><span class="draft-label">${isReal() ? (isReviewed ? "已审核说明" : "待核对说明") : "演示说明"}</span></div>${isEditing ? renderReviewEditor(activeCard) : `<p class="key-purpose">${escapeHtml(activeCard.purpose)}</p><div class="detail-field-grid"><div><span>输入</span><p>${escapeHtml(activeCard.input)}</p></div><div><span>输出</span><p>${escapeHtml(activeCard.output)}</p></div><div class="wide-field"><span>关联关系</span><p>${escapeHtml(activeCard.calls)}</p></div></div><div class="card-warning"><span>ⓘ</span>${escapeHtml(activeCard.note)}</div>`}
          <div class="card-review-panel"><div><strong>${isReviewed ? "✓ 已审核通过" : "○ 等待人工审核"}</strong><small>${isReviewed ? `确认时间：${escapeHtml(reviewedAt)}` : "核对说明后，可直接通过；有误时先编辑并保存。"}</small></div><div class="card-review-actions">${isEditing ? `<button class="button-secondary" data-action="cancel-card-edit">取消</button><button class="button-secondary" data-action="save-card-draft">保存草稿</button><button class="button-primary" data-action="approve-card-edits">保存并通过审核</button>` : `<button class="button-secondary" data-action="edit-card">编辑说明</button><button class="${isReviewed ? "button-secondary" : "button-primary"}" data-action="${isReviewed ? "reopen-card" : "approve-card"}">${isReviewed ? "撤回审核" : "确认审核通过"}</button>`}</div></div><p class="card-review-hint">${isReal() ? "人工审核只确认本卡说明；源码与采集证据仍以固定提交和原始记录为准。" : "审核状态仅保存在当前浏览器的当前仓库与快照中；此处均为假数据，不代表已核实真实源码。"}审核状态保存在当前浏览器，导出卡片清单可备份。</p></div>
        <div class="card-used-by"><span>⌁</span><div><strong>被流程引用</strong><small>${repo().scenarios.filter((item) => item.steps.some((step) => (step.cardIds || [step.cardId]).includes(activeCard.id))).map((item) => escapeHtml(item.name)).join("、") || "暂未关联当前流程"}</small></div>${linkedScenario ? `<button data-page="flow" data-scenario="${linkedScenario.id}" data-step-target="${linkedStepIndex}" data-flow-card="${activeCard.id}">查看流程 →</button>` : ""}</div>
      </section></div>`;
}

function renderCompare() {
  if (repo().snapshots.length < 2) return `<div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>VERSION EXPLORER</div><h1>代码版本对比 <span class="heading-spark">✦</span></h1><p class="page-lede">当前真实仓库只收录固定提交 ${escapeHtml(snapshot().commit.slice(0, 7))} 的断点前链路。</p></div></div><section class="panel single-snapshot"><strong>目前只有一个源码快照</strong><p>新增另一个经过采集和索引的固定提交后，才能比较真实源码与流程差异。</p><button class="button-primary" data-page="flow">返回流程复盘 →</button></section>`;
  const older = repo().snapshots[1] || repo().snapshots[0];
  const newer = repo().snapshots[0];
  const diffs = SNAPSHOT_DIFFS[repo().id] || [];
  const added = diffs.filter((item) => item.kind === "新增").length;
  const changed = diffs.filter((item) => item.kind === "修改").length;
  return `
    <div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>VERSION EXPLORER</div><h1>代码版本对比 <span class="heading-spark">✦</span></h1><p class="page-lede">并排观察两个固定快照的变化，以及它们对学习链路的影响。</p></div><span class="compare-demo-pill">演示差异</span></div>
    <section class="compare-selectors panel"><div class="compare-version"><span class="version-avatar old">A</span><div><span class="pane-label">OLDER SNAPSHOT${older.id === state.snapshotId ? " · 已选择" : ""}</span><strong>${escapeHtml(older.name)}</strong><small>${escapeHtml(older.commit)} · ${escapeHtml(older.date)}</small></div></div><span class="compare-arrows">→</span><div class="compare-version"><span class="version-avatar current">B</span><div><span class="pane-label">NEWER SNAPSHOT${newer.id === state.snapshotId ? " · 已选择" : ""}</span><strong>${escapeHtml(newer.name)}</strong><small>${escapeHtml(newer.commit)} · ${escapeHtml(newer.date)}</small></div></div><button class="button-secondary" data-action="compare-refresh">⇄ 更新对比</button></section>
    <div class="compare-summary-row"><span class="compare-summary-icon">✦</span><div><strong>这两个快照之间有 <b>${diffs.length} 处演示变更</b></strong><small>差异内容为假数据，仅用于预览版本对比页面结构。</small></div><span class="diff-stat added">+ ${added} 新增</span><span class="diff-stat changed">↻ ${changed} 修改</span></div>
    <section class="diff-list">${diffs.map((item, index) => `<article class="panel diff-card"><div class="diff-card-head"><span class="diff-file-icon">${repo().language === "Python" ? "Py" : "TS"}</span><strong>${escapeHtml(item.file)}</strong><span class="diff-kind ${item.kind === "新增" ? "added" : "changed"}">${escapeHtml(item.kind)}</span><span class="diff-location">演示变更 ${String(index + 1).padStart(2, "0")}</span><button class="diff-expand" data-action="toggle-diff" aria-expanded="${index === 0}">⌄</button></div><div class="diff-summary">${escapeHtml(item.summary)}</div><pre class="diff-code ${index === 0 ? "open" : ""}"><span class="diff-add">${escapeHtml(item.change)}</span></pre></article>`).join("")}</section>
    <div class="compare-footnote"><span>ⓘ</span> 历史运行始终关联原始代码快照。真实版本比较接入后会以 commit 和源码哈希定位差异。</div>`;
}

function renderNotes() {
  const saved = localStorage.getItem(`cfo-note-${repo().id}`) || "";
  return `
    <div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span>MY LEARNING NOTES</div><h1>学习笔记 <span class="heading-spark">✦</span></h1><p class="page-lede">把每次读懂的细节留下来，成为自己的代码地图。</p></div><span class="local-save-badge"><i></i> 点击保存后存入此浏览器</span></div>
    <div class="notes-grid"><section class="panel note-editor"><div class="note-editor-head"><div><span class="pane-label">QUICK NOTE</span><h2>今天的新发现</h2></div><span class="note-date">${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span></div><label class="note-title-label">笔记内容<textarea id="noteInput" placeholder="比如：请求进入 RuntimeCoordinator 前，Gateway 会先确认 request_id……">${escapeHtml(saved)}</textarea></label><div class="note-editor-foot"><span><span class="tiny-check">✓</span> 写下理解、疑问或待验证的地方</span><button class="button-primary" data-action="save-note">保存笔记 <span>↗</span></button></div></section>
      <aside class="panel notes-side"><span class="pane-label">LINKED TO</span><h2>关联当前学习内容</h2><div class="linked-item"><span class="linked-icon flow">⌁</span><div><strong>${escapeHtml(scenario().name)}</strong><small>当前场景 · ${scenario().steps.length} 步</small></div><button data-page="flow">↗</button></div><div class="linked-item"><span class="linked-icon code">ƒ</span><div><strong>${escapeHtml(cardFor(selectedStep().cardId).symbol)}</strong><small>${escapeHtml(cardFor(selectedStep().cardId).file.split("/").slice(-1)[0])}</small></div><button data-page="library" data-card="${selectedStep().cardId}">↗</button></div><div class="notes-tip"><span>✦</span><p>建议记录：这一步为什么会执行？它读取了什么，又改变了什么状态？</p></div></aside></div>`;
}

function toast(message) {
  const target = byId("toast");
  target.textContent = message;
  target.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => target.classList.remove("show"), 2600);
}

function setPage(page) {
  if (!pageNames[page]) return;
  if (page !== "library") state.editingCardId = null;
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSearch() {
  const overlay = byId("searchOverlay");
  overlay.hidden = false;
  document.querySelectorAll("[data-action='focus-search']").forEach((button) => button.setAttribute("aria-expanded", "true"));
  byId("globalSearch").value = "";
  byId("searchResults").innerHTML = `<p class="search-hint">输入关键词，搜索当前仓库中的流程和卡片。</p>`;
  setTimeout(() => byId("globalSearch").focus(), 0);
}

function updateSearch(query) {
  const normalized = query.trim().toLowerCase();
  const scenarios = repo().scenarios.filter((item) => `${item.name} ${item.kind} ${item.prompt}`.toLowerCase().includes(normalized));
  const cards = cardsForSnapshot().filter((item) => `${item.symbol} ${item.file} ${item.purpose}`.toLowerCase().includes(normalized)).slice(0, 6);
  if (!normalized) {
    byId("searchResults").innerHTML = `<p class="search-hint">输入关键词，搜索当前仓库中的流程和卡片。</p>`;
    return;
  }
  if (!scenarios.length && !cards.length) {
    byId("searchResults").innerHTML = `<p class="search-hint">没有找到“${escapeHtml(query)}”相关内容。</p>`;
    return;
  }
  byId("searchResults").innerHTML = `${scenarios.map((item) => `<button class="search-result" data-search-scenario="${item.id}"><span class="search-result-icon flow">⌁</span><span><strong>${escapeHtml(item.name)}</strong><small>流程场景 · ${item.kind}</small></span><kbd>场景</kbd></button>`).join("")}${cards.map((item) => `<button class="search-result" data-search-card="${item.id}"><span class="search-result-icon code">ƒ</span><span><strong>${escapeHtml(item.symbol)}</strong><small>${escapeHtml(item.file)}</small></span><kbd>代码卡片</kbd></button>`).join("")}`;
}

async function exportRun() {
  const run = currentRun();
  const bundle = {
    demo: !isReal(),
    repository: repo().name,
    snapshot: snapshot(),
    scenario: { id: scenario().id, name: scenario().name, prompt: scenario().prompt, response: scenario().response },
    run,
    steps: activeSteps().map((step) => ({ ...step, cards: (step.cardIds || [step.cardId]).map(cardFor) })),
  };
  if (isReal() && run.traceFile) {
    try {
      const response = await fetch(`./${run.traceFile}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      bundle.rawTrace = await response.json();
    } catch {
      toast("原始追踪读取失败，请单独保存页面中的采集证据 JSON");
      return;
    }
  }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `code-flow-${repo().id}-${scenario().id}-${run.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${isReal() ? "采集" : "演示"}记录已导出为 JSON`);
}

function handleClick(event) {
  const nav = event.target.closest("[data-page]");
  if (nav) {
    if (nav.tagName === "A") event.preventDefault();
    if (nav.dataset.scenario) {
      state.scenarioId = nav.dataset.scenario;
      state.runId = runsForSnapshot()[0].id;
    }
    if (nav.dataset.card) state.selectedCardId = nav.dataset.card;
    if (nav.dataset.stepTarget !== undefined) state.stepIndex = Number(nav.dataset.stepTarget);
    else if (nav.dataset.scenario) state.stepIndex = 0;
    state.flowCardId = nav.dataset.flowCard || null;
    if (nav.dataset.scenario) state.selectedCardId = selectedStep().cardId;
    setPage(nav.dataset.page);
    return;
  }
  const scenarioButton = event.target.closest("[data-scenario]");
  if (scenarioButton) {
    state.scenarioId = scenarioButton.dataset.scenario;
    state.stepIndex = 0;
    state.flowCardId = null;
    state.runId = runsForSnapshot()[0].id;
    state.selectedCardId = selectedStep().cardId;
    render();
    return;
  }
  const stepButton = event.target.closest("[data-step]");
  if (stepButton) {
    state.stepIndex = Number(stepButton.dataset.step);
    state.flowCardId = null;
    state.selectedCardId = selectedStep().cardId;
    render();
    return;
  }
  const cardButton = event.target.closest("[data-card]");
  if (cardButton) {
    if (state.selectedCardId !== cardButton.dataset.card) state.editingCardId = null;
    state.selectedCardId = cardButton.dataset.card;
    if (state.page !== "library") setPage("library");
    else render();
    return;
  }
  const flowCardButton = event.target.closest("[data-flow-card]");
  if (flowCardButton) {
    state.flowCardId = flowCardButton.dataset.flowCard;
    state.selectedCardId = state.flowCardId;
    render();
    return;
  }
  const searchScenario = event.target.closest("[data-search-scenario]");
  if (searchScenario) {
    state.scenarioId = searchScenario.dataset.searchScenario;
    state.stepIndex = 0;
    state.flowCardId = null;
    state.runId = runsForSnapshot()[0].id;
    byId("searchOverlay").hidden = true;
    setPage("flow");
    return;
  }
  const searchCard = event.target.closest("[data-search-card]");
  if (searchCard) {
    state.selectedCardId = searchCard.dataset.searchCard;
    byId("searchOverlay").hidden = true;
    setPage("library");
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "focus-search") openSearch();
  if (action === "presentation") {
    document.body.classList.toggle("presentation-mode");
    toast(document.body.classList.contains("presentation-mode") ? "已进入专注演示模式" : "已退出演示模式");
  }
  if (action === "next-step" && state.stepIndex < activeSteps().length - 1) {
    state.stepIndex += 1;
    state.flowCardId = null;
    state.selectedCardId = selectedStep().cardId;
    render();
  }
  if (action === "copy-source") {
    if (!navigator.clipboard?.writeText) toast("当前浏览器不支持剪贴板复制");
    else navigator.clipboard.writeText(flowCard().source).then(() => toast(`${isReal() ? "源码片段" : "源码示例"}已复制`)).catch(() => toast("复制失败，请检查浏览器权限"));
  }
  if (action === "export") exportRun();
  if (action === "export-cards") {
    const blob = new Blob([JSON.stringify({ demo: !isReal(), repository: repo().name, snapshot: snapshot(), scope: repo().scope || null, cards: cardsForSnapshot().map((item) => ({ ...item, review: reviewFor(item.id) })) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `code-flow-cards-${repo().id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("卡片清单已导出");
  }
  if (action === "clear-filters") {
    state.libraryQuery = ""; state.libraryType = "全部类型"; state.libraryReviewStatus = "全部状态"; render();
  }
  if (action === "edit-card") {
    state.editingCardId = state.selectedCardId;
    render();
    byId("review-purpose")?.focus();
  }
  if (action === "cancel-card-edit") { state.editingCardId = null; render(); }
  if (action === "save-card-draft") finishCardReview({ fromEditor: true });
  if (action === "approve-card-edits") finishCardReview({ fromEditor: true, approved: true });
  if (action === "approve-card") finishCardReview({ approved: true });
  if (action === "reopen-card") finishCardReview();
  if (action === "bookmark") {
    const saved = bookmarks();
    if (saved.has(state.selectedCardId)) saved.delete(state.selectedCardId);
    else saved.add(state.selectedCardId);
    localStorage.setItem(`cfo-bookmarks-${repo().id}`, JSON.stringify([...saved]));
    render();
    toast(saved.has(state.selectedCardId) ? "卡片已收藏" : "已取消收藏");
  }
  if (action === "evidence-info") toast(isReal() ? "函数进入来自 8094 追踪；ACK 来自 WebSocket；源码片段不等于逐行执行证据。" : "演示链路会标注运行事件与源码关联。");
  if (action === "compare-refresh") toast("当前差异为静态演示数据");
  if (action === "toggle-diff") {
    const button = event.target.closest("[data-action='toggle-diff']");
    const code = button.closest(".diff-card").querySelector(".diff-code");
    const open = code.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "⌄" : "›";
  }
  if (action === "save-note") {
    localStorage.setItem(`cfo-note-${repo().id}`, byId("noteInput")?.value || "");
    toast("笔记已保存在当前浏览器");
  }
}

document.addEventListener("click", handleClick);
byId("repositorySelect").addEventListener("change", (event) => {
  state.repositoryId = event.target.value;
  state.snapshotId = repo().snapshots[0].id;
  state.scenarioId = repo().scenarios[0].id;
  state.stepIndex = 0;
  state.flowCardId = null;
  state.runId = runsForSnapshot()[0].id;
  state.selectedCardId = scenario().steps[0].cardId;
  state.libraryQuery = "";
  state.libraryType = "全部类型";
  state.libraryReviewStatus = "全部状态";
  state.editingCardId = null;
  render();
  toast(`已切换到 ${repo().shortName}${isReal() ? "真实仓库" : "演示仓库"}`);
});
byId("snapshotSelect").addEventListener("change", (event) => {
  state.snapshotId = event.target.value;
  state.libraryReviewStatus = "全部状态";
  state.editingCardId = null;
  state.runId = runsForSnapshot()[0].id;
  state.stepIndex = 0;
  state.flowCardId = null;
  state.selectedCardId = selectedStep().cardId;
  render();
  toast(`已切换到 ${snapshot().name}`);
});
byId("pageContent").addEventListener("change", (event) => {
  if (event.target.id === "runSelect") {
    state.runId = event.target.value;
    state.stepIndex = Math.min(state.stepIndex, activeSteps().length - 1);
    state.flowCardId = null;
    state.selectedCardId = selectedStep().cardId;
    render();
  }
  if (event.target.id === "libraryType") {
    state.libraryType = event.target.value;
    const results = filteredCards();
    if (results.length && !results.some((item) => item.id === state.selectedCardId)) state.selectedCardId = results[0].id;
    state.editingCardId = null;
    render();
  }
  if (event.target.id === "libraryReviewStatus") {
    state.libraryReviewStatus = event.target.value;
    const results = filteredCards();
    if (results.length && !results.some((item) => item.id === state.selectedCardId)) state.selectedCardId = results[0].id;
    state.editingCardId = null;
    render();
  }
});
byId("pageContent").addEventListener("input", (event) => {
  if (event.target.id === "librarySearch") {
    state.libraryQuery = event.target.value;
    if (event.isComposing) return;
    const caret = event.target.selectionStart;
    const results = filteredCards();
    if (results.length && !results.some((item) => item.id === state.selectedCardId)) state.selectedCardId = results[0].id;
    render();
    const input = byId("librarySearch");
    input.focus();
    if (caret !== null) input.setSelectionRange(caret, caret);
  }
});
byId("globalSearch").addEventListener("input", (event) => updateSearch(event.target.value));
byId("searchOverlay").addEventListener("click", (event) => {
  if (event.target.id === "searchOverlay") byId("searchOverlay").hidden = true;
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
  if (event.key === "Escape") byId("searchOverlay").hidden = true;
  if (!byId("searchOverlay").hidden || event.target.closest("input, textarea, select, [contenteditable]")) return;
  if (state.page === "flow" && event.key === "ArrowDown" && state.stepIndex < activeSteps().length - 1) { event.preventDefault(); state.stepIndex += 1; state.flowCardId = null; state.selectedCardId = selectedStep().cardId; render(); }
  if (state.page === "flow" && event.key === "ArrowUp" && state.stepIndex > 0) { event.preventDefault(); state.stepIndex -= 1; state.flowCardId = null; state.selectedCardId = selectedStep().cardId; render(); }
});

render();
