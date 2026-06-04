import { Response } from 'express';

/** 以附件形式下发文本文件（Markdown），文件名兼容非 ASCII（RFC 5987）。 */
export function sendMarkdownAttachment(
  res: Response,
  filename: string,
  content: string,
) {
  const asciiName = filename.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '');
  const utf8Name = encodeURIComponent(filename);
  res.set({
    'Content-Type': 'text/markdown; charset=utf-8',
    'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
    'Cache-Control': 'no-store',
  });
  res.send(content);
}
