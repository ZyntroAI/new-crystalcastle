# CrystalCastle → AWS OIDC Setup

ชุดไฟล์สำหรับตั้งค่าให้ GitHub Actions ของ `1napz/crystalcastle` เชื่อมต่อ
AWS ผ่าน **OIDC (OpenID Connect)** แทนการเก็บ AWS Access Key/Secret Key
เป็น GitHub Secret แบบเดิม ตรงกับสิ่งที่ infographic "PAT vs OIDC" อธิบายไว้:
ใช้โทเค็นอายุสั้นที่แลกกับ AWS ณ ตอนรัน workflow แทนกุญแจถาวร

## ภาพรวม flow

```
GitHub Actions job → ขอ id-token จาก GitHub OIDC provider
                    → ส่ง token ไปที่ AWS STS (AssumeRoleWithWebIdentity)
                    → AWS ตรวจสอบกับ IAM OIDC Provider + Role Trust Policy
                    → ได้ AWS credential ชั่วคราว (ปกติ 1 ชั่วโมง)
```

## ไฟล์ในชุดนี้

| ไฟล์ | หน้าที่ |
|---|---|
| `trust-policy.json` | Trust policy ของ IAM Role — กำหนดว่า "ใครมีสิทธิ์ assume role นี้" โดยจำกัดเฉพาะ workflow ที่รันจาก `1napz/crystalcastle` branch `main` หรือ environment `production` เท่านั้น |
| `permission-policy.json` | Permission policy ของ Role — กำหนดว่า assume role แล้ว "ทำอะไรได้บ้าง" **(เป็นตัวอย่าง push ECR + deploy ECS เท่านั้น ต้องแก้ให้ตรงกับของจริง)** |
| `setup-aws-oidc.sh` | สคริปต์ AWS CLI สร้าง OIDC Provider + IAM Role + แนบ permission policy ให้อัตโนมัติ |
| `.github/workflows/aws-oidc-deploy.yml` | Workflow ตัวอย่างที่ใช้ `aws-actions/configure-aws-credentials` แลก OIDC token เป็น AWS credential แล้ว build/push/deploy |

## ขั้นตอนติดตั้ง

### 1. รันสคริปต์สร้าง OIDC Provider + Role บน AWS

ต้อง authenticate AWS CLI ไว้ก่อน (`aws configure` หรือ SSO) ด้วยสิทธิ์ที่
สร้าง IAM resource ได้:

```bash
AWS_ACCOUNT_ID=<เลข-12-หลักของบัญชี-AWS> \
AWS_REGION=ap-southeast-1 \
./setup-aws-oidc.sh
```

สคริปต์จะ:
1. สร้าง (หรือใช้ของเดิมถ้ามีอยู่แล้ว) IAM OIDC Identity Provider สำหรับ
   `token.actions.githubusercontent.com`
2. สร้าง IAM Role ชื่อ `crystalcastle-github-actions-deploy` พร้อม trust
   policy ที่จำกัดเฉพาะ repo/branch ของ CrystalCastle
3. แนบ permission policy ตัวอย่างเข้ากับ role
4. พิมพ์ **Role ARN** ออกมาให้นำไปใช้ในขั้นตอนถัดไป

### 2. แก้ permission-policy.json ให้ตรงกับของจริง (สำคัญ)

ไฟล์ตัวอย่างสมมติว่า deploy ด้วย ECR + ECS — หาก CrystalCastle deploy จริง
ด้วยวิธีอื่น (เช่น S3 static hosting, Lambda, EC2, App Runner) ให้แก้
`permission-policy.json` ให้ตรงกับ AWS service ที่ใช้จริงก่อนรัน
`setup-aws-oidc.sh` แล้วรันสคริปต์ซ้ำได้ (สคริปต์ตรวจสอบ role เดิมแล้ว
อัปเดตให้อัตโนมัติ ไม่สร้างซ้ำ)

หลักการสำคัญ: ให้สิทธิ์เท่าที่จำเป็นเท่านั้น (least privilege) —
หลีกเลี่ยง `"Resource": "*"` ร่วมกับ action ที่มีสิทธิ์กว้าง

### 3. ใส่ Role ARN ลงใน workflow

เปิด `.github/workflows/aws-oidc-deploy.yml` แล้วแทนที่
`<AWS_ACCOUNT_ID>` ในบรรทัด `role-to-assume` ด้วยเลขบัญชี AWS จริง
(หรือวาง Role ARN เต็มที่สคริปต์พิมพ์ออกมาในขั้นตอนที่ 1)

### 4. (แนะนำ) สร้าง GitHub Environment ชื่อ `production`

ที่ Settings → Environments ของ repo `1napz/crystalcastle` — เพื่อให้
ใช้เงื่อนไข `sub: repo:1napz/crystalcastle:environment:production` ใน
trust policy ได้ตามที่ตั้งไว้ และเปิด required reviewers ก่อน deploy จริง
ได้ถ้าต้องการ

### 5. คัดลอกไฟล์ workflow เข้า repo แล้ว push

```bash
cp -r .github <path-to-crystalcastle-repo>/
cd <path-to-crystalcastle-repo>
git add .github/workflows/aws-oidc-deploy.yml
git commit -m "ci: deploy via AWS OIDC instead of static access keys"
git push
```

## หมายเหตุด้านความปลอดภัย

- **ไม่มี AWS Secret ใดถูกเก็บใน GitHub เลย** — credential ที่ workflow
  ได้รับมีอายุสั้น (ค่าเริ่มต้น 1 ชั่วโมง) และสร้างใหม่ทุกครั้งที่รัน
- Trust policy จำกัดเฉพาะ branch `main` และ environment `production` —
  แม้ branch อื่นของ repo เดียวกันก็ **ไม่สามารถ** assume role นี้ได้
  จนกว่าจะเพิ่มเงื่อนไขเพิ่มเติมเอง
- ใช้ `StringEquals`/`StringLike` เท่านั้นในเงื่อนไข ไม่ใช้
  `ForAllValues:StringLike` เพราะ operator นี้คืนค่า true ได้แม้ claim
  หายไปหรือสะกดผิด ซึ่งเป็นช่องโหว่ที่ AWS เตือนไว้ชัดเจน
- Thumbprint ของ GitHub OIDC provider อาจมีการหมุนเวียนในอนาคต หากพบ
  error เกี่ยวกับ thumbprint ให้ตรวจสอบค่าล่าสุดจาก AWS/GitHub docs
  ก่อนรัน `setup-aws-oidc.sh` ซ้ำ
- Repo ที่สร้างหรือ rename ตั้งแต่กลางปี 2026 เป็นต้นไปอาจได้รับ `sub`
  claim แบบ immutable ที่หน้าตาต่างจากรูปแบบเดิม — หากเปิดใช้ฟีเจอร์นี้
  กับ `1napz/crystalcastle` ในอนาคต ต้องตรวจสอบและปรับค่าใน
  `trust-policy.json` ให้ตรงกับรูปแบบใหม่ด้วย
