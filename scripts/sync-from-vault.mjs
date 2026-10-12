/**
 * 볼트 → 사이트 단일 방향 동기화.
 *
 * 원본은 언제나 Obsidian 볼트다. 이 사이트는 빌드 산출물이므로
 * src/content/ 안의 파일을 직접 고치지 않는다. (04_웹포트폴리오_전략 §6)
 *
 * 실행: npm run sync   (dev/build 앞에 자동으로 붙는다)
 */
import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figHtml } from '../src/lib/figs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.VAULT_DIR
  ?? path.resolve(process.env.HOME, 'Documents/Obsidian/ohs/Notion/오현석');

const OUT_PROJECTS = path.join(ROOT, 'src/content/projects');
const OUT_CAPS = path.join(ROOT, 'src/content/capabilities');
const OUT_DATA = path.join(ROOT, 'src/data');
// 볼트 루트 — 웹_단계.md 의 `원천`(지원서 원고) 경로가 여기 기준이다
const VAULT_ROOT = process.env.VAULT_ROOT ?? path.resolve(VAULT, '../../..');

const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

if (!existsSync(VAULT)) die(`볼트를 찾을 수 없습니다: ${VAULT}\n  VAULT_DIR 환경변수로 경로를 지정하세요.`);

/** frontmatter 원문과 본문을 분리 */
function split(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

/** frontmatter에서 스칼라 키 하나를 뽑는다 (따옴표 제거) */
function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!m) return undefined;
  return m[1].trim().replace(/^["'](.*)["']$/, '$1');
}

/** frontmatter의 리스트 블록(- 항목)을 뽑는다 */
function list(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s.*\\n?)+)`, 'm'));
  if (!m) return [];
  return m[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
}

/**
 * 공개용 정제 — 내부 거버넌스 장치를 본문에서 걷어낸다.
 *
 * 볼트의 T1/T2/T3 출처 등급과 ⚠️ 무결성 메모는 "내가 나에게 사실을 증명하는" 장치다.
 * 채용담당자는 T1이 뭔지 모르고, 회의록 28건을 열어볼 수도 없다.
 * 사실의 범위 표시(PM 2인 중 1인 등)는 web_caveat 로 따로 노출하므로 여기서 지워도 안전하다.
 */
function publicize(body) {
  const INTERNAL_HEADING = /^(#{2,})\s*.*(증빙|미확인|무결성|TODO)/;

  // 내부 전용 섹션은 같은 레벨 이상의 다음 제목이 나올 때까지 통째로 버린다.
  const kept = [];
  let skipDepth = 0;
  for (const line of body.split('\n')) {
    const h = line.match(/^(#{1,6})\s/);
    if (skipDepth) {
      if (h && h[1].length <= skipDepth) skipDepth = 0;
      else continue;
    }
    const m = line.match(INTERNAL_HEADING);
    if (m) { skipDepth = m[1].length; continue; }
    kept.push(line);
  }

  return kept.join('\n')
    // 출처 등급 태그 — [T1], [T2 회의록], [T1 git] …
    .replace(/\s*[\[(]T[123][^\])]*[\])]/g, '')
    // 내부 메모 인용블록 — ⚠️ 무결성 / 출처 각주 / 검토 메모
    .replace(/^>\s*(⚠️|\*?출처|❌|🔍).*$/gm, '')
    // 내부 검증 표현 — 나에게 사실을 증명하려고 붙인 괄호들
    .replace(/\s*[(（](검증된 것만|git blame 검증|코드 재검증|본인 확인|추정 금지|정본)[)）]/g, '')
    // 옵시디언 위키 임베드 (웹에서 깨진다)
    .replace(/!?\[\[[^\]]*\]\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 카드 머리 인용의 메타 줄 제거 — 케이스 페이지 헤더가 이미 같은 말을 한다.
 *
 * 볼트 카드는 옵시디언에서 단독으로 읽히므로 `역할 · 팀 · 기간` 줄이 필요하지만,
 * 웹에서는 바로 위에 kind·meta·caveat 가 이미 찍혀 있어 같은 줄이 두 번 나온다.
 * 기여 범위 표기(PM 2인 중 1인 · 7인 팀 공동)는 web_caveat 로 따로 노출되므로
 * 여기서 지워도 과대주장이 되지 않는다. (06 G1 판정법)
 */
function dropHeroMeta(body) {
  const out = [];
  let seenH1 = false;
  let done = false;
  for (const line of body.split('\n')) {
    if (done) { out.push(line); continue; }
    // 카드 머리 h1은 버린다 — 페이지 머리(case-head h1)가 이미 제목이다. CSS로 숨기면 HTML에 h1이 둘 남는다(외부 피드백 #5 · 10-12)
    if (!seenH1) { if (/^#\s/.test(line)) { seenH1 = true; continue; } out.push(line); continue; }
    if (/^##\s/.test(line)) { done = true; out.push(line); continue; }   // 첫 섹션부터는 손대지 않는다
    // 머리 인용(> **한 줄 요약**)도 뺀다 — 페이지 머리 kind·결과와 같은 말이다(외부 피드백 #5 · 👤 10-12 「빼줘」)
    if (/^>\s*\*\*/.test(line)) continue;
    if (/^>\s*`/.test(line)) {
      while (out.length && out[out.length - 1].trim() === '>') out.pop();  // 문단 가르려고 넣은 빈 인용줄
      done = true;
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

async function reset(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function syncProjects(figs = {}) {
  const dir = path.join(VAULT, '프로젝트');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  await reset(OUT_PROJECTS);

  let n = 0;
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), 'utf8');
    const parts = split(raw);
    if (!parts) continue;
    const slug = field(parts.fm, 'web_slug');
    if (!slug) continue;                     // web_slug 없는 카드는 쇼케이스 제외 (예: care-hub)

    const fm = {
      slug,
      order: Number(field(parts.fm, 'web_order') ?? 99),
      live: field(parts.fm, 'web_live') === 'true',
      spark: field(parts.fm, 'web_spark') === 'true',
      meta: field(parts.fm, 'web_meta') ?? '',
      kind: field(parts.fm, 'web_kind') ?? '',
      summary: field(parts.fm, 'web_summary') ?? '',
      result: field(parts.fm, 'web_result') ?? '',
      resultNote: field(parts.fm, 'web_result_note') ?? '',
      caveat: field(parts.fm, 'web_caveat') ?? '',
      name: field(parts.fm, 'web_name') ?? slug,
      links: JSON.parse(field(parts.fm, 'web_links') ?? '[]'),
      linksNote: field(parts.fm, 'web_links_note') ?? '',
      tags: list(parts.fm, '유형'),
    };

    const out =
      '---\n' +
      Object.entries(fm)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : typeof v === 'string' ? JSON.stringify(v) : v}`)
        .join('\n') +
      '\n---\n' + placeFigs(headLines(dropHeroMeta(publicize(parts.body))), figs[slug] ?? [], slug);

    await writeFile(path.join(OUT_PROJECTS, `${slug}.md`), out);
    n++;
  }
  return n;
}

/** 「내린 결정」 절의 `- **머리**: 설명` → 굵은 머리를 한 줄로 세우고 설명은 다음 줄(10-12 외부 피드백 3차 · 글자는 그대로, 쌍점만 뺀다) */
function headLines(body) {
  return body.replace(/(^## 내린 결정\n[\s\S]*?)(?=^## |(?![\s\S]))/m, (sec) => sec.replace(/^(- \*\*[^*\n]+\*\*):\s*/gm, '$1\\\n  '));
}

/**
 * 본문 그림(웹_그림.md · 2026-10-12) — `## {after}` 절의 끝(다음 `## ` 앞)에 그림 HTML을 꽂는다.
 * drop_code면 그 절의 첫 코드 상자를 뺀다(같은 내용의 글자 그림을 그림으로 대신). 제목을 못 찾으면 멈춘다
 */
