import { createHash } from 'crypto';

// 用 4 个零宽字符给指纹做 base4 编码，肉眼/复制粘贴都看不见，但能从泄露文本里还原 → 溯源到买家。
const ZW = ['​', '‌', '‍', '⁠']; // ZWSP / ZWNJ / ZWJ / WJ
const ZW_SET = new Set(ZW);

/** 取买家+skill 的短指纹（hex，便于落库/对账时比对）。 */
export function fingerprint(userId: string, skillId: string): string {
  return createHash('sha256').update(`${userId}::${skillId}`).digest('hex').slice(0, 12);
}

/** 把 hex 指纹编码成零宽字符串（每个 hex 字符 = 2 个零宽字符，base4）。 */
function toZeroWidth(hex: string): string {
  let out = '';
  for (const ch of hex) {
    const v = parseInt(ch, 16); // 0..15
    out += ZW[(v >> 2) & 3] + ZW[v & 3];
  }
  return out;
}

/** 从含零宽水印的文本里还原指纹 hex（用于溯源；非水印字符忽略）。 */
export function extractFingerprint(text: string): string {
  const zw = Array.from(text).filter((c) => ZW_SET.has(c));
  let hex = '';
  for (let i = 0; i + 1 < zw.length; i += 2) {
    const hi = ZW.indexOf(zw[i]);
    const lo = ZW.indexOf(zw[i + 1]);
    if (hi < 0 || lo < 0) break;
    hex += ((hi << 2) | lo).toString(16);
  }
  return hex;
}

/**
 * 给收费/闭源 skill 正文注入水印：
 *   1) 顶部可见的授权声明（含买家指纹，肉眼可见的威慑）；
 *   2) 正文里嵌入零宽字符指纹（隐形，复制后仍在，用于泄露溯源）。
 */
export function applyWatermark(
  content: string,
  opts: { userId: string; username?: string; skillId: string },
): string {
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
  // 零宽指纹随文埋点：开头一处 + 每个换行后补一个零宽字符片段，去重后仍可还原
  const body = content.replace(/\n/g, () => '\n' + ZW[fp.charCodeAt(0) % 4]);
  return header + zw + body + zw;
}
