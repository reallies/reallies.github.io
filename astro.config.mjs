// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 사용자 페이지(reallies.github.io)로 배포한다.
// 프로젝트 페이지로 옮길 경우에만 base: '/레포이름' 을 되살린다.
export default defineConfig({
  site: 'https://reallies.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
