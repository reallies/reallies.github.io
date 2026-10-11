/**
 * 프로젝트 페이지 본문 그림 — sync가 카드 본문의 절 끝에 HTML로 꽂는다(2026-10-12).
 * 값(라벨·수치)은 볼트 `웹_그림.md`에만 있다 — 카드에 이미 있는 사실·낱말만 쓴다.
 * 마크다운 안의 HTML 블록이라 빈 줄·들여쓰기를 만들지 않는다(빈 줄이 있으면 마크다운이 블록을 끊는다).
 * 클래스는 사례 페이지 그림(cases/[stage].astro)과 같다 — 모양을 한 벌로 둔다.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cls = (base, flags) => [base, ...Object.entries(flags).filter(([, v]) => v).map(([k]) => k)].join(' ');

function gallery(items, base) {
  const tr = items.map((g, k) =>
    `<figure class="${cls('gitem', { tall: g.h > g.w })}"><img src="${base}/${esc(g.src)}" width="${g.w}" height="${g.h}" alt="${esc(g.cap)}" loading="${k ? 'lazy' : 'eager'}" decoding="async"><figcaption>${esc(g.cap)}</figcaption></figure>`).join('');
  const nav = items.length > 1
    ? `<div class="gnav"><button type="button" data-dir="-1" aria-label="이전 화면">←</button><span class="gcount mono"><b>1</b> / ${items.length}</span><button type="button" data-dir="1" aria-label="다음 화면">→</button></div>`
    : '';
  return `<div class="gal"><div class="gtrack" tabindex="0" aria-label="화면 — 옆으로 넘겨 보기">${tr}</div>${nav}</div>`;
}

function bars(groups) {
  return `<div class="cbars">${groups.map((g) => {
    const unit = g.unit ?? '%';
    const max = g.max ?? (unit === '%' ? 100 : Math.max(...g.r.map((b) => b.v)));
    const fmt = (v) => (unit === '%' ? `${v.toFixed(1)}%` : `${v.toLocaleString('en-US')}${unit}`);
    return `<div class="bgroup"><p class="btitle">${esc(g.t)}</p>${g.r.map((b) =>
      `<div class="${cls('brow', { hi: b.hi })}"><span class="bl">${esc(b.l)}</span><span class="bar"><i style="width:${(b.v / max * 100).toFixed(1)}%"></i></span><span class="bv mono">${fmt(b.v)}</span></div>`).join('')}</div>`;
  }).join('')}</div>`;
}

const scope = (xs) => `<div class="cscope">${xs.map((x) =>
  `<div class="${cls('sc', { out: x.out, cut: x.cut })}"><b>${esc(x.b)}</b>${x.s.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`).join('')}</div>`;

const tl = (xs) => `<ol class="ctl">${xs.map((t) =>
  `<li class="${cls('', { end: t.end })}"><b>${esc(t.b)}</b>${t.s.map((x) => `<span>${esc(x)}</span>`).join('')}</li>`).join('')}</ol>`;

/* 흐름 — 상자를 화살표로 잇는다. zone이 같은 상자는 한 테두리로 묶고 이름을 단다. e = 화살표 위 글자 */
function flow(items) {
  const zones = [];
  for (const it of items) {
    const z = it.zone ?? '';
    if (!zones.length || zones.at(-1).z !== z) zones.push({ z, items: [] });
    zones.at(-1).items.push(it);
  }
  let first = true;
  const box = (it) => {
    const arrow = first ? '' : `<span class="farr" aria-hidden="true">${it.e ? `<em>${esc(it.e)}</em>` : ''}→</span>`;
    first = false;
    return `${arrow}<div class="${cls('fbox', { hi: it.hi })}"><b>${esc(it.b)}</b>${(it.s ?? []).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
  };
  return `<div class="cflow">${zones.map((g) => g.z
    ? `<div class="fzone"><p class="fzl mono">${esc(g.z)}</p><div class="frow">${g.items.map(box).join('')}</div></div>`
    : g.items.map(box).join('')).join('')}</div>`;
}

export function figHtml(fig, base = '') {
  const parts = [];
  if (fig.title) parts.push(`<p class="ftitle">${esc(fig.title)}</p>`);
  if (fig.gallery) parts.push(gallery(fig.gallery, base));
  if (fig.flow) parts.push(flow(fig.flow));
  if (fig.bars) parts.push(bars(fig.bars));
  if (fig.scope) parts.push(scope(fig.scope));
  if (fig.tl) parts.push(tl(fig.tl));
  if (fig.cap) parts.push(`<figcaption class="fcap">${esc(fig.cap)}</figcaption>`);
  return `<figure class="cfig pfig">${parts.join('')}</figure>`;
}
