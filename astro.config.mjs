// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeWeb } from './src/lib/nb.js';

// GitHub Pages 사용자 페이지(reallies.github.io)로 배포한다.
// 프로젝트 페이지로 옮길 경우에만 base: '/레포이름' 을 되살린다.
export default defineConfig({
  site: 'https://reallies.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // 본문 줄바꿈(숫자 어절 한 덩어리 · 가운뎃점) · 표 가로 스크롤 상자 — src/lib/nb.js
  markdown: { rehypePlugins: [rehypeWeb] },
  integrations: [
    // sitemap.xml + sitemap-index.xml 자동 생성.
    // 검색엔진과 AI 검색(GEO) 모두 색인 진입점으로 사용한다.
    sitemap({ changefreq: 'monthly', lastmod: new Date() }),
  ],
});
