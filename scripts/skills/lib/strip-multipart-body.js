'use strict';

/** Strip multipart upload wrapper around SKILL.md content if present. */
function stripMultipartBody(body) {
  if (!body || !body.includes('Content-Disposition: form-data')) return body;
  const fm = body.match(/---\n[\s\S]*?\n---\n([\s\S]*?)(?:\r?\n-{10,}[\s\S]*--)?$/);
  if (fm) return fm[1].trim();
  const inner = body.match(/filename="SKILL\.md"[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n-{10,}|$)/);
  return inner ? inner[1].trim() : body;
}

module.exports = { stripMultipartBody };
