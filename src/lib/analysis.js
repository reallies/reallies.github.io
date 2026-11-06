import { getCollection } from 'astro:content';

/* 근거 수는 손으로 적지 않는다 — 본문 각주 중 F(수집 화면)·B(비즈니스 자료)만 센다. 절 참조 각주는 뺀다 */
const countEvidence = (body = '') => (body.match(/^\[\^(?:[CA]?F|B|R-[HW])[^\]]*\]:/gm) ?? []).length;

/** 서비스 분석 전체, 최신 분석일 순 */
export async function getAnalyses() {
  const entries = await getCollection('analysis');
  return entries
    .map((entry) => ({ entry, slug: entry.id, ...entry.data, evidence: countEvidence(entry.body) }))
    .sort((a, b) => b.analyzed.localeCompare(a.analyzed));
}
