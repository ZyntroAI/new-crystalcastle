# ⚛️ useScope Hook — React State Management

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. ภาพรวม

`useScope` จัดการขอบเขตข้อมูล (information scope) สำหรับ React
เปิดให้แยก state เป็นขอบเขตอิสระ ล้างอัตโนมัติ ใช้ memoized selector
และเลือก persist ลง localStorage ได้

## 2. ความสามารถหลัก

- **Type-safe** — รองรับ TypeScript generics เต็ม
- **Scope isolation** — กันข้อมูลรั่วข้าม scope
- **Memoized selectors** — แบบ Redux เพื่อลด re-render
- **Persistence** — เลือกบันทึกลง localStorage ได้
- **Event-based subscription** — สื่อสารข้าม component
- **Shallow equality** — ข้าม re-render เมื่อข้อมูลไม่เปลี่ยน

---

## 3. ตัวอย่างการใช้งาน

**scope พื้นฐาน พร้อม persist:**

```typescript
type AuthData = {
  user: { id: string; name: string } | null;
  token: string | null;
  isAuthenticated: boolean;
};

const { data, update, reset } = useScope<AuthData>('auth', {
  user: null,
  token: null,
  isAuthenticated: false
}, { persist: true });
```

**selector แบบ Redux:**

```typescript
const isAuthenticated = useSelector<AuthData, boolean>(
  'auth',
  s => s.isAuthenticated
);

const userName = useSelector<AuthData, string>(
  'auth',
  s => s.user?.name ?? 'Guest'
);
```

**scope แบบ dynamic ต่อ instance:**

```typescript
function PRCard({ prId }: { prId: string }) {
  const { data } = useScope(`dola:pr:${prId}`, {
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    checks: [] as string[]
  });
  return <div>Status: {data.status}</div>;
}
```

> **รูปแบบการตั้งชื่อ scope:** `dola:pr:<id>` — ขึ้นต้นด้วยระบบ เจ้าของ แล้วตามด้วย id
> ช่วยให้ debug ได้ง่ายว่า scope ไหนเป็นของใคร

---

## 4. ประสิทธิภาพ

**ตาราง 4-1: ข้อได้เปรียบด้านประสิทธิภาพ**

| ความสามารถ | ผลที่ได้ |
|---|---|
| Shallow diff comparison | ข้าม re-render เมื่อข้อมูลเหมือนเดิม |
| Scope isolation | ขอบเขตสะอาด ไม่ปนกัน |
| Memoized functions | reference เสถียร ใส่ dependency array ได้ปลอดภัย |
| Auto-cleanup | ไม่มี memory leak (ยกเว้นตั้ง persist) |
| Registry-based | source of truth เดียว ไม่ duplicate ข้อมูล |

---

## 5. ข้อควรระวัง

- ใส่ `persist: true` แล้ว ต้อง `reset()` เองเมื่อผู้ใช้ออกจากระบบ
- ชื่อ scope ต้องไม่ซ้ำกัน ไม่งั้นสอง component จะแชร์ state โดยไม่ตั้งใจ
- selector ที่คืน object ใหม่ทุกครั้งจะทำให้ shallow equality ใช้ไม่ได้

---

## 6. อ่านต่อ

- Thread Model ที่ใช้ trace id คล้าย scope → [thread-model.md](thread-model.md)
- ความปลอดภัยของ token ที่เก็บใน scope → [api-security.md](api-security.md)
