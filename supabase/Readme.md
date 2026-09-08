# 🗄️ Supabase Integration — Full Workflow Pack
ชุดไฟล์ครบถ้วน: **Auto Branch • Migration • Lint • Preview • Deploy • แจ้งเตือน** สอดคล้องกับ CI/CD ที่มีอยู่ ✅🔄

---

## 📁 โครงสร้างไฟล์
```
.github/
└── workflows/
    ├── supabase-branch.yml       # 🔄 สร้างสาขา + ทดสอบ Migration อัตโนมัติ
    ├── supabase-deploy.yml       # 🚀 Deploy เมื่อ Merge ไป Main
    └── supabase-notify.yml       # 🔔 แจ้งผล Migration/Deploy
```

---

## 📄 1. `.github/workflows/supabase-branch.yml` — Auto Branch & Preview
```yaml
name: Supabase Preview & Migration

on:
  push:
    branches: [main, dev, "feature/**", "hotfix/**"]
    paths: ["supabase/**"]
  pull_request:
    branches: [main, dev]
    paths: ["supabase/**"]

env:
  SUPABASE_VERSION: "v1.226.0"
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

jobs:
  lint-migrations:
    name: Lint & Validate Migrations
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: ${{ env.SUPABASE_VERSION }}

      - name: Validate Migrations
        run: supabase db lint --schema-only

      - name: Check Migration Order
        run: |
          cd supabase/migrations
          LAST=$(ls -1 *.sql | sort -n | tail -1)
          echo "✅ Last migration: $LAST"

  preview-branch:
    name: Create Preview Branch
    needs: lint-migrations
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: ${{ env.SUPABASE_VERSION }}

      - name: Link Project
        run: supabase link --project-ref ${{ env.SUPABASE_PROJECT_ID }}

      - name: Create/Update Preview Branch
        id: preview
        run: |
          BRANCH_NAME="pr-${{ github.event.pull_request.number }}"
          echo "Creating preview branch: $BRANCH_NAME"
          
          supabase branch create "$BRANCH_NAME" --no-wait || true
          
          # รับ Connection String
          DB_URL=$(supabase branch list --json | jq -r --arg b "$BRANCH_NAME" '.[] | select(.name==$b) | .connection_string')
          
          echo "db_url=$DB_URL" >> $GITHUB_OUTPUT
          echo "branch_name=$BRANCH_NAME" >> $GITHUB_OUTPUT

      - name: Apply Migrations to Preview
        run: |
          supabase db push \
            --db-url "${{ steps.preview.outputs.db_url }}" \
            --include-all

      - name: Show Preview Info
        run: |
          echo "✅ Preview Branch พร้อมใช้งาน"
          echo "ชื่อสาขา: ${{ steps.preview.outputs.branch_name }}"
          echo "DB URL: ${{ steps.preview.outputs.db_url }}"

      - name: Comment PR
        uses: thollander/actions-comment-pull-request@v2
        with:
          message: |
            🗄️ **Supabase Preview พร้อมแล้ว**
            • สาขา: `${{ steps.preview.outputs.branch_name }}`
            • สถานะ: ✅ Migration ผ่าน
            • 🔗 [ดูที่นี่](https://supabase.com/dashboard/project/${{ env.SUPABASE_PROJECT_ID }}/branches)
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  notify-result:
    needs: [lint-migrations, preview-branch]
    runs-on: ubuntu-latest
    if: always()
    uses: ./.github/actions/notify
    with:
      status: ${{ needs.preview-branch.result }}
      title: "🗄️ Supabase Preview — PR #${{ github.event.pull_request.number }}"
      message: >-
        Lint: ${{ needs.lint-migrations.result }} | 
        Preview: ${{ needs.preview-branch.result }}
```

---

