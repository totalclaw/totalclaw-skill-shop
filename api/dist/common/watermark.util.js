"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fingerprint = fingerprint;
exports.extractFingerprint = extractFingerprint;
exports.applyWatermark = applyWatermark;
const crypto_1 = require("crypto");
const ZW = ['​', '‌', '‍', '⁠'];
const ZW_SET = new Set(ZW);
function fingerprint(userId, skillId) {
    return (0, crypto_1.createHash)('sha256').update(`${userId}::${skillId}`).digest('hex').slice(0, 12);
}
function toZeroWidth(hex) {
    let out = '';
    for (const ch of hex) {
        const v = parseInt(ch, 16);
        out += ZW[(v >> 2) & 3] + ZW[v & 3];
    }
    return out;
}
function extractFingerprint(text) {
    const zw = Array.from(text).filter((c) => ZW_SET.has(c));
    let hex = '';
    for (let i = 0; i + 1 < zw.length; i += 2) {
        const hi = ZW.indexOf(zw[i]);
        const lo = ZW.indexOf(zw[i + 1]);
        if (hi < 0 || lo < 0)
            break;
        hex += ((hi << 2) | lo).toString(16);
    }
    return hex;
}
function applyWatermark(content, opts) {
    const fp = fingerprint(opts.userId, opts.skillId);
    const who = opts.username ? `${opts.username}（#${opts.userId}）` : `#${opts.userId}`;
    const header = [
        '<!-- ───────────────────────────────────────────────',
        `  © 泰途AI Skill 市场 · 已授权给 ${who}`,
        `  授权指纹 ${fp} · 仅限本人使用，禁止转载 / 转售 / 二次分发`,
        '  本副本含隐形水印，泄露可溯源到购买者并依条款追责。',
        '─────────────────────────────────────────────── -->',
        '',
    ].join('\n');
    const zw = toZeroWidth(fp);
    const body = content.replace(/\n/g, () => '\n' + ZW[fp.charCodeAt(0) % 4]);
    return header + zw + body + zw;
}
//# sourceMappingURL=watermark.util.js.map