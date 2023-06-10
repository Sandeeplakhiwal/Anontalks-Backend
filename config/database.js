// import mongoose from "mongoose";

// export const connectDatabase = () => {
//     mongoose.connect(process.env.MONGO_URI)
//     .then((con) => {
//         console.log(`Database Connected: $(con.connection.host)`)
//     }).catch((err) => console.log(err));
// }

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
