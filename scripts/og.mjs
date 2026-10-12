/**
 * og.png(링크 미리보기 카드) 생성 — scripts/og-template.html 의 {{…}} 를 채워 Chrome 으로 찍는다.
 * 문구 원천: src/data/profile.json(sync 산출) · src/content/projects/checkmate.md 의 result.
 * npm run build 가 sync 직후 돌린다(로컬 전용 — CI 러너에는 볼트도 한글 글꼴도 보장되지 않는다).
 */
import { readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].find((p) => p && existsSync(p));
const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };
if (!CHROME) die('Chrome을 찾을 수 없습니다. CHROME_PATH 로 경로를 지정하세요.');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const profile = JSON.parse(await readFile(path.join(ROOT, 'src/data/profile.json'), 'utf8'));
const cm = await readFile(path.join(ROOT, 'src/content/projects/checkmate.md'), 'utf8');
const result = cm.match(/^result:\s*"(.*)"/m)?.[1] ?? die('checkmate.md 에 result 줄이 없습니다.');
const pct = result.match(/\d+(?:\.\d+)?%/g) ?? [];
if (pct.length < 2) die(`checkmate.md result 에서 수치 두 개를 못 찾았습니다: ${result}`);
const label = result.match(/(탐색 비율|전환율)/)?.[1] ?? die(`checkmate.md result 에서 지표 이름을 못 찾았습니다: ${result}`);

const fill = {
  eyebrow: profile.eyebrow, url: new URL('https://reallies.github.io').host,
  name: profile.name, latin: profile.name_latin, thesis: profile.thesis,
  facts: profile.facts.map((f) => `<div class="fact"><div class="k">${esc(f.k)}</div><div class="v">${esc(f.v)}</div></div>`).join(''),
  spark: `${pct[0]} → ${pct[1]}`, sparkLabel: `CheckMate ${label}`,
};
let html = await readFile(path.join(ROOT, 'scripts/og-template.html'), 'utf8');
html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in fill ? (k === 'facts' ? fill[k] : esc(fill[k])) : die(`템플릿 자리 {{${k}}} 를 채울 값이 없습니다.`)));
const tmp = path.join(ROOT, 'scripts/.og.tmp.html');
await writeFile(tmp, html);
const code = await new Promise((r) => spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--window-size=1200,630',
  `--screenshot=${path.join(ROOT, 'public/og.png')}`, '--run-all-compositor-stages-before-draw', '--virtual-time-budget=4000', tmp],
  { stdio: 'ignore' }).on('exit', r));
await rm(tmp, { force: true });
if (code !== 0) die(`Chrome 스크린샷 실패 (exit ${code})`);
console.log(`✓ og.png 생성  ${fill.thesis.slice(0, 24)}… · ${fill.spark} ${fill.sparkLabel}`);
