# Service System

ระบบจัดการบริการซ่อม (Service Management System) สำหรับการจัดการตั้งแต่การรับแจ้งซ่อม การติดตามสถานะ และการจัดการผู้ใช้งาน

## 📋 คุณสมบัติหลัก

- 🔐 **ระบบ Authentication** - ล็อกอิน/ลงทะเบียนด้วย JWT
- 🎫 **จัดการ Ticket** - สร้าง อัพเดต และติดตามสถานะการซ่อม
- 👥 **จัดการผู้ใช้** - แยกสิทธิ์ระหว่าง Admin และ User
- 📊 **Dashboard** - แสดงสถิติและข้อมูลสำคัญ
- 🎨 **UI/UX** - หน้าเว็บที่ใช้งานง่าย responsive design

## 🛠️ เทคโนโลยีที่ใช้

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Token สำหรับ authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5/CSS3/JavaScript** - UI components
- **Vanilla JavaScript** - ไม่ใช้ framework เพื่อความเรียบง่าย

### Middleware & Tools
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variables management

## 📁 โครงสร้างโปรเจค

```
Service-System/
├── config/
│   └── db.js                 # การเชื่อมต่อ MongoDB
├── controllers/
│   ├── authController.js     # จัดการ login/register
│   ├── ticketController.js   # จัดการ ticket CRUD
│   └── userController.js     # จัดการข้อมูลผู้ใช้
├── middleware/
│   └── authMiddleware.js     # ตรวจสอบ JWT token
├── models/
│   ├── User.js              # Schema ผู้ใช้
│   └── RepairTicket.js      # Schema ticket
├── routes/
│   ├── authRoutes.js        # API routes สำหรับ auth
│   ├── ticketRoutes.js      # API routes สำหรับ ticket
│   └── userRoutes.js        # API routes สำหรับ user
├── public/
│   ├── index.html           # หน้าหลัก
│   ├── dashboard.html       # หน้า dashboard
│   ├── admin.html           # หน้า admin
│   ├── css/                 # Stylesheets
│   └── js/                  # Client-side scripts
├── .env                     # Environment variables (ต้องสร้างเอง)
├── server.js                # Entry point
└── package.json             # Dependencies
```

## 🚀 การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น

- Node.js (เวอร์ชัน 14 ขึ้นไป)
- MongoDB (ติดตั้งในเครื่องหรือใช้ MongoDB Atlas)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจค**
   ```bash
   cd Service-System
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

   Dependencies ที่จะถูกติดตั้ง:
   - `express` - Web framework
   - `mongoose` - MongoDB ODM
   - `bcryptjs` - Password encryption
   - `jsonwebtoken` - JWT authentication
   - `dotenv` - Environment configuration
   - `cors` - CORS middleware
   - `morgan` - HTTP logger
   - `axios` - HTTP client
   - `mongodb-memory-server` - In-memory MongoDB for testing

3. **ตั้งค่า Environment Variables**
   
   สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/service-system
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

   > **หมายเหตุ:** เปลี่ยน `your_jwt_secret_key_here` เป็น secret key ของคุณเอง

4. **เริ่มต้น MongoDB**
   
   หากใช้ MongoDB ในเครื่อง:
   ```bash
   mongod
   ```

   หรือใช้ MongoDB Atlas (cloud):
   - สร้าง cluster ที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - คัดลอก connection string มาใส่ใน `MONGO_URI`

5. **รันเซิร์ฟเวอร์**
   ```bash
   node server.js
   ```

   หรือใช้ nodemon สำหรับ development (ต้องติดตั้งก่อน):
   ```bash
   npm install -g nodemon
   nodemon server.js
   ```

6. **เปิดเว็บไซต์**
   
   เปิดเบราว์เซอร์และไปที่: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบ

### Tickets
- `GET /api/tickets` - ดูรายการ ticket ทั้งหมด
- `POST /api/tickets` - สร้าง ticket ใหม่
- `PUT /api/tickets/:id` - อัพเดท ticket
- `DELETE /api/tickets/:id` - ลบ ticket (Admin only)

### Users
- `GET /api/users` - ดูรายการผู้ใช้ (Admin only)
- `PUT /api/users/:id` - อัพเดทข้อมูลผู้ใช้

## 🔒 สิทธิ์การใช้งาน

- **User** - สร้างและดู ticket ของตัวเอง
- **Admin** - จัดการ ticket ทั้งหมด จัดการผู้ใช้

## 🧪 การทดสอบ

สำหรับการทดสอบ API สามารถใช้:
- **Postman** - Import collection และทดสอบ endpoints
- **Thunder Client** - VS Code extension
- **cURL** - Command line testing

ตัวอย่างการทดสอบด้วย cURL:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเชื่อมต่อ MongoDB**
   - ตรวจสอบว่า MongoDB service ทำงานอยู่
   - ตรวจสอบ `MONGO_URI` ใน `.env`

2. **JWT Token ไม่ทำงาน**
   - ตรวจสอบว่าตั้งค่า `JWT_SECRET` ใน `.env` แล้ว
   - ตรวจสอบว่าส่ง token ใน Authorization header

3. **CORS Error**
   - ตรวจสอบการตั้งค่า CORS ใน `server.js`
   - อาจต้องระบุ origin ที่อนุญาต

## 📝 License

ISC

## 👨‍💻 ผู้พัฒนา

โปรเจคนี้พัฒนาขึ้นเพื่อการศึกษาในวิชา CS319

---

**หมายเหตุ:** โปรเจคนี้เป็นส่วนหนึ่งของการเรียนการสอน ไม่แนะนำให้ใช้ใน production โดยตรงโดยไม่มีการปรับปรุงด้านความปลอดภัยเพิ่มเติม
