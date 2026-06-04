#!/usr/bin/env bash
cd "$(dirname "$0")/.."
counts() { node -e '
const {MongoClient}=require("mongodb");
(async()=>{const c=new MongoClient("mongodb://127.0.0.1:27018/totalclaw");await c.connect();const db=c.db("totalclaw");
const r=await db.collection("skills").countDocuments({kind:"role"});
const s=await db.collection("skills").countDocuments({kind:{$ne:"role"}});
console.log(r+" "+s);await c.close();})().catch(()=>console.log("0 0"))'; }
for i in $(seq 1 90); do   # 最多 ~45*2=90 分钟
  read r s <<< "$(counts)"
  loops=$(pgrep -f fleet.sh | wc -l | tr -d ' ')
  if { [ "${r:-0}" -ge 10000 ] && [ "${s:-0}" -ge 40000 ]; } || [ "$loops" -eq 0 ]; then
    echo "DONE 角色=$r 技能=$s loops=$loops"
    exit 0
  fi
  sleep 30
done
echo "TIMEOUT 角色=$r 技能=$s"
