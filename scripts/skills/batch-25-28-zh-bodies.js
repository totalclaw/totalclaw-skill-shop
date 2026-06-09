'use strict';

const part1 = require('./batch-25-28-zh-bodies-part1');
const part2 = require('./batch-25-28-zh-bodies-part2');
const part3 = require('./batch-25-28-zh-bodies-part3');
const fixes = require('./batch-25-28-zh-bodies-fixes');
const fixes2 = require('./batch-25-28-zh-bodies-fixes2');
const { applyBulkZh } = require('./batch-25-28-zh-bulk-translate');

const merged = { ...part1, ...part2, ...part3, ...fixes2, ...fixes };
for (const [id, body] of Object.entries(merged)) {
  if (!fixes[id] && !fixes2[id]) merged[id] = applyBulkZh(body);
}
module.exports = merged;
