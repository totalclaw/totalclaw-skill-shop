export declare function fingerprint(userId: string, skillId: string): string;
export declare function extractFingerprint(text: string): string;
export declare function applyWatermark(content: string, opts: {
    userId: string;
    username?: string;
    skillId: string;
}): string;
