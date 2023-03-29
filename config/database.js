// import mongoose from "mongoose";

// export const connectDatabase = () => {
//     mongoose.connect(process.env.MONGO_URI)
//     .then((con) => {
//         console.log(`Database Connected: $(con.connection.host)`)
//     }).catch((err) => console.log(err));
// }

import mongoose from "mongoose";

const connection_url = process.env.MONGO_URI;


// DATABASE CONFINGURATION

const connectDatabase = () => {
    mongoose.connect(connection_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

export { connectDatabase }