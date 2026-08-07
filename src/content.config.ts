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
    title: z.string(),
    tags: z.array(z.string()).default([]),
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

export const collections = { projects, capabilities };
