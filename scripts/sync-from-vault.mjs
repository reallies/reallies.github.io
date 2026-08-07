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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.VAULT_DIR
  ?? path.resolve(process.env.HOME, 'Documents/Obsidian/ohs/Notion/오현석');

const OUT_PROJECTS = path.join(ROOT, 'src/content/projects');
const OUT_CAPS = path.join(ROOT, 'src/content/capabilities');
const OUT_DATA = path.join(ROOT, 'src/data');

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

async function reset(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function syncProjects() {
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
      title: (parts.body.match(/^#\s+(.*)$/m)?.[1] ?? slug)
        .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim(),
      tags: list(parts.fm, '유형'),
    };

    const out =
      '---\n' +
      Object.entries(fm)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : typeof v === 'string' ? JSON.stringify(v) : v}`)
        .join('\n') +
      '\n---\n' + parts.body;

    await writeFile(path.join(OUT_PROJECTS, `${slug}.md`), out);
    n++;
  }
  return n;
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
      '\n---\n' + parts.body;

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

const profile = await syncProfile();
const p = await syncProjects();
const c = await syncCapabilities();

console.log(`✓ 볼트 동기화 완료  프로필 1 · 프로젝트 ${p} · 역량 ${c}`);
console.log(`  출처: ${VAULT}`);
if (p !== 5) console.warn(`  ⚠ 프로젝트가 ${p}건입니다. web_slug 필드를 확인하세요.`);
if (c !== 6) console.warn(`  ⚠ 역량이 ${c}건입니다. 역량 카드 frontmatter를 확인하세요.`);
