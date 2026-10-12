/* 웹 줄바꿈 — 숫자·기호가 든 어절은 한 덩어리, 가운뎃점은 줄 첫머리에 오지 않게(4단계 #17·#18 · 10-12).
   PDF 빌드(마이리얼트립 build.py wrap())와 같은 규칙. 글자는 바꾸지 않는다 — 표시만(span · 붙임 공백) */

export const NB_TOKEN = /[\d%×/~]/;
/* 가운뎃점 앞은 붙인다 — 「 · 」는 붙임 공백, 「a·b」는 단어 결합자(줄 첫머리 「·LLM」 방지) */
const dots = (s) => s.replaceAll(' · ', '\u00a0· ').replace(/(?<!\s)·/g, '\u2060·');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Astro 템플릿용 — 문자열 → HTML 문자열(set:html) */
export function nb(s = '') {
  /* **강조**(👤 10-13 칸당 핵심 구절 하나) — 어절 경계에서만 열고 닫는다. 표지를 어절 밖으로 빼야 nb span과 엇갈리지 않는다 */
  return esc(dots(String(s)).replace(/\*\*(.+?)\*\*/g, '\u0001$1\u0002'))
    .replace(/[^\s]+/g, (w) => {
      const open = w.startsWith('\u0001'), close = w.endsWith('\u0002');
      const core = w.slice(open ? 1 : 0, close ? -1 : undefined);
      return (open ? '<strong>' : '') + (NB_TOKEN.test(core) ? `<span class="nb">${core}</span>` : core) + (close ? '</strong>' : '');
    });
}

/* 마크다운 본문용 rehype 플러그인 — 텍스트 노드만 손댄다(code·pre 안은 그대로) · 표는 가로 스크롤 상자로 감싼다 */
export function rehypeWeb() {
  const SKIP = new Set(['code', 'pre', 'script', 'style']);
  const split = (value) => {
    const out = [];
    let buf = '';
    for (const part of dots(value).split(/(\s+)/)) {
      if (part && !/^\s+$/.test(part) && NB_TOKEN.test(part)) {
        if (buf) out.push({ type: 'text', value: buf });
        buf = '';
        out.push({ type: 'element', tagName: 'span', properties: { className: ['nb'] }, children: [{ type: 'text', value: part }] });
      } else buf += part;
    }
    if (buf) out.push({ type: 'text', value: buf });
    return out;
  };
  const walk = (node) => {
    if (!node.children) return;
    const kids = [];
    for (const c of node.children) {
      if (c.type === 'text') kids.push(...split(c.value));
      else if (c.type === 'element' && c.tagName === 'table') {
        walk(c);
        kids.push({ type: 'element', tagName: 'div', properties: { className: ['table-scroll'] }, children: [c] });
      } else {
        if (c.type === 'element' && !SKIP.has(c.tagName)) walk(c);
        else if (c.type === 'root') walk(c);
        kids.push(c);
      }
    }
    node.children = kids;
  };
  return (tree) => walk(tree);
}
