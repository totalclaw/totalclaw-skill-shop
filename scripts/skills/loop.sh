#!/usr/bin/env bash
cd "$(dirname "$0")/../.."
for i in $(seq 1 500); do
  node scripts/skills/generate.js --roles=120 --perRole=8 --concurrency=8 >> data/logs/gen-skills.log 2>&1
  # 没有待处理岗位则歇一会等角色增长
  sleep 8
done
