export declare function cacheGet<T>(key: string, ttlMs: number): T | undefined;
export declare function cacheSet(key: string, data: unknown): void;
export declare function filterKey(prefix: string, filter: unknown): string;
export declare function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T>;
