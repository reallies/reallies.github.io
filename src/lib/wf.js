/* 와이어프레임 SVG → 페이지 안 HTML. <img>로 넣으면 다크 테마를 따르지 못하고 글자가 그림째 줄어든다.
   글 위주 시안은 줄 단위 HTML로(좁은 화면에서 다시 흐른다), 배치가 있는 시안은 SVG를 그대로 넣고 색만 토큰으로 바꾼다.
   원본은 public/analysis/ 의 SVG 하나다 — 요약과 전체 기록이 같이 쓴다 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const COLORS = {
  '#202a35': 'var(--ink)', '#526275': 'var(--muted)', '#c8cdd5': 'var(--hairline)',
  '#fff': 'var(--surface)', '#f4f5f7': 'var(--paper)', '#25374a': 'var(--ink)',
  '#eaf0f6': 'var(--wf-tint)', '#edf0f4': 'var(--wf-tint)', '#fff4dd': 'var(--wf-note)',
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (src) => readFileSync(path.join(process.cwd(), 'public', src.replace(/^\//, '')), 'utf8');

/* 글 위주 시안: 첫 줄(제목)은 빼고 [단추] 표기를 단추 모양으로 */
const rows = (svg, label) => {
  const lines = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]).slice(1);
  const body = lines.map((l) => `<p>${esc(l.replace(/\s{2,}/g, ' ')).replace(/\[([^\]]+)\]/g, '<span class="wf-b">$1</span>')}</p>`).join('');
  return `<div class="wf" role="group" aria-label="${esc(label)}">${body}</div>`;
};

/* 배치 시안: 고정 색을 토큰으로, 크기는 viewBox에 맡긴다. 여백 설명은 캡션이 맡는다 */
const inline = (svg, label) => {
  const out = svg
    .replace(/<\?xml[^>]*>/, '')
    .replace(/\s(width|height)="\d+"(?=[^<]*viewBox)/g, '')
    .replace(/(fill|stroke)="(#[0-9a-f]{3,6})"/gi, (m, a, c) => `${a}="${COLORS[c.toLowerCase()] ?? c}"`)
    .replace(/font-family="sans-serif"/g, 'font-family="var(--font-body)"');
  return `<div class="wfs">${out.replace('<svg ', `<svg role="img" aria-label="${esc(label)}" `)}</div>`;
};

export function wfHtml(src, label = '') {
  const svg = read(src);
  // Spatial diagrams carry their layout; do not flatten them into text rows.
  if (svg.includes('data-layout="spatial"')) return `<div class="wfs">${svg}</div>`;
  if (src.endsWith('/hackers-toeic/wireframe-2.svg')) {
    const lines = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]).slice(1);
    const line = (i) => esc(lines[i]).replace(/\[([^\]]+)\]/g, '<span class="wf-b">$1</span>');
    return `<div class="wf" role="group" aria-label="${esc(label)}">
      <section class="wf-section"><h4>${line(0)}</h4>
        <p class="wf-choice">${line(1)}</p>
        <p class="wf-choice">${line(2)}</p>
      </section>
      <section class="wf-section"><h4>${line(3)}</h4>
        <p class="wf-choice">${line(4).split('←')[0]}</p>
        <p class="wf-note">${esc(lines[4].split('←')[1]?.trim() ?? '')}</p>
        <p>${line(5)}</p>
      </section>
      <section class="wf-section"><p>${line(6)}</p></section>
    </div>`;
  }
  return /<g font-family/.test(svg) ? rows(svg, label) : inline(svg, label);
}
