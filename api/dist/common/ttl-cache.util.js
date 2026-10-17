"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.filterKey = filterKey;
exports.cached = cached;
const _cache = new Map();
function cacheGet(key, ttlMs) {
    const e = _cache.get(key);
    if (e && Date.now() - e.at < ttlMs)
        return e.data;
    return undefined;
}
function cacheSet(key, data) {
    if (_cache.size > 1000)
        _cache.clear();
    _cache.set(key, { at: Date.now(), data });
}
function filterKey(prefix, filter) {
    return prefix + JSON.stringify(filter, (_k, v) => (v instanceof RegExp ? String(v) : v));
}
const _inflight = new Map();
async function cached(key, ttlMs, load) {
    const hit = cacheGet(key, ttlMs);
    if (hit !== undefined)
        return hit;
    const pending = _inflight.get(key);
    if (pending)
        return pending;
    const p = load()
        .then((data) => {
        cacheSet(key, data);
        return data;
    })
        .finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p;
}
//# sourceMappingURL=ttl-cache.util.js.map