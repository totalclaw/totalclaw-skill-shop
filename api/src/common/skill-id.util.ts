/**
 * skillId 在 URL 路径段里的编码约定 —— 服务端**唯一**的还原入口。
 *
 * skillId 的规范形态是 `${source}:${owner}/${slug}`（见 skill.schema.ts），
 * 里面的 `/` 直接放进路径段会被当成路径分隔符，所以客户端
 * （totalclaw-agent 的 `shop_url_segment()`）把 `/` 编成 `~` 再
 * percent-encode。约定写在 agent 仓
 * `docs/skill-shop/encrypted-install-protocol.md` §2。
 *
 * 还原**不能**无脑 `~` → `/`：developer 渠道签发的 skillId 本身就带字面
 * `~`（developer.service.ts 的 `developer:<id>~<slug>`）。无脑替换会把
 * 它改成 `developer:<id>/<slug>`，一条本来能精确命中的记录反而查不到。
 *
 * 所以按「原样 → 把 `~` 还原成 `/`」的顺序给出候选，调用方依次试，先命中
 * 的算数。两种写法都能走通，也就不会因为只改一侧而产生新的不一致。
 */
export function skillIdCandidates(raw: string): string[] {
  const id = String(raw || '').trim();
  if (!id) return [];
  const restored = id.replace(/~/g, '/');
  return restored === id ? [id] : [id, restored];
}
