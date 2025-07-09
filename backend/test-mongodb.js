require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  console.log('Testing MongoDB Atlas connection...');
  console.log('Connection string:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test if we can access the database
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('Ping result:', result);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error codeName:', error.codeName);
    
    if (error.message.includes('bad auth')) {
      console.log('\n🔍 Authentication failed. Possible solutions:');
      console.log('1. Check if username/password are correct');
      console.log('2. Verify the user exists in MongoDB Atlas');
      console.log('3. Check if the user has proper permissions');
      console.log('4. Ensure the user is not locked or disabled');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n🔍 Network connection failed. Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster URL is correct');
      console.log('3. Check if your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    await client.close();
  }
}

testMongoDBConnection(); 