function placeFigs(body, list, slug) {
  let lines = body.split('\n');
  for (const f of list) {
    const h = lines.findIndex((l) => l.trim() === `## ${f.after}`);
    if (h < 0) die(`웹_그림.md: ${slug} 본문에 「## ${f.after}」 절이 없습니다`);
    let end = lines.findIndex((l, i) => i > h && /^## /.test(l));
    if (end < 0) end = lines.length;
    if (f.drop_code) {
      const a = lines.findIndex((l, i) => i > h && i < end && /^```/.test(l));
      const b = a < 0 ? -1 : lines.findIndex((l, i) => i > a && /^```\s*$/.test(l));
      if (a < 0 || b < 0 || b >= end) die(`웹_그림.md: ${slug} 「${f.after}」 절에 코드 상자가 없습니다`);
      lines.splice(a, b - a + 1);
      end -= b - a + 1;
    }
    lines.splice(end, 0, '', figHtml(f), '');
  }
  return lines.join('\n');
}

async function syncFigs(stages) {
  const file = path.join(VAULT, '웹_그림.md');
  if (!existsSync(file)) return {};
  const { default: yaml } = await import('js-yaml');
  const figs = yaml.load(split(await readFile(file, 'utf8')).fm).figs ?? {};
  for (const list of Object.values(figs)) for (const f of list) {
    if (!f.from_case) continue;
    const c = stages.cases.find((x) => x.path === f.from_case) ?? die(`웹_그림.md: 사례 「${f.from_case}」가 없습니다`);
    if (c.fig.scope) f.scope = c.fig.scope;
    if (c.fig.tl) f.tl = c.fig.tl;
  }
  return figs;
}

async function syncCapabilities() {
  const dir = path.join(VAULT, '역량');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  await reset(OUT_CAPS);

  let n = 0;
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), 'utf8');
    const parts = split(raw);
    if (!parts || !/^base:/m.test(parts.fm)) continue;   // base_보관 처리된 구 카드는 제외

    const name = f.replace(/\.md$/, '');
    const fm = {
      name,
      order: Number(field(parts.fm, '순서') ?? 99),
      tags: list(parts.fm, '유형'),
      source: field(parts.fm, '근거') ?? '',
    };
    const out =
      '---\n' +
      Object.entries(fm)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : typeof v === 'string' ? JSON.stringify(v) : v}`)
        .join('\n') +
      '\n---\n' + publicize(parts.body);

    await writeFile(path.join(OUT_CAPS, `${fm.order}-${fm.name}.md`), out);
    n++;
  }
  return n;
}

async function syncProfile() {
  const file = path.join(VAULT, '웹_프로필.md');
  if (!existsSync(file)) die(`웹_프로필.md 가 없습니다: ${file}`);
  const parts = split(await readFile(file, 'utf8'));
  if (!parts) die('웹_프로필.md 의 frontmatter를 읽지 못했습니다.');

  const { default: yaml } = await import('js-yaml');
  const data = yaml.load(parts.fm);

  // 공개 지면 안전장치 — 연락처가 새어나가지 않게 한다 (04 §7)
  const leak = JSON.stringify(data).match(/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/);
  if (leak) die(`웹_프로필.md 에 휴대폰 번호로 보이는 값이 있습니다: ${leak[0]}\n  공개 웹에는 넣지 않습니다.`);

  await mkdir(OUT_DATA, { recursive: true });
  await writeFile(path.join(OUT_DATA, 'profile.json'), JSON.stringify(data, null, 2));
  return data;
}

/**
 * 단계 × 프로젝트 표 + 단계별 대표 사례 (04 §3-B · 2026-10-11).
 *
 * 칸 문장은 볼트의 지원서 원고 본문 마커에서 글자 그대로 읽는다 — 외부 세션 작문 + 사용자 채택본.
 * 웹_단계.md 에는 사실 줄·라벨만 있다. 원고를 한 벌로 두려고 복사본을 만들지 않는다.
 */
// 문단 나눔 — 원고 글자는 그대로 두고 웹_단계.md `split`에 적은 문장 머리 앞에서만 나눈다
function splitAt(paras, heads, where) {
  for (const h of heads) {
    // 문장 머리가 **강조** 표지로 열릴 수 있다(10-13 수정11) — 표지째 다음 문단으로 넘긴다
    const pos = (p) => { const a = p.indexOf(` ${h}`); return a >= 0 ? a : p.indexOf(` **${h}`); };
    const i = paras.findIndex((p) => pos(p) >= 0);
    if (i < 0) die(`${where}: 나눌 문장 머리 「${h}」를 원고에서 찾지 못했습니다`);
    const at = pos(paras[i]);
    paras.splice(i, 1, paras[i].slice(0, at).trim(), paras[i].slice(at).trim());
  }
  return paras;
}

async function syncStages() {
  const file = path.join(VAULT, '웹_단계.md');
  if (!existsSync(file)) die(`웹_단계.md 가 없습니다: ${file}`);
  const { default: yaml } = await import('js-yaml');
  const cfg = yaml.load(split(await readFile(file, 'utf8')).fm);

  const src = cfg.원천.map((r) => path.join(VAULT_ROOT, r)).find((f) => existsSync(f));
  if (!src) die(`단계 원천 원고를 찾을 수 없습니다:\n  ${cfg.원천.join('\n  ')}`);
  const raw = await readFile(src, 'utf8');
  const slots = {};
  for (const m of raw.matchAll(/<!-- 본문:시작 칸=(\S+)[^>]*-->\r?\n([\s\S]*?)\r?\n<!-- 본문:끝 -->/g)) slots[m[1]] = m[2].trim();
  const need = (k) => slots[k] || die(`원고에 「${k}」 칸이 비어 있습니다: ${src}`);

  const cell = {};
  for (const ln of need('단계표').split('\n')) {
    const parts = ln.split('|').map((x) => x.trim());
    if (parts.length !== 3) continue;
    const st = '①②③'.indexOf(parts[1]) + 1;
    if (!st) die(`단계표 줄의 단계 기호를 읽지 못했습니다: ${ln}`);
    cell[`${parts[0]}|${st}`] = parts[2];
  }
  const rows = cfg.rows.map((r) => ({ ...r, cells: [1, 2, 3].map((i) => cell[`${r.pj}|${i}`] ?? '') }));
  const cases = cfg.cases.map((c) => ({
    ...c,
    stageName: cfg.stages.find((s) => s.no === c.stage).name,
    path: cfg.stages.find((s) => s.no === c.stage).path,
    steps: ['문제', '해결', '결과'].map((k) => ({ label: k, paras: splitAt(need(`${c.prefix}_${k}`).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean), c.split?.[k] ?? [], `${c.prefix}_${k}`) })),
  }));
  const data = { title: cfg.title, stages: cfg.stages, rows, cases, source: path.relative(VAULT_ROOT, src) };

  // 공개 지면 금지 문자 — 마이리얼트립 build.py 금지 목록과 같다
  const text = JSON.stringify(data);
  const ban = { 'em dash': '—', 'en dash': '–', '등급 표기': /\[T[123]/, '근거 표기': '근거:', '내부 코드명 404': /(?<![\d.+-])404(?!\d)/ };
  for (const [name, pat] of Object.entries(ban)) {
    if (typeof pat === 'string' ? text.includes(pat) : pat.test(text)) die(`단계 화면에 공개 금지 표기(${name})가 있습니다`);
  }

  await mkdir(OUT_DATA, { recursive: true });
  await writeFile(path.join(OUT_DATA, 'stages.json'), JSON.stringify(data, null, 2));
  return data;
}

const profile = await syncProfile();
const st = await syncStages();
const figs = await syncFigs(st);
const p = await syncProjects(figs);
const c = await syncCapabilities();

console.log(`✓ 볼트 동기화 완료  프로필 1 · 프로젝트 ${p} · 역량 ${c} · 단계 사례 ${st.cases.length} · 본문 그림 ${Object.values(figs).flat().length}`);
console.log(`  단계 원천: ${st.source}`);
console.log(`  출처: ${VAULT}`);
if (p !== 5) console.warn(`  ⚠ 프로젝트가 ${p}건입니다. web_slug 필드를 확인하세요.`);
if (c !== 6) console.warn(`  ⚠ 역량이 ${c}건입니다. 역량 카드 frontmatter를 확인하세요.`);
