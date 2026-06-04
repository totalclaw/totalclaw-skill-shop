#!/usr/bin/env bash
# 生成进度快照：角色（穷尽岗位池 ~28274）、我生成的闭源技能（目标 40000，不含聚合开源）、进程、失败
cd "$(dirname "$0")/.."
node -e '
const {MongoClient}=require("mongodb");
(async()=>{const c=new MongoClient(process.env.MONGODB_URI||"mongodb://127.0.0.1:27018/totalclaw");await c.connect();const db=c.db("totalclaw");
const r=await db.collection("skills").countDocuments({kind:"role"});
const cs=await db.collection("skills").countDocuments({kind:{$ne:"role"},closedSource:true});
const all=await db.collection("skills").countDocuments({kind:{$ne:"role"}});
console.log(`角色: ${r} / ~28274（穷尽岗位池）`);
console.log(`我生成的闭源技能: ${cs} / 40000   （技能总数含聚合开源 ${all}）`);
await c.close();})().catch(()=>console.log("DB 不可达"))'
echo "时间: $(date '+%H:%M:%S')"
pgrep -f 'roles/generate.js' >/dev/null && echo "角色生成: 运行中" || echo "角色生成: 已停止"
pgrep -f 'skills/generate.js' >/dev/null && echo "技能生成: 运行中" || echo "技能生成: 已停止"
pgrep -f 'fleet-watchdog' >/dev/null && echo "看门狗: 运行中" || echo "看门狗: 已停止"
echo "失败累计 角色:$( [ -f data/roles/failed-roles.jsonl ] && wc -l < data/roles/failed-roles.jsonl || echo 0 ) 技能:$( [ -f data/skills/failed-skills.jsonl ] && wc -l < data/skills/failed-skills.jsonl || echo 0 )"
