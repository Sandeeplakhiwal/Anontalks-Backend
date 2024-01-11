import { connectDatabase } from "./config/database.js";
import cloudinary from "cloudinary";
import app from "./app.js";

connectDatabase();

cloudinary.v2.config({
  cloud_name: process.env.CLD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on Port: ${process.env.PORT}`);
});
