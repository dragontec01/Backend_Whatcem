import mongoose from "mongoose";
import config from "../config";

const connectDB = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {};

    if (config.mongodbUser && config.mongodbPassword) {
      options.auth = {
        username: config.mongodbUser,
        password: config.mongodbPassword,
      };
    }

    // ── CORRECCIÓN: usar config.mongodbUri (que ya lee process.env.MONGODB_URI)
    // El fallback anterior "dtechxdb" era incorrecto — la BD real es dtchcxdb
    await mongoose.connect(config.mongodbUri, options);

    console.log(`MongoDB connected successfully`);
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed through app termination");
  process.exit(0);
});

export default connectDB;