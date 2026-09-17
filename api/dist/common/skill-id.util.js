"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillIdCandidates = skillIdCandidates;
function skillIdCandidates(raw) {
    const id = String(raw || '').trim();
    if (!id)
        return [];
    const restored = id.replace(/~/g, '/');
    return restored === id ? [id] : [id, restored];
}
//# sourceMappingURL=skill-id.util.js.map