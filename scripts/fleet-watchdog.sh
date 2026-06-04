#!/usr/bin/env bash
# 看门狗（修订 v4）：
#   角色目标 = 穷尽岗位池（~28,274）。停滞检测：角色数连续 N 次轮询不增长 → 池已穷尽。
#   技能目标 = 给【每一个】角色都生成配套技能。40,000 只是底线，绝不在此停。
#     技能侧停止条件 = 岗位池已穷尽(roles_done) 且 没有任何 undone 角色（每个角色都已 skillsDone）。
#   ★ 欠费熔断：若近一轮日志新增大量 `Insufficient Balance`（DeepSeek 欠费）→ 立即停舰队、
#     写续跑 TODO 到项目（TODO-RESUME.md + ceshi/shop/）、退出。不再空转。
# 用法: nohup bash scripts/fleet-watchdog.sh > data/logs/watchdog.log 2>&1 &
cd "$(dirname "$0")/.."
ROLE_STALL_POLLS=${ROLE_STALL_POLLS:-3}
POLL=${POLL:-120}
BAL_THRESHOLD=${BAL_THRESHOLD:-30}   # 单轮新增余额错误超过此数 → 判定欠费熔断
LOGS="data/logs/gen-roles.log data/logs/gen-skills.log"

bal_count() { grep -ch 'Insufficient Balance' $LOGS 2>/dev/null | awk '{s+=$1} END{print s+0}'; }

counts() {
  node -e '
  const {MongoClient}=require("mongodb");
  (async()=>{const c=new MongoClient("mongodb://127.0.0.1:27018/totalclaw");await c.connect();const db=c.db("totalclaw");
  const r=await db.collection("skills").countDocuments({kind:"role"});
  const cs=await db.collection("skills").countDocuments({kind:{$ne:"role"},closedSource:true});
  const undone=await db.collection("skills").countDocuments({kind:"role",skillsDone:{$ne:true}});
  console.log(r+" "+cs+" "+undone);await c.close();})().catch(()=>console.log("0 0 0"))'
}

write_todo() {
  local reason="$1"
  read r cs undone <<< "$(counts)"
  local ts; ts="$(date '+%Y-%m-%d %H:%M:%S')"
  for f in "TODO-RESUME.md" "/Users/mac02/Desktop/work/new-work/ceshi/shop/TODO-resume.md"; do
    cat > "$f" <<EOF
# 续跑 TODO：角色库 + 闭源技能库（任务因「${reason}」中止）

> 中止时间：${ts}

## 中止时进度
- 角色：${r} / ~28,274（穷尽岗位池）
- 我生成的闭源技能：${cs}（目标：给每个角色都配套，40,000 仅为底线）
- 未配技能的角色：${undone}（这些角色还需生成配套技能）

## 中止原因
$reason —— DeepSeek 账户欠费，已自动停掉整个生成舰队，未空转。

## 恢复步骤
1. 给 DeepSeek 账户充值（key 在 \`api/.env\` 的 \`DEEPSEEK_API_KEY\`），或换有余额的 key。
2. 确认 mongod 在跑：\`lsof -iTCP:27018 -sTCP:LISTEN\`；没有则
   \`nohup /Users/mac02/homebrew/bin/mongod --dbpath data/mongo --port 27018 --bind_ip 127.0.0.1 >> data/logs/mongo.log 2>&1 &\`
3. 重启舰队 + 看门狗：
   \`\`\`
   bash scripts/fleet.sh start
   nohup bash scripts/fleet-watchdog.sh > data/logs/watchdog.log 2>&1 &
   \`\`\`
4. 断点续跑：已生成的角色/技能按 skillId 自动跳过；未配技能的角色会被技能侧重新领取。

## 完成判据（看门狗自动收尾）
- 角色池穷尽（角色数连续 3 次轮询不增长）→ 停角色循环。
- 池穷尽 且 未配技能角色数==0 → 停技能循环。
- 两者都停 → 停舰队。
- 进度：\`bash scripts/status.sh\`
EOF
  done
  echo "$(date '+%H:%M:%S') 已写续跑 TODO：TODO-RESUME.md 与 ceshi/shop/TODO-resume.md"
}

prev_r=-1; stall=0; roles_done=0; skills_done=0
base_bal=$(bal_count); prev_bal=$base_bal
echo "$(date '+%H:%M:%S') 看门狗 v4 启动（欠费基线 $base_bal，单轮阈值 $BAL_THRESHOLD）"
while true; do
  read r cs undone <<< "$(counts)"
  cur_bal=$(bal_count); d_bal=$((cur_bal - prev_bal)); prev_bal=$cur_bal
  echo "$(date '+%H:%M:%S') 角色 ${r}  闭源技能 ${cs}  未配技能角色 ${undone}  本轮余额错误+${d_bal}  stall=${stall} roles_done=${roles_done}"

  # ★ 欠费熔断
  if [ "${d_bal:-0}" -ge "$BAL_THRESHOLD" ]; then
    echo "$(date '+%H:%M:%S') 检测到 DeepSeek 欠费（本轮新增余额错误 ${d_bal} ≥ ${BAL_THRESHOLD}）→ 直接结束任务"
    bash scripts/fleet.sh stop
    write_todo "DeepSeek 欠费（Insufficient Balance）"
    echo "$(date '+%H:%M:%S') 任务已结束（欠费熔断）。充值后按 TODO-RESUME.md 续跑。"
    exit 2
  fi

  # 角色：停滞检测
  if [ "$roles_done" -eq 0 ]; then
    if [ "${r:-0}" -le "${prev_r}" ]; then stall=$((stall+1)); else stall=0; fi
    prev_r=${r:-0}
    if [ "$stall" -ge "$ROLE_STALL_POLLS" ]; then
      echo "$(date '+%H:%M:%S') 岗位池已穷尽 → 停角色循环"
      pkill -f 'roles/generate.js' 2>/dev/null
      if [ -f data/fleet/pids ]; then while IFS=: read -r k p; do [ "$k" = role ] && kill "$p" 2>/dev/null; done < data/fleet/pids; fi
      roles_done=1
    fi
  fi

  # 技能：池穷尽且全角色配齐才停
  if [ "$skills_done" -eq 0 ] && [ "$roles_done" -eq 1 ] && [ "${undone:-1}" -eq 0 ]; then
    echo "$(date '+%H:%M:%S') 全部角色都已配齐技能 → 停技能循环"
    pkill -f 'skills/generate.js' 2>/dev/null
    if [ -f data/fleet/pids ]; then while IFS=: read -r k p; do [ "$k" = skill ] && kill "$p" 2>/dev/null; done < data/fleet/pids; fi
    skills_done=1
  fi

  if [ "$roles_done" -eq 1 ] && [ "$skills_done" -eq 1 ]; then
    echo "$(date '+%H:%M:%S') 角色池穷尽 + 全角色配齐技能 → 收尾停舰队"
    bash scripts/fleet.sh stop
    write_todo "已完成（正常收尾）"
    break
  fi
  sleep "$POLL"
done
