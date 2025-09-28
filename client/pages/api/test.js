import connectDB from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB Atlas
    await connectDB();
    
    return res.status(200).json({ 
      message: "MongoDB connected successfully!",
      timestamp: new Date().toISOString(),
      status: 'connected'
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ 
      message: "MongoDB connection failed",
      error: error.message,
      status: 'error'
    });
  }
}
