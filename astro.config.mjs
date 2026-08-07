// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 배포 설정.
//  · 사용자 페이지(reallies.github.io)로 갈 경우: base 제거
//  · 프로젝트 페이지(reallies.github.io/portfolio)로 갈 경우: base 유지
export default defineConfig({
  site: 'https://reallies.github.io',
  base: '/portfolio',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
