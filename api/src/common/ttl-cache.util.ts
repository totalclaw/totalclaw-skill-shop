// 简单内存 TTL 缓存：列表/分类/来源聚合是热点又重，缓存后重复请求秒回。
const _cache = new Map<string, { at: number; data: unknown }>();

export function cacheGet<T>(key: string, ttlMs: number): T | undefined {
  const e = _cache.get(key);
  if (e && Date.now() - e.at < ttlMs) return e.data as T;
  return undefined;
}

export function cacheSet(key: string, data: unknown) {
  if (_cache.size > 1000) _cache.clear(); // 兜底防膨胀
  _cache.set(key, { at: Date.now(), data });
}

/** Mongo filter → 缓存 key。RegExp 直接 JSON.stringify 会变成 {}，不同搜索词会撞同一个 key。 */
export function filterKey(prefix: string, filter: unknown): string {
  return prefix + JSON.stringify(filter, (_k, v) => (v instanceof RegExp ? String(v) : v));
}

// 同 key 的冷查询合并成一次：缓存过期瞬间涌进来的 N 个请求共用一个 Promise，
// 而不是对 28 万集合并发跑 N 次同样的聚合。失败不缓存，下一个请求重试。
const _inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cacheGet<T>(key, ttlMs);
  if (hit !== undefined) return hit;
  const pending = _inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const p = load()
    .then((data) => {
      cacheSet(key, data);
      return data;
    })
    .finally(() => _inflight.delete(key));
  _inflight.set(key, p);
  return p;
}
