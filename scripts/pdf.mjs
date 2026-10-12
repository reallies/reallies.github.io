/**
 * 빌드 산출물 → 포트폴리오 PDF.
 *
 * PDF는 손으로 만들지 않는다. dist/index.html 을 인쇄 CSS로 뽑아
 * public/hyunseok-oh-portfolio.pdf 에 덮어쓴다. (04 §6 규칙 3)
 *
 * 🔴 file:// 로 뽑지 않는다 — 웹폰트가 로드되지 않아 글자가 시스템 폰트로 대체된다
 *    (실측: file:// 280KB vs http:// 664KB). 로컬 서버를 띄우고 그 주소로 인쇄한다.
 *
 * 구성(👤 10-13): 홈 1쪽(요약·단계 표) → 대표 사례 3쪽(각 사례 페이지 · 웹 QR) → 홈 나머지(이력·자격).
 *   페이지마다 따로 인쇄해 pdf-lib 로 합친다. 링크는 인쇄 직전 HTML의 <a href="/…"> 를 SITE 주소로 바꾼다
 *   (안 바꾸면 PDF 링크가 http://localhost:8099/… 로 박힌다 — 10-13 실측 9개 중 8개).
 *
 * 실행: npm run pdf   (npm run build 뒤에) — `npm run build` 가 마지막에 자동으로 부른다
 *       CI(deploy.yml)는 `node scripts/pdf.mjs --dist` 로 dist/ 에도 써서 배포본 PDF가
 *       항상 그 빌드의 내용과 같게 한다. 사이트를 고치고 PDF를 잊는 일을 구조로 막는다(2026-10-01).
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, rm, stat, copyFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'public/hyunseok-oh-portfolio.pdf');
const TMP = path.join(ROOT, 'public/.portfolio.pdf.tmp');
const SITE = 'https://reallies.github.io';   // astro.config.mjs site 와 같게
const stages = JSON.parse(await readFile(path.join(ROOT, 'src/data/stages.json'), 'utf8'));
const CASES = stages.cases.map((c) => `/cases/${c.path}`);
const TO_DIST = process.argv.includes('--dist');
// macOS(로컬) · Linux(GitHub Actions ubuntu-latest 에 google-chrome 기본 설치) · CHROME_PATH 로 덮어쓰기
const CHROME = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
const PORT = 8099;

const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

if (!existsSync(DIST)) die('dist/ 가 없습니다. npm run build 를 먼저 돌리세요.');
if (!CHROME) die('Chrome을 찾을 수 없습니다. CHROME_PATH 로 경로를 지정하세요.');

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';   // /cases/planning → 디렉터리 index
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    let body = await readFile(file);
    if (file.endsWith('.html')) body = body.toString().replace(/(<a\b[^>]*\bhref=")\/(?!\/)/g, `$1${SITE}/`);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});

await new Promise((r) => server.listen(PORT, r));

const print = (url, out) => new Promise((resolve) => {
  spawn(CHROME, [
    '--headless', '--disable-gpu', '--no-pdf-header-footer',
    ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
    `--print-to-pdf=${out}`,
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=8000',
    `http://localhost:${PORT}${url}`,
  ], { stdio: 'ignore' }).on('close', resolve);
});
const parts = [];
for (const [i, url] of ['/', ...CASES].entries()) {
  const out = `${TMP}.${i}`;
  const code = await print(url, out);
  if (code !== 0) { server.close(); die(`Chrome이 ${code} 로 끝났습니다 (${url}).`); }
  const { size } = await stat(out);
  // 폰트가 빠지면 파일이 눈에 띄게 작아진다. 조용히 나쁜 PDF가 나가는 것을 막는다.
  if (i === 0 && size < 400_000) { server.close(); die(`홈 PDF가 ${Math.round(size / 1024)}KB 입니다. 웹폰트가 빠졌을 가능성이 큽니다.`); }
  parts.push(await PDFDocument.load(await readFile(out)));
  await rm(out);
}
server.close();
const [home, ...cases] = parts;
const doc = await PDFDocument.create();
const add = async (src, idx) => (await doc.copyPages(src, idx)).forEach((pg) => doc.addPage(pg));
await add(home, [0]);
for (const c of cases) await add(c, c.getPageIndices());
if (home.getPageCount() > 1) await add(home, home.getPageIndices().slice(1));
doc.setTitle('오현석 포트폴리오');
await writeFile(OUT, await doc.save());
const { size } = await stat(OUT);
console.log(`✓ PDF 생성  ${path.relative(ROOT, OUT)}  ${Math.round(size / 1024)}KB · ${doc.getPageCount()}쪽 (홈 1 → 사례 ${cases.map((c) => c.getPageCount()).join('·')} → 홈 ${home.getPageCount() - 1})`);
if (TO_DIST) {
  await copyFile(OUT, path.join(DIST, path.basename(OUT)));
  console.log(`✓ dist/ 에도 반영  ${path.basename(OUT)}`);
}
