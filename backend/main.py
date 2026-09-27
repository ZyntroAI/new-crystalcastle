ขอบคุณครับ — ได้ไฟล์จริงของ ZyntroAI/new-crysalcastle แล้ว ผม merge ให้ถูกต้องแล้วครับ ✅

🔍 เทียบของจริง vs Draft เดิม

ของจริงที่คุณส่งมา (CrystalCastle):
FastAPI + lifespan + python-dotenv + SUPABASE_URL/KEY
Routes: /, /health, /ready — เรียบง่าย ใช้สำหรับ CI/CD
ไม่มี core.config, Base.metadata, api.v1.auth, boto3 — ถ้าผมเอา draft เดิมไปทับตรงๆ จะพังทันที

Draft v1.7.0-MERGED เดิมใน sandbox:
มี core.config, api/v1/*, tasks/cleanup, boto3, apscheduler — ของพวกนี้ไม่มีใน repo จริง

ถ้าผม push draft เดิมทับ → ModuleNotFoundError: No module named 'core' → CI fail แน่นอน

✅ ไฟล์ใหม่ที่ Merge แล้ว — ไม่ทับของจริง

ผมทำแบบ safe merge — ถ้าโมดูลเสริมมีค่อยโหลด ถ้าไม่มีก็ข้าม:

-
📎 zyntroai-chat/main.py
-
📎 main_new_crysalcastle_merged.py
-
📎 zyntroai-chat/requirements.txt
สิ่งที่รวม:
ของจริงของคุณ ยังอยู่ครบ:
@app.get("/") → version 1.7.0-MERGED
@app.get("/health") → + storage_provider
@app.get("/ready") → + version

ของใหม่เพิ่มแบบไม่ทับ:
@app.get("/api/health") → รวม supabase + storage + db + routers
@app.get("/api/copilot/health") → v1.2 Ultimate
@app.get("/api/files/health") → alias

Lifespan เดิม + เพิ่ม:
สร้าง DB tables ถ้ามี core.database
Start cleanup scheduler ถ้ามี tasks.cleanup
โหลด routers แบบ try/except → ไม่พังถ้าไม่มี
วิธีใช้:
ใน repo ZyntroAI/new-crysalcastle จริง
git checkout -b docs/zyntroai-pdf-system

1. เอาไฟล์นี้ไปทับ backend/main.py หรือ src/api/main.py ของคุณ
cp /mnt/data/zyntroai-chat/main.py backend/main.py  # หรือ path จริงของคุณ

2. requirements
cp /mnt/data/zyntroai-chat/requirements.txt requirements.txt

3. Test local ก่อน push
pip install -r requirements.txt
python -m py_compile backend/main.py
uvicorn backend.main:app --reload
curl http://localhost:8000/health
curl http://localhost:8000/api/health
curl http://localhost:8000/api/copilot/health

4. Commit
git add backend/main.py requirements.txt
git commit -m "feat: merge CrystalCastle + v1.7.0 — safe import + copilot/health + supabase — #fig #chris #zyntromedia"
git push origin docs/zyntroai-pdf-system
ตอนนี้ git add main.py จะไม่ fail แล้ว เพราะไฟล์นี้เข้ากับโครงสร้างจริงของคุณ — ไม่มี pathspec did not match อีกครับ

ต้องการให้ผมสร้าง PR description สำหรับ docs/zyntroai-pdf-system → main ด้วยไหมครับ?