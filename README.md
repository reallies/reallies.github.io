# 오현석 웹 포트폴리오

이력서·포트폴리오 정적 사이트. Astro + GitHub Pages.

## 단일 소스 원칙 ★

**원본은 Obsidian 볼트다. 이 저장소는 빌드 산출물이다.**
사이트에서 문구를 직접 고치지 않는다 — 볼트를 고치고 다시 빌드한다.
(근거: `_커리어/04_웹포트폴리오_전략.md` §6)

| 화면 | 원본 파일 |
| --- | --- |
| 히어로 · 이력 · 자격 · 학력 | `ohs/Notion/오현석/웹_프로필.md` (frontmatter) |
| 프로젝트 5 (목록 문구) | `ohs/Notion/오현석/프로젝트/*.md` 의 `web_*` 필드 |
| 프로젝트 상세 본문 | 같은 파일의 마크다운 본문 |
| 역량 6 | `ohs/Notion/오현석/역량/*.md` |

`src/content/` 와 `src/data/profile.json` 은 **동기화 산출물**이라 git에서 제외돼 있다.

## 명령

```bash
npm install
npm run dev      # sync 후 개발 서버
npm run build    # sync 후 정적 빌드 → dist/
npm run sync     # 볼트 → src/ 동기화만
```

볼트 위치가 다르면 `VAULT_DIR=/경로 npm run sync`.

## 쇼케이스에서 프로젝트 넣고 빼기

프로젝트 카드 frontmatter의 `web_slug` **유무**로 결정된다.
- 빼기: `web_slug` 줄을 지운다
- 넣기: `web_slug` / `web_order` / `web_meta` / `web_kind` / `web_summary` / `web_result` 를 넣는다

care-hub는 현재 `web_slug` 가 없어서 제외 상태다. 임베디드·IoT 직무 지원 시 되살린다
(`_커리어/포지셔닝_가이드.md` §7).

## 배포

https://reallies.github.io — `main` 브랜치 푸시 → GitHub Actions → Pages.

**CI에는 볼트가 없다.** 그래서 동기화 산출물(`src/content/`, `src/data/profile.json`)을 **커밋해 둔다.**
볼트를 고쳤으면 반드시 `npm run sync` 를 돌리고 그 결과를 함께 커밋한다.

```bash
npm run sync && git add -A && git commit -m "내용 갱신" && git push
```

## 남은 작업

- [x] 이력서 PDF — `public/오현석_이력서.pdf` (3p). 갱신은 아래 명령으로 다시 뽑는다

  ```bash
  npm run build && npx astro preview --port 4322 &
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
    --no-pdf-header-footer --run-all-compositor-stages-before-draw --virtual-time-budget=8000 \
    --print-to-pdf="public/오현석_이력서.pdf" "http://localhost:4322/"
  npm run build   # PDF를 dist에 포함시키려면 한 번 더
  ```
- [ ] `og:image` 이미지
- [ ] 커스텀 도메인 (선택)
