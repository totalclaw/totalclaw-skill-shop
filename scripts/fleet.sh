#!/usr/bin/env bash
# 并行生成「舰队」：启动 N 个角色 worker 循环 + M 个技能 worker 循环。
# 每个循环是一个 node 进程，内部再用 --concurrency 做异步并发。
# 真正的并发数 ≈ (ROLE_LOOPS*ROLE_CONC) + (SKILL_LOOPS*SKILL_CONC)。
# DeepSeek 单 key 的有效吞吐通常在数百并发饱和，超过只会增加延迟。
#
# 用法:
#   bash scripts/fleet.sh start   # 启动舰队
#   bash scripts/fleet.sh stop    # 停止全部
#   bash scripts/fleet.sh ps      # 看进程
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
LOG="$ROOT/data/logs"
mkdir -p "$LOG" "$ROOT/data/fleet"
PIDFILE="$ROOT/data/fleet/pids"

# 加载 DeepSeek key / Mongo URI（generate.js 直接读 process.env，不加载 dotenv）
if [ -f api/.env ]; then set -a; . ./api/.env; set +a; fi

# 提高文件描述符上限（每个并发 HTTPS 连接占一个 fd）
ulimit -n 16384 2>/dev/null || ulimit -n 8192 2>/dev/null || true

ROLE_LOOPS=${ROLE_LOOPS:-6}
ROLE_CONC=${ROLE_CONC:-18}
ROLE_LIMIT=${ROLE_LIMIT:-300}
SKILL_LOOPS=${SKILL_LOOPS:-12}
SKILL_CONC=${SKILL_CONC:-18}
SKILL_ROLES=${SKILL_ROLES:-120}
SKILL_PER=${SKILL_PER:-8}

role_loop() {
  local id=$1
  while true; do
    node scripts/roles/generate.js --limit="$ROLE_LIMIT" --concurrency="$ROLE_CONC" >> "$LOG/gen-roles.log" 2>&1
    sleep 3
  done
}

skill_loop() {
  local id=$1
  while true; do
    node scripts/skills/generate.js --roles="$SKILL_ROLES" --perRole="$SKILL_PER" --concurrency="$SKILL_CONC" >> "$LOG/gen-skills.log" 2>&1
    sleep 5
  done
}

case "${1:-start}" in
  start)
    : > "$PIDFILE"
    echo "[fleet] 启动 角色循环×$ROLE_LOOPS (conc=$ROLE_CONC) + 技能循环×$SKILL_LOOPS (conc=$SKILL_CONC)"
    echo "[fleet] 目标有效并发 ≈ $((ROLE_LOOPS*ROLE_CONC + SKILL_LOOPS*SKILL_CONC))，ulimit -n=$(ulimit -n)"
    for i in $(seq 1 "$ROLE_LOOPS"); do role_loop "$i" & echo "role:$!" >> "$PIDFILE"; done
    for i in $(seq 1 "$SKILL_LOOPS"); do skill_loop "$i" & echo "skill:$!" >> "$PIDFILE"; done
    echo "[fleet] 已启动，pid 记录在 $PIDFILE"
    ;;
  stop)
    echo "[fleet] 停止舰队"
    pkill -f 'roles/generate.js' 2>/dev/null
    pkill -f 'skills/generate.js' 2>/dev/null
    pkill -f 'fleet.sh' 2>/dev/null
    if [ -f "$PIDFILE" ]; then while IFS=: read -r k p; do kill "$p" 2>/dev/null; done < "$PIDFILE"; fi
    echo "[fleet] done"
    ;;
  ps)
    echo "role gen: $(pgrep -fc 'roles/generate.js')  skill gen: $(pgrep -fc 'skills/generate.js')  loops: $(pgrep -fc 'fleet.sh')"
    ;;
esac
