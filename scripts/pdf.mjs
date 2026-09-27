/**
 * 빌드 산출물 → 포트폴리오 PDF.
 *
 * PDF는 손으로 만들지 않는다. dist/index.html 을 인쇄 CSS로 뽑아
 * public/hyunseok-oh-portfolio.pdf 에 덮어쓴다. (04 §6 규칙 3)
 *
 * 🔴 file:// 로 뽑지 않는다 — 웹폰트가 로드되지 않아 글자가 시스템 폰트로 대체된다
 *    (실측: file:// 280KB vs http:// 664KB). 로컬 서버를 띄우고 그 주소로 인쇄한다.
 *
 * 실행: npm run pdf   (npm run build 뒤에)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'public/hyunseok-oh-portfolio.pdf');
const TMP = path.join(ROOT, 'public/.portfolio.pdf.tmp');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8099;

const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

if (!existsSync(DIST)) die('dist/ 가 없습니다. npm run build 를 먼저 돌리세요.');
if (!existsSync(CHROME)) die(`Chrome을 찾을 수 없습니다: ${CHROME}`);

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});

await new Promise((r) => server.listen(PORT, r));

const code = await new Promise((resolve) => {
  spawn(CHROME, [
    '--headless', '--disable-gpu', '--no-pdf-header-footer',
    `--print-to-pdf=${TMP}`,
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=8000',
    `http://localhost:${PORT}/`,
  ], { stdio: 'ignore' }).on('close', resolve);
});

server.close();
if (code !== 0) die(`Chrome이 ${code} 로 끝났습니다.`);

// 폰트가 빠지면 파일이 눈에 띄게 작아진다. 조용히 나쁜 PDF가 나가는 것을 막는다.
const { size } = await stat(TMP);
if (size < 400_000) die(`PDF가 ${Math.round(size / 1024)}KB 입니다. 웹폰트가 빠졌을 가능성이 큽니다.`);

await rename(TMP, OUT);
console.log(`✓ PDF 생성  ${path.relative(ROOT, OUT)}  ${Math.round(size / 1024)}KB`);
