import mongoose from "mongoose";

// DATABASE CONFINGURATION

const connectDatabase = async () => {
  const { connection } = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB connected with ${connection.host}`);
};

export { connectDatabase };
