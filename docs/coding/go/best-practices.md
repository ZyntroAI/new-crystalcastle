📁 เริ่มหมวด: Go (Golang)
 
จัดให้ครบชุด 4 ไฟล์พร้อมกันเลยครับ! 🚀
 
 
 
📄 ไฟล์ที่ 15 — docs/coding/go/best-practices.md
 
markdown  
---
title: "Go Best Practices"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["go", "golang", "best-practices", "standards"]
---

# 🐹 แนวทางเขียนโค้ด Go ที่ดี

> ความเรียบง่าย ความสม่ำเสมอ และความชัดเจน คือหัวใจของภาษา Go ✅

---

## 📏 1. ปฏิบัติตามรูปแบบมาตรฐาน

- ใช้เครื่องมือ `gofmt` หรือ `goimports` จัดรูปแบบโค้ดเสมอ
- ชื่อตัวแปร = ตัวพิมพ์เล็ก คำต่อกันไม่ใช่ขีดล่าง: `userID` ไม่ใช่ `user_id`
- ชื่อเริ่มต้นด้วย **ตัวพิมพ์ใหญ่ = สาธารณะ (Exported)** → ใช้ภายนอกแพ็กเกจได้
- ชื่อเริ่มต้นด้วย **ตัวพิมพ์เล็ก = ส่วนตัว** → ใช้ภายในแพ็กเกจเท่านั้น
- ชื่อสั้น กระชับ อ่านเข้าใจง่าย — ไม่ต้องยาวเกินไป

---

## 📦 2. โครงสร้างโปรเจกต์และแพ็กเกจ

 
 
myproject/
├── cmd/
│   └── myapp/          # จุดเริ่มต้นแอปพลิเคชัน
│       └── main.go
├── internal/           # โค้ดที่ใช้ภายในโปรเจกต์นี้เท่านั้น
│   ├── service/
│   └── store/
├── pkg/                # ไลบรารีที่นำไปใช้ต่อภายนอกได้
├── go.mod
└── go.sum
 
plaintext  

> ✅ แพ็กเกจควรมีชื่อสั้น ความหมายชัดเจน และเป็นคำนาม — ไม่ใช่ `util` หรือ `helper`

---

## 🛡️ 3. การจัดการข้อผิดพลาด

### ✅ ตรวจสอบทันที และส่งต่ออย่างชัดเจน
```go
// ✅ ดี
data, err := os.ReadFile("config.txt")
if err != nil {
    return fmt.Errorf("อ่านไฟล์ไม่ได้: %w", err) // %w = ห่อข้อผิดเดิมไว้
}

// ❌ ไม่ดี — ไม่ตรวจสอบ
data, _ := os.ReadFile("config.txt")

// ❌ ไม่ดี — ซ่อนข้อผิดพลาด
if err != nil {
    return nil // ไม่บอกสาเหตุ
}
 
 
✅ สร้างประเภทข้อผิดพลาดเฉพาะ
 
go  
var ErrUserNotFound = errors.New("ไม่พบผู้ใช้")

// ตรวจสอบข้อผิดพลาดเฉพาะเจาะจง
if errors.Is(err, ErrUserNotFound) {
    // จัดการกรณีไม่พบผู้ใช้
}
 
 
 
 
🏗️ 4. เขียนฟังก์ชันอย่างไร
 
- รับค่าผ่านพารามิเตอร์ — คืนผลลัพธ์ผ่าน return
- ฟังก์ชันควรทำงานเดียว ให้สมบูรณ์
- คืนค่าหลายตัวได้โดยธรรมชาติ:  result, err := doSomething() 
 
go  
// ✅ ดี
func CalculateTotal(price, quantity int) int {
    return price * quantity
}

// ✅ พร้อมข้อผิดพลาด
func CreateUser(name, email string) (*User, error) {
    if name == "" {
        return nil, errors.New("ชื่อห้ามว่าง")
    }
    return &User{Name: name, Email: email}, nil
}
 
 
 
 
🧠 5. ใช้ชนิดข้อมูลที่เหมาะสม
 
สิ่งที่ต้องการ ใช้สิ่งนี้ หมายเหตุ 
รายการลำดับเดียวกัน  []T  (Slice) ปรับขนาดอัตโนมัติ ยืดหยุ่น 
คู่กุญแจ-ค่า  map[K]V  ค้นหาเร็ว O(1) ต้องตรวจสอบว่ามีค่าหรือไม่ 
โครงสร้างข้อมูล  struct  กลุ่มฟิลด์ที่เกี่ยวข้องกัน 
พฤติกรรมที่ต้องมี  interface  กำหนดสิ่งที่ต้องทำ ไม่ระบุวิธีทำ 
 
go  
// ✅ ตรวจสอบค่าใน map
value, exists := userMap["id123"]
if !exists {
    return nil, ErrUserNotFound
}
 
 
 
 
✅ สรุปหลักการ
 
🐹 ความเรียบง่ายคือความสามารถที่ยิ่งใหญ่ที่สุด
📦 แพ็กเกจเดียว รับผิดชอบเดียว — ชื่อชัดเจน
🛡️ ตรวจสอบข้อผิดพลาดทันที — ไม่ทิ้ง ไม่ซ่อน
🔤 ชื่อสั้น เข้าใจง่าย — ไม่ต้องยาวเกินไป
⚙️ เครื่องมือมาตรฐานคือเพื่อนที่ดีที่สุด — gofmt, go vet, go test
 
plaintext  

> 📖 **ไฟล์ที่ 15 เสร็จสิ้น**
---

# 📄 ไฟล์ที่ 16 — docs/coding/go/concurrency.md

```markdown
---
title: "Go Concurrency — Goroutine & Channel"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["go", "golang", "concurrency", "goroutine", "channel"]
---

