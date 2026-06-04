"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMarkdownAttachment = sendMarkdownAttachment;
function sendMarkdownAttachment(res, filename, content) {
    const asciiName = filename.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '');
    const utf8Name = encodeURIComponent(filename);
    res.set({
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
        'Cache-Control': 'no-store',
    });
    res.send(content);
}
//# sourceMappingURL=download.util.js.map