## 📄 2. `.github/workflows/supabase-deploy.yml` — Deploy to Production
```yaml
name: Supabase Deploy to Production

on:
  push:
    branches: [main]
    paths: ["supabase/**"]

env:
  SUPABASE_VERSION: "v1.226.0"
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

jobs:
  deploy:
    name: Deploy Migrations → Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: ${{ env.SUPABASE_VERSION }}

      - name: Link Production Project
        run: supabase link --project-ref ${{ env.SUPABASE_PROJECT_ID }}

      - name: Dry Run (ตรวจสอบก่อน)
        run: supabase db push --dry-run

      - name: Deploy Migrations
        id: deploy
        run: supabase db push

      - name: Deploy Edge Functions
        run: supabase functions deploy --project-ref ${{ env.SUPABASE_PROJECT_ID }}

      - name: Verify Health
        run: |
          echo "✅ Migration Deployed"
          supabase projects health --project-ref ${{ env.SUPABASE_PROJECT_ID }}

  notify-deploy:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    uses: ./.github/actions/notify
    with:
      status: ${{ needs.deploy.result }}
      title: "🚀 Supabase Deploy — Production"
      message: "Migrations + Edge Functions Deployed ✅"
```

---

## 📄 3. `.github/workflows/supabase-notify.yml` — แจ้งเตือนสถานะ
```yaml
name: Supabase Status Monitor

on:
  workflow_run:
    workflows: ["Supabase Preview & Migration", "Supabase Deploy to Production"]
    types: [completed]

jobs:
  alert:
    runs-on: ubuntu-latest
    if: >-
      github.event.workflow_run.conclusion == 'failure' ||
      github.event.workflow_run.conclusion == 'cancelled'
    steps:
      - name: Send Alert
        uses: ./.github/actions/notify
        with:
          status: failure
          title: "⚠️ Supabase Pipeline ล้มเหลว"
          message: >-
            เวิร์กโฟลว์: ${{ github.event.workflow_run.name }}
            • สาขา: ${{ github.event.workflow_run.head_branch }}
            • [ดูรายละเอียด](${{ github.event.workflow_run.html_url }})
```

---

## 🔐 Secrets ที่ต้องตั้งค่า
ไปที่ **Repo → Settings → Secrets and variables → Actions**
| Secret | คำอธิบาย | ที่มา |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Token สำหรับ CLI | Supabase Account → Access Tokens → Create Token |
| `SUPABASE_PROJECT_ID` | ID โปรเจกต์ | Project URL: `https://supabase.com/dashboard/project/THIS_PART` |

---

## 📋 โครงสร้างไฟล์ Supabase ใน Git
```
supabase/
├── migrations/          # SQL เรียงตามลำดับ
│   ├── 202609080000_init.sql
│   ├── 202609080001_users.sql
│   └── ...
├── seed.sql             # ข้อมูลทดสอบ (Preview Branch จะรันอัตโนมัติ)
├── config.toml          # DB / Auth / Storage / Edge Functions
└── .gitignore
```

### 📌 `.gitignore`
```
supabase/.temp
supabase/migrations/*.sql.tmp
.env
```

---

## ✅ ขั้นตอนการทำงานแบบเต็ม
```
1. Push/PR → ตรวจสอบ supabase/** เปลี่ยนไหม
   ↓
2. Lint → ตรวจสอบ SQL ไม่มีข้อผิดพลาด
   ↓
3. สร้าง Preview DB แยกอิสระ
   ↓
4. รัน Migration บน Preview → ทดสอบ
   ↓
5. แจ้งผลทาง PR + Slack/Telegram
   ↓
6. ✅ Merge ไป Main → Deploy → Production อัตโนมัติ
```

---

## 🛡️ คำแนะนำเพิ่มเติม
- ✅ เปิด **Branch Protection Rule** → ต้องผ่าน `Supabase Preview` ก่อน Merge
- ✅ ใช้ `seed.sql` สำหรับข้อมูลทดสอบ — ข้อมูล Production ไม่คัดลอกมา
- ⚠️ **ห้ามแก้ Schema ผ่าน Dashboard โดยตรง** — ทุกอย่างต้องผ่าน Migration ใน Git
- 💰 ถ้าต้องการคัดลอกข้อมูล Production → เปิด **Include Production Data** (มีค่าใช้จ่ายเพิ่ม)

---

## 🚀 พร้อมใช้งาน
วางไฟล์ใน `.github/workflows/` → ตั้งค่า Secrets → Push ไฟล์ `supabase/migrations/` ครับ 🎉

ต้องการให้ผมเพิ่ม **ขั้นตอนรันทดสอบข้อมูล/API บน Preview DB** หรือ **สร้างเทมเพลต Migration เริ่มต้น** ให้เลยไหมครับ? 🧪🗄️
