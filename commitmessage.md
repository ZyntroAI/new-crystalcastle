# Commit Message Convention

Format:

```
<type>(<scope>): <description in English> (<คำอธิบายภาษาไทย>)
```

## Types

- `feat:` เพิ่มฟีเจอร์ใหม่
- `fix:` แก้บั๊กหรือข้อผิดพลาด
- `docs:` เพิ่ม/แก้ไขเอกสาร
- `chore:` งานทั่วไป เช่น config, build, dependency
- `refactor:` ปรับโครงสร้างโค้ดโดยไม่เปลี่ยนพฤติกรรม
- `test:` เพิ่มหรือแก้ไขการทดสอบ
- `ci:` แก้ไข workflow หรือ pipeline

## Examples

```
feat(mock): add mock-api.js for UI testing (เพิ่ม mock-api.js สำหรับทดสอบ UI)
fix(workflow): correct indentation in errorlog-generator.yml (แก้ indentation ให้ถูกต้อง)
docs(reviewer): add reviewer-policy.md (เพิ่ม reviewer-policy.md)
chore(config): update .coderabbit.yaml schema (ปรับ .coderabbit.yaml ให้ตรง schema)
ci(workflows): repair 5 invalid workflow YAML files (ซ่อม workflow ที่ YAML พัง 5 ไฟล์)
```

## Notes

- ใช้ description ภาษาอังกฤษนำ แล้ววงเล็บคำอธิบายภาษาไทย
- ขอบเขต (scope) ใช้ชื่อโฟลเดอร์หรือระบบที่แก้ เช่น `workflow`, `config`, `security`
- บรรทัดหัวข้อไม่เกิน ~72 ตัวอักษร ถ้าต้องอธิบายเพิ่มให้เว้นบรรทัดแล้วใส่ body
