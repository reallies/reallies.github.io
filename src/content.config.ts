import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    live: z.boolean().default(false),
    spark: z.boolean().default(false),
    meta: z.string(),
    kind: z.string(),
    summary: z.string(),
    result: z.string(),
    resultNote: z.string().default(''),
    caveat: z.string().default(''),
    name: z.string(),
    tags: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    linksNote: z.string().default(''),
  }),
});

const analysis = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/analysis' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    service: z.string(),                                // 목록에 쓰는 서비스명
    problem: z.string(),                                // 고른 문제 한 줄
    analyzed: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/),  // 분석일 — 최신순 정렬에도 쓴다
  }),
});

const capabilities = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/capabilities' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
    source: z.string().default(''),
  }),
});

export const collections = { analysis, projects, capabilities };
