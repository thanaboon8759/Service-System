const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // อ่านค่า URL และชื่อฐานข้อมูลจากตัวแปรแวดล้อม (.env)
    const { MONGODB_URL, MONGODB_DB_NAME } = process.env;

    // สร้าง URI สำหรับเชื่อมต่อ MongoDB
    // ตัวอย่าง: mongodb://localhost:27017/mydb
    const mongoUri =
      MONGODB_URL && MONGODB_DB_NAME
        ? `${MONGODB_URL.replace(/\/+$/, '')}/${MONGODB_DB_NAME}`
        : null;

    if (!mongoUri) {
      throw new Error('MONGODB_URL หรือ MONGODB_DB_NAME ไม่ถูกตั้งค่าใน .env');
    }

    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}/${MONGODB_DB_NAME}`);
  } catch (error) {
    console.log('Could not connect to MongoDB with provided env vars. Attempting to start in-memory database...');
    console.error(error.message);
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
    } catch (memError) {
      console.error(`Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
