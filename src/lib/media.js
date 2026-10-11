/* 링크 → 영상/바깥 링크 나누기. 영상은 페이지 안 플레이어(<dialog>)로 연다 — 웹에서만 되는 「실물 보기」 */
export function ytId(url) {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export function splitLinks(links = []) {
  const videos = [];
  const others = [];
  for (const l of links) {
    const id = ytId(l.url);
    if (id) videos.push({ ...l, id });
    else others.push(l);
  }
  return { videos, others };
}
