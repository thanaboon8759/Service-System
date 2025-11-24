const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try connecting to local MongoDB first
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log('Could not connect to local MongoDB. Attempting to start in-memory database...');
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
