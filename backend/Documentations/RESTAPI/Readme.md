การสร้าง REST API Web Server คือการพัฒนาเซิร์ฟเวอร์เพื่อให้ระบบหรือแอปพลิเคชันอื่น ๆ สามารถเชื่อมต่อเพื่อรับส่งข้อมูลผ่านโปรโตคอล HTTP โดยใช้โครงสร้างข้อมูลมาตรฐานอย่าง JSON เป็นหลัก [1, 2, 3, 4] 
ต่อไปนี้คือขั้นตอนและตัวอย่างการสร้าง REST API Web Server อย่างง่ายด้วย Node.js และ Express ซึ่งเป็นเครื่องมือที่ได้รับความนิยมสูงที่สุด [1, 5, 6, 7] 
------------------------------
## 1. วิธีคิดและการใช้ HTTP Methods
การออกแบบ REST API จะอิงตามการจัดการทรัพยากร (Resource) ผ่านคำสั่ง HTTP ดังนี้: [1, 8] 

* GET /users — ดึงข้อมูลผู้ใช้ทั้งหมด
* GET /users/:id — ดึงข้อมูลผู้ใช้รายบุคคลตาม ID
* POST /users — เพิ่มข้อมูลผู้ใช้คนใหม่
* PUT /users/:id — แก้ไขข้อมูลผู้ใช้ที่มีอยู่เดิม
* DELETE /users/:id — ลบข้อมูลผู้ใช้ [1, 3] 

------------------------------
## 2. ขั้นตอนการติดตั้ง (Setup)
เปิด Terminal หรือ Command Prompt แล้วพิมพ์คำสั่งสร้างโปรเจกต์ดังนี้:

# 1. สร้างโฟลเดอร์โปรเจกต์และย้ายเข้าไปด้านใน
mkdir my-rest-api
cd my-rest-api
# 2. เริ่มต้นสร้างไฟล์ package.json
npm init -y
# 3. ติดตั้ง Express Framework
npm install express

------------------------------
## 3. ตัวอย่างโค้ดสร้างเซิร์ฟเวอร์ (server.js)
สร้างไฟล์ชื่อ server.js ขึ้นมาในโฟลเดอร์โปรเจกต์ และใส่โค้ดจำลองระบบจัดการข้อมูลผู้ใช้ (CRUD Operations) ดังนี้: [3, 7] 

const express = require('express');const app = express();const PORT = 3000;
// เปิดใช้งานให้เซิร์ฟเวอร์อ่านข้อมูลแบบ JSON จาก Body ได้
app.use(express.json());
// ข้อมูลจำลองในหน่วยความจำ (Mock Database)let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
];
// 1. GET ALL USERS (ดึงข้อมูลทั้งหมด)
app.get('/api/users', (req, res) => {
    res.json(users);
});
// 2. GET USER BY ID (ค้นหาข้อมูลตาม ID)
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    res.json(user);
});
// 3. POST NEW USER (เพิ่มข้อมูลใหม่)
app.post('/api/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email
    };
    users.push(newUser);
    res.status(201).json(newUser); // 201 หมายถึงสร้างสำเร็จ
});
// 4. PUT UPDATE USER (แก้ไขข้อมูล)
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user });
});
// 5. DELETE USER (ลบข้อมูล)
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    users.splice(index, 1);
    res.json({ message: 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว' });
});
// เริ่มต้นรันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`REST API Server กำลังรันที่ http://localhost:${PORT}`);
});

------------------------------
## 4. วิธีการเปิดใช้งานและทดสอบ

   1. รันเซิร์ฟเวอร์ด้วยคำสั่ง:
   
   node server.js
   
   2. คุณสามารถเปิดเว็บเบราว์เซอร์แล้วเข้าไปที่ http://localhost:3000/api/users เพื่อดูข้อมูลผู้ใช้ทั้งหมดได้ทันที
   3. สำหรับการทดสอบคำสั่งอื่นๆ เช่น POST, PUT, DELETE แนะนำให้ใช้เครื่องมือภายนอกทดสอบ เช่น [Postman](https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/), Thunder Client (ส่วนขยายใน VS Code) หรือคำสั่ง curl บน Terminal [4, 5] 

------------------------------
หากคุณต้องการปรับปรุงโปรเจกต์นี้ให้ทำงานได้จริงในสเกลที่ใหญ่ขึ้น คุณสามารถศึกษาเพิ่มเติมเกี่ยวกับการเชื่อมต่อ Database (เช่น MongoDB หรือ MySQL) และการทำ Authentication (เช่น JWT) เพื่อล็อกอินความปลอดภัยของข้อมูล [5, 6, 9] 
คุณต้องการให้แนะนำวิธีเชื่อมต่อโค้ดนี้เข้ากับ ฐานข้อมูล หรือเครื่องมือสำหรับการ ทดสอบ API เพิ่มเติมไหมครับ?

[1] [https://www.borntodev.com](https://www.borntodev.com/2024/04/10/%E0%B9%80%E0%B8%A3%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B8%95%E0%B9%89%E0%B8%99%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87-rest-apis-%E0%B8%94%E0%B9%89%E0%B8%A7%E0%B8%A2-node-js-express/)
[2] [https://www.9experttraining.com](https://www.9experttraining.com/articles/api-%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B0%E0%B9%84%E0%B8%A3)
[3] [https://medium.com](https://medium.com/@dachawat.fang57/%E0%B8%A1%E0%B8%B2%E0%B8%97%E0%B8%B3-restful-api-%E0%B9%81%E0%B8%9A%E0%B8%9A-%E0%B8%9E%E0%B8%A2%E0%B8%B2%E0%B8%A2%E0%B8%B2%E0%B8%A1%E0%B9%83%E0%B8%AB%E0%B9%89-%E0%B8%87%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B9%86-%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%96%E0%B8%AD%E0%B8%B0-e1dcae04ac52)
[4] [https://docs.mikelopster.dev](https://docs.mikelopster.dev/c/web101/chapter-9/library)
[5] [https://blog.postman.com](https://translate.google.com/translate?u=https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/&hl=th&sl=en&tl=th&client=sge)
[6] [https://www.youtube.com](https://www.youtube.com/watch?v=CAF4NC4OZEE)
[7] [https://www.moesif.com](https://translate.google.com/translate?u=https://www.moesif.com/blog/technical/rest-api-tutorial/&hl=th&sl=en&tl=th&client=sge)
[8] [https://dev.to](https://translate.google.com/translate?u=https://dev.to/leapcell/mastering-restful-api-design-a-practical-guide-408&hl=th&sl=en&tl=th&client=sge)
[9] [https://happycoding.io](https://translate.google.com/translate?u=https://happycoding.io/tutorials/java-server/rest-api&hl=th&sl=en&tl=th&client=sge)
