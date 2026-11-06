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

const row = z.object({ k: z.string(), v: z.string() });

const analysis = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/analysis' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    format: z.enum(['diagnosis', 'principles']).default('diagnosis'),
    pdf: z.boolean().default(true),
    application: z.object({ note: z.string(), shots: z.array(z.object({ src: z.string(), alt: z.string() })) }).optional(),
    service: z.string(),                                // 목록에 쓰는 서비스명
    problem: z.string(),                                // 고른 문제 한 줄
    analyzed: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/),  // 분석일 — 최신순 정렬에도 쓴다
    brief: z.object({                                   // 처음 보는 사람이 읽는 요약. 본문 전체는 /full 에 둔다
      glance: z.array(row),
      context: z.array(row),
      shot: z.object({ src: z.string(), w: z.number(), h: z.number(), alt: z.string(), caption: z.string() }),
      problem: z.array(z.string()),
      candidates: z.array(z.object({ name: z.string(), weak: z.string(), picked: z.boolean().default(false) })),
      why: z.string(),
      fixes: z.array(z.object({ title: z.string(), body: z.string(), effort: z.string() })),
      test: z.array(row),
      risks: z.array(z.string()),
      limits: z.array(z.string()),
    }),
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
