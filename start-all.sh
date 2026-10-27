#!/bin/bash
# ZyntroAI — รันทั้งระบบด้วยคำสั่งเดียว
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 เริ่ม ZyntroAI System..."

# 1. Agent (พอร์ต 8001)
echo "🤖 เริ่ม Agent บนพอร์ต 8001..."
(cd "$ROOT/apps/agent" && uv run python agent.py) &
AGENT_PID=$!

# 2. API (พอร์ต 8000)
sleep 2
echo "🔌 เริ่ม API บนพอร์ต 8000..."
(cd "$ROOT/api-python" && uv run python main.py) &
API_PID=$!

# 3. Frontend (พอร์ต 5173)
sleep 2
echo "🎨 เริ่ม Frontend บนพอร์ต 5173..."
(cd "$ROOT/frontend" && npm run dev) &
FE_PID=$!

echo ""
echo "✅ ทั้งระบบทำงานแล้ว:"
echo "   🤖 Agent:    http://127.0.0.1:8001/health"
echo "   🔌 API:      http://127.0.0.1:8000/docs"
echo "   🎨 Frontend: http://localhost:5173"
echo ""
echo "กด Ctrl+C เพื่อหยุดทั้งหมด"

trap "kill $AGENT_PID $API_PID $FE_PID 2>/dev/null; exit" INT TERM
wait