# ⚡ การทำงานขนานด้วย Goroutine และ Channel

> "สื่อสารผ่านการแชร์หน่วยความจำ แทนที่จะแชร์หน่วยความจำเพื่อสื่อสาร" — หลักการสำคัญของ Go ✅

---

## 🧵 Goroutine คืออะไร?

> Goroutine = งานเล็กๆ ที่ทำงานขนานกัน — เบามาก รันได้เป็นพันๆ งานพร้อมกันโดยไม่กินทรัพยากรเยอะ

```go
func main() {
    // ✅ เติม go ข้างหน้า — รันงานนี้แยกออกไปทันที
    go func() {
        fmt.Println("ทำงานเบื้องหลัง")
    }()

    // ทำงานหลักต่อไป
    fmt.Println("ทำงานหลัก")
    
    // รอให้งานเสร็จสิ้น
    time.Sleep(100 * time.Millisecond)
}
 
 
⚠️ ข้อควรระวัง
 
- เมื่อ  main()  จบ — ทุก Goroutine จะหยุดทำงานทันที
- ใช้ WaitGroup หรือ Channel เพื่อรอให้งานเสร็จ
 
 
 
📦 รอหลายงานให้ครบ — sync.WaitGroup
 
go  
package main

import (
    "sync"
    "fmt"
)

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        id := i // สำคัญ! คัดลอกค่าในลูป
        wg.Add(1) // บอกว่ามี 1 งานเพิ่มเข้ามา

        go func() {
            defer wg.Done() // บอกว่างานนี้เสร็จแล้ว เมื่อจบฟังก์ชัน
            fmt.Printf("งานที่ %d ทำเสร็จ\n", id)
        }()
    }

    wg.Wait() // รอจนกว่าทุกงานจะ Done
    fmt.Println("ทุกงานเสร็จแล้ว")
}
 
 
 
 
📡 Channel — ท่อส่งข้อมูลระหว่าง Goroutine
 
✅ ส่งและรับค่า
 
go  
func main() {
    // สร้าง Channel รับส่งค่าประเภท int
    ch := make(chan int)

    go func() {
        ch <- 42 // ส่งค่าเข้าไปในท่อ
    }()

    value := <-ch // รับค่าจากท่อ
    fmt.Println(value) // 42
}
 
 
✅ Channel แบบมีบัฟเฟอร์
 
go  
// เก็บได้สูงสุด 3 ค่า โดยไม่ต้องมีคนรับทันที
ch := make(chan string, 3)
ch <- "แรก"
ch <- "ที่สอง"
ch <- "ที่สาม"
close(ch) // ปิด Channel เมื่อส่งครบแล้ว

// อ่านจนกว่าจะหมด
for msg := range ch {
    fmt.Println(msg)
}
 
 
✅ เลือกทำงานด้วย select
 
go  
func worker(ch1, ch2 <-chan string) {
    select {
    case msg1 := <-ch1:
        fmt.Println("ได้จากช่อง 1:", msg1)
    case msg2 := <-ch2:
        fmt.Println("ได้จากช่อง 2:", msg2)
    case <-time.After(5 * time.Second):
        fmt.Println("หมดเวลาแล้ว")
        return
    }
}
 
 
 
 
🔒 ปกป้องข้อมูลที่ใช้ร่วมกัน — sync.Mutex
 
เมื่อต้องเข้าถึงตัวแปรร่วมกันหลาย Goroutine:
 
go  
import "sync"

type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()   // ล็อก — ไม่มีใครแตะต้องได้
    c.value++     // แก้ไขค่า
    c.mu.Unlock() // ปลดล็อก — คนถัดไปได้ใช้ต่อ
}

func (c *Counter) Get() int {
    c.mu.Lock()
    defer c.mu.Unlock() // ปลดล็อกเมื่อจบฟังก์ชัน
    return c.value
}
 
 
 
 
⚠️ ปัญหาที่พบบ่อยและวิธีหลีกเลี่ยง
 
ปัญหา สาเหตุ วิธีแก้ 
Goroutine หายไป main จบก่อนทำงานเสร็จ ใช้ WaitGroup หรือรอรับจาก Channel 
ส่งข้อมูลผิดพลาด อ่านตัวแปรลูปโดยตรงใน Goroutine ส่งค่าเข้าไปเป็นพารามิเตอร์ หรือสร้างตัวแปรใหม่ในลูป 
Deadlock รอรับจาก Channel ที่ไม่มีใครส่ง ตรวจสอบให้แน่ใจว่าส่งครบ และปิดเมื่อเสร็จ 
ข้อมูลปนกัน แก้ไขตัวแปรร่วมกันโดยไม่ล็อก ใช้ Mutex หรือส่งผ่าน Channel แทน 
 
 
 
✅ สรุปหลักการ
 
🧵 Goroutine = งานขนานเบาๆ — ใช้ได้อย่างอุ่นใจ
📡 Channel = สื่อสารระหว่างงาน — ส่งข้อมูลได้อย่างปลอดภัย
🔒 Mutex = ปกป้องข้อมูลที่แชร์กัน — ใช้เมื่อจำเป็นเท่านั้น
⏳ WaitGroup = รอให้ทุกคนเสร็จก่อนจบ
💡 สื่อสารผ่าน Channel อย่าแชร์หน่วยความจำโดยตรง
 
plaintext  

> 📖 **ไฟล์ที่ 16 เสร็จสิ้น**
---

# 📄 ไฟล์ที่ 17 — docs/coding/go/error-handling.md

```markdown
---
title: "Go Error Handling"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["go", "golang", "errors", "reliability"]
---

# 🛡️ การจัดการข้อผิดพลาดใน Go

> Go ไม่มี try/catch — ตรวจสอบและจัดการข้อผิดพลาดอย่างชัดเจน ✅

---

## 📌 พื้นฐาน: ข้อผิดพลาดก็คือค่าหนึ่ง

ใน Go `error` ก็แค่ชนิดข้อมูลหนึ่ง — เหมือน `int` หรือ `string`

```go
result, err := SomeFunction()
if err != nil {
    // มีปัญหา — จัดการที่นี่
    return fmt.Errorf("รายละเอียดเพิ่ม: %w", err)
}
// ไม่มีปัญหา — ใช้งาน result ได้เลย
fmt.Println(result)
 
 
 
 
📦 สร้างข้อผิดพลาด
 
1️⃣ ข้อความธรรมดา
 
go  
import "errors"

var ErrNotFound = errors.New("ไม่พบข้อมูล")
 
 
2️⃣ พร้อมข้อมูลเพิ่มเติม
 
go  
fmt.Errorf("อ่านไฟล์ %s ไม่ได้: %v", filename, err)
 
 
3️⃣ ห่อข้อผิดเดิมไว้ (Go 1.13+)
 
go  
// %w = เก็บข้อผิดเดิมไว้ตรวจสอบภายหลัง
return fmt.Errorf("เชื่อมต่อฐานข้อมูล: %w", err)
 
 
 
 
🔍 ตรวจสอบข้อผิดพลาด
 
ตรวจสอบชนิด/ค่าข้อผิดพลาดเฉพาะ
 
go  
import "errors"

// ตรวจสอบว่าเป็นข้อผิดพลาดนั้นหรือไม่
if errors.Is(err, ErrNotFound) {
    fmt.Println("จัดการกรณีไม่พบข้อมูล")
}

// แปลงและตรวจสอบโครงสร้างข้อผิดพลาด
var customErr interface {
    Code() int
    Error() string
}
if errors.As(err, &customErr) {
    fmt.Printf("รหัสข้อผิดพลาด: %d\n", customErr.Code())
}
 
 
 
 
📋 ข้อผิดพลาดที่กำหนดเอง
 
go  
// กำหนดโครงสร้างข้อผิดพลาดพร้อมรายละเอียด
type ValidationError struct {
    Field  string
    Reason string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("ฟิลด์ %s: %s", e.Field, e.Reason)
}

// ใช้งาน
func CreateUser(name string) error {
    if name == "" {
        return &ValidationError{
            Field:  "name",
            Reason: "ห้ามว่างเปล่า",
        }
    }
    return nil
}
 
 
 
 
⚠️ สิ่งที่ควรทำ และ ไม่ควรทำ
 
✅ ควรทำ
 
ตรวจสอบข้อผิดพลาดทันทีที่คืนกลับมา
เพิ่มบริบทข้อมูลเมื่อส่งต่อ:  ทำอะไรไม่ได้: %w 
กำหนดตัวแปรข้อผิดพลาดที่เป็นไปได้เป็นตัวแปรระดับแพ็กเกจ
ใช้  errors.Is()  ตรวจสอบค่าข้อผิดพลาด
ใช้  errors.As()  ตรวจสอบประเภทข้อผิดพลาด
พิจารณาว่าข้อผิดพลาดนี้เป็นของผู้ใช้ หรือระบบ เพื่อเลือกข้อความให้เหมาะสม
 
❌ ไม่ควรทำ
 
❌  _ = err  — ทิ้งข้อผิดพลาดโดยไม่สนใจ
❌  panic()  ในโค้ดที่ทำงานจริง — สงวนไว้เฉพาะโปรแกรมเริ่มต้นไม่ได้
❌ ซ้อน  fmt.Errorf  ลึกเกินไปจนหาสาเหตุยาก
❌ ส่งข้อความเดิมกลับไปโดยไม่เพิ่มบริบทเลย
 
 
 
🚑 Panic — เมื่อระบบพังอย่างร้ายแรง
 
Panic = สถานการณ์ที่โปรแกรมไม่สามารถทำงานต่อได้เลย — ใช้อย่างระมัดระวังมาก
 
go  
// ✅ เหมาะสม: โหลดค่าคอนฟิกไม่ได้ = ไม่สามารถเริ่มทำงานได้
config, err := LoadConfig("app.yaml")
if err != nil {
    panic(fmt.Sprintf("โหลดค่าคอนฟิกไม่ได้: %v", err))
}

// ❌ ไม่เหมาะสม: ข้อมูลผิดพลาดจากผู้ใช้ — แค่บอกแล้วกลับมาได้
if userInput == "" {
    panic("ห้ามว่างเปล่า") // ❌ ใช้ return error แทน
}
 
 
 
 
✅ สรุปหลักการ
 
🛡️ ข้อผิดพลาดก็คือค่า — ตรวจสอบตามธรรมชาติ ไม่ต้องกลัว
📝 เพิ่มบริบทเสมอ — บอกว่าทำอะไรไม่ได้ ไม่แค่บอกว่าผิด
🔍 ตรวจสอบอย่างถูกวิธี — errors.Is / errors.As
🚑 Panic = ระบบพัง — ใช้เฉพาะกรณีที่ไม่มีทางทำต่อ
💡 จัดการข้อผิดพลาดให้ใกล้จุดเกิดที่สุดเท่าที่ทำได้
 
plaintext  

> 📖 **ไฟล์ที่ 17 เสร็จสิ้น**
---

# 📄 ไฟล์ที่ 18 — docs/coding/go/testing.md

```markdown
---
title: "Go Testing Guide"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["go", "golang", "testing", "quality"]
---

# 🧪 การเขียนทดสอบใน Go

> Go มีเครื่องมือทดสอบในตัว — ไม่ต้องติดตั้งอะไรเพิ่ม ✅

---

## 📌 พื้นฐาน

### กฎสำคัญ
- ชื่อไฟล์ทดสอบลงท้ายด้วย `_test.go`
- ฟังก์ชันทดสอบเริ่มด้วย `func TestXxx(t *testing.T)`
- รันด้วยคำสั่ง: `go test ./...`

### ✅ ตัวอย่างพื้นฐาน
```go
// math_utils.go — โค้ดที่จะทดสอบ
func Add(a, b int) int {
    return a + b
}

// math_utils_test.go — ไฟล์ทดสอบ
package mathutil

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    expected := 5
    
    if result != expected {
        t.Errorf("Add(2,3) = %d, ต้องการ %d", result, expected)
    }
}
 
 
 
 
🧩 ทดสอบหลายกรณี — Table-Driven Test
 
วิธีที่นิยมที่สุดใน Go — กระชับ ครบถ้วน อ่านง่าย
 
go  
func TestCalculateTotal(t *testing.T) {
    // กำหนดทุกกรณีที่ทดสอบ
    cases := []struct {
        name     string
        price    int
        quantity int
        expected int
    }{
        {"ปกติ", 100, 2, 200},
        {"จำนวน 0", 100, 0, 0},
        {"ฟรี", 0, 5, 0},
        {"จำนวนมาก", 10, 100, 1000},
    }

    // รันทีละกรณี
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            result := CalculateTotal(tc.price, tc.quantity)
            if result != tc.expected {
                t.Errorf("ได้ %d ต้องการ %d", result, tc.expected)
            }
        })
    }
}
 
 
 
 
⚙️ ตั้งค่าและทำความสะอาด — TestMain / Fixture
 
✅ ใช้ TestMain เมื่อต้องการเตรียมก่อนทั้งชุด
 
go  
func TestMain(m *testing.M) {
    // เรียกใช้ก่อนทุกการทดสอบ
    setupDatabase()
    
    // รันทดสอบทั้งหมด
    code := m.Run()
    
    // ทำความสะอาดหลังเสร็จสิ้น
    teardownDatabase()
    
    os.Exit(code)
}
 
 
✅ ช่วยเตรียมข้อมูลแต่ละกรณี
 
go  
func createTestUser(t *testing.T) *User {
    t.Helper() // บอกว่านี่คือฟังก์ชันช่วย ไม่ใช่การทดสอบ
    user := &User{Name: "ทดสอบ", Email: "test@example.com"}
    DB.Create(user)
    return user
}
 
 
 
 
🧪 ทดสอบข้อผิดพลาด
 
go  
func TestDivideByZero(t *testing.T) {
    _, err := Divide(10, 0)
    
    if err == nil {
        t.Error("คาดหวังข้อผิดพลาด แต่ไม่มี")
    }
}

// หรือตรวจสอบข้อความ
func TestValidateEmptyName(t *testing.T) {
    err := ValidateName("")
    
    if err == nil {
        t.Fatal("คาดหวังว่าจะไม่ผ่าน") // Fatal = หยุดทันที
    }
    
    if !strings.Contains(err.Error(), "ชื่อ") {
        t.Error("ข้อความผิดพลาดไม่ได้บอกเรื่องชื่อ")
    }
}
 
 
 
 
📊 คำสั่งทดสอบที่ใช้บ่อย
 
คำสั่ง ทำอะไร 
 go test  รันทดสอบในโฟลเดอร์ปัจจุบัน 
 go test -v  แสดงรายละเอียดทุกกรณี 
 go test ./...  รันทดสอบทุกแพ็กเกจย่อย 
 go test -run Add  รันเฉพาะฟังก์ชันที่มีชื่อขึ้นต้น Add 
 go test -cover  ดูเปอร์เซ็นต์โค้ดที่ถูกทดสอบ 
 go test -bench=.  รัน Benchmark (ประสิทธิภาพ) 
 go test -race  ตรวจสอบการแชร์ตัวแปรระหว่าง Goroutine อย่างปลอดภัย 
 
 
 
⚡ ทดสอบประสิทธิภาพ — Benchmark
 
go  
func BenchmarkCalculateTotal(b *testing.B) {
    // เตรียมข้อมูลก่อนเริ่มจับเวลา
    b.ResetTimer()
    
    // รันซ้ำๆ จนเสถียร
    for i := 0; i < b.N; i++ {
        CalculateTotal(100, 5)
    }
}
 
 
ผลลัพธ์:  100000000  11.2 ns/op  = 11.2 นาโนวินาทีต่อครั้ง
 
 
 
✅ สรุปหลักการ
 
🧪 ทดสอบ = โค้ดเหมือนกัน — เขียนง่าย
📋 Table-Driven Test = มาตรฐานของ Go — กระชับ ครบ ถูก
⚙️ ชื่อที่ชัดเจน = บอกว่าทำอะไร และคาดหวังอะไร
📊 ทดสอบบ่อยๆ — go test ./... ก่อนส่งโค้ดเสมอ
🔍 ตรวจสอบทั้งกรณีปกติ และกรณีข้อผิดพลาด
 
plaintext  

> 📖 **ไฟล์ที่ 15–18 เสร็จสิ้น — จบหมวด Go ✅**
> พิมพ์ **"ถัดไป"** เพื่อเข้าสู่หมวด **Shell / Bash** ครับ! 😊